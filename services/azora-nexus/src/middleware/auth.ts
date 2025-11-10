/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '@/utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Access token required',
          code: 'AUTH_TOKEN_MISSING',
        },
      });
      return;
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      logger.error('JWT_SECRET environment variable is required');
      res.status(500).json({
        success: false,
        error: {
          message: 'Server configuration error',
          code: 'SERVER_CONFIG_ERROR',
        },
      });
      return;
    }

    const decoded = jwt.verify(token, secret) as {
      id: string;
      email: string;
      role?: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      error: {
        message: 'Invalid or expired token',
        code: 'AUTH_TOKEN_INVALID',
      },
    });
  }
};