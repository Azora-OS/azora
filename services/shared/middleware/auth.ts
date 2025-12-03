import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role?: string;
        email?: string;
      };
    }
  }
}

/**
 * Basic authentication middleware
 * Checks for Authorization header with Bearer token
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    
    // TODO: Validate token with JWT or session store
    // For now, extract userId from token (in production, verify signature)
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      req.user = decoded;
      next();
    } catch (error) {
      throw new AppError(401, 'Invalid token');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Role-based access control middleware
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role || '')) {
      return next(new AppError(403, 'Insufficient permissions'));
    }

    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        req.user = decoded;
      } catch (error) {
        // Silently fail - user remains undefined
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};
