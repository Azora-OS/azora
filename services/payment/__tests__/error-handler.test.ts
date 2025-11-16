/**
 * Error Handler Service Tests
 * Tests for error mapping and handling
 */

import { ErrorHandler } from '../error-handler';
import { PaymentError } from '../types';

// Mock logger
jest.mock('../../shared/logging', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    errorHandler = new ErrorHandler();
  });

  describe('mapStripeError', () => {
    it('should map card_declined error', () => {
      const error = errorHandler.mapStripeError('card_declined', 'Your card was declined');

      expect(error).toBeInstanceOf(PaymentError);
      expect(error.code).toBe('CARD_DECLINED');
      expect(error.message).toContain('declined');
    });

    it('should map insufficient_funds error', () => {
      const error = errorHandler.mapStripeError('insufficient_funds', 'Insufficient funds');

      expect(error.code).toBe('INSUFFICIENT_FUNDS');
    });

    it('should map expired_card error', () => {
      const error = errorHandler.mapStripeError('expired_card', 'Card has expired');

      expect(error.code).toBe('EXPIRED_CARD');
    });

    it('should map processing_error', () => {
      const error = errorHandler.mapStripeError('processing_error', 'Processing error');

      expect(error.code).toBe('PROCESSING_ERROR');
    });

    it('should map unknown error', () => {
      const error = errorHandler.mapStripeError('unknown_error', 'Unknown error');

      expect(error.code).toBe('UNKNOWN_ERROR');
    });
  });

  describe('getErrorMessage', () => {
    it('should return user-friendly message for card_declined', () => {
      const message = errorHandler.getErrorMessage('card_declined');

      expect(message).toContain('declined');
      expect(message).not.toContain('technical');
    });

    it('should return user-friendly message for insufficient_funds', () => {
      const message = errorHandler.getErrorMessage('insufficient_funds');

      expect(message).toContain('funds');
    });

    it('should return generic message for unknown error', () => {
      const message = errorHandler.getErrorMessage('unknown_error');

      expect(message).toBeDefined();
      expect(message.length > 0).toBe(true);
    });
  });

  describe('isRetryable', () => {
    it('should identify retryable error', () => {
      const isRetryable = errorHandler.isRetryable('processing_error');

      expect(isRetryable).toBe(true);
    });

    it('should identify non-retryable error', () => {
      const isRetryable = errorHandler.isRetryable('expired_card');

      expect(isRetryable).toBe(false);
    });
  });

  describe('getStatusCode', () => {
    it('should return correct status code for error', () => {
      const statusCode = errorHandler.getStatusCode('card_declined');

      expect(statusCode).toBe(402);
    });

    it('should return 500 for unknown error', () => {
      const statusCode = errorHandler.getStatusCode('unknown_error');

      expect(statusCode).toBe(500);
    });
  });

  describe('getRetryableErrors', () => {
    it('should return list of retryable errors', () => {
      const retryable = errorHandler.getRetryableErrors();

      expect(Array.isArray(retryable)).toBe(true);
      expect(retryable.length).toBeGreaterThan(0);
      expect(retryable).toContain('card_declined');
    });
  });
});
