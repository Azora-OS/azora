import { Request, Response, NextFunction } from 'express';
import { corsConfig, createRateLimiter, rateLimiters, helmetConfig } from '../security';

describe('Security Middleware', () => {
  describe('corsConfig', () => {
    it('should have correct CORS configuration', () => {
      expect(corsConfig).toBeDefined();
      expect(corsConfig.origin).toBeDefined();
      expect(corsConfig.credentials).toBe(true);
      expect(corsConfig.methods).toContain('GET');
      expect(corsConfig.methods).toContain('POST');
      expect(corsConfig.methods).toContain('PUT');
      expect(corsConfig.methods).toContain('DELETE');
      expect(corsConfig.methods).toContain('PATCH');
    });

    it('should include Authorization in allowed headers', () => {
      expect(corsConfig.allowedHeaders).toContain('Authorization');
      expect(corsConfig.allowedHeaders).toContain('Content-Type');
    });
  });

  describe('createRateLimiter', () => {
    it('should create rate limiter with default max', () => {
      const limiter = createRateLimiter();
      expect(limiter).toBeDefined();
      expect(limiter.options).toBeDefined();
      expect(limiter.options.max).toBe(100);
    });

    it('should create rate limiter with custom max', () => {
      const limiter = createRateLimiter(50);
      expect(limiter.options.max).toBe(50);
    });

    it('should have 15 minute window', () => {
      const limiter = createRateLimiter();
      expect(limiter.options.windowMs).toBe(15 * 60 * 1000);
    });

    it('should have error message', () => {
      const limiter = createRateLimiter();
      expect(limiter.options.message).toBe('Too many requests from this IP');
    });
  });

  describe('rateLimiters', () => {
    it('should have general limiter with 100 max', () => {
      expect(rateLimiters.general).toBeDefined();
      expect(rateLimiters.general.options.max).toBe(100);
    });

    it('should have financial limiter with 50 max', () => {
      expect(rateLimiters.financial).toBeDefined();
      expect(rateLimiters.financial.options.max).toBe(50);
    });

    it('should have auth limiter with 30 max', () => {
      expect(rateLimiters.auth).toBeDefined();
      expect(rateLimiters.auth.options.max).toBe(30);
    });

    it('should have public limiter with 200 max', () => {
      expect(rateLimiters.public).toBeDefined();
      expect(rateLimiters.public.options.max).toBe(200);
    });

    it('should have all required limiters', () => {
      expect(Object.keys(rateLimiters)).toContain('general');
      expect(Object.keys(rateLimiters)).toContain('financial');
      expect(Object.keys(rateLimiters)).toContain('auth');
      expect(Object.keys(rateLimiters)).toContain('public');
    });
  });

  describe('helmetConfig', () => {
    it('should have helmet configuration', () => {
      expect(helmetConfig).toBeDefined();
    });

    it('should have content security policy', () => {
      expect(helmetConfig.contentSecurityPolicy).toBeDefined();
      expect(helmetConfig.contentSecurityPolicy.directives).toBeDefined();
    });

    it('should restrict default source to self', () => {
      const directives = helmetConfig.contentSecurityPolicy.directives;
      expect(directives.defaultSrc).toContain("'self'");
    });

    it('should allow unsafe inline styles', () => {
      const directives = helmetConfig.contentSecurityPolicy.directives;
      expect(directives.styleSrc).toContain("'unsafe-inline'");
    });

    it('should restrict scripts to self', () => {
      const directives = helmetConfig.contentSecurityPolicy.directives;
      expect(directives.scriptSrc).toContain("'self'");
    });

    it('should allow images from self and https', () => {
      const directives = helmetConfig.contentSecurityPolicy.directives;
      expect(directives.imgSrc).toContain("'self'");
      expect(directives.imgSrc).toContain('data:');
      expect(directives.imgSrc).toContain('https:');
    });

    it('should have HSTS enabled', () => {
      expect(helmetConfig.hsts).toBeDefined();
      expect(helmetConfig.hsts.maxAge).toBe(31536000);
      expect(helmetConfig.hsts.includeSubDomains).toBe(true);
      expect(helmetConfig.hsts.preload).toBe(true);
    });
  });
});
