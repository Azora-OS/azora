/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * AUTH HELPERS
 * 
 * Authentication utilities for the Azora SDK
 */

export interface AuthConfig {
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

export class AuthManager {
  private config: AuthConfig = {};
  private refreshCallback?: () => Promise<{ accessToken: string; refreshToken: string; expiresIn: number }>;

  constructor(config: AuthConfig = {}) {
    this.config = config;
  }

  /**
   * Set authentication tokens
   */
  setTokens(tokens: { accessToken: string; refreshToken: string; expiresIn: number }): void {
    this.config.accessToken = tokens.accessToken;
    this.config.refreshToken = tokens.refreshToken;
    this.config.expiresAt = Date.now() + (tokens.expiresIn * 1000);
  }

  /**
   * Get current access token
   */
  async getAccessToken(): Promise<string | null> {
    if (!this.config.accessToken) {
      return this.config.apiKey || null;
    }

    // Check if token is expired
    if (this.config.expiresAt && Date.now() >= this.config.expiresAt) {
      // Try to refresh
      if (this.refreshCallback) {
        try {
          const newTokens = await this.refreshCallback();
          this.setTokens(newTokens);
          return this.config.accessToken;
        } catch (error) {
          console.error('Token refresh failed:', error);
          return null;
        }
      }
      return null;
    }

    return this.config.accessToken;
  }

  /**
   * Set token refresh callback
   */
  onTokenRefresh(callback: () => Promise<{ accessToken: string; refreshToken: string; expiresIn: number }>): void {
    this.refreshCallback = callback;
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return !!(this.config.accessToken || this.config.apiKey);
  }

  /**
   * Clear authentication
   */
  clearAuth(): void {
    this.config = {};
  }

  /**
   * Get authentication headers
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getAccessToken();
    if (!token) {
      return {};
    }

    return {
      'Authorization': `Bearer ${token}`
    };
  }
}

/**
 * Create JWT token (utility)
 */
export function createJWT(payload: Record<string, any>, secret: string, expiresIn: number = 3600): string {
  // In production: use actual JWT library
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + expiresIn }));
  const signature = btoa(`${header}.${body}.${secret}`);
  
  return `${header}.${body}.${signature}`;
}

/**
 * Decode JWT token (utility)
 */
export function decodeJWT(token: string): { header: any; payload: any; signature: string } | null {
  try {
    const [header, payload, signature] = token.split('.');
    
    return {
      header: JSON.parse(atob(header)),
      payload: JSON.parse(atob(payload)),
      signature
    };
  } catch (error) {
    return null;
  }
}

/**
 * Check if JWT is expired
 */
export function isJWTExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded) {return true;}

  const exp = decoded.payload.exp;
  if (!exp) {return false;}

  return Date.now() >= exp * 1000;
}
