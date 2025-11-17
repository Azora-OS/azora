const request = require('supertest');
const app = require('../index');

describe('Research Center Service', () => {
  // Health check test
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('research-center-service');
    });
  });

  // Get all research projects test
  describe('GET /api/research-projects', () => {
    it('should return all research projects', async () => {
      const response = await request(app)
        .get('/api/research-projects')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });
  });

  // Get specific research project test
  describe('GET /api/research-projects/:projectId', () => {
    it('should return specific research project', async () => {
      const response = await request(app)
        .get('/api/research-projects/project_1')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('project_1');
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .get('/api/research-projects/non-existent')
        .expect(404);
      
      expect(response.body.error).toBe('Research project not found');
    });
  });

  // Create a new research project test
  describe('POST /api/research-projects', () => {
    it('should create a new research project', async () => {
      const projectData = {
        title: 'New Research Project',
        description: 'A new research project for testing',
        leadResearcher: 'Dr. Test Researcher',
        status: 'active'
      };

      const response = await request(app)
        .post('/api/research-projects')
        .send(projectData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('New Research Project');
      expect(response.body.data.description).toBe('A new research project for testing');
      expect(response.body.data.leadResearcher).toBe('Dr. Test Researcher');
    });

    it('should return 400 for missing required fields', async () => {
      const projectData = {
        title: 'New Research Project'
        // Missing description and leadResearcher
      };

      const response = await request(app)
        .post('/api/research-projects')
        .send(projectData)
        .expect(400);
      
      expect(response.body.error).toBe('Title, description, and lead researcher are required');
    });
  });

  // Update research project test
  describe('PUT /api/research-projects/:projectId', () => {
    let projectId;

    beforeAll(async () => {
      // Create a project first
      const projectData = {
        title: 'Test Research Project',
        description: 'Test research project for updating',
        leadResearcher: 'Dr. Test Researcher'
      };

      const response = await request(app)
        .post('/api/research-projects')
        .send(projectData);

      projectId = response.body.data.id;
    });

    it('should update research project', async () => {
      const updateData = {
        title: 'Updated Research Project',
        status: 'completed'
      };

      const response = await request(app)
        .put(`/api/research-projects/${projectId}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Research Project');
      expect(response.body.data.status).toBe('completed');
    });

    it('should return 404 for non-existent project', async () => {
      const updateData = {
        title: 'Updated Research Project'
      };

      const response = await request(app)
        .put('/api/research-projects/non-existent')
        .send(updateData)
        .expect(404);
      
      expect(response.body.error).toBe('Research project not found');
    });
  });

  // Get all publications test
  describe('GET /api/publications', () => {
    it('should return all publications', async () => {
      const response = await request(app)
        .get('/api/publications')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });
  });

  // Get publications for a specific project test
  describe('GET /api/research-projects/:projectId/publications', () => {
    it('should return publications for a specific project', async () => {
      const response = await request(app)
        .get('/api/research-projects/project_1/publications')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // Create a new publication test
  describe('POST /api/publications', () => {
    it('should create a new publication', async () => {
      const publicationData = {
        title: 'New Research Publication',
        abstract: 'Abstract of the new research publication',
        projectId: 'project_1',
        authors: ['Dr. Test Researcher', 'Dr. Another Researcher']
      };

      const response = await request(app)
        .post('/api/publications')
        .send(publicationData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('New Research Publication');
      expect(response.body.data.abstract).toBe('Abstract of the new research publication');
      expect(response.body.data.projectId).toBe('project_1');
    });

    it('should return 400 for missing required fields', async () => {
      const publicationData = {
        title: 'New Research Publication'
        // Missing abstract and projectId
      };

      const response = await request(app)
        .post('/api/publications')
        .send(publicationData)
        .expect(400);
      
      expect(response.body.error).toBe('Title, abstract, and project ID are required');
    });
  });
});