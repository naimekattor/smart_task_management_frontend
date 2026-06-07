import React from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = 'No items found',
  description = 'There are no active records in this list yet.',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center transition-colors dark:border-zinc-800 dark:bg-zinc-950/20">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400">
        <FolderOpen className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 inline-flex h-9 items-center justify-center rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-500 hover:shadow-violet-500/10 active:scale-98 dark:bg-violet-500 dark:hover:bg-violet-400"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
