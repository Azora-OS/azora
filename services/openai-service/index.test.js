const request = require('supertest');
const app = require('./index');

describe('OpenAI Service', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service', 'openai-service');
    });
  });

  describe('GET /models', () => {
    it('should return available models', async () => {
      const response = await request(app)
        .get('/models')
        .expect(200);

      expect(response.body).toHaveProperty('models');
      expect(Array.isArray(response.body.models)).toBe(true);
      expect(response.body.models.length).toBeGreaterThan(0);
    });
  });

  describe('POST /chat/completions', () => {
    it('should validate request body', async () => {
      const response = await request(app)
        .post('/chat/completions')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation error');
    });

    it('should reject invalid model', async () => {
      const response = await request(app)
        .post('/chat/completions')
        .send({
          model: 'invalid-model',
          messages: [{ role: 'user', content: 'Hello' }]
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid model');
    });
  });

  describe('POST /images/generations', () => {
    it('should validate request body', async () => {
      const response = await request(app)
        .post('/images/generations')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation error');
    });
  });

  describe('POST /embeddings', () => {
    it('should validate request body', async () => {
      const response = await request(app)
        .post('/embeddings')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation error');
    });
  });

  describe('Rate Limiting', () => {
    it('should return rate limit status', async () => {
      const response = await request(app)
        .get('/rate-limit/status')
        .expect(200);

      expect(response.body).toHaveProperty('limits');
      expect(response.body.limits).toHaveProperty('global');
      expect(response.body.limits).toHaveProperty('chat');
      expect(response.body.limits).toHaveProperty('images');
      expect(response.body.limits).toHaveProperty('embeddings');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not found');
    });
  });
});