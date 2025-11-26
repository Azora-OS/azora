const request = require('supertest');
const express = require('express');

function createTestApp() {
  const app = express();
  app.use(express.json());

  app.post('/api/security/check-compliance', (req, res) => {
    const { service, standards } = req.body;

    if (!service) {
      return res.status(400).json({ error: 'Service identifier is required' });
    }

    const complianceCheck = {
      checkId: `comp_${Date.now()}`,
      service,
      standards: standards || ['GDPR', 'SOC2'],
      compliant: true,
      violations: [],
      score: 95,
      timestamp: new Date().toISOString()
    };

    res.json(complianceCheck);
  });

  app.get('/api/security/compliance-status', (req, res) => {
    res.json({
      overallCompliance: 'compliant',
      services: [],
      lastAudit: new Date().toISOString()
    });
  });

  return app;
}

describe('Azora Aegis - Compliance Checking Tests', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('POST /api/security/check-compliance', () => {
    it('should check service compliance', async () => {
      const response = await request(app)
        .post('/api/security/check-compliance')
        .send({
          service: 'payment-service',
          standards: ['PCI-DSS', 'GDPR']
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('checkId');
      expect(response.body.service).toBe('payment-service');
      expect(response.body.standards).toEqual(['PCI-DSS', 'GDPR']);
    });

    it('should return error when service is missing', async () => {
      const response = await request(app)
        .post('/api/security/check-compliance')
        .send({ standards: ['GDPR'] });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Service identifier is required');
    });

    it('should default to standard compliance checks', async () => {
      const response = await request(app)
        .post('/api/security/check-compliance')
        .send({ service: 'auth-service' });

      expect(response.status).toBe(200);
      expect(response.body.standards).toEqual(['GDPR', 'SOC2']);
    });

    it('should include compliance score', async () => {
      const response = await request(app)
        .post('/api/security/check-compliance')
        .send({ service: 'api-gateway' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('score');
      expect(typeof response.body.score).toBe('number');
      expect(response.body.score).toBeGreaterThanOrEqual(0);
      expect(response.body.score).toBeLessThanOrEqual(100);
    });

    it('should report violations if any', async () => {
      const response = await request(app)
        .post('/api/security/check-compliance')
        .send({ service: 'test-service' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('violations');
      expect(Array.isArray(response.body.violations)).toBe(true);
    });
  });

  describe('GET /api/security/compliance-status', () => {
    it('should return overall compliance status', async () => {
      const response = await request(app)
        .get('/api/security/compliance-status');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('overallCompliance');
      expect(response.body).toHaveProperty('services');
      expect(response.body).toHaveProperty('lastAudit');
    });
  });
});
