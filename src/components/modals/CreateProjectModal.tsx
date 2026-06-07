import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useModalStore } from '@/store/modalStore';
import { useCreateProject } from '@/hooks/useProjects';
import { useNotificationStore } from '@/store/notificationStore';
import { Modal } from './Modal';
import { FormInput } from '../forms/FormInput';
import { FormTextarea } from '../forms/FormTextarea';
import { DatePicker } from '../forms/DatePicker';

const projectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  description: z.string().optional(),
  deadline: z.string().min(1, 'Deadline is required'),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export function CreateProjectModal() {
  const { activeModal, closeModal } = useModalStore();
  const createProjectMutation = useCreateProject();
  const { addToast } = useNotificationStore();

  const isOpen = activeModal === 'createProject';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
  });

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      await createProjectMutation.mutateAsync(data);
      addToast('Project created successfully!', 'success');
      reset();
      closeModal();
    } catch (err: any) {
      addToast(err.message || 'Failed to create project', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Create New Project">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormInput
          label="Project Name"
          type="text"
          placeholder="e.g. Acme Landing Page"
          error={errors.name?.message}
          disabled={createProjectMutation.isPending}
          {...register('name')}
        />

        <FormTextarea
          label="Description"
          placeholder="Enter a brief project overview..."
          error={errors.description?.message}
          disabled={createProjectMutation.isPending}
          {...register('description')}
        />

        <DatePicker
          label="Project Deadline"
          error={errors.deadline?.message}
          disabled={createProjectMutation.isPending}
          {...register('deadline')}
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
            disabled={createProjectMutation.isPending}
            className="flex-1 inline-flex h-9 items-center justify-center rounded-lg bg-violet-600 text-sm font-semibold text-white shadow-xs hover:bg-violet-500 disabled:opacity-50"
          >
            {createProjectMutation.isPending ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
