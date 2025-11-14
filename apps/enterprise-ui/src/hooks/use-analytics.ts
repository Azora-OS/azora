import { useQuery } from '@tanstack/react-query';
import { useApi } from '../lib/api-provider';

export function useAnalytics() {
  const api = useApi();

  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response: any = await api.request('/api/analytics/dashboard');
      return response?.data || {
        totalUsers: 0,
        activeUsers: 0,
        revenue: 0,
        growth: 0
      };
    },
    refetchInterval: 30000 // Refetch every 30s
  });
}

export function useSystemMetrics() {
  const api = useApi();

  return useQuery({
    queryKey: ['system-metrics'],
    queryFn: async () => {
      const response: any = await api.request('/api/health');
      return response?.services || {};
    },
    refetchInterval: 5000 // Refetch every 5s
  });
}
