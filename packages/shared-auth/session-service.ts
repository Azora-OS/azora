/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

LAYER 3: AUTHENTICATION FOUNDATION - SESSION SERVICE
Session management with Redis storage
*/

import { getCacheService, CacheService } from '@azora/shared-database/redis';
import { jwtService, JWTPayload } from './jwt-service';
import crypto from 'crypto';

export interface Session {
  id: string;
  userId: string;
  email: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface SessionCreateInput {
  userId: string;
  email: string;
  role: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Session Service - Unified session management
 */
export class SessionService {
  private cache: CacheService | null = null;
  private sessionPrefix = 'session:';
  private userSessionsPrefix = 'user:sessions:';
  private defaultTTL = 7 * 24 * 60 * 60; // 7 days in seconds

  /**
   * Initialize cache service
   */
  private async getCache(): Promise<CacheService> {
    if (!this.cache) {
      this.cache = await getCacheService();
    }
    return this.cache;
  }

  /**
   * Create new session
   */
  async createSession(input: SessionCreateInput): Promise<Session> {
    const cache = await this.getCache();
    const sessionId = crypto.randomUUID();

    // Generate token pair
    const tokenPair = jwtService.generateTokenPair({
      userId: input.userId,
      email: input.email,
      role: input.role,
      sessionId,
    });

    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + parseInt(process.env.SESSION_TTL || '604800000', 10)
    );

    const session: Session = {
      id: sessionId,
      userId: input.userId,
      email: input.email,
      role: input.role,
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      createdAt: now,
      expiresAt,
      lastActivityAt: now,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    };

    // Store session in Redis
    await cache.set(
      `${this.sessionPrefix}${sessionId}`,
      session,
      this.defaultTTL
    );

    // Store session ID in user's session list
    const userSessions = await this.getUserSessions(input.userId);
    userSessions.push(sessionId);
    await cache.set(
      `${this.userSessionsPrefix}${input.userId}`,
      userSessions,
      this.defaultTTL
    );

    return session;
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<Session | null> {
    const cache = await this.getCache();
    const session = await cache.get<Session>(
      `${this.sessionPrefix}${sessionId}`
    );
    return session;
  }

  /**
   * Validate session
   */
  async validateSession(sessionId: string): Promise<{
    valid: boolean;
    session?: Session;
    error?: string;
  }> {
    const session = await this.getSession(sessionId);

    if (!session) {
      return {
        valid: false,
        error: 'Session not found',
      };
    }

    // Check if session expired
    if (new Date() > session.expiresAt) {
      await this.deleteSession(sessionId);
      return {
        valid: false,
        error: 'Session expired',
      };
    }

    // Validate access token
    const tokenValidation = jwtService.validateToken(session.accessToken);
    if (!tokenValidation.valid) {
      await this.deleteSession(sessionId);
      return {
        valid: false,
        error: 'Invalid access token',
      };
    }

    // Update last activity
    await this.updateLastActivity(sessionId);

    return {
      valid: true,
      session,
    };
  }

  /**
   * Update last activity timestamp
   */
  async updateLastActivity(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) return;

    session.lastActivityAt = new Date();
    const cache = await this.getCache();
    await cache.set(
      `${this.sessionPrefix}${sessionId}`,
      session,
      this.defaultTTL
    );
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    const cache = await this.getCache();
    const session = await this.getSession(sessionId);

    if (session) {
      // Remove from session store
      await cache.delete(`${this.sessionPrefix}${sessionId}`);

      // Remove from user's session list
      const userSessions = await this.getUserSessions(session.userId);
      const updatedSessions = userSessions.filter((id) => id !== sessionId);
      await cache.set(
        `${this.userSessionsPrefix}${session.userId}`,
        updatedSessions,
        this.defaultTTL
      );

      return true;
    }

    return false;
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: string): Promise<string[]> {
    const cache = await this.getCache();
    const sessions = await cache.get<string[]>(
      `${this.userSessionsPrefix}${userId}`
    );
    return sessions || [];
  }

  /**
   * Delete all sessions for a user
   */
  async deleteUserSessions(userId: string): Promise<number> {
    const sessionIds = await this.getUserSessions(userId);
    let deleted = 0;

    for (const sessionId of sessionIds) {
      if (await this.deleteSession(sessionId)) {
        deleted++;
      }
    }

    return deleted;
  }

  /**
   * Refresh session
   */
  async refreshSession(
    sessionId: string,
    refreshToken: string
  ): Promise<Session | null> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return null;
    }

    // Validate refresh token matches
    if (session.refreshToken !== refreshToken) {
      return null;
    }

    // Generate new token pair
    const tokenPair = jwtService.generateTokenPair({
      userId: session.userId,
      email: session.email,
      role: session.role,
      sessionId,
    });

    // Update session
    session.accessToken = tokenPair.accessToken;
    session.refreshToken = tokenPair.refreshToken;
    session.lastActivityAt = new Date();

    const cache = await this.getCache();
    await cache.set(
      `${this.sessionPrefix}${sessionId}`,
      session,
      this.defaultTTL
    );

    return session;
  }

  /**
   * Cleanup expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    // This would require scanning Redis keys, which is expensive
    // Better to use Redis TTL and let them expire naturally
    // Or implement a scheduled job
    return 0;
  }
}

// Export singleton instance
export const sessionService = new SessionService();

export default sessionService;
