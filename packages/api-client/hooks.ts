/**
 * React hooks for Azora API Client
 */

import { useState, useEffect, useCallback } from 'react';
import { AzoraApiClient, ApiError } from './index';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const apiClient = new AzoraApiClient();

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response: any = await apiClient.auth.login(email, password);
      apiClient.setAuthToken(response.token);
      localStorage.setItem('azora_token', response.token);
      setUser(response.user);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('azora_token');
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('azora_token');
    if (token) apiClient.setAuthToken(token);
  }, []);

  return { user, loading, error, login, logout };
};

export const useCourses = (params?: any) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response: any = await apiClient.lms.getCourses(params);
        setCourses(response.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [JSON.stringify(params)]);

  return { courses, loading, error };
};

export const useEnrollments = (studentId: string) => {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    const fetchEnrollments = async () => {
      try {
        const response: any = await apiClient.lms.getEnrollments(studentId);
        setEnrollments(response.data || []);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, [studentId]);

  return { enrollments, loading };
};

export const useTutoring = () => {
  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const startSession = useCallback(async (studentId: string, subject: string) => {
    setLoading(true);
    try {
      const response: any = await apiClient.sapiens.startTutoring(studentId, subject);
      setSession(response.data);
      setMessages([{ role: 'tutor', content: response.data.welcomeMessage }]);
      return response.data;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (!session) return;
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    try {
      const response: any = await apiClient.sapiens.sendMessage(session.sessionId, message);
      setMessages(prev => [...prev, { role: 'tutor', content: response.data.message }]);
      return response.data;
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }, [session]);

  return { session, messages, loading, startSession, sendMessage };
};

export const useGradebook = (studentId: string) => {
  const [grades, setGrades] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    const fetchData = async () => {
      try {
        const [gradesRes, analyticsRes]: any = await Promise.all([
          apiClient.assessment.getGradebook(studentId),
          apiClient.assessment.getAnalytics(studentId)
        ]);
        setGrades(gradesRes.data || []);
        setAnalytics(analyticsRes.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [studentId]);

  return { grades, analytics, loading };
};

export const useWallet = (userId: string) => {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchWallet = async () => {
      try {
        const response: any = await apiClient.mint.getWallet(userId);
        setWallet(response.data);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, [userId]);

  return { wallet, loading };
};

export { apiClient };
