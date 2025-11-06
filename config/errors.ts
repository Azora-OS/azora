/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Standardized Error Handling System
 * Provides consistent error responses across all Azora services
 */

export enum ErrorCode {
  // Authentication & Authorization (1000-1099)
  UNAUTHORIZED = 1000,
  FORBIDDEN = 1001,
  TOKEN_EXPIRED = 1002,
  INVALID_CREDENTIALS = 1003,
  
  // Validation (1100-1199)
  VALIDATION_ERROR = 1100,
  INVALID_INPUT = 1101,
  MISSING_REQUIRED_FIELD = 1102,
  
  // Resource (1200-1299)
  NOT_FOUND = 1200,
  ALREADY_EXISTS = 1201,
  CONFLICT = 1202,
  
  // Payment & Financial (1300-1399)
  PAYMENT_FAILED = 1300,
  INSUFFICIENT_FUNDS = 1301,
  PAYMENT_DECLINED = 1302,
  INVALID_AMOUNT = 1303,
  
  // Rate Limiting (1400-1499)
  RATE_LIMIT_EXCEEDED = 1400,
  TOO_MANY_REQUESTS = 1401,
  
  // Server (1500-1599)
  INTERNAL_SERVER_ERROR = 1500,
  SERVICE_UNAVAILABLE = 1501,
  DATABASE_ERROR = 1502,
  EXTERNAL_SERVICE_ERROR = 1503,
  
  // Business Logic (1600-1699)
  COURSE_NOT_AVAILABLE = 1600,
  ENROLLMENT_LIMIT_REACHED = 1601,
  PREREQUISITE_NOT_MET = 1602,
  
  // Blockchain (1700-1799)
  TRANSACTION_FAILED = 1700,
  INVALID_WALLET_ADDRESS = 1701,
  NETWORK_ERROR = 1702,
}

export interface AzoraError {
  code: ErrorCode;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId?: string;
  path?: string;
}

export class BaseAzoraError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, any>;
  public readonly timestamp: string;
  public readonly requestId?: string;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: Record<string, any>,
    requestId?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.requestId = requestId;

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): AzoraError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      requestId: this.requestId,
    };
  }
}

// Specific Error Classes
export class UnauthorizedError extends BaseAzoraError {
  constructor(message: string = 'Unauthorized', requestId?: string) {
    super(ErrorCode.UNAUTHORIZED, message, 401, undefined, requestId);
  }
}

export class ForbiddenError extends BaseAzoraError {
  constructor(message: string = 'Forbidden', requestId?: string) {
    super(ErrorCode.FORBIDDEN, message, 403, undefined, requestId);
  }
}

export class ValidationError extends BaseAzoraError {
  constructor(message: string, details?: Record<string, any>, requestId?: string) {
    super(ErrorCode.VALIDATION_ERROR, message, 400, details, requestId);
  }
}

export class NotFoundError extends BaseAzoraError {
  constructor(resource: string = 'Resource', requestId?: string) {
    super(ErrorCode.NOT_FOUND, `${resource} not found`, 404, undefined, requestId);
  }
}

export class PaymentError extends BaseAzoraError {
  constructor(message: string, details?: Record<string, any>, requestId?: string) {
    super(ErrorCode.PAYMENT_FAILED, message, 402, details, requestId);
  }
}

export class RateLimitError extends BaseAzoraError {
  constructor(retryAfter: number, requestId?: string) {
    super(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      'Rate limit exceeded',
      429,
      { retryAfter },
      requestId
    );
  }
}

export class InternalServerError extends BaseAzoraError {
  constructor(message: string = 'Internal server error', requestId?: string) {
    super(ErrorCode.INTERNAL_SERVER_ERROR, message, 500, undefined, requestId);
  }
}

/**
 * Express Error Handler Middleware
 */
export function errorHandlerMiddleware(error: Error, req: any, res: any, next: any) {
  // Log the error
  console.error('Error occurred:', {
    name: error.name,
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    path: req.path,
    method: req.method,
    requestId: req.requestId,
  });

  // Handle Azora errors
  if (error instanceof BaseAzoraError) {
    return res.status(error.statusCode).json(error.toJSON());
  }

  // Handle Zod validation errors
  if (error.name === 'ZodError') {
    const zodError = error as any;
    return res.status(400).json({
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Validation error',
      details: zodError.errors,
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
    });
  }

  // Handle generic errors
  const statusCode = (error as any).statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'An error occurred'
    : error.message;

  return res.status(statusCode).json({
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    message,
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
  });
}

/**
 * Async Error Wrapper
 * Wraps async route handlers to catch errors
 */
export function asyncHandler(fn: Function) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Error Logger
 */
export function logError(error: Error, context?: Record<string, any>) {
  const logData = {
    timestamp: new Date().toISOString(),
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...context,
  };

  if (error instanceof BaseAzoraError) {
    logData.code = error.code;
    logData.details = error.details;
  }

  // In production, send to monitoring service (e.g., Datadog, Sentry)
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to error tracking service
    console.error('Production Error:', JSON.stringify(logData));
  } else {
    console.error('Error:', logData);
  }
}
