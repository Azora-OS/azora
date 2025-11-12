/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

REACT HOOKS FOR DESIGN DATA ACCESS
Provides hooks for UI components to access real data
*/

import { useState, useEffect } from 'react';
import { designDataService } from './data-service';

/**
 * Hook to get user wallet balance
 */
export function useWalletBalance(userId: string | null) {
  const [data, setData] = useState<{
    balance: number;
    currency: string;
    change: number;
    changePercent: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        const result = await designDataService.getUserWalletBalance(userId);
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch wallet balance'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [userId]);

  return { data, loading, error };
}

/**
 * Hook to get student progress
 */
export function useStudentProgress(userId: string | null) {
  const [data, setData] = useState<{
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    averageProgress: number;
    recentActivity: Array<{
      courseId: string;
      courseTitle: string;
      progress: number;
      lastActivity: Date;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        const result = await designDataService.getStudentProgress(userId);
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch student progress'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [userId]);

  return { data, loading, error };
}

/**
 * Hook to get system health
 */
export function useHealthCheck() {
  const [data, setData] = useState<{
    status: 'healthy' | 'degraded' | 'down';
    services: Array<{
      name: string;
      status: 'healthy' | 'degraded' | 'down';
      latency?: number;
    }>;
    timestamp: Date;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        const result = await designDataService.getSystemHealth();
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch health check'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    // Refresh every 15 seconds
    const interval = setInterval(fetchData, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { data, loading, error };
}

/**
 * Hook to get comprehensive dashboard data
 */
export function useDashboardData(userId: string | null) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        const result = await designDataService.getCachedDashboardData(userId);
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch dashboard data'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [userId]);

  return { data, loading, error };
}

/**
 * Unified API hook (matches expected interface from apps/web/page.tsx)
 */
export function useApi(userId: string | null) {
  const wallet = useWalletBalance(userId);
  const progress = useStudentProgress(userId);
  const health = useHealthCheck();

  return {
    useWalletBalance: () => wallet,
    useStudentProgress: () => progress,
    useHealthCheck: () => health,
  };
}

export default {
  useWalletBalance,
  useStudentProgress,
  useHealthCheck,
  useDashboardData,
  useApi,
};
