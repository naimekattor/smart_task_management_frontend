import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useModalStore } from '@/store/modalStore';
import { useCreateTask } from '@/hooks/useTasks';
import { useProject } from '@/hooks/useProjects';
import { useNotificationStore } from '@/store/notificationStore';
import { Modal } from './Modal';
import { FormInput } from '../forms/FormInput';
import { FormTextarea } from '../forms/FormTextarea';
import { FormSelect } from '../forms/FormSelect';
import { DatePicker } from '../forms/DatePicker';
import { TaskPriority } from '@/types';

const taskSchema = z.object({
  title: z.string().min(2, 'Task title must be at least 2 characters'),
  description: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  priority: z.nativeEnum(TaskPriority),
  assignedUserId: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export function CreateTaskModal() {
  const { activeModal, closeModal, metaData } = useModalStore();
  const createTaskMutation = useCreateTask();
  const { addToast } = useNotificationStore();

  const isOpen = activeModal === 'createTask';
  const projectId = metaData?.projectId;

  // Fetch project details to load list of assigned members
  const { data: project } = useProject(projectId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: TaskPriority.MEDIUM,
    },
  });

  const onSubmit = async (data: TaskFormValues) => {
    if (!projectId) return;
    try {
      await createTaskMutation.mutateAsync({
        ...data,
        projectId,
        assignedUserId: data.assignedUserId === 'UNASSIGNED' || !data.assignedUserId ? null : data.assignedUserId,
      });
      addToast('Task created successfully!', 'success');
      reset();
      closeModal();
    } catch (err: any) {
      addToast(err.message || 'Failed to create task', 'error');
    }
  };

  const priorityOptions = [
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' },
  ];

  // Map project members to dropdown options
  const memberOptions = [
    { value: 'UNASSIGNED', label: 'Unassigned' },
    ...(project?.members?.map((m: any) => ({
      value: m.user.id,
      label: m.user.name,
    })) || []),
  ];

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Create Task">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormInput
          label="Task Title"
          type="text"
          placeholder="e.g. Design Dashboard Prototypes"
          error={errors.title?.message}
          disabled={createTaskMutation.isPending}
          {...register('title')}
        />

        <FormTextarea
          label="Description"
          placeholder="Enter task details..."
          error={errors.description?.message}
          disabled={createTaskMutation.isPending}
          {...register('description')}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DatePicker
            label="Due Date"
            error={errors.dueDate?.message}
            disabled={createTaskMutation.isPending}
            {...register('dueDate')}
          />

          <FormSelect
            label="Priority"
            options={priorityOptions}
            error={errors.priority?.message}
            disabled={createTaskMutation.isPending}
            {...register('priority')}
          />
        </div>

        <FormSelect
          label="Assignee"
          options={memberOptions}
          error={errors.assignedUserId?.message}
          disabled={createTaskMutation.isPending}
          {...register('assignedUserId')}
        />

        <div className="flex gap-3 pt-3">
          <button
            type="button"
            onClick={closeModal}
            className="flex-1 inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createTaskMutation.isPending}
            className="flex-1 inline-flex h-9 items-center justify-center rounded-lg bg-violet-600 text-sm font-semibold text-white shadow-xs hover:bg-violet-500 disabled:opacity-50"
          >
            {createTaskMutation.isPending ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
