import React from 'react';
import Image from 'next/image';

export interface AvatarMember {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

interface MemberAvatarGroupProps {
  members: AvatarMember[];
  limit?: number;
  size?: 'sm' | 'md';
}

export function MemberAvatarGroup({ members, limit = 4, size = 'sm' }: MemberAvatarGroupProps) {
  const visibleMembers = members.slice(0, limit);
  const extraCount = members.length - limit;

  const sizeClasses = {
    sm: 'h-7 w-7 text-xs border-2',
    md: 'h-9 w-9 text-sm border-2',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex -space-x-2 overflow-hidden items-center">
      {visibleMembers.map((member, idx) => {
        const displayName = member.name || 'Team Member';
        return (
          <div
            key={member.id || idx}
            title={displayName}
            className={`relative inline-flex items-center justify-center rounded-full border-white bg-zinc-100 text-zinc-600 font-semibold uppercase tracking-wider select-none hover:z-10 transition-transform hover:scale-110 dark:border-zinc-950 dark:bg-zinc-800 dark:text-zinc-300 ${sizeClasses[size]}`}
          >
            {member.avatarUrl ? (
              <Image
                src={member.avatarUrl}
                alt={displayName}
                width={36}
                height={36}
                className="rounded-full object-cover h-full w-full"
                unoptimized
              />
            ) : (
              <span>{getInitials(displayName)}</span>
            )}
          </div>
        );
      })}
      {extraCount > 0 && (
        <div
          title={`${extraCount} more members`}
          className={`relative inline-flex items-center justify-center rounded-full border-white bg-zinc-200 text-zinc-700 font-semibold tracking-wide select-none hover:z-10 dark:border-zinc-950 dark:bg-zinc-800 dark:text-zinc-300 ${sizeClasses[size]}`}
        >
          +{extraCount}
        </div>
      )}
    </div>
  );
}
