import { useState, useEffect } from 'react';

const ANALYTICS_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const useAnalytics = (startDate?: string, endDate?: string) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        const response = await fetch(`${ANALYTICS_URL}/analytics/metrics?${params}`);
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [startDate, endDate]);

  const trackEvent = async (type: string, data: any) => {
    try {
      await fetch(`${ANALYTICS_URL}/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...data, timestamp: new Date() })
      });
    } catch (err) {
      console.error('Failed to track event:', err);
    }
  };

  return { metrics, loading, trackEvent };
};

export const useDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch(`${ANALYTICS_URL}/analytics/dashboard`);
        const data = await response.json();
        setDashboard(data);
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  return { dashboard, loading };
};
