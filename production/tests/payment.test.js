const request = require('supertest');
const { app: authApp } = require('../auth-service');
const paymentApp = require('../payment-service');
const { getPrismaClient } = require('../shared/database');

const prisma = getPrismaClient();

describe('Payment Service', () => {
  let authToken;
  let userId;
  const testUser = {
    email: `payment${Date.now()}@azora.world`,
    password: 'testpass123',
    name: 'Payment Test User',
  };

  beforeAll(async () => {
    const registerRes = await request(authApp)
      .post('/api/auth/register')
      .send(testUser);
    
    authToken = registerRes.body.data.accessToken;
    userId = registerRes.body.data.user.id;
  });

  afterAll(async () => {
    await prisma.payment.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.$disconnect();
  });

  describe('POST /api/earn', () => {
    it('should allow user to earn tokens', async () => {
      const res = await request(paymentApp)
        .post('/api/earn')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 150,
          description: 'Completed course module',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.amount).toBe(150);
      expect(res.body.data.type).toBe('DONATION');
    });

    it('should reject invalid amounts', async () => {
      const res = await request(paymentApp)
        .post('/api/earn')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: -50,
          description: 'Invalid',
        });

      expect(res.status).toBe(400);
    });

    it('should reject amounts over limit', async () => {
      const res = await request(paymentApp)
        .post('/api/earn')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 1500,
          description: 'Too much',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/wallet', () => {
    it('should get wallet balance', async () => {
      const res = await request(paymentApp)
        .get('/api/wallet')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('balance');
      expect(res.body.data.currency).toBe('AZR');
    });

    it('should fail without auth', async () => {
      const res = await request(paymentApp).get('/api/wallet');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/transactions', () => {
    it('should list user transactions', async () => {
      const res = await request(paymentApp)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should support limit parameter', async () => {
      const res = await request(paymentApp)
        .get('/api/transactions?limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('POST /api/refunds', () => {
    it('should process refund for valid payment', async () => {
      // First earn some tokens
      const earnRes = await request(paymentApp)
        .post('/api/earn')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 50, description: 'For refund test' });

      const paymentId = earnRes.body.data.id;

      const refundRes = await request(paymentApp)
        .post('/api/refunds')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          paymentId,
          reason: 'Test refund',
        });

      expect(refundRes.status).toBe(201);
      expect(refundRes.body.success).toBe(true);
    });
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const res = await request(paymentApp).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
    });
  });
});
