/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

LAYER 3: AUTHENTICATION FOUNDATION - AUTHENTICATION SERVICE
High-level authentication service combining JWT and Session services
*/

import { jwtService } from './jwt-service';
import { sessionService, Session, SessionCreateInput } from './session-service';

export interface LoginCredentials {
  email: string;
  password: string; // Should be hashed before reaching here
}

export interface LoginResult {
  success: boolean;
  session?: Session;
  error?: string;
}

export interface RefreshTokenResult {
  success: boolean;
  session?: Session;
  error?: string;
}

/**
 * Authentication Service - High-level auth operations
 */
export class AuthenticationService {
  /**
   * Login user and create session
   */
  async login(
    credentials: LoginCredentials,
    userData: {
      userId: string;
      role: string;
    },
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<LoginResult> {
    try {
      // Note: Password validation should happen before this
      // This service assumes password is already validated

      const session = await sessionService.createSession({
        userId: userData.userId,
        email: credentials.email,
        role: userData.role,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
      });

      return {
        success: true,
        session,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Login failed',
      };
    }
  }

  /**
   * Logout user (delete session)
   */
  async logout(sessionId: string): Promise<boolean> {
    return await sessionService.deleteSession(sessionId);
  }

  /**
   * Logout all user sessions
   */
  async logoutAll(userId: string): Promise<number> {
    return await sessionService.deleteUserSessions(userId);
  }

  /**
   * Refresh session tokens
   */
  async refreshTokens(
    sessionId: string,
    refreshToken: string
  ): Promise<RefreshTokenResult> {
    try {
      const session = await sessionService.refreshSession(
        sessionId,
        refreshToken
      );

      if (!session) {
        return {
          success: false,
          error: 'Invalid refresh token or session',
        };
      }

      return {
        success: true,
        session,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Token refresh failed',
      };
    }
  }

  /**
   * Validate session
   */
  async validateSession(sessionId: string): Promise<{
    valid: boolean;
    session?: Session;
    error?: string;
  }> {
    return await sessionService.validateSession(sessionId);
  }

  /**
   * Get user sessions
   */
  async getUserSessions(userId: string): Promise<string[]> {
    return await sessionService.getUserSessions(userId);
  }
}

// Export singleton instance
export const authService = new AuthenticationService();

export default authService;
