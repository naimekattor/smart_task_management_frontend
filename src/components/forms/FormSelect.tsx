import React, { forwardRef, SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, options, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
          {label}
        </label>
        <select
          ref={ref}
          className={`mt-2 block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 shadow-xs outline-none transition-all focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-violet-400 dark:focus:ring-violet-400/20 ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-950 dark:focus:border-red-500'
              : ''
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';
