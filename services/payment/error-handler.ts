/**
 * Error Handler Service
 * Maps Stripe errors to PaymentError and provides user-friendly messages
 */

import { logger } from '../shared/logging';
import { PaymentError } from './types';

export interface ErrorMapping {
  code: string;
  message: string;
  statusCode: number;
  retryable: boolean;
}

export class ErrorHandler {
  private readonly errorMappings: Map<string, ErrorMapping> = new Map([
    // Card errors
    [
      'card_declined',
      {
        code: 'CARD_DECLINED',
        message: 'Your card was declined. Please try another payment method.',
        statusCode: 402,
        retryable: true,
      },
    ],
    [
      'insufficient_funds',
      {
        code: 'INSUFFICIENT_FUNDS',
        message: 'Insufficient funds. Please check your account balance.',
        statusCode: 402,
        retryable: true,
      },
    ],
    [
      'expired_card',
      {
        code: 'EXPIRED_CARD',
        message: 'Your card has expired. Please use a different card.',
        statusCode: 400,
        retryable: false,
      },
    ],
    [
      'incorrect_cvc',
      {
        code: 'INCORRECT_CVC',
        message: 'The CVC code is incorrect. Please try again.',
        statusCode: 400,
        retryable: false,
      },
    ],
    [
      'lost_card',
      {
        code: 'LOST_CARD',
        message: 'This card has been reported as lost.',
        statusCode: 402,
        retryable: false,
      },
    ],
    [
      'stolen_card',
      {
        code: 'STOLEN_CARD',
        message: 'This card has been reported as stolen.',
        statusCode: 402,
        retryable: false,
      },
    ],

    // Processing errors
    [
      'processing_error',
      {
        code: 'PROCESSING_ERROR',
        message: 'A processing error occurred. Please try again later.',
        statusCode: 500,
        retryable: true,
      },
    ],
    [
      'rate_limit',
      {
        code: 'RATE_LIMIT',
        message: 'Too many requests. Please try again in a moment.',
        statusCode: 429,
        retryable: true,
      },
    ],

    // Authentication errors
    [
      'authentication_error',
      {
        code: 'AUTHENTICATION_ERROR',
        message: 'Authentication failed. Please check your credentials.',
        statusCode: 401,
        retryable: false,
      },
    ],

    // Request errors
    [
      'invalid_request_error',
      {
        code: 'INVALID_REQUEST',
        message: 'Invalid request. Please check your input.',
        statusCode: 400,
        retryable: false,
      },
    ],

    // API errors
    [
      'api_error',
      {
        code: 'API_ERROR',
        message: 'An API error occurred. Please try again later.',
        statusCode: 500,
        retryable: true,
      },
    ],

    // Webhook errors
    [
      'INVALID_SIGNATURE',
      {
        code: 'INVALID_SIGNATURE',
        message: 'Invalid webhook signature.',
        statusCode: 401,
        retryable: false,
      },
    ],
  ]);

  /**
   * Map Stripe error to PaymentError
   */
  mapStripeError(stripeErrorCode: string, message?: string): PaymentError {
    const mapping = this.errorMappings.get(stripeErrorCode);

    if (mapping) {
      logger.info('Mapped Stripe error', {
        stripeErrorCode,
        code: mapping.code,
        retryable: mapping.retryable,
      });

      return new PaymentError(mapping.message, mapping.code, mapping.statusCode);
    }

    logger.warn('Unknown Stripe error code', { stripeErrorCode });

    return new PaymentError(
      message || 'An error occurred. Please try again.',
      'UNKNOWN_ERROR',
      500
    );
  }

  /**
   * Check if error is retryable
   */
  isRetryable(errorCode: string): boolean {
    const mapping = this.errorMappings.get(errorCode);
    return mapping?.retryable ?? false;
  }

  /**
   * Get error message for code
   */
  getErrorMessage(errorCode: string): string {
    const mapping = this.errorMappings.get(errorCode);
    return mapping?.message ?? 'An error occurred. Please try again.';
  }

  /**
   * Get HTTP status code for error
   */
  getStatusCode(errorCode: string): number {
    const mapping = this.errorMappings.get(errorCode);
    return mapping?.statusCode ?? 500;
  }

  /**
   * Get all retryable errors
   */
  getRetryableErrors(): string[] {
    const retryable: string[] = [];

    this.errorMappings.forEach((mapping, code) => {
      if (mapping.retryable) {
        retryable.push(code);
      }
    });

    return retryable;
  }

  /**
   * Format error for response
   */
  formatErrorResponse(error: PaymentError): {
    error: string;
    code: string;
    retryable: boolean;
  } {
    return {
      error: error.message,
      code: error.code,
      retryable: this.isRetryable(error.code),
    };
  }
}

export default ErrorHandler;
