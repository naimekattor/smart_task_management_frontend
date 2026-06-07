import React, { forwardRef, InputHTMLAttributes } from 'react';
import { Calendar } from 'lucide-react';

interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
          {label}
        </label>
        <div className="relative mt-2">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 pointer-events-none">
            <Calendar className="h-4 w-4" />
          </div>
          <input
            ref={ref}
            type="date"
            className={`block w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-3 py-2 text-sm text-zinc-950 shadow-xs outline-none transition-all focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-violet-400 dark:focus:ring-violet-400/20 ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-950 dark:focus:border-red-505'
                : ''
            } ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';
