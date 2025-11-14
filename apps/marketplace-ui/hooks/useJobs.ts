import { useState, useEffect } from 'react';
import { api } from '../../../packages/shared-api/client';

const client = new api('http://localhost:4000/api');

export const useJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await client.forge.getJobs();
        setJobs(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const applyToJob = async (jobId: string, userId: string, applicationData: any) => {
    try {
      const result = await client.forge.apply(jobId, userId, applicationData);
      return result;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  return { jobs, loading, error, applyToJob };
};

export const useApplications = (userId: string) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await client.forge.getApplications(userId);
        setApplications(data);
      } catch (err) {
        console.error('Failed to fetch applications:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchApplications();
  }, [userId]);

  return { applications, loading };
};
