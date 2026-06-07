'use client';

import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { useDashboardAnalytics, useRecentActivity } from '@/hooks/useAnalytics';
import {
  FolderKanban,
  CheckSquare,
  Clock,
  TrendingUp,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';
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
} from 'recharts';

export default function DashboardPage() {
  // 1. Query dashboard KPIs & charts data
  const {
    data: analytics,
    isLoading: isAnalyticsLoading,
    isError: isAnalyticsError,
    refetch: refetchAnalytics,
  } = useDashboardAnalytics();

  // 2. Query activity logs
  const {
    data: activities = [],
    isLoading: isActivityLoading,
    isError: isActivityError,
    refetch: refetchActivity,
  } = useRecentActivity();

  if (isAnalyticsLoading || isActivityLoading) {
    return <LoadingState message="Hydrating dashboard analytics..." />;
  }

  if (isAnalyticsError || isActivityError || !analytics) {
    return (
      <ErrorState
        message="Could not load dashboard statistics from the server."
        onRetry={() => {
          refetchAnalytics();
          refetchActivity();
        }}
      />
    );
  }

  const { kpis, charts } = analytics;

  // Chart Styling Constants
  const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  const PRIORITY_COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#3b82f6' };
  const STATUS_COLORS = { Todo: '#6366f1', 'In Progress': '#3b82f6', Completed: '#10b981' };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Dashboard Analytics"
        description="Comprehensive overview of workspace productivity, milestones, and audit trails."
      />

      {/* KPI STAT CARDS CONTAINER */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Projects"
          value={kpis.totalProjects}
          icon={FolderKanban}
          color="blue"
          description="Active collaboration scopes"
        />
        <StatCard
          title="Total Tasks"
          value={kpis.totalTasks}
          icon={CheckSquare}
          color="violet"
          description="All project deliverables"
        />
        <StatCard
          title="Completed Tasks"
          value={kpis.completedTasks}
          icon={TrendingUp}
          color="emerald"
          description={`${
            kpis.totalTasks > 0
              ? Math.round((kpis.completedTasks / kpis.totalTasks) * 100)
              : 0
          }% resolution rate`}
        />
        <StatCard
          title="Pending Tasks"
          value={kpis.pendingTasks}
          icon={Clock}
          color="amber"
          description="Active execution items"
        />
        <StatCard
          title="Overdue Tasks"
          value={kpis.overdueTasks}
          icon={AlertTriangle}
          color="rose"
          description="Requires immediate focus"
        />
      </div>

      {/* CHARTS CONTAINER GRID */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Project Progress Trend */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:col-span-2">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Project Completion Rates (%)
          </h3>
          <div className="mt-6 h-80">
            {charts.projectProgressTrend.length === 0 ? (
              <div className="flex h-full items-center justify-center text-zinc-400">
                <span>No projects to render progress</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.projectProgressTrend}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(9, 9, 11, 0.95)',
                      borderColor: '#27272a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                  />
                  <Bar dataKey="progress" fill="#6366f1" radius={[4, 4, 0, 0]}>
                    {charts.projectProgressTrend.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Task Priorities distribution */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Tasks by Priority
          </h3>
          <div className="mt-6 h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.tasksByPriority}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.tasksByPriority.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS] || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(9, 9, 11, 0.95)',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconSize={10} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Status Distribution */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Task Status Distribution
          </h3>
          <div className="mt-6 h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.taskStatusDistribution}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
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
                    fontSize: '12px',
                  }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconSize={10} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Productivity completions */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:col-span-2">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Team Productivity (Completed Tasks)
          </h3>
          <div className="mt-6 h-80">
            {charts.teamProductivity.length === 0 ? (
              <div className="flex h-full items-center justify-center text-zinc-400">
                <span>No completions to rank productivity</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.teamProductivity}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(9, 9, 11, 0.95)',
                      borderColor: '#27272a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                  />
                  <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY LOGS & WORKLOAD TIMELINE */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:col-span-3">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 pb-3 dark:border-zinc-900">
            Recent Activity Log (Latest 10)
          </h3>
          <div className="mt-6">
            <ActivityTimeline activities={activities} />
          </div>
        </div>
      </div>
    </div>
  );
}
