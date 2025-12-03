/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { ApiClient, ApiResponse } from '../lib/api-client';

interface UseApiOptions<T> extends Omit<UseQueryOptions<ApiResponse<T>, Error>, 'queryKey' | 'queryFn'> {
  serviceName: string;
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  enabled?: boolean;
}

// Custom hook for API calls with automatic fallback to mock data
export function useApi<T = any>({
  serviceName,
  endpoint,
  method = 'GET',
  body,
  enabled = true,
  ...queryOptions
}: UseApiOptions<T>) {
  return useQuery({
    queryKey: [serviceName, endpoint, method, body],
    queryFn: async (): Promise<ApiResponse<T>> => {
      const client = new ApiClient(serviceName);

      switch (method) {
        case 'GET':
          return client.get<T>(endpoint);
        case 'POST':
          return client.post<T>(endpoint, body);
        case 'PUT':
          return client.put<T>(endpoint, body);
        case 'PATCH':
          return client.patch<T>(endpoint, body);
        case 'DELETE':
          return client.delete<T>(endpoint);
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    },
    enabled,
    retry: false, // Don't retry - fallback to mock data on failure
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...queryOptions,
  });
}

// Convenience hooks for specific services
export function useLmsApi<T = any>(endpoint: string, options?: Omit<UseApiOptions<T>, 'serviceName'>) {
  return useApi<T>({ serviceName: 'lms', endpoint, ...options });
}

export function useMintApi<T = any>(endpoint: string, options?: Omit<UseApiOptions<T>, 'serviceName'>) {
  return useApi<T>({ serviceName: 'mint', endpoint, ...options });
}

export function useNexusApi<T = any>(endpoint: string, options?: Omit<UseApiOptions<T>, 'serviceName'>) {
  return useApi<T>({ serviceName: 'nexus', endpoint, ...options });
}

export function useForgeApi<T = any>(endpoint: string, options?: Omit<UseApiOptions<T>, 'serviceName'>) {
  return useApi<T>({ serviceName: 'forge', endpoint, ...options });
}

export function useAegisApi<T = any>(endpoint: string, options?: Omit<UseApiOptions<T>, 'serviceName'>) {
  return useApi<T>({ serviceName: 'aegis', endpoint, ...options });
}

export function useAuthApi<T = any>(endpoint: string, options?: Omit<UseApiOptions<T>, 'serviceName'>) {
  return useApi<T>({ serviceName: 'auth', endpoint, ...options });
}

export function useComplianceApi<T = any>(endpoint: string, options?: Omit<UseApiOptions<T>, 'serviceName'>) {
  return useApi<T>({ serviceName: 'compliance', endpoint, ...options });
}

export function usePaymentApi<T = any>(endpoint: string, options?: Omit<UseApiOptions<T>, 'serviceName'>) {
  return useApi<T>({ serviceName: 'payment', endpoint, ...options });
}

export function useMarketplaceApi<T = any>(endpoint: string, options?: Omit<UseApiOptions<T>, 'serviceName'>) {
  return useApi<T>({ serviceName: 'marketplace', endpoint, ...options });
}

export function useAnalyticsApi<T = any>(endpoint: string, options?: Omit<UseApiOptions<T>, 'serviceName'>) {
  return useApi<T>({ serviceName: 'analytics', endpoint, ...options });
}