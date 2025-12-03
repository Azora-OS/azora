const request = require('supertest');
const app = require('../server.js');

describe('Health Monitor Service', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body.service).toBe('health-monitor');
    });
  });

  describe('GET /api/health', () => {
    it('should return health status for all services', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /api/health/:serviceId', () => {
    it('should return health status for a specific service', async () => {
      const serviceId = 'auth-service';
      const response = await request(app).get(`/api/health/${serviceId}`);
      expect(response.status).toBe(200);
      expect(response.body.serviceId).toBe(serviceId);
      expect(response.body.status).toBeDefined();
      expect(response.body.lastChecked).toBeDefined();
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