import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      content,
      parentId,
    }: {
      taskId: string;
      content: string;
      parentId?: string | null;
    }) => {
      const res = await api.post(`/tasks/${taskId}/comments`, { content, parentId });
      return res.data.data.comment;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      commentId,
      content,
    }: {
      taskId: string;
      commentId: string;
      content: string;
    }) => {
      const res = await api.put(`/tasks/comments/${commentId}`, { content });
      return res.data.data.comment;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, commentId }: { taskId: string; commentId: string }) => {
      const res = await api.delete(`/tasks/comments/${commentId}`);
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
    },
  });
}
