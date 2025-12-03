/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora SDK Type Definitions
 */

export interface AzoraSDKConfig {
  apiKey: string;
  environment?: 'development' | 'staging' | 'production';
  baseURL?: string;
  timeout?: number;
  retries?: number;
  debug?: boolean;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  currency: string;
  enrollments: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  userId: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RetailAnalytics {
  locationId: string;
  footfall: number;
  conversionRate: number;
  revenue: number;
  period: {
    start: string;
    end: string;
  };
}

export interface ColdChainShipment {
  id: string;
  origin: string;
  destination: string;
  status: string;
  temperature: number;
  compliance: number;
}

export interface SafetyIncident {
  id: string;
  type: string;
  severity: string;
  location: {
    latitude: number;
    longitude: number;
  };
  status: string;
  timestamp: string;
}

export interface ArbiterProfile {
  id: string;
  reputation: number;
  casesCompleted: number;
  stake: number;
  status: string;
}

export type RequestOptions = {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
};
