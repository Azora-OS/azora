/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

LAYER 3: AUTHENTICATION FOUNDATION - AUTHENTICATION MIDDLEWARE
Express/Next.js middleware for JWT and session validation
*/

import { Request, Response, NextFunction } from 'express';
import { jwtService, JWTPayload } from './jwt-service';
import { sessionService } from './session-service';

export interface AuthRequest extends Request {
  user?: JWTPayload;
  sessionId?: string;
}

/**
 * Extract token from request
 */
function extractToken(req: Request): string | null {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookie
  if (req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken;
  }

  // Check query parameter (not recommended, but supported)
  if (req.query && typeof req.query.token === 'string') {
    return req.query.token;
  }

  return null;
}

/**
 * JWT Authentication Middleware
 * Validates JWT token and attaches user to request
 */
export function authenticateJWT(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({
      error: 'Authentication required',
      code: 'NO_TOKEN',
    });
    return;
  }

  const validation = jwtService.validateToken(token);

  if (!validation.valid || !validation.payload) {
    res.status(401).json({
      error: validation.error || 'Invalid token',
      code: 'INVALID_TOKEN',
    });
    return;
  }

  // Check if token is expired
  if (jwtService.isTokenExpired(token)) {
    res.status(401).json({
      error: 'Token expired',
      code: 'TOKEN_EXPIRED',
    });
    return;
  }

  // Attach user to request
  req.user = validation.payload;
  next();
}

/**
 * Session Authentication Middleware
 * Validates session and attaches user to request
 */
export async function authenticateSession(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({
      error: 'Authentication required',
      code: 'NO_TOKEN',
    });
    return;
  }

  // Decode token to get session ID
  const payload = jwtService.decodeToken(token);
  if (!payload || !payload.sessionId) {
    res.status(401).json({
      error: 'Invalid token format',
      code: 'INVALID_TOKEN_FORMAT',
    });
    return;
  }

  // Validate session
  const sessionValidation = await sessionService.validateSession(
    payload.sessionId
  );

  if (!sessionValidation.valid || !sessionValidation.session) {
    res.status(401).json({
      error: sessionValidation.error || 'Invalid session',
      code: 'INVALID_SESSION',
    });
    return;
  }

  // Attach user and session to request
  req.user = {
    userId: sessionValidation.session.userId,
    email: sessionValidation.session.email,
    role: sessionValidation.session.role,
    sessionId: sessionValidation.session.id,
  };
  req.sessionId = sessionValidation.session.id;

  next();
}

/**
 * Role-based authorization middleware factory
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        code: 'NO_USER',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles,
        current: req.user.role,
      });
      return;
    }

    next();
  };
}

/**
 * Optional authentication middleware
 * Attaches user if token is present, but doesn't fail if missing
 */
export function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const token = extractToken(req);

  if (token) {
    const validation = jwtService.validateToken(token);
    if (validation.valid && validation.payload) {
      req.user = validation.payload;
    }
  }

  next();
}

export default {
  authenticateJWT,
  authenticateSession,
  requireRole,
  optionalAuth,
};
