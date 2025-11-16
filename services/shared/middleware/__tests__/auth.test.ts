import { Request, Response, NextFunction } from 'express';
import { authenticate, requireRole, optionalAuth } from '../auth';
import { AppError } from '../errorHandler';

describe('Auth Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      headers: {},
      user: undefined
    };
    res = {};
    next = jest.fn();
  });

  describe('authenticate', () => {
    it('should throw error when no authorization header', () => {
      authenticate(req as Request, res as Response, next);
      
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
    });

    it('should throw error when authorization header is invalid', () => {
      req.headers = { authorization: 'InvalidFormat' };
      
      authenticate(req as Request, res as Response, next);
      
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
    });

    it('should throw error when token is invalid', () => {
      req.headers = { authorization: 'Bearer invalid-token' };
      
      authenticate(req as Request, res as Response, next);
      
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
    });

    it('should set user when valid token provided', () => {
      const userData = { userId: 'user123', role: 'admin', email: 'test@azora.world' };
      const token = Buffer.from(JSON.stringify(userData)).toString('base64');
      req.headers = { authorization: `Bearer ${token}` };
      
      authenticate(req as Request, res as Response, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(req.user).toEqual(userData);
    });

    it('should extract userId from token', () => {
      const userData = { userId: 'user456' };
      const token = Buffer.from(JSON.stringify(userData)).toString('base64');
      req.headers = { authorization: `Bearer ${token}` };
      
      authenticate(req as Request, res as Response, next);
      
      expect(req.user?.userId).toBe('user456');
    });

    it('should handle Bearer token with different cases', () => {
      const userData = { userId: 'user789' };
      const token = Buffer.from(JSON.stringify(userData)).toString('base64');
      req.headers = { authorization: `Bearer ${token}` };
      
      authenticate(req as Request, res as Response, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(req.user).toBeDefined();
    });
  });

  describe('requireRole', () => {
    it('should throw error when user not authenticated', () => {
      const middleware = requireRole(['admin']);
      req.user = undefined;
      
      middleware(req as Request, res as Response, next);
      
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
    });

    it('should throw error when user role not allowed', () => {
      const middleware = requireRole(['admin']);
      req.user = { userId: 'user123', role: 'user' };
      
      middleware(req as Request, res as Response, next);
      
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(403);
    });

    it('should allow user with correct role', () => {
      const middleware = requireRole(['admin']);
      req.user = { userId: 'user123', role: 'admin' };
      
      middleware(req as Request, res as Response, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it('should allow user with one of multiple allowed roles', () => {
      const middleware = requireRole(['admin', 'moderator']);
      req.user = { userId: 'user123', role: 'moderator' };
      
      middleware(req as Request, res as Response, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it('should throw error when user has no role', () => {
      const middleware = requireRole(['admin']);
      req.user = { userId: 'user123' };
      
      middleware(req as Request, res as Response, next);
      
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(403);
    });
  });

  describe('optionalAuth', () => {
    it('should continue without error when no authorization header', () => {
      optionalAuth(req as Request, res as Response, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(req.user).toBeUndefined();
    });

    it('should continue without error when authorization header is invalid', () => {
      req.headers = { authorization: 'InvalidFormat' };
      
      optionalAuth(req as Request, res as Response, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(req.user).toBeUndefined();
    });

    it('should set user when valid token provided', () => {
      const userData = { userId: 'user123', role: 'user' };
      const token = Buffer.from(JSON.stringify(userData)).toString('base64');
      req.headers = { authorization: `Bearer ${token}` };
      
      optionalAuth(req as Request, res as Response, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(req.user).toEqual(userData);
    });

    it('should silently fail on invalid token', () => {
      req.headers = { authorization: 'Bearer invalid-token' };
      
      optionalAuth(req as Request, res as Response, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(req.user).toBeUndefined();
    });

    it('should handle malformed JSON in token', () => {
      const token = Buffer.from('not-json').toString('base64');
      req.headers = { authorization: `Bearer ${token}` };
      
      optionalAuth(req as Request, res as Response, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(req.user).toBeUndefined();
    });
  });
});
