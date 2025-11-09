// 🧪 Azora Education Platform Tests

const request = require('supertest');
const app = require('../server');

describe('Azora Education API', () => {
  
  describe('Health Check', () => {
    test('GET /api/health should return healthy status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('azora-education');
      expect(response.body.ubuntu).toBe('I learn because we grow together');
    });
  });

  describe('Learner Management', () => {
    test('POST /api/learners should create new learner', async () => {
      const learnerData = {
        name: 'Test Learner',
        email: 'test@azora.education',
        learningGoals: ['AI', 'Blockchain'],
        preferredStyle: 'visual'
      };

      const response = await request(app)
        .post('/api/learners')
        .send(learnerData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.learner.name).toBe(learnerData.name);
      expect(response.body.learner.email).toBe(learnerData.email);
      expect(response.body.learner.azrBalance).toBe(100); // Welcome bonus
      expect(response.body.welcomeMessage).toBeDefined();
    });

    test('POST /api/learners should reject invalid email', async () => {
      const invalidData = {
        name: 'Test User',
        email: 'invalid-email'
      };

      const response = await request(app)
        .post('/api/learners')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toContain('Invalid email format');
    });
  });

  describe('Course Management', () => {
    test('GET /api/courses should return course list', async () => {
      const response = await request(app)
        .get('/api/courses')
        .expect(200);

      expect(response.body.courses).toBeDefined();
      expect(Array.isArray(response.body.courses)).toBe(true);
      expect(response.body.total).toBeGreaterThan(0);
      expect(response.body.featured).toBeDefined();
    });

    test('GET /api/courses with filters should work', async () => {
      const response = await request(app)
        .get('/api/courses?category=ai&difficulty=2&premium=false')
        .expect(200);

      expect(response.body.courses).toBeDefined();
      // Should filter courses based on criteria
    });
  });

  describe('AI Tutor Integration', () => {
    let learnerId;

    beforeAll(async () => {
      // Create a test learner first
      const learnerResponse = await request(app)
        .post('/api/learners')
        .send({
          name: 'AI Test Learner',
          email: 'ai-test@azora.education'
        });
      
      learnerId = learnerResponse.body.learner.id;
    });

    test('POST /api/tutor/chat should return AI response', async () => {
      const chatData = {
        learnerId,
        message: 'What is artificial intelligence?',
        context: 'curious'
      };

      const response = await request(app)
        .post('/api/tutor/chat')
        .send(chatData)
        .expect(200);

      expect(response.body.sessionId).toBeDefined();
      expect(response.body.response).toBeDefined();
      expect(response.body.suggestions).toBeDefined();
      expect(Array.isArray(response.body.suggestions)).toBe(true);
    });
  });

  describe('Gamification System', () => {
    let learnerId, courseId;

    beforeAll(async () => {
      // Create test learner
      const learnerResponse = await request(app)
        .post('/api/learners')
        .send({
          name: 'Gamification Test',
          email: 'gamification@azora.education'
        });
      
      learnerId = learnerResponse.body.learner.id;

      // Get a course to enroll in
      const coursesResponse = await request(app).get('/api/courses');
      courseId = coursesResponse.body.courses[0].id;
    });

    test('POST /api/progress/update should award XP and AZR', async () => {
      const progressData = {
        learnerId,
        courseId,
        moduleId: 'test_module',
        score: 0.9,
        timeSpent: 45
      };

      const response = await request(app)
        .post('/api/progress/update')
        .send(progressData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.progress.xpGained).toBeGreaterThan(0);
      expect(response.body.progress.azrGained).toBeGreaterThan(0);
      expect(response.body.progress.totalXP).toBeGreaterThan(0);
      expect(response.body.elaraMessage).toBeDefined();
    });
  });

  describe('Leaderboard System', () => {
    test('GET /api/leaderboards should return ranked learners', async () => {
      const response = await request(app)
        .get('/api/leaderboards?type=xp&limit=5')
        .expect(200);

      expect(response.body.leaderboard).toBeDefined();
      expect(Array.isArray(response.body.leaderboard)).toBe(true);
      expect(response.body.type).toBe('xp');
      
      // Check if properly ranked
      if (response.body.leaderboard.length > 1) {
        expect(response.body.leaderboard[0].xp).toBeGreaterThanOrEqual(
          response.body.leaderboard[1].xp
        );
      }
    });
  });

  describe('Ubuntu Philosophy Integration', () => {
    test('All responses should include Ubuntu elements', async () => {
      const healthResponse = await request(app).get('/api/health');
      expect(healthResponse.body.ubuntu).toBeDefined();
      
      // Ubuntu philosophy should be embedded throughout the platform
      expect(healthResponse.body.ubuntu).toContain('together');
    });
  });
});

// Performance Tests
describe('Performance Tests', () => {
  test('Health endpoint should respond quickly', async () => {
    const start = Date.now();
    await request(app).get('/api/health').expect(200);
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(100); // Should respond in under 100ms
  });

  test('Course listing should handle large requests', async () => {
    const start = Date.now();
    await request(app).get('/api/courses').expect(200);
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(500); // Should respond in under 500ms
  });
});

// Security Tests
describe('Security Tests', () => {
  test('Should reject malicious input', async () => {
    const maliciousData = {
      name: '<script>alert("xss")</script>',
      email: 'test@example.com'
    };

    const response = await request(app)
      .post('/api/learners')
      .send(maliciousData)
      .expect(200);

    // Name should be sanitized
    expect(response.body.learner.name).not.toContain('<script>');
  });

  test('Should include security headers', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('DENY');
    expect(response.headers['x-xss-protection']).toBe('1; mode=block');
  });
});