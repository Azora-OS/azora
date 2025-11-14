const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const BASE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

describe('Auth Service', () => {
  let testUser;
  let accessToken;
  let refreshToken;

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    if (testUser) {
      await prisma.token.deleteMany({ where: { userId: testUser.id } });
      await prisma.user.delete({ where: { id: testUser.id } });
    }
    await prisma.$disconnect();
  });

  describe('POST /register', () => {
    it('should register a new user', async () => {
      const response = await request(BASE_URL)
        .post('/register')
        .send({
          email: `test${Date.now()}@azora.world`,
          password: 'SecurePass123!',
          name: 'Test User'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBeDefined();
      
      testUser = response.body.user;
    });

    it('should reject duplicate email', async () => {
      const response = await request(BASE_URL)
        .post('/register')
        .send({
          email: testUser.email,
          password: 'SecurePass123!',
          name: 'Duplicate User'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already exists');
    });

    it('should reject weak password', async () => {
      const response = await request(BASE_URL)
        .post('/register')
        .send({
          email: 'weak@azora.world',
          password: '123',
          name: 'Weak Password User'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('at least 8 characters');
    });
  });

  describe('POST /login', () => {
    beforeAll(async () => {
      const hashedPassword = await bcrypt.hash('TestPassword123!', 12);
      testUser = await prisma.user.create({
        data: {
          email: `login${Date.now()}@azora.world`,
          password: hashedPassword,
          name: 'Login Test User',
          isEmailVerified: true
        }
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(BASE_URL)
        .post('/login')
        .send({
          email: testUser.email,
          password: 'TestPassword123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.user.email).toBe(testUser.email);

      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    it('should reject invalid credentials', async () => {
      const response = await request(BASE_URL)
        .post('/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid credentials');
    });
  });

  describe('GET /profile', () => {
    it('should get user profile with valid token', async () => {
      const response = await request(BASE_URL)
        .get('/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should reject request without token', async () => {
      const response = await request(BASE_URL)
        .get('/profile');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /refresh', () => {
    it('should refresh access token', async () => {
      const response = await request(BASE_URL)
        .post('/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.accessToken).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(BASE_URL)
        .post('/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /logout', () => {
    it('should logout successfully', async () => {
      const response = await request(BASE_URL)
        .post('/logout')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
