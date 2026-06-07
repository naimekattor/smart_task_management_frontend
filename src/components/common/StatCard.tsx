import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  color?: 'violet' | 'emerald' | 'blue' | 'amber' | 'rose';
  trend?: {
    value: string;
    type: 'up' | 'down' | 'neutral';
  };
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color = 'violet',
  trend,
}: StatCardProps) {
  const colorMap = {
    violet: 'text-violet-600 bg-violet-50 border-violet-100 dark:text-violet-400 dark:bg-violet-950/20 dark:border-violet-900/30',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-900/30',
    blue: 'text-blue-600 bg-blue-50 border-blue-100 dark:text-blue-400 dark:bg-blue-950/20 dark:border-blue-900/30',
    amber: 'text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/30',
    rose: 'text-rose-600 bg-rose-50 border-rose-100 dark:text-rose-400 dark:bg-rose-950/20 dark:border-rose-900/30',
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {title}
        </span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${colorMap[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-semibold ${
              trend.type === 'up'
                ? 'text-emerald-600 dark:text-emerald-400'
                : trend.type === 'down'
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-zinc-500'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
      {description && (
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          {description}
        </p>
      )}
      {/* Decorative gradient light reflection */}
      <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-radial from-violet-500/5 to-transparent dark:from-violet-500/10"></div>
    </div>
  );
}
