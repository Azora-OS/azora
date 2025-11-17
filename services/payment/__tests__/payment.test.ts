import request from 'supertest';
import app from '../index';

describe('Payment Service', () => {
  // Health check test
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('payment-service');
    });
  });

  // Get all payments test
  describe('GET /api/payments', () => {
    it('should return all payments', async () => {
      const response = await request(app)
        .get('/api/payments')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });
  });

  // Get specific payment test
  describe('GET /api/payments/:paymentId', () => {
    it('should return specific payment', async () => {
      const response = await request(app)
        .get('/api/payments/payment_1')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('payment_1');
    });

    it('should return 404 for non-existent payment', async () => {
      const response = await request(app)
        .get('/api/payments/non-existent')
        .expect(404);
      
      expect(response.body.error).toBe('Payment not found');
    });
  });

  // Create a new payment test
  describe('POST /api/payments', () => {
    it('should create a new payment', async () => {
      const paymentData = {
        amount: 49.99,
        currency: 'USD',
        method: 'credit_card',
        customerId: 'customer_456'
      };

      const response = await request(app)
        .post('/api/payments')
        .send(paymentData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.amount).toBe(49.99);
      expect(response.body.data.currency).toBe('USD');
      expect(response.body.data.method).toBe('credit_card');
      expect(response.body.data.customerId).toBe('customer_456');
    });

    it('should return 400 for missing required fields', async () => {
      const paymentData = {
        amount: 49.99
        // Missing currency, method, and customerId
      };

      const response = await request(app)
        .post('/api/payments')
        .send(paymentData)
        .expect(400);
      
      expect(response.body.error).toBe('Amount, currency, method, and customer ID are required');
    });
  });

  // Update payment status test
  describe('PUT /api/payments/:paymentId', () => {
    let paymentId: string;

    beforeAll(async () => {
      // Create a payment first
      const paymentData = {
        amount: 79.99,
        currency: 'USD',
        method: 'paypal',
        customerId: 'customer_789'
      };

      const response = await request(app)
        .post('/api/payments')
        .send(paymentData);

      paymentId = response.body.data.id;
    });

    it('should update payment status', async () => {
      const updateData = {
        status: 'completed'
      };

      const response = await request(app)
        .put(`/api/payments/${paymentId}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
    });

    it('should return 404 for non-existent payment', async () => {
      const updateData = {
        status: 'completed'
      };

      const response = await request(app)
        .put('/api/payments/non-existent')
        .send(updateData)
        .expect(404);
      
      expect(response.body.error).toBe('Payment not found');
    });
  });

  // Process refund test
  describe('POST /api/payments/:paymentId/refund', () => {
    let paymentId: string;

    beforeAll(async () => {
      // Create a payment first
      const paymentData = {
        amount: 99.99,
        currency: 'USD',
        method: 'credit_card',
        customerId: 'customer_123'
      };

      const response = await request(app)
        .post('/api/payments')
        .send(paymentData);

      paymentId = response.body.data.id;
    });

    it('should process refund', async () => {
      const response = await request(app)
        .post(`/api/payments/${paymentId}/refund`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('refunded');
      expect(response.body.message).toBe('Payment refunded successfully');
    });

    it('should return 404 for non-existent payment', async () => {
      const response = await request(app)
        .post('/api/payments/non-existent/refund')
        .expect(404);
      
      expect(response.body.error).toBe('Payment not found');
    });
  });
});