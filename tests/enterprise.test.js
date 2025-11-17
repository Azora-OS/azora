const request = require('supertest');
const app = require('../services/enterprise/server');

describe('Enterprise Service - Comprehensive Tests', () => {
  describe('Health & Status', () => {
    it('should return healthy status with ubuntu message', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('azora-enterprise');
      expect(response.body.ubuntu).toBe('I serve because we prosper together');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('Enterprise Management', () => {
    it('should create new enterprise', async () => {
      const enterpriseData = {
        name: 'Test Enterprise',
        domain: 'test.azora.world',
        features: ['basic', 'advanced'],
        tier: 'PREMIUM'
      };

      const response = await request(app)
        .post('/api/enterprises')
        .send(enterpriseData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(enterpriseData.name);
      expect(response.body.data.tier).toBe('PREMIUM');
    });

    it('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/api/enterprises')
        .send({})
        .expect(500);
      
      expect(response.body.error).toBeDefined();
    });
  });

  describe('License Management', () => {
    it('should create enterprise license', async () => {
      const licenseData = {
        enterpriseId: 'ent_123',
        type: 'PREMIUM',
        features: ['white-label', 'analytics'],
        maxUsers: 500
      };

      const response = await request(app)
        .post('/api/licenses')
        .send(licenseData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('PREMIUM');
      expect(response.body.data.maxUsers).toBe(500);
    });
  });

  describe('White-label Configuration', () => {
    it('should create white-label config', async () => {
      const whitelabelData = {
        enterpriseId: 'ent_123',
        branding: {
          logo: 'https://example.com/logo.png',
          colors: { primary: '#007bff' }
        },
        customDomain: 'custom.example.com',
        features: ['custom-branding', 'analytics']
      };

      const response = await request(app)
        .post('/api/white-label')
        .send(whitelabelData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.customDomain).toBe('custom.example.com');
    });
  });

  describe('Security & Validation', () => {
    it('should sanitize XSS in enterprise name', async () => {
      const maliciousData = {
        name: '<script>alert("xss")</script>Test Enterprise',
        domain: 'test.com'
      };

      const response = await request(app)
        .post('/api/enterprises')
        .send(maliciousData);
      
      // Should not contain script tags
      expect(JSON.stringify(response.body)).not.toContain('<script>');
    });

    it('should have security headers', async () => {
      const response = await request(app)
        .get('/api/health');
      
      expect(response.headers['x-content-type-options']).toBeDefined();
      expect(response.headers['x-frame-options']).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Endpoint not found');
    });
  });
});