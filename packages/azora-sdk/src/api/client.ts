/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import type { AzoraConfig, ApiResponse } from '../types';

interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
}

/**
 * Azora API Client
 * 
 * Handles all HTTP requests to Azora OS services
 */
export class AzoraAPIClient {
  private config: AzoraConfig;
  private baseURL: string;

  public education: EducationAPI;
  public payments: PaymentsAPI;
  public auth: AuthAPI;
  public retailAI: RetailAIAPI;
  public coldChain: ColdChainAPI;
  public safety: SafetyAPI;
  public arbiter: ArbiterAPI;

  constructor(config: AzoraConfig) {
    this.config = config;
    this.baseURL = config.baseURL || this.getDefaultBaseURL(config.environment!);

    this.education = new EducationAPI(this);
    this.payments = new PaymentsAPI(this);
    this.auth = new AuthAPI(this);
    this.retailAI = new RetailAIAPI(this);
    this.coldChain = new ColdChainAPI(this);
    this.safety = new SafetyAPI(this);
    this.arbiter = new ArbiterAPI(this);
  }

  async request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
      ...options?.headers
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: AbortSignal.timeout(options?.timeout || this.config.timeout || 30000)
      });

      const result = await response.json();
      return result;
    } catch (error) {
      if (this.config.debug) {
        console.error('API Request Error:', error);
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  updateConfig(config: AzoraConfig): void {
    this.config = config;
    this.baseURL = config.baseURL || this.getDefaultBaseURL(config.environment!);
  }

  private getDefaultBaseURL(environment: string): string {
    const urls = {
      development: 'http://localhost:3000',
      staging: 'https://staging-api.azora.co.za',
      production: 'https://api.azora.co.za'
    };
    return urls[environment as keyof typeof urls] || urls.production;
  }
}

// API Modules

class EducationAPI {
  constructor(private client: AzoraAPIClient) { }

  async listCourses(page = 1, perPage = 20) {
    return this.client.request('GET', `/api/v1/courses?page=${page}&perPage=${perPage}`);
  }

  async getCourse(courseId: string) {
    return this.client.request('GET', `/api/v1/courses/${courseId}`);
  }

  async enroll(courseId: string, userId: string) {
    return this.client.request('POST', `/api/v1/courses/${courseId}/enroll`, { userId });
  }
}

class PaymentsAPI {
  constructor(private client: AzoraAPIClient) { }

  async createPayment(data: { amount: number; currency: string; userId: string; metadata?: any }) {
    return this.client.request('POST', '/api/v1/payments', data);
  }

  async getPayment(paymentId: string) {
    return this.client.request('GET', `/api/v1/payments/${paymentId}`);
  }
}

class AuthAPI {
  constructor(private client: AzoraAPIClient) { }

  async login(email: string, password: string) {
    return this.client.request('POST', '/api/v1/auth/login', { email, password });
  }

  async register(data: { email: string; password: string; name: string }) {
    return this.client.request('POST', '/api/v1/auth/register', data);
  }

  async refreshToken(refreshToken: string) {
    return this.client.request('POST', '/api/v1/auth/refresh', { refreshToken });
  }
}

class RetailAIAPI {
  constructor(private client: AzoraAPIClient) { }

  async getDashboard(clientId: string) {
    return this.client.request('GET', `/api/v1/retail/dashboard/${clientId}`);
  }

  async getAnalytics(clientId: string, startDate: string, endDate: string) {
    return this.client.request('GET', `/api/v1/retail/analytics?clientId=${clientId}&startDate=${startDate}&endDate=${endDate}`);
  }
}

class ColdChainAPI {
  constructor(private client: AzoraAPIClient) { }

  async getShipmentStatus(shipmentId: string) {
    return this.client.request('GET', `/api/v1/shipments/${shipmentId}/status`);
  }

  async startMonitoring(shipmentId: string, data: any) {
    return this.client.request('POST', `/api/v1/shipments/${shipmentId}/monitor`, data);
  }
}

class SafetyAPI {
  constructor(private client: AzoraAPIClient) { }

  async reportIncident(data: any) {
    return this.client.request('POST', '/api/v1/incidents', data);
  }

  async getIncidentsByArea(latitude: number, longitude: number, radius: number) {
    return this.client.request('GET', `/api/v1/incidents/area?latitude=${latitude}&longitude=${longitude}&radius=${radius}`);
  }
}

class ArbiterAPI {
  constructor(private client: AzoraAPIClient) { }

  async getReputation(arbiterId: string) {
    return this.client.request('GET', `/api/v1/reputation/${arbiterId}`);
  }

  async stakeTokens(arbiterId: string, amount: number) {
    return this.client.request('POST', '/api/v1/stake', { arbiterId, amount });
  }

  async getTopArbiters(limit = 10) {
    return this.client.request('GET', `/api/v1/arbiters/top?limit=${limit}`);
  }
}
