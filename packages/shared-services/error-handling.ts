/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

UNIFIED ERROR HANDLING
Provides consistent error handling across all services
*/

export enum ErrorCode {
  // Authentication Errors (1000-1999)
  AUTH_REQUIRED = 1001,
  AUTH_INVALID_TOKEN = 1002,
  AUTH_EXPIRED_TOKEN = 1003,
  AUTH_INSUFFICIENT_PERMISSIONS = 1004,

  // Validation Errors (2000-2999)
  VALIDATION_FAILED = 2001,
  VALIDATION_MISSING_FIELD = 2002,
  VALIDATION_INVALID_FORMAT = 2003,

  // Database Errors (3000-3999)
  DATABASE_CONNECTION_FAILED = 3001,
  DATABASE_QUERY_FAILED = 3002,
  DATABASE_RECORD_NOT_FOUND = 3003,
  DATABASE_CONSTRAINT_VIOLATION = 3004,

  // Service Errors (4000-4999)
  SERVICE_UNAVAILABLE = 4001,
  SERVICE_TIMEOUT = 4002,
  SERVICE_NOT_FOUND = 4003,

  // Business Logic Errors (5000-5999)
  BUSINESS_RULE_VIOLATION = 5001,
  INSUFFICIENT_BALANCE = 5002,
  RESOURCE_LIMIT_EXCEEDED = 5003,

  // System Errors (9000-9999)
  INTERNAL_ERROR = 9001,
  UNKNOWN_ERROR = 9999,
}

export interface AzoraError {
  code: ErrorCode;
  message: string;
  details?: any;
  timestamp: Date;
  requestId?: string;
  userId?: string;
}

/**
 * Unified Error Handler
 */
export class UnifiedErrorHandler {
  /**
   * Create standardized error
   */
  static createError(
    code: ErrorCode,
    message: string,
    details?: any,
    requestId?: string,
    userId?: string
  ): AzoraError {
    return {
      code,
      message,
      details,
      timestamp: new Date(),
      requestId,
      userId,
    };
  }

  /**
   * Handle error and return standardized response
   */
  static handleError(error: any, requestId?: string, userId?: string): {
    statusCode: number;
    error: AzoraError;
  } {
    // If already an AzoraError, return it
    if (error.code && error.message && error.timestamp) {
      return {
        statusCode: this.getStatusCode(error.code),
        error: {
          ...error,
          requestId,
          userId,
        },
      };
    }

    // Map common errors
    if (error.name === 'ValidationError') {
      return {
        statusCode: 400,
        error: this.createError(
          ErrorCode.VALIDATION_FAILED,
          error.message,
          error.details,
          requestId,
          userId
        ),
      };
    }

    if (error.name === 'PrismaClientKnownRequestError') {
      if (error.code === 'P2025') {
        return {
          statusCode: 404,
          error: this.createError(
            ErrorCode.DATABASE_RECORD_NOT_FOUND,
            'Record not found',
            { code: error.code },
            requestId,
            userId
          ),
        };
      }
    }

    // Default to internal error
    return {
      statusCode: 500,
      error: this.createError(
        ErrorCode.INTERNAL_ERROR,
        'An internal error occurred',
        { originalError: error.message },
        requestId,
        userId
      ),
    };
  }

  /**
   * Get HTTP status code for error code
   */
  private static getStatusCode(code: ErrorCode): number {
    if (code >= 1000 && code < 2000) {return 401;} // Auth errors
    if (code >= 2000 && code < 3000) {return 400;} // Validation errors
    if (code >= 3000 && code < 4000) {return 500;} // Database errors
    if (code >= 4000 && code < 5000) {return 503;} // Service errors
    if (code >= 5000 && code < 6000) {return 400;} // Business logic errors
    return 500; // System errors
  }

  /**
   * Express error middleware
   */
  static errorMiddleware(error: any, req: any, res: any, next: any) {
    const handled = this.handleError(
      error,
      req.requestId,
      req.user?.userId
    );

    res.status(handled.statusCode).json({
      success: false,
      error: handled.error,
    });
  }
}

export default UnifiedErrorHandler;
