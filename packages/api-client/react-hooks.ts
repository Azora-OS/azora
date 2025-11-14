/**
 * React hooks for API client
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClient } from './client';

export function useApiClient() {
  const client = new ApiClient(process.env.NEXT_PUBLIC_API_URL);
  return client;
}

export function useAuth() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => client.getProfile(),
    retry: false
  });

  const login = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      client.login(email, password),
    onSuccess: (data: any) => {
      if (data.token) client.setToken(data.token);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });

  const logout = () => {
    client.clearToken();
    queryClient.clear();
  };

  return { user, isLoading, login, logout };
}

export function useCourses() {
  const client = useApiClient();
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => client.getCourses()
  });
}

export function useCourse(id: string) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['course', id],
    queryFn: () => client.getCourse(id),
    enabled: !!id
  });
}

export function useEnrollments() {
  const client = useApiClient();
  return useQuery({
    queryKey: ['enrollments'],
    queryFn: () => client.getEnrollments()
  });
}

export function useWallet() {
  const client = useApiClient();
  return useQuery({
    queryKey: ['wallet'],
    queryFn: () => client.getWallet()
  });
}

export function useTransactions() {
  const client = useApiClient();
  return useQuery({
    queryKey: ['transactions'],
    queryFn: () => client.getTransactions()
  });
}
