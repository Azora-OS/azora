const request = require('supertest');
const app = require('../server.js');

describe('Azora Pay Service', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body.service).toBe('azora-pay');
    });
  });

  describe('POST /api/payments', () => {
    it('should process a payment successfully', async () => {
      const paymentData = {
        amount: 100,
        currency: 'USD',
        description: 'Test payment'
      };

      const response = await request(app)
        .post('/api/payments')
        .send(paymentData)
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.amount).toBe(paymentData.amount);
      expect(response.body.currency).toBe(paymentData.currency);
      expect(response.body.description).toBe(paymentData.description);
      expect(response.body.paymentId).toBeDefined();
      expect(response.body.status).toBe('processed');
    });

    it('should return error when amount is missing', async () => {
      const paymentData = {
        currency: 'USD'
      };

      const response = await request(app)
        .post('/api/payments')
        .send(paymentData)
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Amount and currency are required');
    });

    it('should return error when currency is missing', async () => {
      const paymentData = {
        amount: 100
      };

      const response = await request(app)
        .post('/api/payments')
        .send(paymentData)
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Amount and currency are required');
    });
  });

  describe('GET /api/payments/:paymentId', () => {
    it('should return payment status', async () => {
      const paymentId = 'pay_12345';

      const response = await request(app)
        .get(`/api/payments/${paymentId}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.paymentId).toBe(paymentId);
      expect(response.body.status).toBe('processed');
    });
  });

  describe('404 handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/non-existent-route');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Route not found');
    });
  });
});