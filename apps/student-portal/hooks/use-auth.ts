import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api-provider';

export function useAuth() {
  const api = useApi();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const response: any = await api.auth.profile();
        return response?.data;
      } catch {
        return null;
      }
    },
    retry: false
  });

  const login = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response: any = await api.auth.login(email, password);
      if (response?.data?.token) {
        api.setAuthToken(response.data.token);
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });

  const logout = () => {
    api.clearAuthToken();
    queryClient.clear();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return {
    user,
    isLoading,
    login,
    logout,
  };
}
