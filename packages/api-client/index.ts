/**
 * AZORA PROPRIETARY LICENSE
 * Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
 * 
 * Azora API Client - Comprehensive Backend Integration
 * Connects all frontend apps to backend services
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL || 'http://localhost:4000';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class AzoraApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private headers: Record<string, string> = {};

  constructor(config?: { baseUrl?: string }) {
    this.baseUrl = config?.baseUrl || API_URL;
  }

  setAuthToken(token: string) {
    this.token = token;
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken() {
    this.token = null;
    delete this.headers['Authorization'];
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers = {
      'Content-Type': 'application/json',
      ...this.headers,
      ...options.headers,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication API
  auth = {
    login: (email: string, password: string) =>
      this.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (data: { email: string; password: string; name: string }) =>
      this.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    logout: () =>
      this.request('/api/auth/logout', { method: 'POST' }),
    profile: () => this.request('/api/auth/profile'),
    updateProfile: (data: any) =>
      this.request('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  };

  // Education API
  education = {
    getCourses: (params?: { category?: string; search?: string }) =>
      this.request(`/api/courses${params ? '?' + new URLSearchParams(params as any).toString() : ''}`),
    getCourse: (id: string) => this.request(`/api/courses/${id}`),
    enroll: (courseId: string) =>
      this.request(`/api/courses/${courseId}/enroll`, { method: 'POST' }),
    getProgress: (studentId: string) =>
      this.request(`/api/users/${studentId}/progress`),
    getEnrollments: () => this.request('/api/enrollments'),
    getStats: (userId: string) => this.request(`/api/users/${userId}/stats`),
    getRewards: (userId: string) => this.request(`/api/users/${userId}/rewards`),
  };

  // Wallet & Payments API
  wallet = {
    getBalance: () => this.request('/api/wallet/balance'),
    getTransactions: (params?: { limit?: number; offset?: number }) =>
      this.request(`/api/transactions${params ? '?' + new URLSearchParams(params as any).toString() : ''}`),
    transfer: (to: string, amount: number, currency: string) =>
      this.request('/api/wallet/transfer', {
        method: 'POST',
        body: JSON.stringify({ to, amount, currency }),
      }),
  };

  payments = {
    createPayment: (data: { amount: number; currency: string; description?: string }) =>
      this.request('/api/payments/create', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getPaymentHistory: () => this.request('/api/payments/history'),
    getSubscriptionPlans: () => this.request('/api/payments/plans'),
    subscribe: (planId: string) =>
      this.request('/api/payments/subscribe', {
        method: 'POST',
        body: JSON.stringify({ planId }),
      }),
  };

  // AI Tutor API
  tutor = {
    ask: (question: string, context?: any) =>
      this.request('/api/tutor/ask', {
        method: 'POST',
        body: JSON.stringify({ question, context }),
      }),
    getLearningPath: (subject: string, level: string, goals: string[]) =>
      this.request('/api/tutor/learning-path', {
        method: 'POST',
        body: JSON.stringify({ subject, level, goals }),
      }),
    getRecommendations: () => this.request('/api/tutor/recommendations'),
  };

  // Jobs & Marketplace API
  jobs = {
    getJobs: (params?: { category?: string; location?: string; search?: string }) =>
      this.request(`/api/jobs${params ? '?' + new URLSearchParams(params as any).toString() : ''}`),
    getJob: (id: string) => this.request(`/api/jobs/${id}`),
    apply: (jobId: string, applicationData: any) =>
      this.request(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        body: JSON.stringify(applicationData),
      }),
    getApplications: () => this.request('/api/applications'),
    getApplicationStatus: (applicationId: string) =>
      this.request(`/api/applications/${applicationId}`),
  };

  marketplace = {
    getListings: (params?: { category?: string; search?: string }) =>
      this.request(`/api/marketplace/listings${params ? '?' + new URLSearchParams(params as any).toString() : ''}`),
    getListing: (id: string) => this.request(`/api/marketplace/listings/${id}`),
    createListing: (data: any) =>
      this.request('/api/marketplace/listings', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  };

  // Skills & Talent API
  skills = {
    getSkills: () => this.request('/api/skills'),
    getUserSkills: (userId: string) => this.request(`/api/users/${userId}/skills`),
    addSkill: (skillId: string) =>
      this.request('/api/skills/add', {
        method: 'POST',
        body: JSON.stringify({ skillId }),
      }),
    verifySkill: (userId: string, skillId: string) =>
      this.request('/api/skills/verify', {
        method: 'POST',
        body: JSON.stringify({ userId, skillId }),
      }),
  };

  // Health & System API
  health = {
    check: () => this.request('/api/health'),
    getServiceStatus: () => this.request('/api/services/status'),
  };

  // Dashboard & Analytics API
  dashboard = {
    getOverview: () => this.request('/api/dashboard/overview'),
    getMetrics: (timeRange?: string) =>
      this.request(`/api/dashboard/metrics${timeRange ? '?range=' + timeRange : ''}`),
    getActivity: () => this.request('/api/dashboard/activity'),
  };
}

// Export singleton instance
export const apiClient = new AzoraApiClient();

// Export class for custom instances
export default AzoraApiClient;