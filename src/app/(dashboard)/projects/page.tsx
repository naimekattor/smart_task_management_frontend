'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { FilterPanel } from '@/components/common/FilterPanel';
import { MemberAvatarGroup } from '@/components/common/MemberAvatarGroup';
import { useProjects } from '@/hooks/useProjects';
import { useFilterStore } from '@/store/filterStore';
import { useModalStore } from '@/store/modalStore';
import {
  Calendar,
  Plus,
  Settings,
  UserPlus,
  ArrowRight,
  TrendingUp,
  FolderDot,
} from 'lucide-react';
import Link from 'next/link';

export default function ProjectsPage() {
  const { data: session } = useSession();
  const currentUser = session?.user;

  const { openModal } = useModalStore();
  const { projectStatus, searchQuery } = useFilterStore();

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useProjects({
    status: projectStatus,
    search: searchQuery,
  });

  const isPMOrAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'PROJECT_MANAGER';

  if (isLoading) {
    return <LoadingState message="Fetching workspace projects..." />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        message="Could not load projects list from the server."
        onRetry={refetch}
      />
    );
  }

  const projects = data.projects || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-emerald-700 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/20';
      case 'COMPLETED':
        return 'text-blue-700 bg-blue-50 border-blue-100 dark:text-blue-400 dark:bg-blue-950/20';
      case 'ON_HOLD':
        return 'text-amber-700 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-950/20';
      default:
        return 'text-zinc-700 bg-zinc-50 border-zinc-100';
    }
  };

  const isOverdue = (deadlineStr: string, status: string) => {
    return new Date(deadlineStr) < new Date() && status !== 'COMPLETED';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Projects"
        description="Initiate, schedule, and allocate resources across active projects."
      >
        {isPMOrAdmin && (
          <button
            onClick={() => openModal('createProject')}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-4 text-xs font-semibold text-white shadow-xs hover:bg-violet-500 active:scale-98 dark:bg-violet-500 dark:hover:bg-violet-400"
          >
            <Plus className="h-4 w-4" />
            Create Project
          </button>
        )}
      </PageHeader>

      {}
      <FilterPanel type="project" />

      {}
      {projects.length === 0 ? (
        <EmptyState
          title="No projects active"
          description="Initialize your first project workflow scope to allocate tasks."
          actionLabel={isPMOrAdmin ? 'Create Project' : undefined}
          onAction={isPMOrAdmin ? () => openModal('createProject') : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project: any) => {
            const totalTasks = project.tasks?.length || 0;
            const completedTasks = project.tasks?.filter((t: any) => t.status === 'COMPLETED').length || 0;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            
            const projectMembers = project.members?.map((m: any) => ({
              id: m.user.id,
              name: m.user.name,
              avatarUrl: m.user.avatarUrl,
            })) || [];

            const isDeadOverdue = isOverdue(project.deadline, project.status);

            return (
              <div
                key={project.id}
                className="group relative flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-2xs hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 transition-all"
              >
                <div>
                  {}
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-3xs font-semibold uppercase tracking-wider ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {project.status.replace('_', ' ').toLowerCase()}
                    </span>

                    {isPMOrAdmin && (
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openModal('addMember', { projectId: project.id })}
                          title="Add Team Member"
                          className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
                        >
                          <UserPlus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openModal('editProject', { project })}
                          title="Project Settings"
                          className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {}
                  <h3 className="mt-4 text-base font-bold text-zinc-950 dark:text-zinc-50">
                    {project.name}
                  </h3>
                  <p className="mt-1.5 text-xs text-zinc-500 line-clamp-2 leading-relaxed dark:text-zinc-400">
                    {project.description || 'No description added.'}
                  </p>
                </div>

                <div className="mt-6 space-y-4">
                  {}
                  <div>
                    <div className="flex items-center justify-between text-3xs font-bold text-zinc-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-violet-500" />
                        Progress
                      </span>
                      <span>{progress}% ({completedTasks}/{totalTasks} Tasks)</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-violet-600 transition-all dark:bg-violet-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {}
                  <div className="flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-900">
                    <div
                      className={`flex items-center gap-1.5 text-3xs font-semibold ${
                        isDeadOverdue
                          ? 'text-red-600 dark:text-red-400 animate-pulse'
                          : 'text-zinc-400 dark:text-zinc-500'
                      }`}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(project.deadline).toLocaleDateString()}</span>
                    </div>

                    <MemberAvatarGroup members={projectMembers} limit={3} />
                  </div>

                  {}
                  <Link
                    href={`/tasks?projectId=${project.id}`}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-50 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/80 transition-colors"
                  >
                    <span>View Kanban Board</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
