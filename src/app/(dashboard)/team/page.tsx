'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { DataTable } from '@/components/tables/DataTable';
import { useWorkloads, useDeleteUser } from '@/hooks/useMembers';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import { useNotificationStore } from '@/store/notificationStore';
import { Mail, Shield, ShieldAlert, Users, Award, Trash2 } from 'lucide-react';
import Image from 'next/image';

export default function TeamPage() {
  const { data: session } = useSession();
  const currentUser = session?.user;
  const isAdmin = currentUser?.role === 'ADMIN';

  const { data: workloads = [], isLoading, isError, refetch } = useWorkloads();
  const deleteUserMutation = useDeleteUser();
  const { addToast } = useNotificationStore();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);

  const columns = [
    { key: 'user', label: 'Team Member' },
    { key: 'role', label: 'System Role' },
    { key: 'workload', label: 'Workload Metrics' },
    { key: 'status', label: 'Capacity Status' },
    ...(isAdmin ? [{ key: 'actions', label: 'Actions' }] : []),
  ];

  const handleDeleteClick = (id: string, name: string) => {
    setUserToDelete({ id, name });
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUserMutation.mutateAsync(userToDelete.id);
      addToast(`${userToDelete.name} was successfully removed from the system.`, 'success');
      refetch();
    } catch (err: any) {
      addToast(err.message || 'Failed to remove user', 'error');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-2 py-0.5 text-2xs font-semibold text-red-700 dark:border-red-950/40 dark:bg-red-950/20 dark:text-red-400">
            <Award className="h-3 w-3" />
            Admin
          </span>
        );
      case 'PROJECT_MANAGER':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-2xs font-semibold text-amber-700 dark:border-amber-950/40 dark:bg-amber-950/20 dark:text-amber-400">
            <ShieldAlert className="h-3 w-3" />
            Manager
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-2xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-350">
            <Users className="h-3 w-3" />
            Team Member
          </span>
        );
    }
  };

  const getCapacityStatus = (pending: number) => {
    if (pending > 5) {
      return (
        <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-2xs font-bold text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 animate-pulse">
          High Load ({pending})
        </span>
      );
    }
    if (pending > 2) {
      return (
        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-2xs font-bold text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
          Moderate ({pending})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-2xs font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
        Available ({pending})
      </span>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (isLoading) {
    return <LoadingState message="Calculating team workloads..." />;
  }

  if (isError) {
    return <ErrorState message="Could not fetch team workload stats." onRetry={refetch} />;
  }

  return (
    <div className="space-y-6 animate-fade-in text-zinc-900 dark:text-zinc-100">
      <PageHeader
        title="Team Member Workloads"
        description="Monitor assignments, check task density, and prevent resource bottlenecking."
      />

      <DataTable
        columns={columns}
        data={workloads}
        renderRow={(item: any, idx: number) => (
          <tr
            key={item.id || idx}
            className="hover:bg-zinc-50/50 transition-colors dark:hover:bg-zinc-900/10"
          >
            {}
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center gap-3">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-zinc-150 text-xs font-bold border border-zinc-200 select-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-350">
                  {item.avatarUrl ? (
                    <Image
                      src={item.avatarUrl}
                      alt={item.name}
                      width={32}
                      height={32}
                      className="rounded-full object-cover h-full w-full"
                      unoptimized
                    />
                  ) : (
                    <span>{getInitials(item.name)}</span>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-950 dark:text-zinc-50">
                    {item.name}
                  </h4>
                  <p className="flex items-center gap-1 text-3xs text-zinc-400">
                    <Mail className="h-3 w-3" />
                    {item.email}
                  </p>
                </div>
              </div>
            </td>

            {}
            <td className="px-6 py-4 whitespace-nowrap">
              {getRoleBadge(item.role)}
            </td>

            {}
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
                <div className="text-center">
                  <span className="block text-zinc-900 font-semibold dark:text-zinc-200">
                    {item.workload.total}
                  </span>
                  <span className="text-3xs text-zinc-400">Total</span>
                </div>
                <div className="text-center border-l border-zinc-200 pl-4 dark:border-zinc-800">
                  <span className="block text-emerald-600 font-semibold dark:text-emerald-400">
                    {item.workload.completed}
                  </span>
                  <span className="text-3xs text-zinc-400">Done</span>
                </div>
                <div className="text-center border-l border-zinc-200 pl-4 dark:border-zinc-800">
                  <span className="block text-amber-600 font-semibold dark:text-amber-400">
                    {item.workload.pending}
                  </span>
                  <span className="text-3xs text-zinc-400">Pending</span>
                </div>
                <div className="text-center border-l border-zinc-200 pl-4 dark:border-zinc-800">
                  <span className="block text-rose-600 font-semibold dark:text-rose-400">
                    {item.workload.overdue}
                  </span>
                  <span className="text-3xs text-zinc-400">Overdue</span>
                </div>
              </div>
            </td>

            {}
            <td className="px-6 py-4 whitespace-nowrap">
              {getCapacityStatus(item.workload.pending)}
            </td>

            {}
            {isAdmin && (
              <td className="px-6 py-4 whitespace-nowrap">
                {item.id !== currentUser?.id ? (
                  <button
                    onClick={() => handleDeleteClick(item.id, item.name)}
                    disabled={deleteUserMutation.isPending}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-white text-red-500 hover:border-red-350 hover:bg-red-50 hover:text-red-650 disabled:opacity-50 dark:border-red-950/40 dark:bg-zinc-950 dark:hover:bg-red-950/20"
                    title="Remove User"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : (
                  <span className="text-2xs text-zinc-400 select-none">You (Admin)</span>
                )}
              </td>
            )}
          </tr>
        )}
      />

      {userToDelete && (
        <ConfirmDialog
          isOpen={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          title="Remove User"
          message={`Are you sure you want to permanently remove "${userToDelete.name}" from the system? This action will remove all their project assignments, comments, and attachments, and cannot be undone.`}
          confirmLabel="Remove User"
          onConfirm={handleConfirmDelete}
          isDestructive
          isLoading={deleteUserMutation.isPending}
        />
      )}
    </div>
  );
}
