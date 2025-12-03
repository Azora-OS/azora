const request = require('supertest');
const app = require('../index.js');

describe('AI Orchestrator Service', () => {
  // Close the server after all tests
  afterAll((done) => {
    app.close(done);
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service', 'ai-orchestrator');
    });
  });

  describe('GET /api/models', () => {
    it('should return all AI models', async () => {
      const response = await request(app).get('/api/models');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/models', () => {
    it('should register a new AI model', async () => {
      const newModel = {
        name: 'Test AI Model',
        type: 'test',
        capabilities: ['testing']
      };

      const response = await request(app)
        .post('/api/models')
        .send(newModel);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', newModel.name);
      expect(response.body.data).toHaveProperty('type', newModel.type);
    });

    it('should return error for missing name', async () => {
      const invalidModel = {
        type: 'test'
      };

      const response = await request(app)
        .post('/api/models')
        .send(invalidModel);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/models/:modelId', () => {
    it('should return a specific AI model', async () => {
      // First, create a model to fetch
      const newModel = {
        name: 'Fetch Test Model',
        type: 'test'
      };

      const createResponse = await request(app)
        .post('/api/models')
        .send(newModel);

      const modelId = createResponse.body.data.id;

      // Now fetch the model
      const response = await request(app).get(`/api/models/${modelId}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', modelId);
      expect(response.body.data).toHaveProperty('name', newModel.name);
    });

    it('should return 404 for non-existent model', async () => {
      const response = await request(app).get('/api/models/non-existent-id');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/orchestrate', () => {
    it('should start AI task orchestration', async () => {
      // First, create a model to use
      const newModel = {
        name: 'Orchestration Test Model',
        type: 'test'
      };

      const createResponse = await request(app)
        .post('/api/models')
        .send(newModel);

      const modelId = createResponse.body.data.id;

      // Now test orchestration
      const orchestrationRequest = {
        taskId: 'test-task-123',
        models: [modelId],
        inputData: { test: 'data' }
      };

      const response = await request(app)
        .post('/api/orchestrate')
        .send(orchestrationRequest);

      expect(response.status).toBe(202);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status', 'pending');
    });

    it('should return error for missing models', async () => {
      const invalidRequest = {
        taskId: 'test-task-123'
      };

      const response = await request(app)
        .post('/api/orchestrate')
        .send(invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/performance', () => {
    it('should return performance metrics', async () => {
      const response = await request(app).get('/api/performance');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});