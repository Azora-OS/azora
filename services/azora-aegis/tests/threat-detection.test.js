const request = require('supertest');
const express = require('express');

function createTestApp() {
  const app = express();
  const helmet = require('helmet');
  const cors = require('cors');

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.post('/api/security/detect-threat', (req, res) => {
    const { eventData, source } = req.body;

    if (!eventData) {
      return res.status(400).json({ error: 'Event data is required' });
    }

    const threatAnalysis = {
      threatId: `threat_${Date.now()}`,
      source: source || 'unknown',
      severity: 'low',
      threatType: 'none',
      detected: false,
      confidence: 0.95,
      timestamp: new Date().toISOString()
    };

    // Simulate threat detection logic
    if (eventData.suspicious === true) {
      threatAnalysis.detected = true;
      threatAnalysis.severity = 'high';
      threatAnalysis.threatType = 'suspicious_activity';
    }

    res.json(threatAnalysis);
  });

  app.get('/api/security/threats', (req, res) => {
    res.json({
      threats: [],
      count: 0,
      lastUpdated: new Date().toISOString()
    });
  });

  return app;
}

describe('Azora Aegis - Threat Detection Tests', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('POST /api/security/detect-threat', () => {
    it('should analyze event data for threats', async () => {
      const response = await request(app)
        .post('/api/security/detect-threat')
        .send({
          eventData: { action: 'login', ip: '192.168.1.1' },
          source: 'auth-service'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('threatId');
      expect(response.body.source).toBe('auth-service');
      expect(response.body).toHaveProperty('severity');
      expect(response.body).toHaveProperty('detected');
    });

    it('should detect suspicious activity', async () => {
      const response = await request(app)
        .post('/api/security/detect-threat')
        .send({
          eventData: { suspicious: true, action: 'unauthorized_access' },
          source: 'api-gateway'
        });

      expect(response.status).toBe(200);
      expect(response.body.detected).toBe(true);
      expect(response.body.severity).toBe('high');
      expect(response.body.threatType).toBe('suspicious_activity');
    });

    it('should return error when event data is missing', async () => {
      const response = await request(app)
        .post('/api/security/detect-threat')
        .send({ source: 'test' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Event data is required');
    });

    it('should include confidence score in analysis', async () => {
      const response = await request(app)
        .post('/api/security/detect-threat')
        .send({
          eventData: { action: 'login' }
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('confidence');
      expect(typeof response.body.confidence).toBe('number');
    });
  });

  describe('GET /api/security/threats', () => {
    it('should return list of detected threats', async () => {
      const response = await request(app)
        .get('/api/security/threats');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('threats');
      expect(Array.isArray(response.body.threats)).toBe(true);
      expect(response.body).toHaveProperty('count');
    });
  });
});
