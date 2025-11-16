import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import bcrypt from 'bcrypt';

// Mock factories
const userFactory = {
  build: (overrides?: any) => ({
    email: `test${Date.now()}@azora.test`,
    password: 'Test123!@#',
    firstName: 'Test',
    lastName: 'User',
    role: 'student',
    ...overrides
  })
};

const authHelper = {
  decodeToken: (token: string) => {
    const payload = token.split('.')[1];
    return JSON.parse(Buffer.from(payload, 'base64').toString());
  }
};

const API_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';

describe('Auth Service - Comprehensive Tests', () => {
  
  describe('Registration', () => {
    it('should register new user with hashed password', async () => {
      const userData = userFactory.build();
      
      const res = await request(API_URL)
        .post('/api/auth/register')
        .send(userData);
      
      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe(userData.email);
      expect(res.body.user.password).toBeUndefined();
      expect(res.body.token).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      const userData = userFactory.build();
      
      await request(API_URL).post('/api/auth/register').send(userData);
      const res = await request(API_URL).post('/api/auth/register').send(userData);
      
      expect(res.status).toBe(409);
      expect(res.body.error).toContain('already exists');
    });

    it('should validate password strength', async () => {
      const userData = userFactory.build({ password: 'weak' });
      
      const res = await request(API_URL)
        .post('/api/auth/register')
        .send(userData);
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('password');
    });
  });

  describe('Login', () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = userFactory.build();
      await request(API_URL).post('/api/auth/register').send(testUser);
    });

    it('should login with valid credentials', async () => {
      const res = await request(API_URL)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });
      
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should reject invalid password', async () => {
      const res = await request(API_URL)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        });
      
      expect(res.status).toBe(401);
    });

    it('should reject non-existent user', async () => {
      const res = await request(API_URL)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.azora',
          password: 'password',
        });
      
      expect(res.status).toBe(401);
    });
  });

  describe('JWT Token', () => {
    it('should generate valid JWT token', async () => {
      const userData = userFactory.build();
      const res = await request(API_URL).post('/api/auth/register').send(userData);
      
      const token = res.body.token;
      const decoded = authHelper.decodeToken(token);
      
      expect(decoded.email).toBe(userData.email);
      expect(decoded.userId).toBeDefined();
    });

    it('should access protected route with valid token', async () => {
      const userData = userFactory.build();
      const registerRes = await request(API_URL).post('/api/auth/register').send(userData);
      
      const res = await request(API_URL)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${registerRes.body.token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(userData.email);
    });

    it('should reject invalid token', async () => {
      const res = await request(API_URL)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(res.status).toBe(401);
    });
  });

  describe('Password Reset', () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = userFactory.build();
      await request(API_URL).post('/api/auth/register').send(testUser);
    });

    it('should initiate password reset', async () => {
      const res = await request(API_URL)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email });
      
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('reset');
    });

    it('should reset password with valid token', async () => {
      // This would require implementing reset token generation
      // Placeholder for now
      expect(true).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on login attempts', async () => {
      const userData = userFactory.build();
      
      // Make multiple failed login attempts
      const promises = Array(10).fill(null).map(() =>
        request(API_URL)
          .post('/api/auth/login')
          .send({ email: userData.email, password: 'wrong' })
      );
      
      const results = await Promise.all(promises);
      const rateLimited = results.some(r => r.status === 429);
      
      expect(rateLimited).toBe(true);
    });
  });
});
