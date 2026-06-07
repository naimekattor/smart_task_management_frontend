import React from 'react';
import {
  Folder,
  Edit2,
  Trash2,
  UserPlus,
  UserMinus,
  CheckSquare,
  User,
  CheckCircle,
  RefreshCw,
  Clock,
} from 'lucide-react';
import Image from 'next/image';

interface ActivityLog {
  id: string;
  action: string;
  metadata: any;
  timestamp: string;
  user: {
    name: string;
    avatarUrl?: string | null;
    role: string;
  };
}

interface ActivityTimelineProps {
  activities: ActivityLog[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const getIcon = (action: string) => {
    switch (action) {
      case 'PROJECT_CREATED':
        return <Folder className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case 'PROJECT_UPDATED':
        return <Edit2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'PROJECT_DELETED':
        return <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case 'MEMBER_ADDED':
        return <UserPlus className="h-4 w-4 text-violet-600 dark:text-violet-400" />;
      case 'MEMBER_REMOVED':
        return <UserMinus className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case 'TASK_CREATED':
        return <CheckSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
      case 'TASK_ASSIGNED':
        return <User className="h-4 w-4 text-sky-600 dark:text-sky-400" />;
      case 'TASK_COMPLETED':
        return <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case 'TASK_STATUS_UPDATED':
        return <RefreshCw className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />;
      default:
        return <Clock className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />;
    }
  };

  const formatMetadata = (action: string, metadata: any) => {
    if (!metadata) return '';
    switch (action) {
      case 'PROJECT_CREATED':
      case 'PROJECT_UPDATED':
        return `project: "${metadata.projectName}"`;
      case 'PROJECT_DELETED':
        return `project: "${metadata.projectName}"`;
      case 'MEMBER_ADDED':
        return `member "${metadata.memberName}" to "${metadata.projectName}"`;
      case 'MEMBER_REMOVED':
        return `member "${metadata.memberName}" from "${metadata.projectName}"`;
      case 'TASK_CREATED':
      case 'TASK_COMPLETED':
        return `task: "${metadata.taskTitle}"`;
      case 'TASK_ASSIGNED':
        return `task "${metadata.taskTitle}" to ${metadata.assigneeName}`;
      case 'TASK_STATUS_UPDATED':
        return `status of "${metadata.taskTitle}" from ${metadata.oldStatus} to ${metadata.newStatus}`;
      default:
        return JSON.stringify(metadata);
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

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (activities.length === 0) {
    return (
      <p className="text-sm text-zinc-400 text-center py-6">
        No recent activities recorded.
      </p>
    );
  }

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {activities.map((activity, activityIdx) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {activityIdx !== activities.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-zinc-200 dark:bg-zinc-800"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                {/* User avatar or initials */}
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600 border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                  {activity.user.avatarUrl ? (
                    <Image
                      src={activity.user.avatarUrl}
                      alt={activity.user.name}
                      width={32}
                      height={32}
                      className="rounded-full object-cover h-full w-full"
                      unoptimized
                    />
                  ) : (
                    <span>{getInitials(activity.user.name)}</span>
                  )}
                </div>
                
                {/* Action details */}
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {activity.user.name}
                      </span>{' '}
                      {activity.action.toLowerCase().replace('_', ' ')}{' '}
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">
                        {formatMetadata(activity.action, activity.metadata)}
                      </span>
                    </p>
                  </div>
                  <div className="whitespace-nowrap text-right text-xs text-zinc-400">
                    <span className="inline-flex items-center gap-1">
                      {getIcon(activity.action)}
                      {timeAgo(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
