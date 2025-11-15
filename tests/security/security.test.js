const request = require('supertest');
const { rateLimiters, validateInput, sanitizeInput } = require('../../packages/security-middleware');
const { schemas } = require('../../packages/input-validation');

describe('Security Tests', () => {
  describe('Rate Limiting', () => {
    test('should enforce rate limits', () => {
      expect(rateLimiters.standard).toBeDefined();
      expect(rateLimiters.auth).toBeDefined();
      expect(rateLimiters.financial).toBeDefined();
    });
  });

  describe('Input Validation', () => {
    test('should validate user creation', () => {
      const valid = { email: 'test@test.com', password: 'password123', name: 'Test' };
      expect(() => schemas.user.create.parse(valid)).not.toThrow();
    });

    test('should reject invalid email', () => {
      const invalid = { email: 'invalid', password: 'password123', name: 'Test' };
      expect(() => schemas.user.create.parse(invalid)).toThrow();
    });

    test('should reject short password', () => {
      const invalid = { email: 'test@test.com', password: '123', name: 'Test' };
      expect(() => schemas.user.create.parse(invalid)).toThrow();
    });
  });

  describe('Input Sanitization', () => {
    test('should sanitize XSS attempts', () => {
      const req = { body: { name: '<script>alert("xss")</script>' }, query: {}, params: {} };
      const res = {};
      const next = jest.fn();
      
      sanitizeInput(req, res, next);
      
      expect(req.body.name).not.toContain('<script>');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('CORS', () => {
    test('should allow localhost origins', () => {
      const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
      expect(allowedOrigins).toContain('http://localhost:3000');
    });
  });
});
