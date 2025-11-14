import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from './use-api';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const api = useApi();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: (credentials: any) => api.auth.login(credentials.email, credentials.password),
    onSuccess: (data) => {
      api.setAuthToken(data.token);
      localStorage.setItem('auth_token', data.token);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      navigate('/dashboard');
    }
  });

  const logoutMutation = useMutation({
    mutationFn: () => api.auth.logout(),
    onSuccess: () => {
      api.setAuthToken(null);
      localStorage.removeItem('auth_token');
      queryClient.clear();
      navigate('/auth/login');
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
