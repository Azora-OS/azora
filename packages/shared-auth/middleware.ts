/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

SHARED AUTH MIDDLEWARE
Express middleware for authentication and authorization
*/

import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  user?: JwtPayload;
}

interface AzoraJwtPayload extends JwtPayload {
  userId: string;
}

/**
 * Authentication middleware
 * Validates JWT token and attaches user information to request
 */
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({ success: false, error: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, secret) as AzoraJwtPayload;
    req.userId = decoded.userId;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

/**
 * Optional authentication middleware
 * Attaches user information if token is present, but doesn't fail if missing
 */
export const optionalAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      const secret = process.env.JWT_SECRET;
      if (secret) {
        const decoded = jwt.verify(token, secret) as AzoraJwtPayload;
        req.userId = decoded.userId;
        req.user = decoded;
      }
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Authenticate session and return user context
 * Used by AI data access layer
 */
export async function authenticateSession(req: AuthRequest): Promise<string | null> {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return null;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not configured');
      return null;
    }

    const decoded = jwt.verify(token, secret) as AzoraJwtPayload;
    return decoded.userId || null;
  } catch (error) {
    return null;
  }
}

export default {
  authMiddleware,
  optionalAuthMiddleware,
  authenticateSession,
};
