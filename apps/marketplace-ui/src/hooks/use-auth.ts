import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useAuth() {
  const queryClient = useQueryClient();

  const login = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.auth.login(email, password),
    onSuccess: (data) => {
      if (data.token) {
        api.setAuthToken(data.token);
        localStorage.setItem('auth_token', data.token);
      }
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const profile = useQuery({
    queryKey: ['user'],
    queryFn: () => api.auth.profile(),
    enabled: !!localStorage.getItem('auth_token'),
  });

  return {
    login,
    profile,
    user: profile.data,
    isAuthenticated: !!profile.data,
    isLoading: profile.isLoading,
  };
}