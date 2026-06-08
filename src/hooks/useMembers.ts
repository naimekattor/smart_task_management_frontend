import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export function useMembers() {
  return useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data.data.users;
    },
  });
}

export function useWorkloads() {
  return useQuery({
    queryKey: ['workloads'],
    queryFn: async () => {
      const res = await api.get('/users/workloads');
      return res.data.data.workloads;
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.delete(`/users/${userId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['workloads'] });
    },
  });
}
