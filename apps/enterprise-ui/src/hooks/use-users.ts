import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../lib/api-provider';

export function useUsers() {
  const api = useApi();

  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response: any = await api.request('/api/users');
      return response?.data || [];
    }
  });
}

export function useUserDetails(userId: string) {
  const api = useApi();

  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response: any = await api.request(`/api/users/${userId}`);
      return response?.data;
    },
    enabled: !!userId
  });
}

export function useUpdateUserRole() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response: any = await api.request(`/api/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role })
      });
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
}
