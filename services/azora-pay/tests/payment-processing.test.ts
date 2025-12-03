import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { mockStripe } from '../../../tests/mocks/stripe.mock';

const API_URL = process.env.PAY_SERVICE_URL || 'http://localhost:3010';

describe('Azora Pay - Payment Processing', () => {
  beforeEach(() => {
    mockStripe.reset();
  });

  afterEach(() => {
    mockStripe.reset();
  });

  describe('Payment Intent Creation', () => {
    it('should create payment intent', async () => {
      const res = await request(API_URL)
        .post('/api/payments/intent')
        .send({
          amount: 1000,
          currency: 'usd',
          userId: 'user-123',
        });

      expect(res.status).toBe(200);
      expect(res.body.clientSecret).toBeDefined();
      expect(res.body.id).toBeDefined();
    });

    it('should reject payment intent without amount', async () => {
      const res = await request(API_URL)
        .post('/api/payments/intent')
        .send({
          currency: 'usd',
          userId: 'user-123',
        });

      expect(res.status).toBe(400);
    });

    it('should record payment to blockchain', async () => {
      const res = await request(API_URL)
        .post('/api/payments/intent')
        .send({
          amount: 1000,
          currency: 'usd',
          userId: 'user-123',
        });

      expect(res.status).toBe(200);
      expect(res.body.blockchainRecordId).toBeDefined();
    });

    it('should contribute to CitadelFund', async () => {
      const res = await request(API_URL)
        .post('/api/payments/intent')
        .send({
          amount: 1000,
          currency: 'usd',
          userId: 'user-123',
        });

      expect(res.status).toBe(200);
      expect(res.body.citadelContribution).toBe(100);
    });
  });

  describe('Payment Processing', () => {
    it('should process payment successfully', async () => {
      const intentRes = await request(API_URL)
        .post('/api/payments/intent')
        .send({
          amount: 1000,
          currency: 'usd',
          userId: 'user-123',
        });

      const res = await request(API_URL)
        .post('/api/payments/process')
        .send({
          paymentIntentId: intentRes.body.id,
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBeDefined();
    });

    it('should handle payment failure', async () => {
      const res = await request(API_URL)
        .post('/api/payments/process')
        .send({
          paymentIntentId: 'invalid-intent-id',
        });

      expect(res.status).toBe(500);
    });
  });

  describe('Refund Handling', () => {
    it('should process refund', async () => {
      const intentRes = await request(API_URL)
        .post('/api/payments/intent')
        .send({
          amount: 1000,
          currency: 'usd',
          userId: 'user-123',
        });

      const res = await request(API_URL)
        .post('/api/payments/refund')
        .send({
          paymentIntentId: intentRes.body.id,
          amount: 500,
        });

      expect(res.status).toBe(200);
      expect(res.body.refundId).toBeDefined();
    });

    it('should reject refund for invalid payment', async () => {
      const res = await request(API_URL)
        .post('/api/payments/refund')
        .send({
          paymentIntentId: 'invalid-id',
          amount: 500,
        });

      expect(res.status).toBe(404);
    });
  });

  describe('Payment History', () => {
    it('should retrieve payment history for user', async () => {
      const res = await request(API_URL)
        .get('/api/payments/history')
        .query({ userId: 'user-123' });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.payments)).toBe(true);
    });

    it('should filter payment history by date', async () => {
      const res = await request(API_URL)
        .get('/api/payments/history')
        .query({
          userId: 'user-123',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.payments)).toBe(true);
    });

    it('should filter payment history by status', async () => {
      const res = await request(API_URL)
        .get('/api/payments/history')
        .query({
          userId: 'user-123',
          status: 'succeeded',
        });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.payments)).toBe(true);
    });
  });

  describe('Webhook Processing', () => {
    it('should process payment success webhook', async () => {
      const webhookEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
            amount: 1000,
            currency: 'usd',
          },
        },
      };

      const res = await request(API_URL)
        .post('/api/payments/webhook')
        .set('stripe-signature', 'test-signature')
        .send(webhookEvent);

      expect(res.status).toBe(200);
      expect(res.body.received).toBe(true);
    });

    it('should process payment failure webhook', async () => {
      const webhookEvent = {
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_test_123',
            amount: 1000,
            currency: 'usd',
          },
        },
      };

      const res = await request(API_URL)
        .post('/api/payments/webhook')
        .set('stripe-signature', 'test-signature')
        .send(webhookEvent);

      expect(res.status).toBe(200);
      expect(res.body.received).toBe(true);
    });

    it('should reject webhook with invalid signature', async () => {
      const webhookEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
          },
        },
      };

      const res = await request(API_URL)
        .post('/api/payments/webhook')
        .send(webhookEvent);

      expect(res.status).toBe(400);
    });
  });
});
