/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

LAYER 3: AUTHENTICATION FOUNDATION - JWT SERVICE
Unified JWT service with token generation, validation, and refresh
*/

import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  sessionId?: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenValidationResult {
  valid: boolean;
  payload?: JWTPayload;
  error?: string;
}

/**
 * JWT Service - Unified token management
 */
export class JWTService {
  private secret: string;
  private accessTokenExpiry: number; // seconds
  private refreshTokenExpiry: number; // seconds

  constructor() {
    this.secret = process.env.JWT_SECRET || '';
    if (!this.secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    this.accessTokenExpiry = parseInt(
      process.env.JWT_ACCESS_TOKEN_EXPIRY || '3600',
      10
    ); // Default: 1 hour
    this.refreshTokenExpiry = parseInt(
      process.env.JWT_REFRESH_TOKEN_EXPIRY || '604800',
      10
    ); // Default: 7 days
  }

  /**
   * Generate access token
   */
  generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    const tokenPayload: JWTPayload = {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.accessTokenExpiry,
    };

    return jwt.sign(tokenPayload, this.secret, {
      algorithm: 'HS256',
    });
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(userId: string, sessionId?: string): string {
    const payload = {
      userId,
      sessionId: sessionId || crypto.randomUUID(),
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.refreshTokenExpiry,
    };

    return jwt.sign(payload, this.secret, {
      algorithm: 'HS256',
    });
  }

  /**
   * Generate token pair (access + refresh)
   */
  generateTokenPair(
    payload: Omit<JWTPayload, 'iat' | 'exp'>
  ): TokenPair {
    const sessionId = crypto.randomUUID();
    const accessToken = this.generateAccessToken({
      ...payload,
      sessionId,
    });
    const refreshToken = this.generateRefreshToken(payload.userId, sessionId);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessTokenExpiry,
    };
  }

  /**
   * Validate token
   */
  validateToken(token: string): TokenValidationResult {
    try {
      const decoded = jwt.verify(token, this.secret) as JWTPayload;

      return {
        valid: true,
        payload: decoded,
      };
    } catch (error: any) {
      return {
        valid: false,
        error: error.message || 'Invalid token',
      };
    }
  }

  /**
   * Decode token without validation (for inspection)
   */
  decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  refreshAccessToken(
    refreshToken: string,
    userData: Omit<JWTPayload, 'iat' | 'exp'>
  ): TokenPair | null {
    const validation = this.validateToken(refreshToken);

    if (!validation.valid || !validation.payload) {
      return null;
    }

    // Verify it's a refresh token
    const decoded = validation.payload as any;
    if (decoded.type !== 'refresh') {
      return null;
    }

    // Generate new token pair
    return this.generateTokenPair({
      ...userData,
      sessionId: decoded.sessionId,
    });
  }

  /**
   * Get token expiry time
   */
  getTokenExpiry(token: string): number | null {
    const decoded = this.decodeToken(token);
    return decoded?.exp || null;
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    const expiry = this.getTokenExpiry(token);
    if (!expiry) {return true;}

    return Date.now() / 1000 >= expiry;
  }
}

// Export singleton instance
export const jwtService = new JWTService();

export default jwtService;
