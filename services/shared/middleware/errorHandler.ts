/**
 * Shared Error Handler Middleware
 * 
 * PRODUCTION-GRADE Express error handling
 * Use in all Express services
 */

import { Request, Response, NextFunction } from 'express';
import { AppError, isOperationalError } from '../utils/errors';
import { Logger } from '../utils/logger';

const logger = new Logger('ErrorHandler');

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    statusCode: number;
    details?: any;
  };
  requestId?: string;
  timestamp: string;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default error values
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';
  let details: any = undefined;

  // Handle known AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  }

  // Log error
  logger.error('Request error', err, {
    path: req.path,
    method: req.method,
    statusCode,
    code,
    userId: (req as any).user?.id,
  });

  // Send response
  const response: ErrorResponse = {
    success: false,
    error: {
      message,
      code,
      statusCode,
      ...(details && { details }),
    },
    requestId: (req as any).requestId,
    timestamp: new Date().toISOString(),
  };

  // Don't send stack traces in production
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    (response.error as any).stack = err.stack;
  }

  res.status(statusCode).json(response);
};

// Async handler wrapper to catch errors
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(
    `Route ${req.method} ${req.path} not found`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};
