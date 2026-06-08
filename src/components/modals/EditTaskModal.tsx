import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from 'next-auth/react';
import { useModalStore } from '@/store/modalStore';
import { useTask, useUpdateTask, useDeleteTask, useUploadAttachment, useDeleteAttachment } from '@/hooks/useTasks';
import { useCreateComment, useDeleteComment } from '@/hooks/useComments';
import { useProject } from '@/hooks/useProjects';
import { useNotificationStore } from '@/store/notificationStore';
import { Modal } from './Modal';
import { FormInput } from '../forms/FormInput';
import { FormTextarea } from '../forms/FormTextarea';
import { FormSelect } from '../forms/FormSelect';
import { DatePicker } from '../forms/DatePicker';
import { FileUploader } from '../forms/FileUploader';
import { TaskPriority, TaskStatus } from '@/types';
import {
  Paperclip,
  Trash2,
  CornerDownRight,
  MessageSquare,
  File,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import Image from 'next/image';

const taskSchema = z.object({
  title: z.string().min(2, 'Task title must be at least 2 characters'),
  description: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  priority: z.nativeEnum(TaskPriority),
  status: z.nativeEnum(TaskStatus),
  assignedUserId: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export function EditTaskModal() {
  const { data: session } = useSession();
  const currentUser = session?.user;

  const { activeModal, closeModal, metaData } = useModalStore();
  const { addToast } = useNotificationStore();

  const isOpen = activeModal === 'editTask';
  const taskMeta = metaData?.task;

  const { data: task, isLoading: isTaskLoading } = useTask(taskMeta?.id);

  const { data: project } = useProject(task?.projectId);

  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const uploadAttachmentMutation = useUploadAttachment();
  const deleteAttachmentMutation = useDeleteAttachment();
  const createCommentMutation = useCreateComment();
  const deleteCommentMutation = useDeleteComment();

  const [commentText, setCommentText] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
  });

  useEffect(() => {
    if (task) {
      setValue('title', task.title);
      setValue('description', task.description || '');
      setValue('priority', task.priority);
      setValue('status', task.status);
      setValue('assignedUserId', task.assignedUserId || 'UNASSIGNED');

      const dateStr = new Date(task.dueDate).toISOString().split('T')[0];
      setValue('dueDate', dateStr);
    }
  }, [task, setValue]);

  if (!isOpen || !taskMeta) return null;

  const isPMOrAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'PROJECT_MANAGER';
  const isAssigned = task?.assignedUserId === currentUser?.id;
  const canModifyEverything = isPMOrAdmin;
  const canModifyStatusOnly = currentUser?.role === 'TEAM_MEMBER' && isAssigned;
  const hasNoEditAccess = currentUser?.role === 'TEAM_MEMBER' && !isAssigned;

  const handleSaveDetails = async (data: TaskFormValues) => {
    try {
      await updateTaskMutation.mutateAsync({
        id: task.id,
        data: {
          ...data,
          assignedUserId: data.assignedUserId === 'UNASSIGNED' ? null : data.assignedUserId,
        },
      });
      addToast('Task details saved!', 'success');
      closeModal();
    } catch (err: any) {
      addToast(err.message || 'Failed to update task details', 'error');
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTaskMutation.mutateAsync({
        id: task.id,
        projectId: task.projectId,
      });
      addToast('Task deleted successfully', 'success');
      closeModal();
    } catch (err: any) {
      addToast(err.message || 'Failed to delete task', 'error');
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      await uploadAttachmentMutation.mutateAsync({
        taskId: task.id,
        formData,
      });
      addToast('File attached successfully!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to upload attachment', 'error');
    }
  };

  const handleFileDelete = async (attachmentId: string) => {
    try {
      await deleteAttachmentMutation.mutateAsync({
        taskId: task.id,
        attachmentId,
      });
      addToast('Attachment removed', 'success');
    } catch (err: any) {
      addToast('Failed to delete attachment', 'error');
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await createCommentMutation.mutateAsync({
        taskId: task.id,
        content: commentText,
      });
      setCommentText('');
      addToast('Comment added!', 'success');
    } catch (err: any) {
      addToast('Failed to post comment', 'error');
    }
  };

  const handlePostReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      await createCommentMutation.mutateAsync({
        taskId: task.id,
        content: replyText,
        parentId,
      });
      setReplyText('');
      setActiveReplyId(null);
      addToast('Reply posted!', 'success');
    } catch (err: any) {
      addToast('Failed to post reply', 'error');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteCommentMutation.mutateAsync({
        taskId: task.id,
        commentId,
      });
      addToast('Comment deleted', 'success');
    } catch (err: any) {
      addToast('Failed to delete comment', 'error');
    }
  };

  const priorityOptions = [
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' },
  ];

  const statusOptions = [
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  const memberOptions = [
    { value: 'UNASSIGNED', label: 'Unassigned' },
    ...(project?.members?.map((m: any) => ({
      value: m.user.id,
      label: m.user.name,
    })) || []),
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const rootComments = task?.comments?.filter((c: any) => !c.parentId) || [];
  const getReplies = (parentId: string) => {
    return task?.comments?.filter((c: any) => c.parentId === parentId) || [];
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Task Detail Board" size="xl">
      {isTaskLoading || !task ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-violet-600"></div>
          <p className="mt-4 text-xs font-semibold">Syncing task details...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {task.title}
              </h3>
              <p className="mt-2 text-sm text-zinc-500 whitespace-pre-wrap dark:text-zinc-400">
                {task.description || 'No description provided.'}
              </p>
            </div>

            {}
            <div className="border-t border-zinc-100 pt-6 dark:border-zinc-900">
              <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <Paperclip className="h-4 w-4" />
                <span>Attachments ({task.attachments?.length || 0})</span>
              </h4>
              
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {task.attachments?.map((file: any) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/50 px-3 py-2 dark:border-zinc-900 dark:bg-zinc-950/20"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <File className="h-4 w-4 shrink-0 text-violet-500" />
                      <div className="truncate pr-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {file.name}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={file.url.startsWith('/') ? `http://localhost:5000${file.url}` : file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-900"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      
                      {}
                      {(isPMOrAdmin || file.userId === currentUser?.id) && (
                        <button
                          onClick={() => handleFileDelete(file.id)}
                          className="rounded-lg p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {}
              {!hasNoEditAccess && (
                <div className="mt-4">
                  <FileUploader
                    onUpload={handleFileUpload}
                    isLoading={uploadAttachmentMutation.isPending}
                  />
                </div>
              )}
            </div>

            {}
            <div className="border-t border-zinc-100 pt-6 dark:border-zinc-900">
              <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <MessageSquare className="h-4 w-4" />
                <span>Comments ({task.comments?.length || 0})</span>
              </h4>

              {}
              <form onSubmit={handlePostComment} className="mt-4">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment thread..."
                  rows={2}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={!commentText.trim() || createCommentMutation.isPending}
                    className="inline-flex h-8 items-center justify-center rounded-lg bg-violet-600 px-4 text-xs font-semibold text-white shadow-xs hover:bg-violet-500 disabled:opacity-50"
                  >
                    Post Comment
                  </button>
                </div>
              </form>

              {}
              <div className="mt-6 space-y-5">
                {rootComments.map((comment: any) => {
                  const replies = getReplies(comment.id);
                  const isCommentOwner = comment.userId === currentUser?.id;
                  
                  return (
                    <div key={comment.id} className="space-y-4">
                      {}
                      <div className="flex gap-3">
                        <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold border border-zinc-200 select-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                          {comment.user.avatarUrl ? (
                            <Image
                              src={comment.user.avatarUrl}
                              alt={comment.user.name}
                              width={28}
                              height={28}
                              className="rounded-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <span>{getInitials(comment.user.name)}</span>
                          )}
                        </div>

                        <div className="flex-1 bg-zinc-50 rounded-xl px-4 py-2.5 dark:bg-zinc-900/40">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                              {comment.user.name}
                            </span>
                            <span className="text-4xs text-zinc-400">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                            {comment.content}
                          </p>

                          <div className="mt-2 flex items-center gap-3 text-4xs font-bold text-zinc-400 uppercase tracking-wider">
                            <button
                              onClick={() => {
                                setActiveReplyId(comment.id);
                                setReplyText('');
                              }}
                              className="hover:text-violet-600 dark:hover:text-violet-400"
                            >
                              Reply
                            </button>
                            
                            {(isPMOrAdmin || isCommentOwner) && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="hover:text-red-500"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {}
                      {activeReplyId === comment.id && (
                        <form
                          onSubmit={(e) => handlePostReply(e, comment.id)}
                          className="ml-10 flex gap-2"
                        >
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-950 outline-none focus:border-violet-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                          />
                          <button
                            type="submit"
                            disabled={!replyText.trim()}
                            className="inline-flex h-8 items-center justify-center rounded-lg bg-zinc-800 px-3 text-2xs font-semibold text-white hover:bg-zinc-700"
                          >
                            Reply
                          </button>
                        </form>
                      )}

                      {}
                      {replies.map((reply: any) => {
                        const isReplyOwner = reply.userId === currentUser?.id;
                        return (
                          <div key={reply.id} className="ml-10 flex gap-3">
                            <div className="flex items-center text-zinc-300 dark:text-zinc-800">
                              <CornerDownRight className="h-4 w-4" />
                            </div>
                            
                            <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-3xs font-semibold border border-zinc-200 select-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                              {reply.user.avatarUrl ? (
                                <Image
                                  src={reply.user.avatarUrl}
                                  alt={reply.user.name}
                                  width={24}
                                  height={24}
                                  className="rounded-full object-cover"
                                  unoptimized
                                />
                              ) : (
                                <span>{getInitials(reply.user.name)}</span>
                              )}
                            </div>

                            <div className="flex-1 bg-zinc-50/50 rounded-xl px-4 py-2 dark:bg-zinc-900/20">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                  {reply.user.name}
                                </span>
                                <span className="text-4xs text-zinc-400">
                                  {new Date(reply.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              
                              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                                {reply.content}
                              </p>

                              {(isPMOrAdmin || isReplyOwner) && (
                                <div className="mt-1 text-4xs font-bold text-zinc-400 uppercase tracking-wider">
                                  <button
                                    onClick={() => handleDeleteComment(reply.id)}
                                    className="hover:text-red-500"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {}
          <div className="space-y-6 rounded-xl border border-zinc-100 bg-zinc-50/50 p-5 dark:border-zinc-900 dark:bg-zinc-950/20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Task Settings
            </h4>

            {hasNoEditAccess ? (
              <div className="rounded-lg border border-yellow-100 bg-yellow-50/20 p-3 text-xs text-yellow-600 dark:border-yellow-950/30 dark:text-yellow-400 flex gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>You do not have access to edit this task since it is not assigned to you.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit(handleSaveDetails)} className="space-y-5">
                {}
                <FormInput
                  label="Title"
                  type="text"
                  disabled={canModifyStatusOnly || updateTaskMutation.isPending}
                  error={errors.title?.message}
                  {...register('title')}
                />

                <FormTextarea
                  label="Description"
                  disabled={canModifyStatusOnly || updateTaskMutation.isPending}
                  error={errors.description?.message}
                  {...register('description')}
                />

                <FormSelect
                  label="Status"
                  options={statusOptions}
                  error={errors.status?.message}
                  disabled={updateTaskMutation.isPending}
                  {...register('status')}
                />

                <FormSelect
                  label="Priority"
                  options={priorityOptions}
                  error={errors.priority?.message}
                  disabled={canModifyStatusOnly || updateTaskMutation.isPending}
                  {...register('priority')}
                />

                <FormSelect
                  label="Assignee"
                  options={memberOptions}
                  error={errors.assignedUserId?.message}
                  disabled={canModifyStatusOnly || updateTaskMutation.isPending}
                  {...register('assignedUserId')}
                />

                <DatePicker
                  label="Due Date"
                  error={errors.dueDate?.message}
                  disabled={canModifyStatusOnly || updateTaskMutation.isPending}
                  {...register('dueDate')}
                />

                <div className="flex flex-col gap-3 pt-3">
                  <button
                    type="submit"
                    disabled={updateTaskMutation.isPending}
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-violet-600 text-sm font-semibold text-white shadow-xs hover:bg-violet-500 disabled:opacity-50"
                  >
                    {updateTaskMutation.isPending ? 'Saving...' : 'Save Settings'}
                  </button>

                  {}
                  {isPMOrAdmin && (
                    <button
                      type="button"
                      onClick={handleDeleteTask}
                      disabled={deleteTaskMutation.isPending}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 bg-white text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-950 dark:bg-zinc-950 dark:text-red-400 dark:hover:bg-red-950/20"
                    >
                      Delete Task
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
