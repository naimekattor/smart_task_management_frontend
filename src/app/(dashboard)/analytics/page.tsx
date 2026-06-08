'use client';

import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { StatCard } from '@/components/common/StatCard';
import { useDashboardAnalytics } from '@/hooks/useAnalytics';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import {
  FolderKanban,
  CheckSquare,
  Clock,
  TrendingUp,
  Award,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { data: analytics, isLoading, isError, refetch } = useDashboardAnalytics();

  if (isLoading) {
    return <LoadingState message="Compiling advanced reports..." />;
  }

  if (isError || !analytics) {
    return <ErrorState message="Failed to load workspace reports." onRetry={refetch} />;
  }

  const { kpis, charts } = analytics;

  const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  const STATUS_COLORS = { Todo: '#6366f1', 'In Progress': '#3b82f6', Completed: '#10b981' };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Performance Analytics"
        description="Review detailed statistics on tasks, timelines, and resource capacities."
      />

      {}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Milestone Completion Rate"
          value={`${kpis.totalTasks > 0 ? Math.round((kpis.completedTasks / kpis.totalTasks) * 100) : 0}%`}
          icon={TrendingUp}
          color="emerald"
          description="Resolved tasks percentage"
        />
        <StatCard
          title="Open Action Items"
          value={kpis.pendingTasks}
          icon={Clock}
          color="amber"
          description="Uncompleted backlogs"
        />
        <StatCard
          title="Active Projects"
          value={kpis.totalProjects}
          icon={FolderKanban}
          color="blue"
          description="Allocated project boards"
        />
        <StatCard
          title="Overdue Risk Index"
          value={kpis.overdueTasks}
          icon={CheckSquare}
          color="rose"
          description="Tasks past due dates"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 pb-3 dark:border-zinc-900">
            Project Timelines & Completion (%)
          </h3>
          <div className="mt-6 h-80">
            {charts.projectProgressTrend.length === 0 ? (
              <div className="flex h-full items-center justify-center text-zinc-400">
                <span>No projects to render timeline</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.projectProgressTrend} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                  <XAxis type="number" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} unit="%" />
                  <YAxis dataKey="name" type="category" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(9, 9, 11, 0.95)',
                      borderColor: '#27272a',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="progress" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={15}>
                    {charts.projectProgressTrend.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 pb-3 dark:border-zinc-900">
            Team Completions Summary
          </h3>
          <div className="mt-6 h-80">
            {charts.teamProductivity.length === 0 ? (
              <div className="flex h-full items-center justify-center text-zinc-400">
                <span>No completions to rank productivity</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.teamProductivity}>
                  <defs>
                    <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(9, 9, 11, 0.95)',
                      borderColor: '#27272a',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCompletions)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:col-span-2">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 pb-3 dark:border-zinc-900">
            Tasks Resolution Share
          </h3>
          <div className="mt-6 h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.taskStatusDistribution}
                  cx="50%"
                  cy="45%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.taskStatusDistribution.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(9, 9, 11, 0.95)',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconSize={10} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
