const request = require('supertest');
const app = require('../server.js');

describe('KYC/AML Service', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body.service).toBe('kyc-aml-service');
    });
  });

  describe('POST /api/kyc/verify', () => {
    it('should verify user identity', async () => {
      const userData = {
        userId: 'user_123',
        documentType: 'passport',
        documentNumber: 'P12345678'
      };

      const response = await request(app)
        .post('/api/kyc/verify')
        .send(userData)
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.verificationId).toBeDefined();
      expect(response.body.status).toBe('verified');
    });

    it('should return error when required fields are missing', async () => {
      const userData = {
        userId: 'user_123'
      };

      const response = await request(app)
        .post('/api/kyc/verify')
        .send(userData)
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Document type and number are required');
    });
  });

  describe('GET /api/aml/check/:userId', () => {
    it('should check user against watchlists', async () => {
      const userId = 'user_123';

      const response = await request(app)
        .get(`/api/aml/check/${userId}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.userId).toBe(userId);
      expect(response.body.isSanctioned).toBeDefined();
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