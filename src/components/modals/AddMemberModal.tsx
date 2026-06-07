import React from 'react';
import { useModalStore } from '@/store/modalStore';
import { useMembers } from '@/hooks/useMembers';
import { useProject, useAddMember } from '@/hooks/useProjects';
import { useNotificationStore } from '@/store/notificationStore';
import { Modal } from './Modal';
import { UserPlus, Check } from 'lucide-react';
import Image from 'next/image';

export function AddMemberModal() {
  const { activeModal, closeModal, metaData } = useModalStore();
  const { addToast } = useNotificationStore();

  const isOpen = activeModal === 'addMember';
  const projectId = metaData?.projectId;

  const { data: project } = useProject(projectId);
  const { data: allUsers = [], isLoading: isUsersLoading } = useMembers();
  const addMemberMutation = useAddMember();

  const handleAdd = async (userId: string, userName: string) => {
    if (!projectId) return;
    try {
      await addMemberMutation.mutateAsync({
        projectId,
        userId,
      });
      addToast(`${userName} added to the project!`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to add member', 'error');
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

  // Filter users who are NOT already project members
  const projectMemberIds = new Set(project?.members?.map((m: any) => m.userId) || []);
  const nonMembers = allUsers.filter((u: any) => !projectMemberIds.has(u.id));

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Add Project Members">
      {isUsersLoading ? (
        <div className="flex flex-col items-center justify-center py-10 text-zinc-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-250 border-t-violet-600"></div>
          <p className="mt-2 text-2xs">Fetching members list...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Select users to add to <span className="font-semibold text-zinc-800 dark:text-zinc-200">"{project?.name}"</span>
          </p>

          <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100 pr-1 dark:divide-zinc-900">
            {nonMembers.length === 0 ? (
              <p className="text-center py-8 text-xs text-zinc-400">
                All registered users are already members of this project.
              </p>
            ) : (
              nonMembers.map((user: any) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                      {user.avatarUrl ? (
                        <Image
                          src={user.avatarUrl}
                          alt={user.name}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <span>{getInitials(user.name)}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                        {user.name}
                      </h4>
                      <p className="text-4xs text-zinc-400">{user.email} • {user.role.replace('_', ' ')}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAdd(user.id, user.name)}
                    disabled={addMemberMutation.isPending}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-violet-950/20"
                  >
                    <UserPlus className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={closeModal}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-zinc-900 px-4 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
