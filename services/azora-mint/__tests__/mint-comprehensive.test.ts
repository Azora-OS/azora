import { describe, it, expect, beforeEach } from '@jest/globals';
import { userFactory, authHelper } from '@azora/test-utils';
import request from 'supertest';

const API_URL = process.env.MINT_SERVICE_URL || 'http://localhost:4003';

describe('Mint Service - Comprehensive Tests', () => {
  let authToken: string;
  let testUser: any;

  beforeEach(async () => {
    testUser = userFactory.buildStudent();
    authToken = authHelper.generateToken({
      userId: testUser.id!,
      email: testUser.email,
      role: testUser.role,
    });
  });

  describe('Wallet Management', () => {
    it('should create wallet on user registration', async () => {
      const res = await request(API_URL)
        .post('/api/wallet/create')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(201);
      expect(res.body.wallet.userId).toBe(testUser.id);
      expect(res.body.wallet.balance).toBe(0);
    });

    it('should get wallet balance', async () => {
      await request(API_URL)
        .post('/api/wallet/create')
        .set('Authorization', `Bearer ${authToken}`);
      
      const res = await request(API_URL)
        .get('/api/wallet/balance')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.balance).toBeDefined();
    });

    it('should get wallet transactions', async () => {
      const res = await request(API_URL)
        .get('/api/wallet/transactions')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.transactions)).toBe(true);
    });
  });

  describe('Mining Engine (Proof-of-Knowledge)', () => {
    beforeEach(async () => {
      await request(API_URL)
        .post('/api/wallet/create')
        .set('Authorization', `Bearer ${authToken}`);
    });

    it('should calculate mining rewards for lesson completion', async () => {
      const res = await request(API_URL)
        .post('/api/mining/calculate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          activityType: 'lesson_completion',
          courseId: 'course-123',
          lessonId: 'lesson-456',
        });
      
      expect(res.status).toBe(200);
      expect(res.body.reward).toBeGreaterThan(0);
    });

    it('should award AZR tokens for learning activity', async () => {
      const res = await request(API_URL)
        .post('/api/mining/award')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          activityType: 'lesson_completion',
          amount: 10,
        });
      
      expect(res.status).toBe(200);
      expect(res.body.transaction.amount).toBe(10);
    });

    it('should enforce daily mining limits', async () => {
      // Award tokens multiple times
      for (let i = 0; i < 10; i++) {
        await request(API_URL)
          .post('/api/mining/award')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ activityType: 'lesson_completion', amount: 100 });
      }
      
      // Should hit limit
      const res = await request(API_URL)
        .post('/api/mining/award')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ activityType: 'lesson_completion', amount: 100 });
      
      expect(res.status).toBe(429);
      expect(res.body.error).toContain('limit');
    });
  });

  describe('Transaction Processing', () => {
    beforeEach(async () => {
      await request(API_URL)
        .post('/api/wallet/create')
        .set('Authorization', `Bearer ${authToken}`);
      
      // Add some balance
      await request(API_URL)
        .post('/api/mining/award')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ activityType: 'lesson_completion', amount: 100 });
    });

    it('should process transfer between wallets', async () => {
      const recipient = userFactory.build();
      
      const res = await request(API_URL)
        .post('/api/transactions/transfer')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipientId: recipient.id,
          amount: 10,
          currency: 'AZR',
        });
      
      expect(res.status).toBe(200);
      expect(res.body.transaction.amount).toBe(10);
    });

    it('should reject transfer with insufficient balance', async () => {
      const recipient = userFactory.build();
      
      const res = await request(API_URL)
        .post('/api/transactions/transfer')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipientId: recipient.id,
          amount: 1000,
          currency: 'AZR',
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('insufficient');
    });

    it('should maintain balance integrity', async () => {
      const initialBalance = await request(API_URL)
        .get('/api/wallet/balance')
        .set('Authorization', `Bearer ${authToken}`);
      
      const recipient = userFactory.build();
      await request(API_URL)
        .post('/api/transactions/transfer')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipientId: recipient.id,
          amount: 10,
          currency: 'AZR',
        });
      
      const finalBalance = await request(API_URL)
        .get('/api/wallet/balance')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(finalBalance.body.balance).toBe(initialBalance.body.balance - 10);
    });
  });

  describe('Payment Processing (Stripe)', () => {
    it('should create payment intent', async () => {
      const res = await request(API_URL)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 1000,
          currency: 'usd',
          description: 'Course purchase',
        });
      
      expect(res.status).toBe(200);
      expect(res.body.clientSecret).toBeDefined();
    });

    it('should process successful payment', async () => {
      const res = await request(API_URL)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          paymentIntentId: 'pi_test_123',
          amount: 1000,
        });
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('succeeded');
    });
  });

  describe('Token Economics', () => {
    it('should get current AZR price', async () => {
      const res = await request(API_URL)
        .get('/api/economics/price');
      
      expect(res.status).toBe(200);
      expect(res.body.price).toBeGreaterThan(0);
    });

    it('should get token supply metrics', async () => {
      const res = await request(API_URL)
        .get('/api/economics/supply');
      
      expect(res.status).toBe(200);
      expect(res.body.totalSupply).toBeDefined();
      expect(res.body.circulatingSupply).toBeDefined();
    });

    it('should calculate UBI distribution', async () => {
      const res = await request(API_URL)
        .get('/api/economics/ubi')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.amount).toBeGreaterThan(0);
    });
  });

  describe('Withdrawal', () => {
    beforeEach(async () => {
      await request(API_URL)
        .post('/api/wallet/create')
        .set('Authorization', `Bearer ${authToken}`);
      
      // Add balance
      await request(API_URL)
        .post('/api/mining/award')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ activityType: 'lesson_completion', amount: 1000 });
    });

    it('should initiate withdrawal request', async () => {
      const res = await request(API_URL)
        .post('/api/wallet/withdraw')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 100,
          method: 'bank_transfer',
          bankDetails: {
            accountNumber: '1234567890',
            routingNumber: '987654321',
          },
        });
      
      expect(res.status).toBe(200);
      expect(res.body.withdrawal.status).toBe('pending');
    });

    it('should enforce minimum withdrawal amount', async () => {
      const res = await request(API_URL)
        .post('/api/wallet/withdraw')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 1,
          method: 'bank_transfer',
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('minimum');
    });
  });
});
