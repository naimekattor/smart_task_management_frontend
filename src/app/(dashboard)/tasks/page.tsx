'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { FilterPanel } from '@/components/common/FilterPanel';
import { KanbanBoard } from '@/components/dashboard/KanbanBoard';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useFilterStore } from '@/store/filterStore';
import { useModalStore } from '@/store/modalStore';
import { Plus, KanbanSquare, CheckSquare, Layers } from 'lucide-react';

function TasksPageContent() {
  const { data: session } = useSession();
  const currentUser = session?.user;

  const router = useRouter();
  const searchParams = useSearchParams();
  const queryProjectId = searchParams.get('projectId');

  const { openModal } = useModalStore();
  const { searchQuery, taskStatus, priority, assignedUserId } = useFilterStore();

  const [activeProjectId, setActiveProjectId] = useState<string>('');

  // 1. Fetch all projects to populate select dropdown
  const {
    data: projectsData,
    isLoading: isProjectsLoading,
    isError: isProjectsError,
  } = useProjects({ limit: 100 }); // fetch all

  const projects = projectsData?.projects || [];

  // Sync active project with query parameter or select first project
  useEffect(() => {
    if (queryProjectId) {
      setActiveProjectId(queryProjectId);
    } else if (projects.length > 0 && !activeProjectId) {
      setActiveProjectId(projects[0].id);
      router.push(`/tasks?projectId=${projects[0].id}`);
    }
  }, [queryProjectId, projects, activeProjectId, router]);

  // 2. Fetch tasks for active project and current filters
  const {
    data: tasksData,
    isLoading: isTasksLoading,
    isError: isTasksError,
    refetch: refetchTasks,
  } = useTasks({
    projectId: activeProjectId || undefined,
    status: taskStatus,
    priority,
    assignedUserId,
    search: searchQuery,
  });

  const handleProjectChange = (id: string) => {
    setActiveProjectId(id);
    router.push(`/tasks?projectId=${id}`);
  };

  const isPMOrAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'PROJECT_MANAGER';

  if (isProjectsLoading) {
    return <LoadingState message="Connecting taskboards..." />;
  }

  if (isProjectsError) {
    return <ErrorState message="Could not retrieve projects directory." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Tasks Kanban Board"
        description="Plan sprints, align workloads, and drag tasks across stages."
      >
        {isPMOrAdmin && activeProjectId && (
          <button
            onClick={() => openModal('createTask', { projectId: activeProjectId })}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-4 text-xs font-semibold text-white shadow-xs hover:bg-violet-500 active:scale-98 dark:bg-violet-500 dark:hover:bg-violet-400"
          >
            <Plus className="h-4 w-4" />
            Create Task
          </button>
        )}
      </PageHeader>

      {/* BOARD SELECTOR & SEARCH ACTION AREA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Layers className="h-5 w-5 text-zinc-400" />
          <select
            value={activeProjectId}
            onChange={(e) => handleProjectChange(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-800 outline-none focus:border-violet-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
          >
            {projects.length === 0 ? (
              <option value="">No Active Projects</option>
            ) : (
              projects.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="Create a project first"
          description="You must create at least one project scope before you can schedule tasks."
          actionLabel={isPMOrAdmin ? 'Create Project' : undefined}
          onAction={isPMOrAdmin ? () => openModal('createProject') : undefined}
        />
      ) : !activeProjectId ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <KanbanSquare className="h-10 w-10 animate-pulse" />
          <p className="mt-4 text-xs font-semibold">Select a project scope to visualize board...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* FILTER PANEL */}
          <FilterPanel type="task" />

          {/* KANBAN BOARD SECTION */}
          {isTasksLoading ? (
            <div className="flex justify-center items-center py-20 text-zinc-400">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-violet-600"></div>
              <span className="ml-2 text-xs font-semibold">Fetching tasks...</span>
            </div>
          ) : isTasksError ? (
            <ErrorState message="Could not sync tasks board." onRetry={refetchTasks} />
          ) : (
            <KanbanBoard
              tasks={tasksData.tasks || []}
              projectId={activeProjectId}
              userRole={currentUser?.role || 'TEAM_MEMBER'}
              userId={currentUser?.id || ''}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function TasksPage() {
  return (
    <React.Suspense fallback={<LoadingState message="Loading taskboards..." />}>
      <TasksPageContent />
    </React.Suspense>
  );
}
