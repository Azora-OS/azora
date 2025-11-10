/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

REACT HOOKS FOR API CLIENT
Provides React hooks for all API operations
*/

import { useState, useCallback } from 'react';
import { getAPIClient, UnifiedAPIClient } from './client';

/**
 * Hook for API mutations
 */
export function useMutation<TData = any, TVariables = any>(
  mutationFn: (client: UnifiedAPIClient, variables: TVariables) => Promise<TData>
) {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (variables: TVariables) => {
    try {
      setLoading(true);
      setError(null);
      const client = getAPIClient();
      const result = await mutationFn(client, variables);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Mutation failed');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [mutationFn]);

  return { mutate, data, loading, error };
}

/**
 * Hook for API queries
 */
export function useQuery<TData = any>(
  queryFn: (client: UnifiedAPIClient) => Promise<TData>,
  options?: { enabled?: boolean; refetchInterval?: number }
) {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (options?.enabled === false) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const client = getAPIClient();
      const result = await queryFn(client);
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Query failed');
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [queryFn, options?.enabled]);

  // Auto-fetch on mount
  useState(() => {
    fetch();
    if (options?.refetchInterval) {
      const interval = setInterval(fetch, options.refetchInterval);
      return () => clearInterval(interval);
    }
  });

  return { data, loading, error, refetch: fetch };
}

export default {
  useMutation,
  useQuery,
};
