import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { mockStripe } from '../../../tests/mocks/stripe.mock';

const API_URL = process.env.PAY_SERVICE_URL || 'http://localhost:3010';

describe('Azora Pay - Stripe Integration', () => {
  beforeEach(() => {
    mockStripe.reset();
  });

  afterEach(() => {
    mockStripe.reset();
  });

  describe('Customer Management', () => {
    it('should create Stripe customer', async () => {
      const res = await request(API_URL)
        .post('/api/customers')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          userId: 'user-123',
        });

      expect(res.status).toBe(201);
      expect(res.body.customerId).toBeDefined();
      expect(res.body.email).toBe('test@example.com');
    });

    it('should retrieve existing customer', async () => {
      const createRes = await request(API_URL)
        .post('/api/customers')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          userId: 'user-123',
        });

      const res = await request(API_URL)
        .get(`/api/customers/${createRes.body.customerId}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('test@example.com');
    });

    it('should update customer information', async () => {
      const createRes = await request(API_URL)
        .post('/api/customers')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          userId: 'user-123',
        });

      const res = await request(API_URL)
        .put(`/api/customers/${createRes.body.customerId}`)
        .send({
          name: 'Updated Name',
        });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Name');
    });
  });

  describe('Payment Methods', () => {
    it('should attach payment method to customer', async () => {
      const customerRes = await request(API_URL)
        .post('/api/customers')
        .send({
          email: 'test@example.com',
          userId: 'user-123',
        });

      const res = await request(API_URL)
        .post('/api/payment-methods/attach')
        .send({
          customerId: customerRes.body.customerId,
          paymentMethodId: 'pm_test_123',
        });

      expect(res.status).toBe(200);
      expect(res.body.attached).toBe(true);
    });

    it('should list customer payment methods', async () => {
      const customerRes = await request(API_URL)
        .post('/api/customers')
        .send({
          email: 'test@example.com',
          userId: 'user-123',
        });

      const res = await request(API_URL)
        .get(`/api/payment-methods/${customerRes.body.customerId}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.paymentMethods)).toBe(true);
    });

    it('should detach payment method', async () => {
      const res = await request(API_URL)
        .delete('/api/payment-methods/pm_test_123');

      expect(res.status).toBe(200);
      expect(res.body.detached).toBe(true);
    });
  });

  describe('Subscription Payments', () => {
    it('should create subscription', async () => {
      const customerRes = await request(API_URL)
        .post('/api/customers')
        .send({
          email: 'test@example.com',
          userId: 'user-123',
        });

      const res = await request(API_URL)
        .post('/api/subscriptions')
        .send({
          customerId: customerRes.body.customerId,
          priceId: 'price_test_123',
        });

      expect(res.status).toBe(201);
      expect(res.body.subscriptionId).toBeDefined();
      expect(res.body.status).toBe('active');
    });

    it('should cancel subscription', async () => {
      const res = await request(API_URL)
        .delete('/api/subscriptions/sub_test_123');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('canceled');
    });

    it('should update subscription', async () => {
      const res = await request(API_URL)
        .put('/api/subscriptions/sub_test_123')
        .send({
          priceId: 'price_test_456',
        });

      expect(res.status).toBe(200);
      expect(res.body.updated).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle Stripe API errors', async () => {
      const res = await request(API_URL)
        .post('/api/payments/intent')
        .send({
          amount: -100,
          currency: 'usd',
          userId: 'user-123',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should handle network errors gracefully', async () => {
      const res = await request(API_URL)
        .get('/api/customers/invalid-customer-id');

      expect(res.status).toBe(404);
    });
  });
});
