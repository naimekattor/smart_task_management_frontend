import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading details...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative flex items-center justify-center">
        {/* Pulsating backdrop halo */}
        <div className="absolute h-16 w-16 animate-ping rounded-full bg-violet-500/20 opacity-75"></div>
        {/* Core animated gradient spinner */}
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-violet-600 dark:border-zinc-800 dark:border-t-violet-400"></div>
      </div>
      <p className="mt-6 text-sm font-medium text-zinc-500 animate-pulse dark:text-zinc-400">
        {message}
      </p>
    </div>
  );
}
