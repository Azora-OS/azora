const request = require('supertest');
const { app } = require('../auth-service');
const { getPrismaClient } = require('../shared/database');

const prisma = getPrismaClient();

describe('Auth Service', () => {
  let authToken;
  const testUser = {
    email: `test${Date.now()}@azora.world`,
    password: 'testpassword123',
    name: 'Test User',
  };

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email);
      
      authToken = res.body.data.accessToken;
    });

    it('should fail with duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test2@azora.world',
          password: 'short',
          name: 'Test',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should fail with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get user profile', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(testUser.email);
    });

    it('should fail without token', async () => {
      const res = await request(app).get('/api/auth/profile');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
    });
  });
});
