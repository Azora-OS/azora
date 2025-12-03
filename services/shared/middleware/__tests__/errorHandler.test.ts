import { Request, Response, NextFunction } from 'express';
import { AppError, errorHandler } from '../errorHandler';

describe('Error Handler Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  describe('AppError', () => {
    it('should create error with status code and message', () => {
      const error = new AppError(400, 'Bad request');
      
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Bad request');
      expect(error.isOperational).toBe(true);
    });

    it('should be instance of Error', () => {
      const error = new AppError(500, 'Server error');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });

    it('should have correct prototype', () => {
      const error = new AppError(401, 'Unauthorized');
      
      expect(Object.getPrototypeOf(error)).toBe(AppError.prototype);
    });

    it('should allow custom isOperational flag', () => {
      const error = new AppError(500, 'Error', false);
      
      expect(error.isOperational).toBe(false);
    });

    it('should handle 401 status code', () => {
      const error = new AppError(401, 'Unauthorized');
      
      expect(error.statusCode).toBe(401);
    });

    it('should handle 403 status code', () => {
      const error = new AppError(403, 'Forbidden');
      
      expect(error.statusCode).toBe(403);
    });

    it('should handle 404 status code', () => {
      const error = new AppError(404, 'Not found');
      
      expect(error.statusCode).toBe(404);
    });

    it('should handle 500 status code', () => {
      const error = new AppError(500, 'Internal server error');
      
      expect(error.statusCode).toBe(500);
    });
  });

  describe('errorHandler', () => {
    it('should handle AppError correctly', () => {
      const error = new AppError(400, 'Bad request');
      
      errorHandler(error, req as Request, res as Response, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Bad request'
      });
    });

    it('should return 401 for unauthorized error', () => {
      const error = new AppError(401, 'Unauthorized');
      
      errorHandler(error, req as Request, res as Response, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 403 for forbidden error', () => {
      const error = new AppError(403, 'Forbidden');
      
      errorHandler(error, req as Request, res as Response, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return 404 for not found error', () => {
      const error = new AppError(404, 'Not found');
      
      errorHandler(error, req as Request, res as Response, next);
      
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 for unexpected error', () => {
      const error = new Error('Unexpected error');
      
      errorHandler(error, req as Request, res as Response, next);
      
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should hide error message in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const error = new Error('Sensitive error details');
      
      errorHandler(error, req as Request, res as Response, next);
      
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error'
      });
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should show error message in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const error = new Error('Development error');
      
      errorHandler(error, req as Request, res as Response, next);
      
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Development error'
      });
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should log unexpected errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Unexpected error');
      
      errorHandler(error, req as Request, res as Response, next);
      
      expect(consoleSpy).toHaveBeenCalledWith('Unexpected error:', error);
      
      consoleSpy.mockRestore();
    });

    it('should return error status in response', () => {
      const error = new AppError(422, 'Validation error');
      
      errorHandler(error, req as Request, res as Response, next);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error'
        })
      );
    });
  });
});
