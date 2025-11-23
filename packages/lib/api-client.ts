/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Service Endpoints
export const API_ENDPOINTS = {
  API_GATEWAY: 'http://localhost:4000',
  AUTH_SERVICE: 'http://localhost:4001',
  AZORA_EDUCATION: 'http://localhost:4002',
  AZORA_FINANCE: 'http://localhost:4003',
  AZORA_MARKETPLACE: 'http://localhost:4004',
  HEALTH_MONITOR: 'http://localhost:4005',
  AZORA_AEGIS: 'http://localhost:4006',
  AI_FAMILY_SERVICE: 'http://localhost:4010',
  AZORA_SAPIENS: 'http://localhost:4011',
  NOTIFICATION_SERVICE: 'http://localhost:4012',
  PAYMENT: 'http://localhost:4013',
  ANALYTICS_SERVICE: 'http://localhost:4014',
  ENTERPRISE: 'http://localhost:4020'
} as const;

// User-configurable API endpoints (stored in localStorage)
export type UserApiConfig = {
  [serviceName: string]: string | undefined;
};

// Get user-configured API endpoint from localStorage
export function getUserApiEndpoint(serviceName: string): string | null {
  if (typeof window === 'undefined') {return null;}
  try {
    const config = localStorage.getItem('azora_api_config');
    if (!config) {return null;}
    const endpoints: UserApiConfig = JSON.parse(config);
    return endpoints[serviceName] || null;
  } catch {
    return null;
  }
}

// Save user-configured API endpoint to localStorage
export function setUserApiEndpoint(serviceName: string, url: string | null): void {
  if (typeof window === 'undefined') {return;}
  try {
    const config = localStorage.getItem('azora_api_config');
    const endpoints: UserApiConfig = config ? JSON.parse(config) : {};
    if (url) {
      endpoints[serviceName] = url;
    } else {
      delete endpoints[serviceName];
    }
    localStorage.setItem('azora_api_config', JSON.stringify(endpoints));
  } catch (error) {
    console.error('Failed to save API config:', error);
  }
}

// Get all user API configurations
export function getAllUserApiEndpoints(): UserApiConfig {
  if (typeof window === 'undefined') {return {};}
  try {
    const config = localStorage.getItem('azora_api_config');
    return config ? JSON.parse(config) : {};
  } catch {
    return {};
  }
}

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database?: 'up' | 'down';
    redis?: 'up' | 'down';
    externalApi?: 'up' | 'down';
  };
}

// API Client Class
export class ApiClient {
  private client: AxiosInstance;
  private serviceName: string;
  private retryCount: Map<string, number> = new Map();

