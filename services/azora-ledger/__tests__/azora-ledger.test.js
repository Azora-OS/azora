const request = require('supertest');
const app = require('../server.js');

describe('Azora Ledger Service', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body.service).toBe('azora-ledger');
    });
  });

  describe('GET /api/transactions', () => {
    it('should return a list of transactions', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.count).toBeDefined();
    });
  });

  describe('POST /api/transactions', () => {
    it('should create a new transaction', async () => {
      const transactionData = {
        amount: 100,
        currency: 'USD',
        description: 'Test transaction',
        accountId: 'account_123'
      };

      const response = await request(app)
        .post('/api/transactions')
        .send(transactionData)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.amount).toBe(transactionData.amount);
    });

    it('should return error when required fields are missing', async () => {
      const transactionData = {
        description: 'Test transaction'
      };

      const response = await request(app)
        .post('/api/transactions')
        .send(transactionData)
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Amount and currency are required');
    });
  });

  describe('GET /api/transactions/:transactionId', () => {
    it('should return a specific transaction', async () => {
      const transactionId = 'transaction_123';

      const response = await request(app)
        .get(`/api/transactions/${transactionId}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(transactionId);
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