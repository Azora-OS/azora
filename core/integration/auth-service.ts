/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

AUTHENTICATION SERVICE
Complete auth flows with JWT, OAuth, and MFA support
*/

import { azoraAPI } from './api-gateway-config';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface User {
  id: string;
  email: string;
  role: string;
  profile: any;
}

export class AuthService {
  private user: User | null = null;
  private tokens: AuthTokens | null = null;

  async login(email: string, password: string): Promise<User> {
    const response = await azoraAPI.post('/api/auth/login', { email, password });
    this.setAuth(response.user, response.tokens);
    return response.user;
  }

  async loginWithOAuth(provider: string, code: string): Promise<User> {
    const response = await azoraAPI.post('/api/auth/oauth', { provider, code });
    this.setAuth(response.user, response.tokens);
    return response.user;
  }

  async register(data: { email: string; password: string; name: string }): Promise<User> {
    const response = await azoraAPI.post('/api/auth/register', data);
    this.setAuth(response.user, response.tokens);
    return response.user;
  }

  async verifyMFA(code: string): Promise<boolean> {
    const response = await azoraAPI.post('/api/auth/mfa/verify', { code });
    return response.verified;
  }

  async refreshToken(): Promise<void> {
    if (!this.tokens?.refreshToken) throw new Error('No refresh token');
    const response = await azoraAPI.post('/api/auth/refresh', {
      refreshToken: this.tokens.refreshToken
    });
    this.setAuth(this.user!, response.tokens);
  }

  async logout(): Promise<void> {
    await azoraAPI.post('/api/auth/logout', {});
    this.clearAuth();
  }

  getUser(): User | null {
    return this.user;
  }

  getAccessToken(): string | null {
    return this.tokens?.accessToken || null;
  }

  isAuthenticated(): boolean {
    return !!this.tokens?.accessToken;
  }

  private setAuth(user: User, tokens: AuthTokens): void {
    this.user = user;
    this.tokens = tokens;
    azoraAPI.setToken(tokens.accessToken);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('azora_user', JSON.stringify(user));
      localStorage.setItem('azora_tokens', JSON.stringify(tokens));
    }
  }

  private clearAuth(): void {
    this.user = null;
    this.tokens = null;
    azoraAPI.setToken('');
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('azora_user');
      localStorage.removeItem('azora_tokens');
    }
  }

  restoreSession(): void {
    if (typeof window === 'undefined') return;
    
    const userStr = localStorage.getItem('azora_user');
    const tokensStr = localStorage.getItem('azora_tokens');
    
    if (userStr && tokensStr) {
      this.user = JSON.parse(userStr);
      this.tokens = JSON.parse(tokensStr);
      azoraAPI.setToken(this.tokens!.accessToken);
    }
  }
}

export const authService = new AuthService();
