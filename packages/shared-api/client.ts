/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

UNIFIED API CLIENT
Provides a single, consistent API client for all frontend components
*/

import { getServiceRegistry } from '@azora/shared-services/service-registry';

export interface APIClientConfig {
  baseUrl?: string;
  token?: string;
  timeout?: number;
}

/**
 * Unified API Client
 * Single client for all API calls across the system
 */
export class UnifiedAPIClient {
  private baseUrl: string;
  private token?: string;
  private timeout: number;

  constructor(config: APIClientConfig = {}) {
    this.baseUrl = config.baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    this.token = config.token;
    this.timeout = config.timeout || 30000;
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Make API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }));
        throw new APIError(error.error || 'Request failed', response.status, error);
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new APIError('Request timeout', 408);
      }
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Service-specific methods
  async getWalletBalance(userId: string) {
    return this.get(`/api/design/wallet-balance`);
  }

  async getStudentProgress(userId: string) {
    return this.get(`/api/design/student-progress`);
  }

  async getHealthCheck() {
    return this.get(`/api/design/health-check`);
  }

  async getDashboard(userId: string) {
    return this.get(`/api/design/dashboard`);
  }

  // Course methods
  async getCourses(filters?: any) {
    return this.get(`/api/lms/courses${filters ? '?' + new URLSearchParams(filters).toString() : ''}`);
  }

  async enrollInCourse(courseId: string) {
    return this.post(`/api/lms/enrollments`, { courseId });
  }

  async updateProgress(enrollmentId: string, progress: number, completed?: boolean) {
    return this.patch(`/api/lms/enrollments/${enrollmentId}/progress`, { progress, completed });
  }

  // Retail AI methods
  async getInventory() {
    return this.get(`/api/retail-ai/inventory`);
  }

  async getForecast(itemId: string, days: number = 30) {
    return this.get(`/api/retail-ai/forecast/${itemId}?days=${days}`);
  }

  async optimizePricing(itemId: string) {
    return this.get(`/api/retail-ai/pricing/optimize/${itemId}`);
  }

  async getCustomerInsights() {
    return this.get(`/api/retail-ai/insights/customer-behavior`);
  }

  // Institutional methods
  async getStudents(filters?: any) {
    return this.get(`/api/institutional/students${filters ? '?' + new URLSearchParams(filters).toString() : ''}`);
  }

  async registerStudent(data: any) {
    return this.post(`/api/institutional/students/register`, data);
  }

  async getStudentCredentials(studentId: string) {
    return this.get(`/api/institutional/students/${studentId}/credentials`);
  }

  async getMonitoringDashboard() {
    return this.get(`/api/institutional/monitoring/dashboard`);
  }
}

/**
 * API Error
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Export singleton instance
let apiClientInstance: UnifiedAPIClient | null = null;

export function getAPIClient(config?: APIClientConfig): UnifiedAPIClient {
  if (!apiClientInstance) {
    apiClientInstance = new UnifiedAPIClient(config);
  }
  return apiClientInstance;
}

export default UnifiedAPIClient;