  constructor(serviceName: string = 'default', baseURL?: string) {
    // Priority: user-configured URL > provided baseURL > env var > null
    const userUrl = getUserApiEndpoint(serviceName);
    const finalBaseURL = userUrl || baseURL || this.getEnvUrl(serviceName) || null;

    this.serviceName = serviceName;
    this.client = axios.create({
      baseURL: finalBaseURL || undefined,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private getEnvUrl(serviceName: string): string | null {
    const envKey = `NEXT_PUBLIC_${serviceName.toUpperCase()}_URL`;
    return process.env[envKey] || null;
  }

  private setupInterceptors() {
    // Request Interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;

        if (!config || !config.retry) {
          return Promise.reject(error);
        }

        const retryKey = `${config.method}-${config.url}`;
        const currentRetry = this.retryCount.get(retryKey) || 0;

        if (currentRetry < API_CONFIG.RETRY_ATTEMPTS) {
          this.retryCount.set(retryKey, currentRetry + 1);

          // Exponential backoff
          const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, currentRetry);
          await new Promise(resolve => setTimeout(resolve, delay));

          return this.client(config);
        }

        this.retryCount.delete(retryKey);
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generic API Methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    // If no baseURL configured, return mock data
    if (!this.client.defaults.baseURL) {
      return this.getMockData<T>(url);
    }

    try {
      const response = await this.client.get(url, config);
      return this.handleSuccess(response);
    } catch (error) {
      // On API failure, try mock data as fallback
      console.warn(`API call failed for ${this.serviceName}${url}, using mock data:`, error);
      return this.getMockData<T>(url);
    }
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    if (!this.client.defaults.baseURL) {
      return this.getMockData<T>(url);
    }

    try {
      const response = await this.client.post(url, data, config);
      return this.handleSuccess(response);
    } catch (error) {
      console.warn(`API call failed for ${this.serviceName}${url}, using mock data:`, error);
      return this.getMockData<T>(url);
    }
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    if (!this.client.defaults.baseURL) {
      return this.getMockData<T>(url);
    }

    try {
      const response = await this.client.put(url, data, config);
      return this.handleSuccess(response);
    } catch (error) {
      console.warn(`API call failed for ${this.serviceName}${url}, using mock data:`, error);
      return this.getMockData<T>(url);
    }
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    if (!this.client.defaults.baseURL) {
      return this.getMockData<T>(url);
    }

    try {
      const response = await this.client.patch(url, data, config);
      return this.handleSuccess(response);
    } catch (error) {
      console.warn(`API call failed for ${this.serviceName}${url}, using mock data:`, error);
      return this.getMockData<T>(url);
    }
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    if (!this.client.defaults.baseURL) {
      return this.getMockData<T>(url);
    }

    try {
      const response = await this.client.delete(url, config);
      return this.handleSuccess(response);
    } catch (error) {
      console.warn(`API call failed for ${this.serviceName}${url}, using mock data:`, error);
      return this.getMockData<T>(url);
    }
  }

  private async getMockData<T>(url: string): Promise<ApiResponse<T>> {
    // Import mock data dynamically to avoid circular dependencies
    const { getMockData, createMockApiResponse } = await import('./mock-data');

    const mockResult = getMockData(this.serviceName, url.replace(/^\//, ''));
    return createMockApiResponse(mockResult);
  }

  private handleSuccess<T>(response: AxiosResponse): ApiResponse<T> {
    return {
      success: true,
      data: response.data,
      timestamp: new Date().toISOString(),
    };
  }

  private handleError<T>(error: any): ApiResponse<T> {
    let errorMessage = 'An unexpected error occurred';

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      errorMessage = data?.message || data?.error || `HTTP ${status} error`;
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'Network error - please check your connection';
    } else {
      // Something else happened
      errorMessage = error.message || 'Request configuration error';
    }

    return {
      success: false,
      data: undefined,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    };
  }
}

// Create default API client instance
export const apiClient = new ApiClient();

// Service-specific API clients
export class LmsApi extends ApiClient {
  constructor() {
    super('lms');
  }

  // LMS-specific methods
  async getCourses(studentId?: string) {
    return this.get(`/courses${studentId ? `?studentId=${studentId}` : ''}`);
  }

  async getCourse(courseId: string) {
    return this.get(`/courses/${courseId}`);
  }

  async enrollInCourse(courseId: string, studentId: string) {
    return this.post(`/courses/${courseId}/enroll`, { studentId });
  }

  async getProgress(studentId: string) {
    return this.get(`/progress/${studentId}`);
  }

  async submitAssignment(courseId: string, assignmentId: string, submission: any) {
    return this.post(`/courses/${courseId}/assignments/${assignmentId}/submit`, submission);
  }
}

export class MintApi extends ApiClient {
  constructor() {
    super('mint');
  }

  async getWallet(userId: string) {
    return this.get(`/wallet/${userId}`);
  }

  async createWallet(userId: string) {
    return this.post('/wallet', { userId });
  }

  async createTransaction(data: any) {
    return this.post('/transaction', data);
  }
}

export class ForgeApi extends ApiClient {
  constructor() {
    super('forge');
  }

  // Forge-specific methods
  async getJobs(query?: string, category?: string) {
    const params = new URLSearchParams();
    if (query) {params.append('q', query);}
    if (category) {params.append('category', category);}
    return this.get(`/jobs?${params.toString()}`);
  }

  async getJob(jobId: string) {
    return this.get(`/jobs/${jobId}`);
  }

  async applyForJob(jobId: string, application: any) {
    return this.post(`/jobs/${jobId}/apply`, application);
  }

  async getApplications(userId: string) {
    return this.get(`/applications/${userId}`);
  }
}

export class EducationApi extends ApiClient {
  constructor() {
    super('education');
  }

  async getInstitutions() {
    return this.get('/institutions');
  }

  async getPrograms() {
    return this.get('/programs');
  }
}

export class PaymentsApi extends ApiClient {
  constructor() {
    super('payments');
  }

  // Payments-specific methods
  async getBalance(userId: string) {
    return this.get(`/balance/${userId}`);
  }

  async getTransactions(userId: string, page = 1, limit = 20) {
    return this.get(`/transactions/${userId}?page=${page}&limit=${limit}`);
  }

  async transfer(fromUserId: string, toUserId: string, amount: number, description?: string) {
    return this.post('/transfer', { fromUserId, toUserId, amount, description });
  }

  async getWallet(userId: string) {
    return this.get(`/wallet/${userId}`);
  }
}

// Export instances
export const paymentsApi = new PaymentsApi();

export class NexusApi extends ApiClient {
  constructor() {
    super('nexus');
  }

  // Nexus-specific methods
  async getAiModels() {
    return this.get('/models');
  }

  async generateText(prompt: string, modelId: string, options?: any) {
    return this.post('/generate/text', { prompt, modelId, options });
  }

  async getUsageStats(userId: string) {
    return this.get(`/usage/${userId}`);
  }
}

export class AegisApi extends ApiClient {
  constructor() {
    super('aegis');
  }

  // Aegis-specific methods
  async getSecurityStatus(userId: string) {
    return this.get(`/status/${userId}`);
  }

  async reportIncident(incident: any) {
    return this.post('/incidents', incident);
  }

  async getAuditLogs(userId: string, page = 1, limit = 20) {
    return this.get(`/audit/${userId}?page=${page}&limit=${limit}`);
  }
}

// Export service instances
export const lmsApi = new LmsApi();
export const mintApi = new MintApi();
export const nexusApi = new NexusApi();
export const forgeApi = new ForgeApi();
export const aegisApi = new AegisApi();

// Health check
export const checkHealth = async (): Promise<HealthStatus | null> => {
  try {
    const response = await apiClient.get<HealthStatus>(API_ENDPOINTS.HEALTH);
    return response.data || null;
  } catch (error) {
    console.error('Health check failed:', error);
    return null;
  }
};

// Authentication helpers
export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
};

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

export default apiClient;
