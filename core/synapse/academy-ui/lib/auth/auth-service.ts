/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Authentication Service for Azora Academy
 * Handles @ac.azora.world email domain validation and user authentication
 */

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'student' | 'instructor' | 'admin';
  avatar?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'student' | 'instructor';
}

class AuthService {
  private baseUrl: string;

  constructor() {
    // Use environment variable or default to auth service
    this.baseUrl = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:4000/api/auth';
  }

  /**
   * Validate email domain for @ac.azora.world or @edu.azora.world
   */
  private validateEmailDomain(email: string): boolean {
    const allowedDomains = ['@ac.azora.world', '@edu.azora.world', '@azora.world', '@azora.es'];
    return allowedDomains.some(domain => email.toLowerCase().endsWith(domain.toLowerCase()));
  }

  /**
   * Register a new student with @ac.azora.world email
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    // Validate email domain
    if (!this.validateEmailDomain(data.email)) {
      throw new Error('Email must be from @ac.azora.world (university) or @edu.azora.world (K-12) domain');
    }

    try {
      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
          role: data.role || 'student',
          domain: 'ac.azora.world',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const result = await response.json();

      // Store token in localStorage
      if (result.token) {
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
      }

      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login with @ac.azora.world email
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Validate email domain
    if (!this.validateEmailDomain(credentials.email)) {
      throw new Error('Email must be from @ac.azora.world (university) or @edu.azora.world (K-12) domain');
    }

    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const result = await response.json();

      // Store token in localStorage
      if (result.token) {
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
      }

      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        await fetch(`${this.baseUrl}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  }

  /**
   * Get current user from token
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getToken();
      if (!token) return null;

      const response = await fetch(`${this.baseUrl}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.logout();
        return null;
      }

      const result = await response.json();
      return result.user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  /**
   * Get stored user
   */
  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error('Email verification failed');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    if (!this.validateEmailDomain(email)) {
      throw new Error('Email must be from @ac.azora.world domain');
    }

    try {
      const response = await fetch(`${this.baseUrl}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Password reset request failed');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        throw new Error('Password reset failed');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();

