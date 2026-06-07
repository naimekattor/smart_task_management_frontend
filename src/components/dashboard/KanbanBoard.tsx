import React, { useState } from 'react';
import { useUpdateTask } from '@/hooks/useTasks';
import { TaskStatus, TaskPriority } from '@/types';
import { Calendar, AlertCircle, ArrowUpRight, MessageSquare, Paperclip, Plus } from 'lucide-react';
import Image from 'next/image';
import { useNotificationStore } from '@/store/notificationStore';
import { useModalStore } from '@/store/modalStore';

interface Task {
  id: string;
  title: string;
  description?: string | null;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  projectId: string;
  assignedUserId?: string | null;
  assignee?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  } | null;
  _count?: {
    comments?: number;
    attachments?: number;
  };
}

interface KanbanBoardProps {
  tasks: Task[];
  projectId: string;
  userRole: string;
  userId: string;
}

export function KanbanBoard({ tasks, projectId, userRole, userId }: KanbanBoardProps) {
  const updateTaskMutation = useUpdateTask();
  const { addToast } = useNotificationStore();
  const { openModal } = useModalStore();

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const columns: { status: TaskStatus; label: string; bg: string; border: string; text: string }[] = [
    {
      status: TaskStatus.TODO,
      label: 'To Do',
      bg: 'bg-zinc-50 dark:bg-zinc-900/40',
      border: 'border-zinc-200 dark:border-zinc-800',
      text: 'text-zinc-700 dark:text-zinc-300',
    },
    {
      status: TaskStatus.IN_PROGRESS,
      label: 'In Progress',
      bg: 'bg-blue-50/20 dark:bg-blue-950/5',
      border: 'border-blue-100 dark:border-blue-950/30',
      text: 'text-blue-700 dark:text-blue-400',
    },
    {
      status: TaskStatus.COMPLETED,
      label: 'Completed',
      bg: 'bg-emerald-50/20 dark:bg-emerald-950/5',
      border: 'border-emerald-100 dark:border-emerald-950/30',
      text: 'text-emerald-700 dark:text-emerald-400',
    },
  ];

  // Drag start handler
  const handleDragStart = (e: React.DragEvent, taskId: string, taskStatus: TaskStatus) => {
    e.dataTransfer.setData('text/plain', taskId);
    setActiveDragId(taskId);
  };

  // Drag end handler
  const handleDragEnd = () => {
    setActiveDragId(null);
    setDragOverColumn(null);
  };

  // Drag over handler
  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  // Drop handler
  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    setActiveDragId(null);
    setDragOverColumn(null);

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (task.status === targetStatus) return;

    // Team member permission check (only assigned user can move)
    if (userRole === 'TEAM_MEMBER' && task.assignedUserId !== userId) {
      addToast('Access denied. You can only move tasks assigned to you.', 'error');
      return;
    }

    try {
      await updateTaskMutation.mutateAsync({
        id: taskId,
        data: { status: targetStatus },
      });
      addToast(`Task status moved to "${targetStatus.replace('_', ' ')}"`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to update task status', 'error');
    }
  };

  const getPriorityBadgeColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'HIGH':
        return 'text-rose-700 bg-rose-50 border-rose-100 dark:text-rose-400 dark:bg-rose-950/30 dark:border-rose-900/40';
      case 'MEDIUM':
        return 'text-amber-700 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900/40';
      case 'LOW':
        return 'text-blue-700 bg-blue-50 border-blue-100 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-900/40';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {columns.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.status);
        const isDragOver = dragOverColumn === col.status;

        return (
          <div
            key={col.status}
            onDragOver={(e) => handleDragOver(e, col.status)}
            onDrop={(e) => handleDrop(e, col.status)}
            className={`flex flex-col rounded-xl border p-4 transition-all min-h-[500px] ${col.bg} ${
              isDragOver
                ? 'border-violet-500 ring-2 ring-violet-500/10'
                : 'border-zinc-200 dark:border-zinc-800'
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold uppercase tracking-wider ${col.text}`}>
                  {col.label}
                </span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200/50 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {columnTasks.length}
                </span>
              </div>
              
              {/* Only PMs/Admins can add tasks in columns directly */}
              {(userRole === 'ADMIN' || userRole === 'PROJECT_MANAGER') && col.status === TaskStatus.TODO && (
                <button
                  onClick={() => openModal('createTask', { projectId })}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Cards Container */}
            <div className="flex-1 space-y-3 overflow-y-auto mt-2">
              {columnTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-400 select-none">
                  <span className="text-xs">No tasks in column</span>
                </div>
              ) : (
                columnTasks.map((task) => {
                  const isDragging = activeDragId === task.id;
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id, task.status)}
                      onDragEnd={handleDragEnd}
                      onClick={() => openModal('editTask', { task })}
                      className={`group relative rounded-xl border border-zinc-200 bg-white p-4 shadow-xs hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 transition-all cursor-pointer ${
                        isDragging ? 'opacity-40 scale-98 pointer-events-none' : ''
                      }`}
                    >
                      {/* Priority Tag */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-2xs font-semibold uppercase tracking-wider ${getPriorityBadgeColor(
                            task.priority
                          )}`}
                        >
                          {task.priority.toLowerCase()}
                        </span>
                        
                        <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 text-zinc-400 transition-opacity" />
                      </div>

                      {/* Title */}
                      <h4 className="mt-3 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                        {task.title}
                      </h4>

                      {/* Description snippet */}
                      {task.description && (
                        <p className="mt-1 text-xs text-zinc-500 line-clamp-2 dark:text-zinc-400">
                          {task.description}
                        </p>
                      )}

                      {/* Card Footer info */}
                      <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-900">
                        <div className="flex items-center gap-1.5 text-2xs text-zinc-400 dark:text-zinc-500">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(task.dueDate)}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Comments count */}
                          {!!(task._count?.comments) && (
                            <div className="flex items-center gap-1 text-2xs text-zinc-400">
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span>{task._count.comments}</span>
                            </div>
                          )}

                          {/* Assignee Avatar */}
                          {task.assignee ? (
                            <div
                              title={`Assigned to ${task.assignee.name}`}
                              className="relative flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-3xs font-semibold text-zinc-600 uppercase border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                            >
                              {task.assignee.avatarUrl ? (
                                <Image
                                  src={task.assignee.avatarUrl}
                                  alt={task.assignee.name}
                                  width={24}
                                  height={24}
                                  className="rounded-full object-cover h-full w-full"
                                  unoptimized
                                />
                              ) : (
                                <span>{getInitials(task.assignee.name)}</span>
                              )}
                            </div>
                          ) : (
                            <div
                              title="Unassigned"
                              className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-zinc-300 text-zinc-400 dark:border-zinc-800"
                            >
                              <AlertCircle className="h-3.5 w-3.5" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
