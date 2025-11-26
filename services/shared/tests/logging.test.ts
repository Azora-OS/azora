import winston from 'winston';
import { Request, Response, NextFunction } from 'express';
import {
  createLogger,
  requestLoggingMiddleware,
  logInfo,
  logWarn,
  logError,
  logDebug,
  logDatabaseOperation,
  logAuthEvent,
  logBusinessEvent,
  logPaymentEvent,
  logErrorWithContext
} from '../logging';

describe('Shared Utilities - Logging', () => {
  let logger: winston.Logger;
  
  beforeEach(() => {
    logger = createLogger('test-service');
  });
  
  afterEach(() => {
    logger.close();
  });
  
  describe('createLogger', () => {
    it('should create logger with service name', () => {
      const testLogger = createLogger('test-service');
      expect(testLogger).toBeDefined();
      expect(testLogger.defaultMeta).toEqual({ service: 'test-service' });
    });
    
    it('should have console transport', () => {
      const testLogger = createLogger('test-service');
      const transports = testLogger.transports;
      expect(transports.length).toBeGreaterThan(0);
    });
  });
  
  describe('logInfo', () => {
    it('should log info message', () => {
      const spy = jest.spyOn(logger, 'info');
      logInfo(logger, 'Test message');
      expect(spy).toHaveBeenCalledWith('Test message', undefined);
    });
    
    it('should log info message with metadata', () => {
      const spy = jest.spyOn(logger, 'info');
      const meta = { userId: '123', action: 'test' };
      logInfo(logger, 'Test message', meta);
      expect(spy).toHaveBeenCalledWith('Test message', meta);
    });
  });
  
  describe('logWarn', () => {
    it('should log warning message', () => {
      const spy = jest.spyOn(logger, 'warn');
      logWarn(logger, 'Warning message');
      expect(spy).toHaveBeenCalledWith('Warning message', undefined);
    });
  });
  
  describe('logError', () => {
    it('should log error message', () => {
      const spy = jest.spyOn(logger, 'error');
      const error = new Error('Test error');
      logError(logger, 'Error occurred', error);
      expect(spy).toHaveBeenCalled();
    });
    
    it('should include error stack', () => {
      const spy = jest.spyOn(logger, 'error');
      const error = new Error('Test error');
      logError(logger, 'Error occurred', error);
      const callArgs = spy.mock.calls[0];
      expect(callArgs[1]).toHaveProperty('stack');
    });
  });
  
  describe('logDebug', () => {
    it('should log debug message', () => {
      const spy = jest.spyOn(logger, 'debug');
      logDebug(logger, 'Debug message');
      expect(spy).toHaveBeenCalledWith('Debug message', undefined);
    });
  });
  
  describe('logDatabaseOperation', () => {
    it('should log successful database operation', () => {
      const spy = jest.spyOn(logger, 'log');
      logDatabaseOperation(logger, 'SELECT', 'users', 50, true);
      expect(spy).toHaveBeenCalledWith('info', 'Database SELECT on users', expect.any(Object));
    });
    
    it('should log failed database operation', () => {
      const spy = jest.spyOn(logger, 'log');
      const error = new Error('Connection failed');
      logDatabaseOperation(logger, 'INSERT', 'users', 100, false, error);
      expect(spy).toHaveBeenCalledWith('error', 'Database INSERT on users', expect.any(Object));
    });
  });
  
  describe('logAuthEvent', () => {
    it('should log login event', () => {
      const spy = jest.spyOn(logger, 'info');
      logAuthEvent(logger, 'login', 'user123');
      expect(spy).toHaveBeenCalledWith('Auth: login', expect.objectContaining({
        event: 'login',
        userId: 'user123'
      }));
    });
    
    it('should log failed login event', () => {
      const spy = jest.spyOn(logger, 'info');
      logAuthEvent(logger, 'failed_login', undefined, { ip: '192.168.1.1' });
      expect(spy).toHaveBeenCalledWith('Auth: failed_login', expect.objectContaining({
        event: 'failed_login',
        ip: '192.168.1.1'
      }));
    });
  });
  
  describe('logBusinessEvent', () => {
    it('should log business event', () => {
      const spy = jest.spyOn(logger, 'info');
      logBusinessEvent(logger, 'course_enrolled', 'user123', { courseId: 'course456' });
      expect(spy).toHaveBeenCalledWith('Business: course_enrolled', expect.objectContaining({
        event: 'course_enrolled',
        userId: 'user123',
        courseId: 'course456'
      }));
    });
  });
  
  describe('logPaymentEvent', () => {
    it('should log payment event', () => {
      const spy = jest.spyOn(logger, 'info');
      logPaymentEvent(logger, 'payment_completed', 'txn123', 99.99, 'USD');
      expect(spy).toHaveBeenCalledWith('Payment: payment_completed', expect.objectContaining({
        event: 'payment_completed',
        transactionId: 'txn123',
        amount: 99.99,
        currency: 'USD'
      }));
    });
  });
  
  describe('logErrorWithContext', () => {
    it('should log error with context', () => {
      const spy = jest.spyOn(logger, 'error');
      const error = new Error('Test error');
      logErrorWithContext(logger, error, 'payment processing', { orderId: '123' });
      expect(spy).toHaveBeenCalledWith('Error in payment processing', expect.objectContaining({
        error: 'Test error',
        context: 'payment processing',
        orderId: '123'
      }));
    });
  });
  
  describe('requestLoggingMiddleware', () => {
    it('should create middleware function', () => {
      const middleware = requestLoggingMiddleware(logger);
      expect(typeof middleware).toBe('function');
    });
    
    it('should log HTTP requests', () => {
      const spy = jest.spyOn(logger, 'info');
      const middleware = requestLoggingMiddleware(logger);
      
      const req = {
        method: 'GET',
        path: '/api/test',
        ip: '127.0.0.1',
        get: jest.fn().mockReturnValue('test-agent')
      } as unknown as Request;
      
      const res = {
        statusCode: 200,
        send: jest.fn().mockImplementation(function(data: any) {
          return data;
        })
      } as unknown as Response;
      
      const next = jest.fn() as NextFunction;
      
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
