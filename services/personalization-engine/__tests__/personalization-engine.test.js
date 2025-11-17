const request = require('supertest');
const app = require('../server.js');

describe('Personalization Engine Service', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body.service).toBe('personalization-engine');
    });
  });

  describe('GET /api/recommendations/:userId', () => {
    it('should return personalized recommendations for a user', async () => {
      const userId = 'user_123';

      const response = await request(app)
        .get(`/api/recommendations/${userId}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.userId).toBe(userId);
      expect(response.body.recommendations).toBeDefined();
    });
  });

  describe('POST /api/preferences/:userId', () => {
    it('should update user preferences', async () => {
      const userId = 'user_123';
      const preferences = {
        interests: ['technology', 'science'],
        preferredContentTypes: ['video', 'article']
      };

      const response = await request(app)
        .post(`/api/preferences/${userId}`)
        .send(preferences)
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.userId).toBe(userId);
      expect(response.body.message).toBe('Preferences updated successfully');
    });
  });

  describe('GET /api/preferences/:userId', () => {
    it('should return user preferences', async () => {
      const userId = 'user_123';

      const response = await request(app)
        .get(`/api/preferences/${userId}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.userId).toBe(userId);
      expect(response.body.preferences).toBeDefined();
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