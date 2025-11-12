const request = require('supertest');
const gatewayApp = require('../api-gateway');

describe('API Gateway', () => {
  describe('GET /health', () => {
    it('should return gateway health status', async () => {
      const res = await request(gatewayApp).get('/health');

      expect(res.status).toBeLessThanOrEqual(503); // 200 or 503 acceptable
      expect(res.body.service).toBe('api-gateway');
      expect(res.body).toHaveProperty('services');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api', () => {
    it('should return API documentation', async () => {
      const res = await request(gatewayApp).get('/api');

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Azora OS API Gateway');
      expect(res.body).toHaveProperty('endpoints');
      expect(res.body.endpoints).toHaveProperty('auth');
      expect(res.body.endpoints).toHaveProperty('education');
      expect(res.body.endpoints).toHaveProperty('payment');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(gatewayApp).get('/api/unknown');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Endpoint not found');
    });
  });
});
