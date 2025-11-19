/**
 * Structured Logger Tests
 */

import { structuredLogger } from '../structured-logger';

describe('StructuredLogger', () => {
  describe('info', () => {
    it('should log info messages', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      structuredLogger.info('Test info message');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log info with context', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      structuredLogger.info('User enrolled', {
        userId: 'user-123',
        courseId: 'course-456',
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log info with metadata', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      structuredLogger.info('Payment processed', 
        { userId: 'user-123' },
        { amount: 99.99, currency: 'USD' }
      );

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('warn', () => {
    it('should log warning messages', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      structuredLogger.warn('Test warning message');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('error', () => {
    it('should log error messages', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      structuredLogger.error('Test error message', new Error('Test error'));

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log error with string message', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      structuredLogger.error('Test error', 'Error string');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log error with context and metadata', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      structuredLogger.error(
        'Payment failed',
        new Error('Insufficient funds'),
        { userId: 'user-123' },
        { amount: 99.99, errorCode: 'INSUFFICIENT_FUNDS' }
      );

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('debug', () => {
    it('should log debug messages', () => {
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();

      structuredLogger.debug('Test debug message');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('logHttpRequest', () => {
    it('should log HTTP requests', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      structuredLogger.logHttpRequest('GET', '/api/v1/courses', 200, 0.5);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log HTTP requests with context', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      structuredLogger.logHttpRequest('POST', '/api/v1/enrollments', 201, 1.2, {
        userId: 'user-123',
        requestId: 'req-456',
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('logDbOperation', () => {
    it('should log database operations', () => {
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();

      structuredLogger.logDbOperation('SELECT', 'courses', 0.05, 10);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('logAiOperation', () => {
    it('should log successful AI operations', () => {
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();

      structuredLogger.logAiOperation('elara', 'tutoring', 2.5, 'success');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log failed AI operations', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      structuredLogger.logAiOperation('knowledge-ocean', 'retrieval', 5.0, 'error');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('logBusinessEvent', () => {
    it('should log business events', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      structuredLogger.logBusinessEvent('enrollment_created', {
        studentId: 'student-123',
        courseId: 'course-456',
        tier: 'premium',
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('createChildLogger', () => {
    it('should create a child logger with context', () => {
      const childLogger = structuredLogger.createChildLogger({
        userId: 'user-123',
        courseId: 'course-456',
      });

      expect(childLogger).toBeDefined();
      expect(childLogger.info).toBeDefined();
      expect(childLogger.warn).toBeDefined();
      expect(childLogger.error).toBeDefined();
      expect(childLogger.debug).toBeDefined();
    });

    it('should log with child logger context', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const childLogger = structuredLogger.createChildLogger({
        userId: 'user-123',
        courseId: 'course-456',
      });

      childLogger.info('Module completed');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log business events with child logger', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const childLogger = structuredLogger.createChildLogger({
        userId: 'user-123',
      });

      childLogger.logBusinessEvent('course_completion', { score: 95 });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
