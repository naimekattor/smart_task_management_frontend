import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'An error occurred while fetching data from the server.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50/20 p-12 text-center dark:border-red-950/20 dark:bg-red-950/5">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 animate-pulse">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
        Data Connection Failed
      </h3>
      <p className="mt-2 max-w-sm text-sm text-red-600 dark:text-red-400/80">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 inline-flex h-9 items-center justify-center rounded-lg border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 shadow-sm transition-all hover:bg-red-50 active:scale-98 dark:border-red-950 dark:bg-zinc-950 dark:text-red-400 dark:hover:bg-red-950/20"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
