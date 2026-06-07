import React from 'react';
import { useFilterStore } from '@/store/filterStore';
import { useMembers } from '@/hooks/useMembers';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';

interface FilterPanelProps {
  type: 'project' | 'task';
  showProjectFilter?: boolean; // toggle filter inside task list if needed
}

export function FilterPanel({ type }: FilterPanelProps) {
  const {
    projectStatus,
    taskStatus,
    priority,
    assignedUserId,
    setProjectStatus,
    setTaskStatus,
    setPriority,
    setAssignedUserId,
    resetFilters,
  } = useFilterStore();

  const { data: members = [] } = useMembers();

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/45">
      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        <SlidersHorizontal className="h-4 w-4" />
        <span>Filters</span>
      </div>

      <div className="flex flex-wrap items-center gap-3 ml-2">
        {/* Project Status Filter */}
        {type === 'project' && (
          <select
            value={projectStatus}
            onChange={(e) => setProjectStatus(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 outline-none hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="ON_HOLD">On Hold</option>
          </select>
        )}

        {/* Task Status Filter */}
        {type === 'task' && (
          <>
            <select
              value={taskStatus}
              onChange={(e) => setTaskStatus(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 outline-none hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              <option value="ALL">All Statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>

            {/* Task Priority Filter */}
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 outline-none hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            {/* Assignee Filter */}
            <select
              value={assignedUserId}
              onChange={(e) => setAssignedUserId(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 outline-none hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              <option value="ALL">All Assignees</option>
              {members.map((member: any) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </>
        )}

        {/* Reset Trigger */}
        <button
          onClick={resetFilters}
          className="inline-flex items-center gap-1.5 rounded-lg border border-transparent px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>
    </div>
  );
}
