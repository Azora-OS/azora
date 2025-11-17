/**
 * AZORA PROPRIETARY LICENSE
 * Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
 * 
 * React Hooks for API Integration
 * Comprehensive hooks for all frontend apps with backend connectivity
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient, type ApiResponse } from './index';

// Initialize token from localStorage
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('azora_token');
  if (token) apiClient.setAuthToken(token);
}

// ============================================================================
// AUTHENTICATION HOOKS
// ============================================================================

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.auth.login(email, password);
      if (response.success && response.data?.token) {
        apiClient.setAuthToken(response.data.token);
        localStorage.setItem('azora_token', response.data.token);
        setUser(response.data.user);
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      } else {
        throw new Error(response.error || 'Login failed');
      }
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [queryClient]);

  const logout = useCallback(() => {
    apiClient.clearAuthToken();
    localStorage.removeItem('azora_token');
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  return { user, loading, error, login, logout };
};

export const useProfile = (options?: UseQueryOptions<ApiResponse>) => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => apiClient.auth.profile(),
    ...options,
  });
};

// ============================================================================
// EDUCATION HOOKS
// ============================================================================

export const useCourses = (params?: { category?: string; search?: string }, options?: UseQueryOptions<ApiResponse>) => {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => apiClient.education.getCourses(params),
    ...options,
  });
};

export const useCourse = (id: string, options?: UseQueryOptions<ApiResponse>) => {
  return useQuery({
    queryKey: ['course', id],
    queryFn: () => apiClient.education.getCourse(id),
    enabled: !!id,
    ...options,
  });
};

export const useEnrollCourse = (options?: UseMutationOptions<ApiResponse, Error, string>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId) => apiClient.education.enroll(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    ...options,
  });
};

export const useEnrollments = (options?: UseQueryOptions<ApiResponse>) => {
  return useQuery({
    queryKey: ['enrollments'],
    queryFn: () => apiClient.education.getEnrollments(),
    ...options,
  });
};

export const useStudentProgress = (studentId: string, options?: UseQueryOptions<ApiResponse>) => {
  return useQuery({
    queryKey: ['progress', studentId],
    queryFn: () => apiClient.education.getProgress(studentId),
    enabled: !!studentId,
    ...options,
  });
};

export const useStudentStats = (userId: string, options?: UseQueryOptions<ApiResponse>) => {
  return useQuery({
    queryKey: ['stats', userId],
    queryFn: () => apiClient.education.getStats(userId),
    enabled: !!userId,
    ...options,
  });
};

// ============================================================================
// WALLET & PAYMENT HOOKS
// ============================================================================

export const useWallet = (userId?: string, options?: UseQueryOptions<ApiResponse>) => {
  return useQuery({
    queryKey: ['wallet', 'balance', userId],
    queryFn: () => apiClient.wallet.getBalance(),
    enabled: !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds
    ...options,
  });
};

export const useWalletBalance = (options?: UseQueryOptions<ApiResponse>) => {
  return useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: () => apiClient.wallet.getBalance(),
    refetchInterval: 30000,
    ...options,
  });
};

export const useTransactions = (params?: { limit?: number; offset?: number }, options?: UseQueryOptions<ApiResponse>) => {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => apiClient.wallet.getTransactions(params),
    ...options,
  });
};

export const useCreatePayment = (options?: UseMutationOptions<ApiResponse, Error, { amount: number; currency: string; description?: string }>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.payments.createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    ...options,
  });
};

export const useSubscriptionPlans = (options?: UseQueryOptions<ApiResponse>) => {
  return useQuery({
    queryKey: ['subscription', 'plans'],
    queryFn: () => apiClient.payments.getSubscriptionPlans(),
    ...options,
  });
};

// ============================================================================
// JOBS & MARKETPLACE HOOKS
// ============================================================================

export const useJobs = (params?: { category?: string; location?: string; search?: string }, options?: UseQueryOptions<ApiResponse>) => {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: () => apiClient.jobs.getJobs(params),
    ...options,
  });
};

export const useJob = (id: string, options?: UseQueryOptions<ApiResponse>) => {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => apiClient.jobs.getJob(id),
    enabled: !!id,
    ...options,
  });
};

export const useApplyJob = (options?: UseMutationOptions<ApiResponse, Error, { jobId: string; applicationData: any }>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, applicationData }) => apiClient.jobs.apply(jobId, applicationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    ...options,
  });
};

export const useApplications = (options?: UseQueryOptions<ApiResponse>) => {
  return useQuery({
    queryKey: ['applications'],
    queryFn: () => apiClient.jobs.getApplications(),
    ...options,
  });
};

export const useMarketplaceListings = (params?: { category?: string; search?: string }, options?: UseQueryOptions<ApiResponse>) => {
  return useQuery({
    queryKey: ['marketplace', 'listings', params],
    queryFn: () => apiClient.marketplace.getListings(params),
    ...options,
  });
};

// ============================================================================
// SKILLS HOOKS
// ============================================================================

export const useSkills = (options?: UseQueryOptions<ApiResponse>) => {
  return useQuery({
    queryKey: ['skills'],
    queryFn: () => apiClient.skills.getSkills(),
    ...options,
  });
};

export const useUserSkills = (userId: string, options?: UseQueryOptions<ApiResponse>) => {
  return useQuery({
    queryKey: ['skills', 'user', userId],
    queryFn: () => apiClient.skills.getUserSkills(userId),
    enabled: !!userId,
    ...options,
  });
};

// ============================================================================
// DASHBOARD HOOKS
// ============================================================================

export const useDashboardOverview = (options?: UseQueryOptions<ApiResponse>) => {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => apiClient.dashboard.getOverview(),
    refetchInterval: 60000, // Refetch every minute
    ...options,
  });
};

export const useDashboardMetrics = (timeRange?: string, options?: UseQueryOptions<ApiResponse>) => {
  return useQuery({
    queryKey: ['dashboard', 'metrics', timeRange],
    queryFn: () => apiClient.dashboard.getMetrics(timeRange),
    ...options,
  });
};

export const useDashboardActivity = (options?: UseQueryOptions<ApiResponse>) => {
  return useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: () => apiClient.dashboard.getActivity(),
    refetchInterval: 30000, // Refetch every 30 seconds
    ...options,
  });
};

// ============================================================================
// HEALTH & SYSTEM HOOKS
// ============================================================================

export const useHealthCheck = (options?: UseQueryOptions<ApiResponse>) => {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.health.check(),
    refetchInterval: 60000, // Refetch every minute
    ...options,
  });
};

export const useServiceStatus = (options?: UseQueryOptions<ApiResponse>) => {
  return useQuery({
    queryKey: ['services', 'status'],
    queryFn: () => apiClient.health.getServiceStatus(),
    refetchInterval: 30000, // Refetch every 30 seconds
    ...options,
  });
};

// ============================================================================
// LEGACY HOOKS (Backward Compatibility)
// ============================================================================

export const useGradebook = (studentId: string) => {
  const [grades, setGrades] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    const fetchData = async () => {
      try {
        const statsResponse = await apiClient.education.getStats(studentId);
        if (statsResponse.success) {
          setGrades(statsResponse.data?.grades || []);
          setAnalytics(statsResponse.data?.analytics);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [studentId]);

  return { grades, analytics, loading };
};

export const useTutoring = () => {
  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const startSession = useCallback(async (studentId: string, subject: string) => {
    setLoading(true);
    try {
      const response = await apiClient.tutor.getLearningPath(subject, 'beginner', []);
      if (response.success) {
        setSession({ sessionId: Date.now(), subject, studentId });
        setMessages([{ role: 'tutor', content: 'Welcome! How can I help you today?' }]);
        return response.data;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (!session) return;
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    try {
      const response = await apiClient.tutor.ask(message, session);
      if (response.success) {
        setMessages(prev => [...prev, { role: 'tutor', content: response.data?.answer || 'I understand.' }]);
        return response.data;
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }, [session]);

  return { session, messages, loading, startSession, sendMessage };
};

// Export apiClient for direct use
export { apiClient };