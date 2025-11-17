const request = require('supertest');
const app = require('../index.js');

describe('AI Evolution Engine', () => {
  // Health check test
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('ai-evolution-engine');
    });
  });

  // Get all models test
  describe('GET /api/models', () => {
    it('should return list of models', async () => {
      const response = await request(app)
        .get('/api/models')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  // Get specific model test
  describe('GET /api/models/:modelId', () => {
    it('should return specific model data', async () => {
      const response = await request(app)
        .get('/api/models/model-1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('model-1');
      expect(response.body.data.name).toBe('Constitutional AI Assistant');
    });

    it('should return 404 for non-existent model', async () => {
      const response = await request(app)
        .get('/api/models/non-existent')
        .expect(404);

      expect(response.body.error).toBe('Model not found');
    });
  });

  // Model evolution test
  describe('POST /api/evolve', () => {
    it('should evolve a model with performance data', async () => {
      const evolutionData = {
        modelId: 'model-1',
        performanceData: {
          accuracy: 0.95,
          biasScore: 0.10,
          responseTime: 100
        },
        feedback: ['Great responses', 'Very helpful']
      };

      const response = await request(app)
        .post('/api/evolve')
        .send(evolutionData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.model.id).toBe('model-1');
      expect(response.body.data.model.version).not.toBe('1.0.0');
    });

    it('should return 400 for missing model ID', async () => {
      const evolutionData = {
        performanceData: {
          accuracy: 0.95
        }
      };

      const response = await request(app)
        .post('/api/evolve')
        .send(evolutionData)
        .expect(400);

      expect(response.body.error).toBe('Model ID is required');
    });

    it('should return 404 for non-existent model', async () => {
      const evolutionData = {
        modelId: 'non-existent',
        performanceData: {
          accuracy: 0.95
        }
      };

      const response = await request(app)
        .post('/api/evolve')
        .send(evolutionData)
        .expect(404);

      expect(response.body.error).toBe('Model not found');
    });
  });

  // Adaptive learning test
  describe('POST /api/adaptive-learning', () => {
    it('should apply adaptive learning', async () => {
      const adaptiveData = {
        userData: {
          id: 'user-123',
          preferences: ['concise', 'technical']
        },
        context: 'programming',
        preferences: ['concise', 'technical']
      };

      const response = await request(app)
        .post('/api/adaptive-learning')
        .send(adaptiveData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe('user-123');
      expect(Array.isArray(response.body.data.adaptations)).toBe(true);
    });

    it('should return 400 for missing user data', async () => {
      const adaptiveData = {
        context: 'programming'
      };

      const response = await request(app)
        .post('/api/adaptive-learning')
        .send(adaptiveData)
        .expect(400);

      expect(response.body.error).toBe('User data with ID is required');
    });
  });

  // Submit feedback test
  describe('POST /api/models/:modelId/feedback', () => {
    it('should record feedback for a model', async () => {
      const feedbackData = {
        feedback: 'This model is very accurate',
        rating: 5,
        userId: 'user-123'
      };

      const response = await request(app)
        .post('/api/models/model-1/feedback')
        .send(feedbackData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.modelId).toBe('model-1');
      expect(response.body.data.feedback).toBe('This model is very accurate');
    });

    it('should return 400 for missing feedback', async () => {
      const feedbackData = {
        rating: 5
      };

      const response = await request(app)
        .post('/api/models/model-1/feedback')
        .send(feedbackData)
        .expect(400);

      expect(response.body.error).toBe('Feedback is required');
    });

    it('should return 404 for non-existent model', async () => {
      const feedbackData = {
        feedback: 'Great model',
        rating: 5
      };

      const response = await request(app)
        .post('/api/models/non-existent/feedback')
        .send(feedbackData)
        .expect(404);

      expect(response.body.error).toBe('Model not found');
    });
  });
});
