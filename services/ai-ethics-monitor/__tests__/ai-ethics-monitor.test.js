const request = require('supertest');
const app = require('../index.js');

describe('AI Ethics Monitor Service', () => {
  // Close the server after all tests
  afterAll((done) => {
    app.close(done);
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service', 'ai-ethics-monitor');
    });
  });

  describe('POST /api/monitor', () => {
    it('should perform AI ethics analysis', async () => {
      const ethicsRequest = {
        aiDecision: 'Recommend loan approval',
        context: {
          sensitivity: 'medium',
          impact: 'high'
        },
        user: 'test-user-123'
      };

      const response = await request(app)
        .post('/api/monitor')
        .send(ethicsRequest);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('decision', ethicsRequest.aiDecision);
      expect(response.body.data).toHaveProperty('ethicalScore');
      expect(response.body.data).toHaveProperty('violations');
      expect(response.body.data).toHaveProperty('recommendations');
    });

    it('should return error for missing AI decision', async () => {
      const invalidRequest = {
        context: { sensitivity: 'high' }
      };

      const response = await request(app)
        .post('/api/monitor')
        .send(invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/compliance', () => {
    it('should check constitutional AI compliance', async () => {
      const complianceRequest = {
        action: 'Process personal data',
        context: {
          purpose: 'user profiling'
        }
      };

      const response = await request(app)
        .post('/api/compliance')
        .send(complianceRequest);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('action', complianceRequest.action);
      expect(response.body.data).toHaveProperty('compliant');
      expect(response.body.data).toHaveProperty('violations');
      expect(response.body.data).toHaveProperty('recommendations');
    });

    it('should return error for missing action', async () => {
      const invalidRequest = {
        context: { purpose: 'testing' }
      };

      const response = await request(app)
        .post('/api/compliance')
        .send(invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/reports', () => {
    it('should return all ethics reports', async () => {
      const response = await request(app).get('/api/reports');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/compliance-reports', () => {
    it('should return all compliance reports', async () => {
      const response = await request(app).get('/api/compliance-reports');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/violations', () => {
    it('should return all violations', async () => {
      const response = await request(app).get('/api/violations');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});