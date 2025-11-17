const request = require('supertest');
const app = require('../server');

describe('AI Family Service API Routes', () => {
  describe('GET /', () => {
    test('should return API documentation', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Welcome to the Azora AI Family Service API');
      expect(response.body.endpoints).toBeDefined();
    });
  });

  describe('GET /api/health', () => {
    test('should return health status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body.service).toBe('AI Family Service');
    });
  });

  describe('POST /api/chat/chat', () => {
    test('should return 400 if message is missing', async () => {
      const response = await request(app)
        .post('/api/chat/chat')
        .send({ userId: 'test-user' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Message is required');
    });

    test('should return response from specified personality', async () => {
      const response = await request(app)
        .post('/api/chat/chat')
        .send({
          userId: 'test-user',
          personality: 'themba',
          message: 'Hi Themba!'
        });

      expect(response.status).toBe(200);
      expect(response.body.from).toBe('themba');
      expect(response.body.response).toBeDefined();
    });
  });

  describe('POST /api/chat/auto-chat', () => {
    test('should return 400 if message is missing', async () => {
      const response = await request(app)
        .post('/api/chat/auto-chat')
        .send({ userId: 'test-user' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Message is required');
    });

    test('should automatically route to appropriate personality', async () => {
      const response = await request(app)
        .post('/api/chat/auto-chat')
        .send({
          userId: 'test-user',
          message: 'I need help with my finances'
        });

      expect(response.status).toBe(200);
      // Should route to Kofi for finance-related queries
      expect(['kofi', 'elara']).toContain(response.body.from);
      expect(response.body.response).toBeDefined();
    });
  });

  describe('GET /api/chat/greeting', () => {
    test('should return personalized greeting', async () => {
      const response = await request(app)
        .get('/api/chat/greeting')
        .query({ userId: 'test-user', personality: 'elara' });

      expect(response.status).toBe(200);
      expect(response.body.greeting).toBeDefined();
      expect(response.body.greeting).toContain('Elara');
    });
  });

  describe('POST /api/chat/consult-family', () => {
    test('should return 400 if topic is missing', async () => {
      const response = await request(app)
        .post('/api/chat/consult-family')
        .send({ userId: 'test-user' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Topic is required');
    });

    test('should return family consultation', async () => {
      const response = await request(app)
        .post('/api/chat/consult-family')
        .send({
          userId: 'test-user',
          topic: 'career advice'
        });

      expect(response.status).toBe(200);
      expect(response.body.topic).toBe('career advice');
      expect(response.body.insights).toBeDefined();
      expect(response.body.coordinatedResponse).toBeDefined();
    });
  });

  describe('GET /api/chat/family-config', () => {
    test('should return family configuration', async () => {
      const response = await request(app).get('/api/chat/family-config');

      expect(response.status).toBe(200);
      expect(response.body.elara).toBeDefined();
      expect(response.body.themba).toBeDefined();
    });
  });

  describe('GET /api/chat/interaction-stats', () => {
    test('should return interaction statistics', async () => {
      const response = await request(app).get('/api/chat/interaction-stats');

      expect(response.status).toBe(200);
      expect(response.body.totalInteractions).toBeDefined();
      expect(response.body.familyMemberUsage).toBeDefined();
      expect(response.body.recentInteractions).toBeDefined();
    });
  });

  describe('404 Handler', () => {
    test('should return 404 for unknown endpoints', async () => {
      const response = await request(app).get('/api/unknown-endpoint');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Endpoint not found');
    });
  });
});
