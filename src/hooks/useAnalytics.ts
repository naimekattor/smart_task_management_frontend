import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export function useDashboardAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await api.get('/analytics/dashboard');
      return res.data.data;
    },
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['activity-logs'],
    queryFn: async () => {
      const res = await api.get('/activity/logs');
      return res.data.data.activities;
    },
  });
}
