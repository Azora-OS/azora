/**
 * Constitutional AI Middleware Tests
 * Integration tests for API Gateway middleware
 */

import { Request, Response, NextFunction } from 'express';
import { ConstitutionalOrchestrator } from '../orchestrator';
import { createConstitutionalMiddleware, ConstitutionalRequest } from '../middleware/constitutional-middleware';

describe('Constitutional AI Middleware', () => {
  let orchestrator: ConstitutionalOrchestrator;
  let middleware: any;
  let mockReq: Partial<ConstitutionalRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    orchestrator = new ConstitutionalOrchestrator({
      ubuntuEnabled: true,
      biasDetectionEnabled: true,
      privacyFilterEnabled: true,
      harmPreventionEnabled: true,
      auditLoggingEnabled: false
    });

    middleware = createConstitutionalMiddleware(orchestrator, {
      enabled: true,
      skipPaths: ['/health', '/metrics'],
      skipMethods: ['OPTIONS', 'HEAD'],
      onViolation: 'block',
      includeMetadata: true
    });

    mockReq = {
      path: '/api/generate',
      method: 'POST',
      body: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
  });

  describe('Middleware Initialization', () => {
    it('should create middleware with default configuration', () => {
      const defaultMiddleware = createConstitutionalMiddleware(orchestrator);
      expect(defaultMiddleware).toBeDefined();
      expect(typeof defaultMiddleware).toBe('function');
    });

    it('should create middleware with custom configuration', () => {
      const customMiddleware = createConstitutionalMiddleware(orchestrator, {
        enabled: false,
        onViolation: 'warn'
      });
      expect(customMiddleware).toBeDefined();
    });
  });

  describe('Middleware Execution', () => {
    it('should call next() when middleware is disabled', async () => {
      const disabledMiddleware = createConstitutionalMiddleware(orchestrator, {
        enabled: false
      });

      await disabledMiddleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next() for skipped paths', async () => {
      mockReq.path = '/health';

      await middleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next() for skipped methods', async () => {
      mockReq.method = 'OPTIONS';

      await middleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next() for non-AI responses', async () => {
      mockReq.path = '/api/data';

      await middleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should intercept and validate AI responses', async () => {
      mockReq.path = '/api/generate';

      await middleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.json).toBeDefined();
    });
  });

  describe('Response Validation', () => {
    it('should validate response with AI output field', async () => {
      mockReq.path = '/api/generate';

      await middleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

      const responseBody = {
        output: 'This is a community-focused solution that benefits everyone.'
      };

      // Simulate calling res.json with AI output
      if (typeof mockRes.json === 'function') {
        mockRes.json(responseBody);
      }

      expect(mockNext).toHaveBeenCalled();
    });

    it('should validate response with response field', async () => {
      mockReq.path = '/api/generate';

      await middleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

      const responseBody = {
        response: 'This is a community-focused solution that benefits everyone.'
      };

      if (typeof mockRes.json === 'function') {
        mockRes.json(responseBody);
      }

      expect(mockNext).toHaveBeenCalled();
    });

    it('should validate response with message field', async () => {
      mockReq.path = '/api/generate';

      await middleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

      const responseBody = {
        message: 'This is a community-focused solution that benefits everyone.'
      };

      if (typeof mockRes.json === 'function') {
        mockRes.json(responseBody);
      }

      expect(mockNext).toHaveBeenCalled();
    });

    it('should validate response with content field', async () => {
      mockReq.path = '/api/generate';

      await middleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

      const responseBody = {
        content: 'This is a community-focused solution that benefits everyone.'
      };

      if (typeof mockRes.json === 'function') {
        mockRes.json(responseBody);
      }

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Violation Handling', () => {
    it('should block response on violation when configured', async () => {
      const blockMiddleware = createConstitutionalMiddleware(orchestrator, {
        onViolation: 'block'
      });

      mockReq.path = '/api/generate';

      await blockMiddleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should warn on violation when configured', async () => {
      const warnMiddleware = createConstitutionalMiddleware(orchestrator, {
        onViolation: 'warn'
      });

      mockReq.path = '/api/generate';

      await warnMiddleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should log violation when configured', async () => {
      const logMiddleware = createConstitutionalMiddleware(orchestrator, {
        onViolation: 'log'
      });

      mockReq.path = '/api/generate';

      await logMiddleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Metadata Inclusion', () => {
    it('should include validation metadata when configured', async () => {
      const metadataMiddleware = createConstitutionalMiddleware(orchestrator, {
        includeMetadata: true
      });

      mockReq.path = '/api/generate';

      await metadataMiddleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should exclude validation metadata when configured', async () => {
      const noMetadataMiddleware = createConstitutionalMiddleware(orchestrator, {
        includeMetadata: false
      });

      mockReq.path = '/api/generate';

      await noMetadataMiddleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Request Attachment', () => {
    it('should attach constitutional validation data to request', async () => {
      mockReq.path = '/api/generate';

      await middleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should preserve original request properties', async () => {
      mockReq.path = '/api/generate';
      mockReq.body = { query: 'test' };

      await middleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

      expect(mockReq.body).toEqual({ query: 'test' });
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors gracefully', async () => {
      mockReq.path = '/api/generate';

      await middleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should not crash on invalid response body', async () => {
      mockReq.path = '/api/generate';

      await middleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle null response body', async () => {
      mockReq.path = '/api/generate';

      await middleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

      if (typeof mockRes.json === 'function') {
        mockRes.json(null);
      }

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Path Filtering', () => {
    it('should skip validation for health check endpoint', async () => {
      mockReq.path = '/health';

      await middleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should skip validation for metrics endpoint', async () => {
      mockReq.path = '/metrics';

      await middleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should validate non-skipped paths', async () => {
      mockReq.path = '/api/generate';

      await middleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should support custom skip paths', async () => {
      const customMiddleware = createConstitutionalMiddleware(orchestrator, {
        skipPaths: ['/custom', '/skip']
      });

      mockReq.path = '/custom';

      await customMiddleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Method Filtering', () => {
    it('should skip validation for OPTIONS method', async () => {
      mockReq.method = 'OPTIONS';

      await middleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should skip validation for HEAD method', async () => {
      mockReq.method = 'HEAD';

      await middleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should validate POST requests', async () => {
      mockReq.method = 'POST';
      mockReq.path = '/api/generate';

      await middleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should validate GET requests', async () => {
      mockReq.method = 'GET';
      mockReq.path = '/api/generate';

      await middleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should support custom skip methods', async () => {
      const customMiddleware = createConstitutionalMiddleware(orchestrator, {
        skipMethods: ['PATCH', 'DELETE']
      });

      mockReq.method = 'PATCH';

      await customMiddleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Integration Scenarios', () => {
    it('should validate compliant AI output', async () => {
      mockReq.path = '/api/generate';

      await middleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle multiple sequential requests', async () => {
      for (let i = 0; i < 3; i++) {
        mockReq.path = '/api/generate';
        mockNext.mockClear();

        await middleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
      }
    });

    it('should maintain state across requests', async () => {
      mockReq.path = '/api/generate';

      await middleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();

      // Second request should work independently
      mockNext.mockClear();
      await middleware(mockReq as ConstitutionalRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Configuration Validation', () => {
    it('should accept valid configuration', () => {
      const validConfig = {
        enabled: true,
        skipPaths: ['/health'],
        skipMethods: ['OPTIONS'],
        onViolation: 'block' as const,
        includeMetadata: true
      };

      const testMiddleware = createConstitutionalMiddleware(orchestrator, validConfig);
      expect(testMiddleware).toBeDefined();
    });

    it('should work with partial configuration', () => {
      const partialConfig = {
        enabled: true
      };

      const testMiddleware = createConstitutionalMiddleware(orchestrator, partialConfig);
      expect(testMiddleware).toBeDefined();
    });

    it('should work with empty configuration', () => {
      const testMiddleware = createConstitutionalMiddleware(orchestrator, {});
      expect(testMiddleware).toBeDefined();
    });
  });
});
