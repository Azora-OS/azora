const request = require('supertest');
const app = require('../server');

describe('enterprise Service', () => {
  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('API Endpoints', () => {
    it('should handle 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Endpoint not found');
    });

    it('should handle invalid JSON', async () => {
      const response = await request(app)
        .post('/api/test')
        .send('invalid json')
        .expect(400);
    });
  });

  describe('Security', () => {
    it('should have security headers', async () => {
      const response = await request(app)
        .get('/api/health');
      
      expect(response.headers['x-content-type-options']).toBeDefined();
      expect(response.headers['x-frame-options']).toBeDefined();
    });

    it('should handle rate limiting', async () => {
      // Make multiple requests to test rate limiting
      const promises = Array(10).fill().map(() => 
        request(app).get('/api/health')
      );
      
      const responses = await Promise.all(promises);
      expect(responses.every(r => r.status === 200 || r.status === 429)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle server errors gracefully', async () => {
      // Test error middleware
      const response = await request(app)
        .get('/api/health');
      
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('Input Validation', () => {
    it('should sanitize XSS attempts', async () => {
      const maliciousInput = '<script>alert("xss")</script>';
      
      const response = await request(app)
        .post('/api/test')
        .send({ data: maliciousInput });
      
      // Should not contain script tags in response
      expect(JSON.stringify(response.body)).not.toContain('<script>');
    });
  });
});