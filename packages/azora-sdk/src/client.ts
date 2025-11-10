import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { AzoraConfig } from './types';
import { AuthService } from './services/auth.service';
import { EducationService } from './services/education.service';
import { PaymentService } from './services/payment.service';
import { SafetyService } from './services/safety.service';

const DEFAULT_BASE_URLS = {
  development: 'http://localhost:4000/api',
  staging: 'https://staging-api.azora.world/api',
  production: 'https://api.azora.world/api'
};

export class AzoraClient {
  private axios: AxiosInstance;
  public auth: AuthService;
  public education: EducationService;
  public payment: PaymentService;
  public safety: SafetyService;
  private config: AzoraConfig;

  constructor(config: AzoraConfig) {
    this.config = {
      environment: 'development',
      timeout: 30000,
      retries: 3,
      debug: false,
      ...config
    };

    // Determine base URL
    const baseURL = this.config.baseURL || 
      DEFAULT_BASE_URLS[this.config.environment || 'development'];

    // Create axios instance
    const axiosConfig: AxiosRequestConfig = {
      baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey
      }
    };

    this.axios = axios.create(axiosConfig);

    // Add request interceptor for auth tokens
    this.axios.interceptors.request.use(
      (config) => {
        if (this.config.debug) {
          console.log('[Azora SDK] Request:', config.method?.toUpperCase(), config.url);
        }
        
        // Add auth token if available
        const token = this.getStoredToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => {
        if (this.config.debug) {
          console.error('[Azora SDK] Request error:', error);
        }
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.axios.interceptors.response.use(
      (response) => {
        if (this.config.debug) {
          console.log('[Azora SDK] Response:', response.status, response.config.url);
        }
        return response;
      },
      async (error) => {
        if (this.config.debug) {
          console.error('[Azora SDK] Response error:', error.response?.status, error.message);
        }

        // Handle token refresh on 401
        if (error.response?.status === 401 && !error.config._retry) {
          error.config._retry = true;
          
          const refreshToken = this.getStoredRefreshToken();
          if (refreshToken) {
            try {
              const response = await this.auth.refreshToken(refreshToken);
              if (response.success && response.data) {
                this.setStoredToken(response.data.accessToken);
                if (response.data.refreshToken) {
                  this.setStoredRefreshToken(response.data.refreshToken);
                }
                
                // Retry original request
                error.config.headers.Authorization = `Bearer ${response.data.accessToken}`;
                return this.axios.request(error.config);
              }
            } catch (refreshError) {
              // Refresh failed, clear tokens
              this.clearStoredTokens();
            }
          }
        }

        return Promise.reject(error);
      }
    );

    // Initialize services
    this.auth = new AuthService(this.axios);
    this.education = new EducationService(this.axios);
    this.payment = new PaymentService(this.axios);
    this.safety = new SafetyService(this.axios);
  }

  // Token management helpers
  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('azora_access_token');
    }
    return null;
  }

  private getStoredRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('azora_refresh_token');
    }
    return null;
  }

  private setStoredToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('azora_access_token', token);
    }
  }

  private setStoredRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('azora_refresh_token', token);
    }
  }

  private clearStoredTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('azora_access_token');
      localStorage.removeItem('azora_refresh_token');
    }
  }

  // Public token management
  public setAuthToken(accessToken: string, refreshToken?: string): void {
    this.setStoredToken(accessToken);
    if (refreshToken) {
      this.setStoredRefreshToken(refreshToken);
    }
  }

  public clearAuth(): void {
    this.clearStoredTokens();
  }

  // Health check
  public async healthCheck(): Promise<{ healthy: boolean; version?: string }> {
    try {
      const response = await this.axios.get('/health');
      return { healthy: true, version: response.data.version };
    } catch (error) {
      return { healthy: false };
    }
  }
}
