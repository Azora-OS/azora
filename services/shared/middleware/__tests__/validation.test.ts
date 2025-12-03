import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../validation';

describe('Validation Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  describe('validate', () => {
    it('should call next when validation passes', async () => {
      const schema = z.object({
        body: z.object({
          email: z.string().email()
        })
      });

      req.body = { email: 'test@azora.world' };

      const middleware = validate(schema);
      await middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should return 400 when validation fails', async () => {
      const schema = z.object({
        body: z.object({
          email: z.string().email()
        })
      });

      req.body = { email: 'invalid-email' };

      const middleware = validate(schema);
      await middleware(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });

    it('should return validation error details', async () => {
      const schema = z.object({
        body: z.object({
          email: z.string().email()
        })
      });

      req.body = { email: 'invalid' };

      const middleware = validate(schema);
      await middleware(req as Request, res as Response, next);

      const response = (res.json as jest.Mock).mock.calls[0][0];
      expect(response.error).toBe('Validation failed');
      expect(response.details).toBeDefined();
      expect(Array.isArray(response.details)).toBe(true);
    });

    it('should validate body fields', async () => {
      const schema = z.object({
        body: z.object({
          name: z.string().min(1),
          age: z.number().min(0)
        })
      });

      req.body = { name: 'John', age: 25 };

      const middleware = validate(schema);
      await middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should validate query parameters', async () => {
      const schema = z.object({
        query: z.object({
          page: z.string().transform(Number).pipe(z.number().min(1))
        })
      });

      req.query = { page: '1' };

      const middleware = validate(schema);
      await middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should validate path parameters', async () => {
      const schema = z.object({
        params: z.object({
          id: z.string().uuid()
        })
      });

      req.params = { id: '550e8400-e29b-41d4-a716-446655440000' };

      const middleware = validate(schema);
      await middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should reject invalid UUID', async () => {
      const schema = z.object({
        params: z.object({
          id: z.string().uuid()
        })
      });

      req.params = { id: 'not-a-uuid' };

      const middleware = validate(schema);
      await middleware(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should validate multiple fields', async () => {
      const schema = z.object({
        body: z.object({
          email: z.string().email(),
          password: z.string().min(8),
          name: z.string().min(1)
        })
      });

      req.body = {
        email: 'test@azora.world',
        password: 'SecurePass123',
        name: 'Test User'
      };

      const middleware = validate(schema);
      await middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should reject when required field is missing', async () => {
      const schema = z.object({
        body: z.object({
          email: z.string().email(),
          password: z.string().min(8)
        })
      });

      req.body = { email: 'test@azora.world' };

      const middleware = validate(schema);
      await middleware(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle complex nested validation', async () => {
      const schema = z.object({
        body: z.object({
          user: z.object({
            email: z.string().email(),
            profile: z.object({
              firstName: z.string(),
              lastName: z.string()
            })
          })
        })
      });

      req.body = {
        user: {
          email: 'test@azora.world',
          profile: {
            firstName: 'John',
            lastName: 'Doe'
          }
        }
      };

      const middleware = validate(schema);
      await middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should validate arrays', async () => {
      const schema = z.object({
        body: z.object({
          tags: z.array(z.string())
        })
      });

      req.body = { tags: ['education', 'technology'] };

      const middleware = validate(schema);
      await middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should reject invalid array items', async () => {
      const schema = z.object({
        body: z.object({
          ids: z.array(z.number())
        })
      });

      req.body = { ids: [1, 'invalid', 3] };

      const middleware = validate(schema);
      await middleware(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
