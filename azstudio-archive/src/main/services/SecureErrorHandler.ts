/**
 * SecureErrorHandler - Prevents information disclosure through error messages
 * Logs detailed errors internally while showing generic messages to users
 */

export interface ErrorContext {
  operation: string;
  userId?: string;
  resource?: string;
  timestamp: Date;
}

export class SecureErrorHandler {
  private static errorLog: Array<{
    error: Error;
    context: ErrorContext;
    stack?: string;
  }> = [];

  /**
   * Handle error securely - log details, return generic message
   */
  static handle(error: Error, context: ErrorContext): string {
    // Log full error details internally
    this.logError(error, context);

    // Return generic user-facing message
    return this.getUserMessage(error, context);
  }

  /**
   * Log error with full details
   */
  private static logError(error: Error, context: ErrorContext): void {
    this.errorLog.push({
      error,
      context,
      stack: error.stack,
    });

    // Keep only last 1000 errors
    if (this.errorLog.length > 1000) {
      this.errorLog.shift();
    }

    // TODO: Send to external logging service
    console.error('[SecureError]', {
      message: error.message,
      operation: context.operation,
      timestamp: context.timestamp,
    });
  }

  /**
   * Get user-friendly error message
   */
  private static getUserMessage(error: Error, context: ErrorContext): string {
    const errorType = error.constructor.name;

    // Map specific errors to user messages
    const messageMap: Record<string, string> = {
      'ENOENT': 'The requested resource was not found',
      'EACCES': 'Permission denied',
      'EEXIST': 'Resource already exists',
      'ETIMEDOUT': 'Operation timed out',
      'ECONNREFUSED': 'Connection refused',
      'NetworkError': 'Network error occurred',
      'ValidationError': 'Invalid input provided',
      'AuthenticationError': 'Authentication failed',
      'AuthorizationError': 'Access denied',
    };

    // Check error code
    const errorCode = (error as any).code;
    if (errorCode && messageMap[errorCode]) {
      return messageMap[errorCode];
    }

    // Check error type
    if (messageMap[errorType]) {
      return messageMap[errorType];
    }

    // Generic fallback
    return `An error occurred during ${context.operation}. Please try again.`;
  }

  /**
   * Get error log (for admin/debugging)
   */
  static getErrorLog(): Array<{ error: Error; context: ErrorContext; stack?: string }> {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  static clearErrorLog(): void {
    this.errorLog = [];
  }
}
