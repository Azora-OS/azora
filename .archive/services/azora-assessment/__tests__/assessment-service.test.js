const request = require('supertest');
const app = require('../index');

describe('Assessment Service', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);
      
      expect(res.body).toHaveProperty('status', 'healthy');
      expect(res.body).toHaveProperty('service');
    });
  });

  describe('GET /', () => {
    it('should return API documentation', async () => {
      const res = await request(app)
        .get('/')
        .expect(200);
      
      expect(res.body).toHaveProperty('service');
      expect(res.body).toHaveProperty('endpoints');
    });
  });

  describe('POST /api/assessments', () => {
    it('should create a new assessment', async () => {
      const assessmentData = {
        userId: 'user_123',
        title: 'Test Assessment',
        type: 'QUIZ',
        questions: [
          {
            type: 'multiple-choice',
            question: 'What is 2+2?',
            options: ['3', '4', '5'],
            correctAnswer: 1,
            points: 1
          }
        ],
        maxScore: 1
      };

      const res = await request(app)
        .post('/api/assessments')
        .send(assessmentData)
        .expect(201);
      
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('title', 'Test Assessment');
    });
  });

  describe('GET /api/assessments/:id', () => {
    it('should return 404 for non-existent assessment', async () => {
      const res = await request(app)
        .get('/api/assessments/non-existent-id')
        .expect(404);
      
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error', 'Assessment not found');
    });
  });

  describe('PUT /api/assessments/:id', () => {
    it('should return 404 for non-existent assessment', async () => {
      const res = await request(app)
        .put('/api/assessments/non-existent-id')
        .send({ title: 'Updated Title' })
        .expect(404);
      
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error', 'Assessment not found');
    });
  });

  describe('DELETE /api/assessments/:id', () => {
    it('should return 404 for non-existent assessment', async () => {
      const res = await request(app)
        .delete('/api/assessments/non-existent-id')
        .expect(404);
      
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error', 'Assessment not found');
    });
  });
});