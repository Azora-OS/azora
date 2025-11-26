const request = require('supertest');
const app = require('../index');

describe('AI Ethics Monitor - Ethics Monitoring Tests', () => {
  describe('POST /api/monitor', () => {
    it('should generate ethics report for AI decision', async () => {
      const response = await request(app)
        .post('/api/monitor')
        .send({
          aiDecision: 'Approve loan application',
          context: { sensitivity: 'high', amount: 50000 },
          user: 'user123'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('ethicalScore');
      expect(response.body.data).toHaveProperty('violations');
      expect(response.body.data).toHaveProperty('recommendations');
    });

    it('should return error when AI decision is missing', async () => {
      const response = await request(app)
        .post('/api/monitor')
        .send({ context: {}, user: 'user123' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('AI decision is required');
    });

    it('should calculate ethical score', async () => {
      const response = await request(app)
        .post('/api/monitor')
        .send({
          aiDecision: 'Recommend content',
          context: { sensitivity: 'low' }
        });

      expect(response.status).toBe(201);
      expect(response.body.data.ethicalScore).toBeGreaterThanOrEqual(0);
      expect(response.body.data.ethicalScore).toBeLessThanOrEqual(100);
    });

    it('should detect ethical violations', async () => {
      const response = await request(app)
        .post('/api/monitor')
        .send({
          aiDecision: 'Process sensitive data',
          context: { sensitivity: 'high', biasRisk: true }
        });

      expect(response.status).toBe(201);
      expect(Array.isArray(response.body.data.violations)).toBe(true);
    });

    it('should provide recommendations', async () => {
      const response = await request(app)
        .post('/api/monitor')
        .send({
          aiDecision: 'Automated hiring decision',
          context: { sensitivity: 'high' }
        });

      expect(response.status).toBe(201);
      expect(Array.isArray(response.body.data.recommendations)).toBe(true);
      expect(response.body.data.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/reports', () => {
    it('should retrieve all ethics reports', async () => {
      const response = await request(app)
        .get('/api/reports');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('count');
    });
  });

  describe('GET /api/reports/:reportId', () => {
    it('should retrieve specific ethics report', async () => {
      // First create a report
      const createResponse = await request(app)
        .post('/api/monitor')
        .send({ aiDecision: 'Test decision' });

      const reportId = createResponse.body.data.id;

      // Then retrieve it
      const response = await request(app)
        .get(`/api/reports/${reportId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(reportId);
    });

    it('should return 404 for non-existent report', async () => {
      const response = await request(app)
        .get('/api/reports/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Ethics report not found');
    });
  });

  describe('GET /api/violations', () => {
    it('should retrieve all violations', async () => {
      const response = await request(app)
        .get('/api/violations');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
