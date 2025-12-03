import { Request, Response, NextFunction } from 'express';
import { authenticate, requireRole, optionalAuth } from '../middleware/auth';

describe('Shared Utilities - Authentication Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  
  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    nextFunction = jest.fn();
  });
  
  describe('authenticate', () => {
    it('should authenticate valid Bearer token', () => {
      const userData = { userId: '123', email: 'test@azora.world' };
      const token = Buffer.from(JSON.stringify(userData)).toString('base64');
      
      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };
      
      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockRequest.user).toEqual(userData);
      expect(nextFunction).toHaveBeenCalled();
    });
    
    it('should reject request without authorization header', () => {
      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
    });
    
    it('should reject request with invalid token format', () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat token'
      };
      
      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
    });
    
    it('should reject request with malformed token', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token'
      };
      
      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
    });
  });
  
  describe('requireRole', () => {
    it('should allow user with required role', () => {
      mockRequest.user = {
        userId: '123',
        role: 'admin',
        email: 'admin@azora.world'
      };
      
      const middleware = requireRole(['admin', 'moderator']);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalledWith();
    });
    
    it('should reject user without required role', () => {
      mockRequest.user = {
        userId: '123',
        role: 'user',
        email: 'user@azora.world'
      };
      
      const middleware = requireRole(['admin', 'moderator']);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
    });
    
    it('should reject unauthenticated user', () => {
      const middleware = requireRole(['admin']);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
    });
    
    it('should handle multiple allowed roles', () => {
      mockRequest.user = {
        userId: '123',
        role: 'moderator',
        email: 'mod@azora.world'
      };
      
      const middleware = requireRole(['admin', 'moderator', 'editor']);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalledWith();
    });
  });
  
  describe('optionalAuth', () => {
    it('should attach user if valid token provided', () => {
      const userData = { userId: '123', email: 'test@azora.world' };
      const token = Buffer.from(JSON.stringify(userData)).toString('base64');
      
      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };
      
      optionalAuth(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockRequest.user).toEqual(userData);
      expect(nextFunction).toHaveBeenCalled();
    });
    
    it('should continue without user if no token provided', () => {
      optionalAuth(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockRequest.user).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
    });
    
    it('should continue without user if invalid token provided', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token'
      };
      
      optionalAuth(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockRequest.user).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
    });
  });
});
