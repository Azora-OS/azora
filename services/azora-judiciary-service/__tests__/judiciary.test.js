const request = require('supertest');
const app = require('../index.js');

describe('Azora Judiciary Service', () => {
  // Health check test
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('azora-judiciary-service');
    });
  });

  // Get all legal cases test
  describe('GET /api/cases', () => {
    it('should return all legal cases', async () => {
      const response = await request(app)
        .get('/api/cases')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });
  });

  // Get specific legal case test
  describe('GET /api/cases/:caseId', () => {
    it('should return specific legal case', async () => {
      const response = await request(app)
        .get('/api/cases/legal_1')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('legal_1');
    });

    it('should return 404 for non-existent case', async () => {
      const response = await request(app)
        .get('/api/cases/non-existent')
        .expect(404);
      
      expect(response.body.error).toBe('Legal case not found');
    });
  });

  // File a new legal case test
  describe('POST /api/cases', () => {
    it('should file a new legal case', async () => {
      const caseData = {
        title: 'New Contract Dispute',
        type: 'civil',
        description: 'Dispute regarding contract terms',
        priority: 'high',
        parties: ['Party X', 'Party Y']
      };

      const response = await request(app)
        .post('/api/cases')
        .send(caseData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('New Contract Dispute');
      expect(response.body.data.type).toBe('civil');
    });

    it('should return 400 for missing required fields', async () => {
      const caseData = {
        title: 'New Case',
        type: 'civil'
        // Missing description
      };

      const response = await request(app)
        .post('/api/cases')
        .send(caseData)
        .expect(400);
      
      expect(response.body.error).toBe('Title, type, and description are required');
    });
  });

  // Update legal case status test
  describe('PUT /api/cases/:caseId', () => {
    let caseId;

    beforeAll(async () => {
      // Create a case first
      const caseData = {
        title: 'Test Case',
        type: 'administrative',
        description: 'Test case for updating'
      };

      const response = await request(app)
        .post('/api/cases')
        .send(caseData);

      caseId = response.body.data.id;
    });

    it('should update legal case status', async () => {
      const updateData = {
        status: 'in_progress',
        resolution: 'Parties are negotiating',
        priority: 'high'
      };

      const response = await request(app)
        .put(`/api/cases/${caseId}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('in_progress');
      expect(response.body.data.resolution).toBe('Parties are negotiating');
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
      
      expect(response.body.error).toBe('Legal case not found');
    });
  });

  // Get all legal documents test
  describe('GET /api/documents', () => {
    it('should return all legal documents', async () => {
      const response = await request(app)
        .get('/api/documents')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });
  });

  // Get specific legal document test
  describe('GET /api/documents/:documentId', () => {
    it('should return specific legal document', async () => {
      const response = await request(app)
        .get('/api/documents/doc_1')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('doc_1');
    });

    it('should return 404 for non-existent document', async () => {
      const response = await request(app)
        .get('/api/documents/non-existent')
        .expect(404);
      
      expect(response.body.error).toBe('Legal document not found');
    });
  });

  // Upload a new legal document test
  describe('POST /api/documents', () => {
    it('should upload a new legal document', async () => {
      const documentData = {
        title: 'New Agreement',
        type: 'contract',
        version: '1.0',
        content: 'This is the content of the new agreement'
      };

      const response = await request(app)
        .post('/api/documents')
        .send(documentData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('New Agreement');
      expect(response.body.data.type).toBe('contract');
    });

    it('should return 400 for missing required fields', async () => {
      const documentData = {
        title: 'New Document'
        // Missing type
      };

      const response = await request(app)
        .post('/api/documents')
        .send(documentData)
        .expect(400);
      
      expect(response.body.error).toBe('Title and type are required');
    });
  });

  // Update legal document metadata test
  describe('PUT /api/documents/:documentId', () => {
    let documentId;

    beforeAll(async () => {
      // Create a document first
      const documentData = {
        title: 'Test Document',
        type: 'policy',
        version: '1.0'
      };

      const response = await request(app)
        .post('/api/documents')
        .send(documentData);

      documentId = response.body.data.id;
    });

    it('should update legal document metadata', async () => {
      const updateData = {
        title: 'Updated Document',
        type: 'contract',
        version: '2.0',
        status: 'inactive'
      };

      const response = await request(app)
        .put(`/api/documents/${documentId}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Document');
      expect(response.body.data.type).toBe('contract');
      expect(response.body.data.version).toBe('2.0');
      expect(response.body.data.status).toBe('inactive');
    });

    it('should return 404 for non-existent document', async () => {
      const updateData = {
        title: 'Updated Document'
      };

      const response = await request(app)
        .put('/api/documents/non-existent')
        .send(updateData)
        .expect(404);
      
      expect(response.body.error).toBe('Legal document not found');
    });
  });

  // Search cases test
  describe('GET /api/cases/search', () => {
    it('should search cases by type', async () => {
      const response = await request(app)
        .get('/api/cases/search?type=civil')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search cases by status', async () => {
      const response = await request(app)
        .get('/api/cases/search?status=closed')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // Search documents test
  describe('GET /api/documents/search', () => {
    it('should search documents by type', async () => {
      const response = await request(app)
        .get('/api/documents/search?type=contract')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search documents by title', async () => {
      const response = await request(app)
        .get('/api/documents/search?title=Agreement')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});