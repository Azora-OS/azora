/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

ERROR HANDLER
Centralized error handling with Ubuntu principles
*/

export class AzoraError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AzoraError';
  }
}

export class ErrorHandler {
  handle(error: any): AzoraError {
    if (error instanceof AzoraError) {
      return error;
    }

    if (error.response) {
      return new AzoraError(
        error.response.data?.message || 'API Error',
        error.response.data?.code || 'API_ERROR',
        error.response.status,
        error.response.data
      );
    }

    if (error.name === 'AbortError') {
      return new AzoraError('Request timeout', 'TIMEOUT', 408);
    }

    return new AzoraError(
      error.message || 'Unknown error',
      'UNKNOWN_ERROR',
      500
    );
  }

  isAuthError(error: AzoraError): boolean {
    return error.statusCode === 401 || error.code === 'UNAUTHORIZED';
  }

  isNetworkError(error: AzoraError): boolean {
    return error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT';
  }
}

export const errorHandler = new ErrorHandler();
