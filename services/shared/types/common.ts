/**
 * Shared TypeScript Types
 * 
 * PRODUCTION-GRADE type safety
 * Use these instead of 'any'
 */

// API Response types
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  requestId?: string;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    statusCode: number;
    details?: any;
  };
  requestId?: string;
  timestamp: string;
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Database types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Service configuration
export interface ServiceConfig {
  port: number;
  environment: 'development' | 'production' | 'test';
  databaseUrl?: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

// Health check response
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  service: string;
  version: string;
  timestamp: string;
  uptime: number;
  checks: {
    database?: 'connected' | 'disconnected' | 'error';
    redis?: 'connected' | 'disconnected' | 'error';
    [key: string]: string | undefined;
  };
}

// User types (common across services)
export interface User {
  id: string;
  email: string;
  studentNumber?: string;
  role: 'student' | 'instructor' | 'admin' | 'staff';
  createdAt: Date;
  updatedAt: Date;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncResult<T, E = Error> = Promise<{ data: T; error: null } | { data: null; error: E }>;
