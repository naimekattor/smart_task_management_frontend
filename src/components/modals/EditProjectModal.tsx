import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useModalStore } from '@/store/modalStore';
import { useUpdateProject } from '@/hooks/useProjects';
import { useNotificationStore } from '@/store/notificationStore';
import { Modal } from './Modal';
import { FormInput } from '../forms/FormInput';
import { FormTextarea } from '../forms/FormTextarea';
import { FormSelect } from '../forms/FormSelect';
import { DatePicker } from '../forms/DatePicker';
import { ProjectStatus } from '@/types';

const projectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  description: z.string().optional(),
  deadline: z.string().min(1, 'Deadline is required'),
  status: z.nativeEnum(ProjectStatus),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export function EditProjectModal() {
  const { activeModal, closeModal, metaData } = useModalStore();
  const updateProjectMutation = useUpdateProject();
  const { addToast } = useNotificationStore();

  const isOpen = activeModal === 'editProject';
  const project = metaData?.project;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
  });

  // Pre-load values
  useEffect(() => {
    if (project) {
      setValue('name', project.name);
      setValue('description', project.description || '');
      setValue('status', project.status);
      
      const deadlineDate = new Date(project.deadline).toISOString().split('T')[0];
      setValue('deadline', deadlineDate);
    }
  }, [project, setValue]);

  const onSubmit = async (data: ProjectFormValues) => {
    if (!project?.id) return;
    try {
      await updateProjectMutation.mutateAsync({
        id: project.id,
        data,
      });
      addToast('Project updated successfully!', 'success');
      closeModal();
    } catch (err: any) {
      addToast(err.message || 'Failed to update project', 'error');
    }
  };

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'ON_HOLD', label: 'On Hold' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Edit Project Settings">
      {project && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormInput
            label="Project Name"
            type="text"
            error={errors.name?.message}
            disabled={updateProjectMutation.isPending}
            {...register('name')}
          />

          <FormTextarea
            label="Description"
            error={errors.description?.message}
            disabled={updateProjectMutation.isPending}
            {...register('description')}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DatePicker
              label="Deadline"
              error={errors.deadline?.message}
              disabled={updateProjectMutation.isPending}
              {...register('deadline')}
            />

            <FormSelect
              label="Project Status"
              options={statusOptions}
              error={errors.status?.message}
              disabled={updateProjectMutation.isPending}
              {...register('status')}
            />
          </div>

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
              disabled={updateProjectMutation.isPending}
              className="flex-1 inline-flex h-9 items-center justify-center rounded-lg bg-violet-600 text-sm font-semibold text-white shadow-xs hover:bg-violet-500 disabled:opacity-50"
            >
              {updateProjectMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
