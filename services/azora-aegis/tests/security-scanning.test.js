const request = require('supertest');
const express = require('express');

// Create a test app instance
function createTestApp() {
  const app = express();
  const helmet = require('helmet');
  const cors = require('cors');
  const rateLimit = require('express-rate-limit');

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  });
  app.use(limiter);

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      service: 'azora-aegis',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      security: 'active'
    });
  });

  // Security monitoring endpoints
  app.get('/api/security/status', (req, res) => {
    res.json({
      threats: 0,
      alerts: 0,
      status: 'secure'
    });
  });

  app.post('/api/security/scan', (req, res) => {
    const { target, scanType } = req.body;
    
    if (!target) {
      return res.status(400).json({ error: 'Target is required' });
    }

    const scanResult = {
      scanId: `scan_${Date.now()}`,
      target,
      scanType: scanType || 'full',
      vulnerabilities: [],
      status: 'completed',
      timestamp: new Date().toISOString()
    };

    res.json(scanResult);
  });

  app.post('/api/security/alert', (req, res) => {
    res.json({ received: true });
  });

  return app;
}

describe('Azora Aegis - Security Scanning Tests', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('POST /api/security/scan', () => {
    it('should perform security scan on target', async () => {
      const response = await request(app)
        .post('/api/security/scan')
        .send({
          target: 'https://example.com',
          scanType: 'vulnerability'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('scanId');
      expect(response.body.target).toBe('https://example.com');
      expect(response.body.scanType).toBe('vulnerability');
      expect(response.body.status).toBe('completed');
    });

    it('should return error when target is missing', async () => {
      const response = await request(app)
        .post('/api/security/scan')
        .send({ scanType: 'full' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Target is required');
    });

    it('should default to full scan when scanType not specified', async () => {
      const response = await request(app)
        .post('/api/security/scan')
        .send({ target: 'https://example.com' });

      expect(response.status).toBe(200);
      expect(response.body.scanType).toBe('full');
    });

    it('should return vulnerabilities array', async () => {
      const response = await request(app)
        .post('/api/security/scan')
        .send({ target: 'https://example.com' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('vulnerabilities');
      expect(Array.isArray(response.body.vulnerabilities)).toBe(true);
    });
  });

  describe('GET /api/security/status', () => {
    it('should return security status', async () => {
      const response = await request(app)
        .get('/api/security/status');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('threats');
      expect(response.body).toHaveProperty('alerts');
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('secure');
    });
  });
});
