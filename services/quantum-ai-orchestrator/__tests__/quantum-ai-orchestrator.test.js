const request = require('supertest');
const app = require('../index');

describe('Quantum AI Orchestration Service', () => {
  // Health check test
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('quantum-ai-orchestration-service');
    });
  });

  // Get quantum AI tasks test
  describe('GET /api/quantum-ai/tasks', () => {
    it('should return all quantum AI tasks', async () => {
      const response = await request(app)
        .get('/api/quantum-ai/tasks')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });
  });

  // Get specific quantum AI task test
  describe('GET /api/quantum-ai/tasks/:taskId', () => {
    it('should return specific quantum AI task', async () => {
      const response = await request(app)
        .get('/api/quantum-ai/tasks/task_1')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('task_1');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/api/quantum-ai/tasks/non-existent')
        .expect(404);
      
      expect(response.body.error).toBe('Quantum AI task not found');
    });
  });

  // Create a new quantum AI task test
  describe('POST /api/quantum-ai/tasks', () => {
    it('should create a new quantum AI task', async () => {
      const taskData = {
        name: 'New Quantum AI Task',
        description: 'A new quantum AI task for testing',
        priority: 'high',
        status: 'pending'
      };

      const response = await request(app)
        .post('/api/quantum-ai/tasks')
        .send(taskData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Quantum AI Task');
      expect(response.body.data.description).toBe('A new quantum AI task for testing');
      expect(response.body.data.priority).toBe('high');
    });

    it('should return 400 for missing required fields', async () => {
      const taskData = {
        name: 'New Quantum AI Task'
        // Missing description
      };

      const response = await request(app)
        .post('/api/quantum-ai/tasks')
        .send(taskData)
        .expect(400);
      
      expect(response.body.error).toBe('Name and description are required');
    });
  });

  // Update quantum AI task test
  describe('PUT /api/quantum-ai/tasks/:taskId', () => {
    let taskId;

    beforeAll(async () => {
      // Create a task first
      const taskData = {
        name: 'Test Quantum AI Task',
        description: 'Test quantum AI task for updating',
        priority: 'medium'
      };

      const response = await request(app)
        .post('/api/quantum-ai/tasks')
        .send(taskData);

      taskId = response.body.data.id;
    });

    it('should update quantum AI task', async () => {
      const updateData = {
        name: 'Updated Quantum AI Task',
        status: 'completed'
      };

      const response = await request(app)
        .put(`/api/quantum-ai/tasks/${taskId}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Quantum AI Task');
      expect(response.body.data.status).toBe('completed');
    });

    it('should return 404 for non-existent task', async () => {
      const updateData = {
        name: 'Updated Quantum AI Task'
      };

      const response = await request(app)
        .put('/api/quantum-ai/tasks/non-existent')
        .send(updateData)
        .expect(404);
      
      expect(response.body.error).toBe('Quantum AI task not found');
    });
  });

  // Execute quantum AI task test
  describe('POST /api/quantum-ai/tasks/:taskId/execute', () => {
    let taskId;

    beforeAll(async () => {
      // Create a task first
      const taskData = {
        name: 'Executable Quantum AI Task',
        description: 'Executable quantum AI task for testing',
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/quantum-ai/tasks')
        .send(taskData);

      taskId = response.body.data.id;
    });

    it('should execute quantum AI task', async () => {
      const response = await request(app)
        .post(`/api/quantum-ai/tasks/${taskId}/execute`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Quantum AI task executed successfully');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .post('/api/quantum-ai/tasks/non-existent/execute')
        .expect(404);
      
      expect(response.body.error).toBe('Quantum AI task not found');
    });
  });
});