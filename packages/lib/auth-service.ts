/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

import { ApiClient } from './api-client';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export class AuthService extends ApiClient {
  constructor() {
    super('auth', process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001');
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    return this.post('/register', data);
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.post('/login', credentials);
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<User | null> {
    try {
      const response = await this.post('/verify', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.success ? response.data : null;
    } catch {
      return null;
    }
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<User | null> {
    try {
      const response = await this.get('/profile');
      return response.success ? response.data?.user : null;
    } catch {
      return null;
    }
  }

  /**
   * Handle Google OAuth callback
   */
  async handleGoogleCallback(code: string): Promise<AuthResponse> {
    return this.post('/auth/google/callback', { code });
  }

  /**
   * Handle GitHub OAuth callback
   */
  async handleGithubCallback(code: string): Promise<AuthResponse> {
    return this.post('/auth/github/callback', { code });
  }

  /**
   * Handle Apple OAuth callback
   */
  async handleAppleCallback(code: string, user?: string): Promise<AuthResponse> {
    return this.post('/auth/apple/callback', { code, user });
  }

  /**
   * Get Google OAuth authorization URL
   */
  async getGoogleAuthUrl(): Promise<{ authorizationUrl: string }> {
    const response = await this.get('/auth/google');
    return response.data;
  }

  /**
   * Get GitHub OAuth authorization URL
   */
  async getGithubAuthUrl(): Promise<{ authorizationUrl: string }> {
    const response = await this.get('/auth/github');
    return response.data;
  }

  /**
   * Get Apple OAuth authorization URL
   */
  async getAppleAuthUrl(): Promise<{ authorizationUrl: string }> {
    const response = await this.get('/auth/apple');
    return response.data;
  }
}

// Create and export auth service instance
export const authService = new AuthService();

// Authentication helpers
export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
};

export const setUser = (user: User) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const getUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
};

export const removeUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken() && !!getUser();
};

export const logout = () => {
  removeAuthToken();
  removeUser();
  // Redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/login';
  }
};

export default authService;