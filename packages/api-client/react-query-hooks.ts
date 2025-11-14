import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AzoraApiClient } from './index';

let clientInstance: AzoraApiClient | null = null;

export const getApiClient = () => {
  if (!clientInstance) {
    clientInstance = new AzoraApiClient({
      onAuthError: () => {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    });
  }
  return clientInstance;
};

export const useAuthMutation = () => {
  const client = getApiClient();
  const queryClient = useQueryClient();

  const login = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      client.auth.login(email, password),
    onSuccess: (data: any) => {
      if (data.data?.token) {
        client.setAuthToken(data.data.token);
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
    }
  });

  const register = useMutation({
    mutationFn: (data: any) => client.auth.register(data)
  });

  const logout = () => {
    client.clearAuthToken();
    queryClient.clear();
  };

  return { login, register, logout };
};

export const useProfile = () => {
  const client = getApiClient();
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => client.auth.profile()
  });
};

export const useCoursesQuery = (params?: any) => {
  const client = getApiClient();
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => client.lms.getCourses(params)
  });
};

export const useEnrollmentMutation = () => {
  const client = getApiClient();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ courseId, studentId }: { courseId: string; studentId: string }) =>
      client.lms.enroll(courseId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    }
  });
};

export const useWalletQuery = (userId: string) => {
  const client = getApiClient();
  return useQuery({
    queryKey: ['wallet', userId],
    queryFn: () => client.mint.getWallet(userId),
    enabled: !!userId
  });
};

export const useJobsQuery = (params?: any) => {
  const client = getApiClient();
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: () => client.marketplace.getJobs(params)
  });
};

export const useJobApplicationMutation = () => {
  const client = getApiClient();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ jobId, userId }: { jobId: string; userId: string }) =>
      client.marketplace.applyToJob(jobId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    }
  });
};
