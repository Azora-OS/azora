/**
 * Monitoring Middleware
 * Tracks HTTP requests, errors, and performance metrics
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { structuredLogger } from '../utils/structured-logger';
import {
  recordHttpRequest,
  recordHttpError,
  updateSystemMetrics,
} from '../utils/metrics';

/**
 * Extend Express Request to include monitoring data
 */
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
    }
  }
}

/**
 * Middleware to add request ID and start time
 */
export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  req.requestId = req.headers['x-request-id'] as string || uuidv4();
  req.startTime = Date.now();

  // Add request ID to response headers
  res.setHeader('X-Request-ID', req.requestId);

  next();
}

/**
 * Middleware to log HTTP requests and record metrics
 */
export function httpLoggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
): void {
  // Capture the original send function
  const originalSend = res.send;

  // Override send to capture response
  res.send = function (data: any) {
    const duration = (Date.now() - req.startTime) / 1000; // Convert to seconds
    const statusCode = res.statusCode;

    // Record metrics
    recordHttpRequest(req.method, req.path, statusCode, duration);

    // Log request
    structuredLogger.logHttpRequest(
      req.method,
      req.path,
      statusCode,
      duration,
      {
        requestId: req.requestId,
        userId: (req as any).userId,
      }
    );

    // Call original send
    return originalSend.call(this, data);
  };

  next();
}

/**
 * Middleware to handle errors and record error metrics
 */
export function errorHandlingMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.status || err.statusCode || 500;
  const errorType = err.name || 'UnknownError';

  // Record error metric
  recordHttpError(req.method, req.path, errorType);

  // Log error
  structuredLogger.error(
    `HTTP Error: ${err.message}`,
    err,
    {
      requestId: req.requestId,
      userId: (req as any).userId,
    },
    {
      method: req.method,
      path: req.path,
      statusCode,
      errorType,
    }
  );

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error',
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Middleware to update system metrics periodically
 */
export function systemMetricsMiddleware(
  req: Request, // eslint-disable-line @typescript-eslint/no-unused-vars
  res: Response, // eslint-disable-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  // Update system metrics every 10 requests
  if (Math.random() < 0.1) {
    updateSystemMetrics();
  }

  next();
}

/**
 * Middleware to log slow requests
 */
export function slowRequestMiddleware(
  slowThresholdMs: number = 1000
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const originalSend = res.send;

    res.send = function (data: any) {
      const duration = Date.now() - req.startTime;

      if (duration > slowThresholdMs) {
        structuredLogger.warn(
          `Slow request detected: ${req.method} ${req.path} took ${duration}ms`,
          {
            requestId: req.requestId,
            userId: (req as any).userId,
          },
          {
            method: req.method,
            path: req.path,
            duration,
            threshold: slowThresholdMs,
          }
        );
      }

      return originalSend.call(this, data);
    };

    next();
  };
}

/**
 * Middleware to log request body (for debugging)
 */
export function requestBodyLoggingMiddleware(
  req: Request,
  res: Response, // eslint-disable-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  if (process.env.LOG_REQUEST_BODY === 'true' && req.method !== 'GET') {
    structuredLogger.debug(
      `Request body: ${req.method} ${req.path}`,
      {
        requestId: req.requestId,
        userId: (req as any).userId,
      },
      {
        body: req.body,
      }
    );
  }

  next();
}
