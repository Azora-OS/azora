/**
 * AUTH SERVICE
 * Connects frontend to auth-service backend (port 3001)
 * Provides all authentication functionality
 */

const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API || 'http://localhost:3001';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

class AuthService {
  private getHeaders(includeAuth = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('azora_token');
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('azora_token', token);
    }
  }

  private removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('azora_token');
    }
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await fetch(`${AUTH_API_URL}/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const result = await response.json();
    if (result.token) {
      this.setToken(result.token);
    }
    return result;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${AUTH_API_URL}/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const result = await response.json();
    if (result.token) {
      this.setToken(result.token);
    }
    return result;
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${AUTH_API_URL}/logout`, {
        method: 'POST',
        headers: this.getHeaders(true),
      });
    } finally {
      this.removeToken();
    }
  }

  async getProfile(): Promise<User> {
    const response = await fetch(`${AUTH_API_URL}/profile`, {
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to get profile');
    }

    return response.json();
  }

  async verifyToken(): Promise<boolean> {
    try {
      const response = await fetch(`${AUTH_API_URL}/verify`, {
        headers: this.getHeaders(true),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const response = await fetch(`${AUTH_API_URL}/refresh`, {
        method: 'POST',
        headers: this.getHeaders(true),
      });

      if (!response.ok) return null;

      const data = await response.json();
      if (data.token) {
        this.setToken(data.token);
        return data.token;
      }
      return null;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
