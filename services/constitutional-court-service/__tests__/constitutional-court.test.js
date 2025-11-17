const request = require('supertest');
const app = require('../index.js');

describe('Constitutional Court Service', () => {
  // Health check test
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('constitutional-court-service');
    });
  });

  // Get all constitutional cases test
  describe('GET /api/cases', () => {
    it('should return all constitutional cases', async () => {
      const response = await request(app)
        .get('/api/cases')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });
  });

  // Get specific constitutional case test
  describe('GET /api/cases/:caseId', () => {
    it('should return specific constitutional case', async () => {
      const response = await request(app)
        .get('/api/cases/case_1')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('case_1');
    });

    it('should return 404 for non-existent case', async () => {
      const response = await request(app)
        .get('/api/cases/non-existent')
        .expect(404);
      
      expect(response.body.error).toBe('Case not found');
    });
  });

  // File a new constitutional case test
  describe('POST /api/cases', () => {
    it('should file a new constitutional case', async () => {
      const caseData = {
        title: 'New Constitutional Case',
        description: 'Description of the new case',
        priority: 'high',
        parties: ['Party A', 'Party B']
      };

      const response = await request(app)
        .post('/api/cases')
        .send(caseData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('New Constitutional Case');
      expect(response.body.data.status).toBe('open');
    });

    it('should return 400 for missing required fields', async () => {
      const caseData = {
        title: 'New Case'
        // Missing description
      };

      const response = await request(app)
        .post('/api/cases')
        .send(caseData)
        .expect(400);
      
      expect(response.body.error).toBe('Title and description are required');
    });
  });

  // Update constitutional case status test
  describe('PUT /api/cases/:caseId', () => {
    let caseId;

    beforeAll(async () => {
      // Create a case first
      const caseData = {
        title: 'Test Case',
        description: 'Test case for updating'
      };

      const response = await request(app)
        .post('/api/cases')
        .send(caseData);

      caseId = response.body.data.id;
    });

    it('should update constitutional case status', async () => {
      const updateData = {
        status: 'in_progress',
        resolution: 'Case is under investigation',
        priority: 'high'
      };

      const response = await request(app)
        .put(`/api/cases/${caseId}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('in_progress');
      expect(response.body.data.resolution).toBe('Case is under investigation');
      expect(response.body.data.priority).toBe('high');
    });

    it('should return 404 for non-existent case', async () => {
      const updateData = {
        status: 'resolved'
      };

      const response = await request(app)
        .put('/api/cases/non-existent')
        .send(updateData)
        .expect(404);
      
      expect(response.body.error).toBe('Case not found');
    });
  });

  // Constitutional compliance check test
  describe('POST /api/compliance/check', () => {
    it('should check constitutional compliance', async () => {
      const complianceData = {
        action: 'data_processing',
        context: { userId: 'user_123', dataType: 'personal' },
        userId: 'user_123'
      };

      const response = await request(app)
        .post('/api/compliance/check')
        .send(complianceData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.action).toBe('data_processing');
      expect(typeof response.body.data.compliant).toBe('boolean');
    });

    it('should return 400 for missing required fields', async () => {
      const complianceData = {
        context: { userId: 'user_123' }
        // Missing action
      };

      const response = await request(app)
        .post('/api/compliance/check')
        .send(complianceData)
        .expect(400);
      
      expect(response.body.error).toBe('Action is required');
    });
  });

  // Get all constitutional violations test
  describe('GET /api/compliance/violations', () => {
    it('should return all constitutional violations', async () => {
      const response = await request(app)
        .get('/api/compliance/violations')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });
  });

  // Get specific constitutional violation test
  describe('GET /api/compliance/violations/:violationId', () => {
    it('should return specific constitutional violation', async () => {
      // First trigger a compliance check that generates a violation
      const complianceData = {
        action: 'unauthorized_data_access',
        context: { userId: 'user_123' }
      };

      const complianceResponse = await request(app)
        .post('/api/compliance/check')
        .send(complianceData);

      // Then fetch violations
      const response = await request(app)
        .get('/api/compliance/violations')
        .expect(200);

      if (response.body.data.length > 0) {
        const violationId = response.body.data[0].id;
        const violationResponse = await request(app)
          .get(`/api/compliance/violations/${violationId}`)
          .expect(200);
        
        expect(violationResponse.body.success).toBe(true);
        expect(violationResponse.body.data.id).toBe(violationId);
      }
    });

    it('should return 404 for non-existent violation', async () => {
      const response = await request(app)
        .get('/api/compliance/violations/non-existent')
        .expect(404);
      
      expect(response.body.error).toBe('Violation not found');
    });
  });

  // Search cases test
  describe('GET /api/cases/search', () => {
    it('should search cases by status', async () => {
      const response = await request(app)
        .get('/api/cases/search?status=open')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search cases by priority', async () => {
      const response = await request(app)
        .get('/api/cases/search?priority=high')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});