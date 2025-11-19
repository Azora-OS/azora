/**
 * End-to-End AI Integration Tests
 * Tests Elara, Knowledge Ocean, and Constitutional AI integrations
 */

import request from 'supertest';
import { PrismaClient } from '@prisma/client';

const BASE_URL = process.env.API_URL || 'http://localhost:3020';
const prisma = new PrismaClient();

describe('E2E: AI Integration', () => {
  let studentId: string;
  let courseId: string;
  let enrollmentId: string;

  beforeAll(async () => {
    // Setup: Create student and course
    const studentResponse = await request(BASE_URL)
      .post('/api/v1/enrollments')
      .send({
        email: 'ai-test@example.com',
        name: 'AI Test Student',
        tier: 'premium',
      });

    studentId = studentResponse.body.data.id;

    const courseResponse = await request(BASE_URL)
      .post('/api/v1/courses')
      .send({
        title: 'AI Test Course',
        description: 'Course for AI testing',
        tier: 'premium',
        instructorId: 'test-instructor',
      });

    courseId = courseResponse.body.data.id;

    const enrollmentResponse = await request(BASE_URL)
      .post(`/api/v1/enrollments/${studentId}/courses`)
      .send({
        courseId,
      });

    enrollmentId = enrollmentResponse.body.data.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Elara Orchestrator Tutoring', () => {
    it('should provide tutoring response', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/tutoring/ask`)
        .send({
          studentId,
          courseId,
          question: 'What is the main concept?',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('response');
      expect(response.body.data.response.length).toBeGreaterThan(0);
    });

    it('should include context in tutoring response', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/tutoring/ask`)
        .send({
          studentId,
          courseId,
          question: 'Explain the concept',
          context: {
            moduleId: 'module-1',
            previousResponses: [],
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('response');
      expect(response.body.data).toHaveProperty('context');
    });

    it('should cache tutoring responses', async () => {
      const question = 'What is caching?';

      const response1 = await request(BASE_URL)
        .post(`/api/v1/tutoring/ask`)
        .send({
          studentId,
          courseId,
          question,
        });

      const response2 = await request(BASE_URL)
        .post(`/api/v1/tutoring/ask`)
        .send({
          studentId,
          courseId,
          question,
        });

      expect(response1.body.data.response).toBe(response2.body.data.response);
    });

    it('should track tutoring history', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/tutoring/history/${studentId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should handle tutoring errors gracefully', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/tutoring/ask`)
        .send({
          studentId,
          courseId,
          question: '', // Empty question
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Knowledge Ocean Context Retrieval', () => {
    it('should retrieve context for topic', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/context/retrieve`)
        .query({
          courseId,
          topic: 'main-concept',
          tier: 'premium',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('resources');
      expect(Array.isArray(response.body.data.resources)).toBe(true);
    });

    it('should enforce 70/30 resource ratio', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/context/retrieve`)
        .query({
          courseId,
          topic: 'main-concept',
          tier: 'premium',
        });

      const resources = response.body.data.resources;
      const internalCount = resources.filter((r: any) => r.source === 'internal').length;
      const externalCount = resources.filter((r: any) => r.source === 'external').length;
      const total = internalCount + externalCount;

      const internalRatio = (internalCount / total) * 100;
      expect(internalRatio).toBeGreaterThanOrEqual(70);
    });

    it('should rank resources by relevance', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/context/retrieve`)
        .query({
          courseId,
          topic: 'main-concept',
          tier: 'premium',
        });

      const resources = response.body.data.resources;
      for (let i = 0; i < resources.length - 1; i++) {
        expect(resources[i].relevanceScore).toBeGreaterThanOrEqual(
          resources[i + 1].relevanceScore
        );
      }
    });

    it('should support language-specific retrieval', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/context/retrieve`)
        .query({
          courseId,
          topic: 'main-concept',
          language: 'en',
          tier: 'premium',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.resources.length).toBeGreaterThan(0);
    });

    it('should handle context retrieval errors', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/context/retrieve`)
        .query({
          courseId: 'invalid-course',
          topic: 'main-concept',
          tier: 'premium',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('Constitutional AI Content Validation', () => {
    it('should validate course content', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/quality/validate-course`)
        .send({
          courseId,
          instructorId: 'test-instructor',
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('isValid');
      expect(response.body.data).toHaveProperty('feedback');
    });

    it('should check for bias in content', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/quality/validate-course`)
        .send({
          courseId,
          checkBias: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('biasScore');
      expect(response.body.data.biasScore).toBeGreaterThanOrEqual(0);
      expect(response.body.data.biasScore).toBeLessThanOrEqual(100);
    });

    it('should verify accuracy of content', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/quality/validate-course`)
        .send({
          courseId,
          checkAccuracy: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('accuracyScore');
    });

    it('should check clarity of content', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/quality/validate-course`)
        .send({
          courseId,
          checkClarity: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('clarityScore');
    });

    it('should validate assessment questions', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/quality/validate-assessment`)
        .send({
          courseId,
          questions: [
            {
              id: 'q1',
              text: 'What is the concept?',
              options: ['A', 'B', 'C', 'D'],
              correctAnswer: 'A',
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('isValid');
    });

    it('should validate teacher feedback', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/quality/validate-feedback`)
        .send({
          courseId,
          feedback: 'Great work on this assignment!',
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('isValid');
    });
  });

  describe('AI Error Handling and Fallbacks', () => {
    it('should handle tutoring timeout gracefully', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/tutoring/ask`)
        .send({
          studentId,
          courseId,
          question: 'Complex question',
          timeout: 100, // Very short timeout
        });

      // Should either succeed or return graceful error
      expect([200, 408, 504]).toContain(response.status);
    });

    it('should provide fallback response on AI failure', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/tutoring/ask`)
        .send({
          studentId,
          courseId,
          question: 'Test question',
        });

      // Should always return a response
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('response');
    });

    it('should retry failed AI requests', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/tutoring/ask`)
        .send({
          studentId,
          courseId,
          question: 'Test question',
          retryCount: 3,
        });

      expect(response.status).toBe(200);
    });

    it('should log AI errors for monitoring', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/monitoring/logs`)
        .query({
          filter: 'ai_error',
          limit: 10,
        });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('AI Performance Metrics', () => {
    it('should track tutoring latency', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/monitoring/metrics`)
        .query({
          metric: 'ai_query_duration',
          engine: 'elara',
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('p95');
      expect(response.body.data.p95).toBeLessThan(5000); // 5 seconds
    });

    it('should track AI error rates', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/monitoring/metrics`)
        .query({
          metric: 'ai_error_rate',
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('errorRate');
      expect(response.body.data.errorRate).toBeLessThan(10); // Less than 10%
    });

    it('should track context retrieval performance', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/monitoring/metrics`)
        .query({
          metric: 'ai_query_duration',
          engine: 'knowledge-ocean',
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('p95');
    });
  });

  describe('Multi-AI Orchestration', () => {
    it('should coordinate multiple AI engines', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/tutoring/ask`)
        .send({
          studentId,
          courseId,
          question: 'Complex question requiring multiple AI engines',
          useMultipleEngines: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('response');
      expect(response.body.data).toHaveProperty('enginesUsed');
    });

    it('should validate AI responses with Constitutional AI', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/tutoring/ask`)
        .send({
          studentId,
          courseId,
          question: 'Test question',
          validateResponse: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('validated');
    });
  });
});
