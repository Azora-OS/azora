const request = require('supertest');
const app = require('../server.js');

describe('Project Marketplace Service', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body.service).toBe('project-marketplace');
    });
  });

  describe('GET /api/projects', () => {
    it('should return a list of projects', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.count).toBeDefined();
    });
  });

  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      const projectData = {
        title: 'Test Project',
        description: 'A test project',
        budget: 1000,
        deadline: '2023-12-31'
      };

      const response = await request(app)
        .post('/api/projects')
        .send(projectData)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe(projectData.title);
    });

    it('should return error when required fields are missing', async () => {
      const projectData = {
        description: 'A test project'
      };

      const response = await request(app)
        .post('/api/projects')
        .send(projectData)
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Title is required');
    });
  });

  describe('GET /api/projects/:projectId', () => {
    it('should return a specific project', async () => {
      const projectId = 'project_123';

      const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(projectId);
    });
  });

  describe('PUT /api/projects/:projectId', () => {
    it('should update a project', async () => {
      const projectId = 'project_123';
      const updateData = {
        title: 'Updated Project Title',
        description: 'Updated project description'
      };

      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .send(updateData)
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe(updateData.title);
    });
  });

  describe('DELETE /api/projects/:projectId', () => {
    it('should delete a project', async () => {
      const projectId = 'project_123';

      const response = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Project deleted successfully');
    });
  });

  describe('404 handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/non-existent-route');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Route not found');
    });
  });
});