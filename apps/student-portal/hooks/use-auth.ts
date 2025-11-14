import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from './use-api';

export function useAuth() {
  const api = useApi();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (credentials: any) => api.auth.login(credentials.email, credentials.password),
    onSuccess: () => {
      window.location.href = '/courses';
    }
  });

  const logoutMutation = useMutation({
    mutationFn: () => api.auth.logout(),
    onSuccess: () => {
      queryClient.clear();
      window.location.href = '/auth/login';
    },
  });

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
