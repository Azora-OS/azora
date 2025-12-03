const request = require('supertest');
const app = require('../index');

describe('AI Ethics Monitor - Compliance Checking Tests', () => {
  describe('POST /api/compliance', () => {
    it('should check constitutional compliance', async () => {
      const response = await request(app)
        .post('/api/compliance')
        .send({
          action: 'Deploy AI model',
          context: { domain: 'healthcare', impact: 'high' }
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('compliant');
      expect(response.body.data).toHaveProperty('violations');
      expect(response.body.data).toHaveProperty('recommendations');
    });

    it('should return error when action is missing', async () => {
      const response = await request(app)
        .post('/api/compliance')
        .send({ context: {} });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Action is required');
    });

    it('should report compliance status', async () => {
      const response = await request(app)
        .post('/api/compliance')
        .send({
          action: 'Process user data',
          context: { dataType: 'personal' }
        });

      expect(response.status).toBe(201);
      expect(typeof response.body.data.compliant).toBe('boolean');
    });

    it('should detect constitutional violations', async () => {
      const response = await request(app)
        .post('/api/compliance')
        .send({
          action: 'Automated decision without transparency',
          context: { transparency: 'low' }
        });

      expect(response.status).toBe(201);
      expect(Array.isArray(response.body.data.violations)).toBe(true);
    });

    it('should provide compliance recommendations', async () => {
      const response = await request(app)
        .post('/api/compliance')
        .send({
          action: 'Deploy AI system',
          context: { accountability: 'unclear' }
        });

      expect(response.status).toBe(201);
      expect(Array.isArray(response.body.data.recommendations)).toBe(true);
      expect(response.body.data.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/compliance-reports', () => {
    it('should retrieve all compliance reports', async () => {
      const response = await request(app)
        .get('/api/compliance-reports');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('count');
    });
  });

  describe('GET /api/compliance-reports/:reportId', () => {
    it('should retrieve specific compliance report', async () => {
      // First create a report
      const createResponse = await request(app)
        .post('/api/compliance')
        .send({ action: 'Test action' });

      const reportId = createResponse.body.data.id;

      // Then retrieve it
      const response = await request(app)
        .get(`/api/compliance-reports/${reportId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(reportId);
    });

    it('should return 404 for non-existent report', async () => {
      const response = await request(app)
        .get('/api/compliance-reports/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Compliance report not found');
    });
  });
});
