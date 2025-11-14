import { useState, useEffect } from 'react';

const MONITORING_URL = 'http://localhost:3013';

export const useServiceStatus = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`${MONITORING_URL}/api/services/status`);
        const data = await response.json();
        setServices(data);
      } catch (err) {
        console.error('Failed to fetch service status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  return { services, loading };
};
