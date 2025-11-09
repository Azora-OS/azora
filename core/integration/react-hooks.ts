/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

REACT HOOKS
Custom hooks for easy integration in React components
*/

import { useState, useEffect, useCallback } from 'react';
import { authService } from './auth-service';
import { wsClient } from './websocket-client';
import {
  educationService,
  mintService,
  forgeService,
  sapiensService
} from './service-bridges';

// Auth Hook
export function useAuth() {
  const [user, setUser] = useState(authService.getUser());
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const user = await authService.login(email, password);
      setUser(user);
      return user;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  return { user, loading, login, logout, isAuthenticated: !!user };
}

// WebSocket Hook
export function useWebSocket(event: string, handler: (data: any) => void) {
  useEffect(() => {
    wsClient.on(event, handler);
    return () => wsClient.off(event, handler);
  }, [event, handler]);
}

// Course Hook
export function useCourse(courseId: string) {
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    educationService.getCourse(courseId)
      .then(setCourse)
      .finally(() => setLoading(false));
  }, [courseId]);

  return { course, loading };
}

// Wallet Hook
export function useWallet(userId: string) {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    mintService.getWallet(userId)
      .then(setWallet)
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useWebSocket('transaction:completed', refresh);
  useWebSocket('mining:reward', refresh);

  return { wallet, loading, refresh };
}

// Jobs Hook
export function useJobs(filters?: any) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    forgeService.getJobs(filters)
      .then(setJobs)
      .finally(() => setLoading(false));
  }, [filters]);

  return { jobs, loading };
}

// AI Chat Hook
export function useAIChat(userId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (message: string) => {
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    
    try {
      const response = await sapiensService.chat(userId, message);
      setMessages(prev => [...prev, { role: 'assistant', content: response.message }]);
      return response;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { messages, loading, sendMessage };
}
