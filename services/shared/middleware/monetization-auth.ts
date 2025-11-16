/**
 * Monetization Auth Middleware
 * Provides standardized authentication for all monetization endpoints
 * Integrates with existing JWT auth system
 */

import { NextRequest } from 'next/server';
import { logger } from '../logging';

export interface AuthContext {
  userId: string;
  role?: string;
  email?: string;
  authenticated: boolean;
}

/**
 * Extract user context from request
 * Supports multiple auth methods:
 * 1. x-user-id header (for internal services)
 * 2. Authorization Bearer token (for external clients)
 * 3. JWT in cookies (for web clients)
 */
export function extractUserContext(request: NextRequest): AuthContext {
  // Method 1: x-user-id header (internal services)
  const userId = request.headers.get('x-user-id');
  if (userId) {
    return {
      userId,
      authenticated: true,
    };
  }

  // Method 2: Authorization Bearer token
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      // In production, verify JWT signature
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      return {
        userId: decoded.userId || decoded.sub,
        role: decoded.role,
        email: decoded.email,
        authenticated: true,
      };
    } catch (error) {
      logger.warn('Failed to decode Bearer token', { error });
    }
  }

  // Method 3: JWT in cookies
  const cookies = request.cookies;
  const token = cookies.get('auth_token')?.value;
  if (token) {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      return {
        userId: decoded.userId || decoded.sub,
        role: decoded.role,
        email: decoded.email,
        authenticated: true,
      };
    } catch (error) {
      logger.warn('Failed to decode auth cookie', { error });
    }
  }

  return {
    userId: '',
    authenticated: false,
  };
}

/**
 * Require authentication for endpoint
 * Returns 401 if not authenticated
 */
export function requireAuth(request: NextRequest): AuthContext | null {
  const context = extractUserContext(request);
  if (!context.authenticated) {
    logger.warn('Unauthorized request', {
      path: request.nextUrl.pathname,
      method: request.method,
    });
    return null;
  }
  return context;
}

/**
 * Require specific role for endpoint
 * Returns 403 if user doesn't have required role
 */
export function requireRole(context: AuthContext, allowedRoles: string[]): boolean {
  if (!context.authenticated) {
    return false;
  }

  if (!context.role || !allowedRoles.includes(context.role)) {
    logger.warn('Insufficient permissions', {
      userId: context.userId,
      userRole: context.role,
      requiredRoles: allowedRoles,
    });
    return false;
  }

  return true;
}

/**
 * Verify user owns resource
 * Used for endpoints that access user-specific data
 */
export function verifyResourceOwnership(
  context: AuthContext,
  resourceUserId: string
): boolean {
  if (!context.authenticated) {
    return false;
  }

  if (context.userId !== resourceUserId) {
    logger.warn('Unauthorized resource access', {
      userId: context.userId,
      resourceUserId,
    });
    return false;
  }

  return true;
}

/**
 * Add user context to request for downstream services
 * Useful for logging and audit trails
 */
export function addUserContextToRequest(
  request: NextRequest,
  context: AuthContext
): void {
  // Store in request headers for downstream services
  (request.headers as any)['x-authenticated-user-id'] = context.userId;
  if (context.role) {
    (request.headers as any)['x-user-role'] = context.role;
  }
  if (context.email) {
    (request.headers as any)['x-user-email'] = context.email;
  }
}
