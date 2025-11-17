const request = require('supertest');
const app = require('../server');

describe('constitutional-ai Integration Tests', () => {
  beforeAll(async () => {
    // Setup test database
  });

  afterAll(async () => {
    // Cleanup test database
  });

  describe('API Integration', () => {
    it('should handle concurrent requests', async () => {
      const promises = Array(10).fill().map(() => 
        request(app).get('/health')
      );
      const responses = await Promise.all(promises);
      responses.forEach(res => {
        expect(res.status).toBe(200);
      });
    });

    it('should handle malformed requests gracefully', async () => {
      const res = await request(app)
        .post('/api/test')
        .send('invalid json')
        .expect(400);
    });

    it('should enforce rate limiting', async () => {
      const promises = Array(200).fill().map(() => 
        request(app).get('/health')
      );
      const responses = await Promise.all(promises);
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe('Security Tests', () => {
    it('should have security headers', async () => {
      const res = await request(app).get('/health');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('DENY');
    });

    it('should sanitize XSS attempts', async () => {
      const malicious = '<script>alert("xss")</script>';
      const res = await request(app)
        .post('/api/test')
        .send({ data: malicious });
      expect(JSON.stringify(res.body)).not.toContain('<script>');
    });
  });
});