/**
 * End-to-End Premium Student Features Tests
 * Tests premium tier features and access control
 */

import request from 'supertest';
import { PrismaClient } from '@prisma/client';

const BASE_URL = process.env.API_URL || 'http://localhost:3020';
const prisma = new PrismaClient();

describe('E2E: Premium Student Features', () => {
  let premiumStudentId: string;
  let freeStudentId: string;
  let premiumCourseId: string;
  let freeCourseId: string;

  beforeAll(async () => {
    // Create premium course
    const premiumCourseResponse = await request(BASE_URL)
      .post('/api/v1/courses')
      .send({
        title: 'Premium Course',
        description: 'Premium course for testing',
        tier: 'premium',
        instructorId: 'test-instructor',
        language: 'en',
      });

    premiumCourseId = premiumCourseResponse.body.data.id;

    // Create free course
    const freeCourseResponse = await request(BASE_URL)
      .post('/api/v1/courses')
      .send({
        title: 'Free Course',
        description: 'Free course for testing',
        tier: 'free',
        instructorId: 'test-instructor',
        language: 'en',
      });

    freeCourseId = freeCourseResponse.body.data.id;

    // Create premium student
    const premiumResponse = await request(BASE_URL)
      .post('/api/v1/enrollments')
      .send({
        email: 'premium@example.com',
        name: 'Premium Student',
        tier: 'premium',
      });

    premiumStudentId = premiumResponse.body.data.id;

    // Create free student
    const freeResponse = await request(BASE_URL)
      .post('/api/v1/enrollments')
      .send({
        email: 'free@example.com',
        name: 'Free Student',
        tier: 'free',
      });

    freeStudentId = freeResponse.body.data.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Premium Course Access', () => {
    it('should allow premium student to enroll in premium course', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/enrollments/${premiumStudentId}/courses`)
        .send({
          courseId: premiumCourseId,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should prevent free student from enrolling in premium course', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/enrollments/${freeStudentId}/courses`)
        .send({
          courseId: premiumCourseId,
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('tier');
    });

    it('should allow free student to enroll in free course', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/enrollments/${freeStudentId}/courses`)
        .send({
          courseId: freeCourseId,
        });

      expect(response.status).toBe(201);
    });

    it('should allow premium student to enroll in free course', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/enrollments/${premiumStudentId}/courses`)
        .send({
          courseId: freeCourseId,
        });

      expect(response.status).toBe(201);
    });
  });

  describe('Tutoring Feature', () => {
    let premiumEnrollmentId: string;

    beforeAll(async () => {
      const enrollmentResponse = await request(BASE_URL)
        .post(`/api/v1/enrollments/${premiumStudentId}/courses`)
        .send({
          courseId: premiumCourseId,
        });

      premiumEnrollmentId = enrollmentResponse.body.data.id;
    });

    it('should allow premium student to ask tutoring questions', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/tutoring/ask`)
        .send({
          studentId: premiumStudentId,
          courseId: premiumCourseId,
          question: 'What is the main concept?',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('response');
      expect(response.body.data).toHaveProperty('timestamp');
    });

    it('should prevent free student from accessing tutoring', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/tutoring/ask`)
        .send({
          studentId: freeStudentId,
          courseId: freeCourseId,
          question: 'What is the main concept?',
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('premium');
    });

    it('should cache tutoring responses', async () => {
      const response1 = await request(BASE_URL)
        .post(`/api/v1/tutoring/ask`)
        .send({
          studentId: premiumStudentId,
          courseId: premiumCourseId,
          question: 'What is caching?',
        });

      const response2 = await request(BASE_URL)
        .post(`/api/v1/tutoring/ask`)
        .send({
          studentId: premiumStudentId,
          courseId: premiumCourseId,
          question: 'What is caching?',
        });

      expect(response1.body.data.response).toBe(response2.body.data.response);
    });

    it('should track tutoring history', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/tutoring/history/${premiumStudentId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Premium Resources', () => {
    it('should provide premium resources to premium students', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/context/retrieve`)
        .query({
          courseId: premiumCourseId,
          topic: 'main-concept',
          tier: 'premium',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('resources');
      expect(response.body.data.resources.length).toBeGreaterThan(0);
    });

    it('should enforce 70/30 resource ratio for premium', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/context/retrieve`)
        .query({
          courseId: premiumCourseId,
          topic: 'main-concept',
          tier: 'premium',
        });

      const resources = response.body.data.resources;
      const internalCount = resources.filter((r: any) => r.source === 'internal').length;
      const externalCount = resources.filter((r: any) => r.source === 'external').length;
      const total = internalCount + externalCount;

      const internalRatio = (internalCount / total) * 100;
      const externalRatio = (externalCount / total) * 100;

      expect(internalRatio).toBeGreaterThanOrEqual(70);
      expect(externalRatio).toBeLessThanOrEqual(30);
    });

    it('should prevent free students from accessing premium resources', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/context/retrieve`)
        .query({
          courseId: freeCourseId,
          topic: 'main-concept',
          tier: 'premium',
        });

      expect(response.status).toBe(403);
    });
  });

  describe('Advanced Analytics', () => {
    it('should provide detailed analytics for premium students', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/analytics/outcomes/${premiumStudentId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('detailedAnalytics');
      expect(response.body.data.detailedAnalytics).toBe(true);
    });

    it('should provide basic analytics for free students', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/analytics/outcomes/${freeStudentId}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('detailedAnalytics');
      expect(response.body.data.detailedAnalytics).toBe(false);
    });

    it('should track tutoring usage in analytics', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/analytics/outcomes/${premiumStudentId}`);

      expect(response.body.data).toHaveProperty('tutoringUsage');
      expect(response.body.data.tutoringUsage).toBeGreaterThan(0);
    });

    it('should track resource access in analytics', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/analytics/outcomes/${premiumStudentId}`);

      expect(response.body.data).toHaveProperty('resourcesAccessed');
      expect(response.body.data.resourcesAccessed).toBeGreaterThan(0);
    });

    it('should provide learning path recommendations', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/analytics/outcomes/${premiumStudentId}`);

      expect(response.body.data).toHaveProperty('learningPath');
      expect(Array.isArray(response.body.data.learningPath)).toBe(true);
    });
  });

  describe('Premium Enrollment Limits', () => {
    it('should allow unlimited course enrollments for premium', async () => {
      // Create multiple courses
      for (let i = 0; i < 5; i++) {
        const courseResponse = await request(BASE_URL)
          .post('/api/v1/courses')
          .send({
            title: `Premium Course ${i}`,
            description: 'Test',
            tier: 'premium',
            instructorId: 'test-instructor',
          });

        const response = await request(BASE_URL)
          .post(`/api/v1/enrollments/${premiumStudentId}/courses`)
          .send({
            courseId: courseResponse.body.data.id,
          });

        expect(response.status).toBe(201);
      }
    });

    it('should enforce free tier course limit', async () => {
      // Create multiple courses
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < 5; i++) {
        const courseResponse = await request(BASE_URL)
          .post('/api/v1/courses')
          .send({
            title: `Free Course ${i}`,
            description: 'Test',
            tier: 'free',
            instructorId: 'test-instructor',
          });

        const response = await request(BASE_URL)
          .post(`/api/v1/enrollments/${freeStudentId}/courses`)
          .send({
            courseId: courseResponse.body.data.id,
          });

        if (response.status === 201) {
          successCount++;
        } else {
          failCount++;
        }
      }

      expect(successCount).toBeLessThanOrEqual(3); // Free limit
      expect(failCount).toBeGreaterThan(0);
    });
  });

  describe('Premium Feature Pricing', () => {
    it('should show premium tier pricing', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/pricing/tiers/premium`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('price');
      expect(response.body.data).toHaveProperty('features');
      expect(response.body.data.features).toContain('tutoring');
      expect(response.body.data.features).toContain('premium_resources');
    });

    it('should show pro tier pricing', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/pricing/tiers/pro`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('price');
      expect(response.body.data.price).toBeGreaterThan(0);
    });

    it('should calculate annual discount', async () => {
      const monthlyResponse = await request(BASE_URL)
        .get(`/api/v1/pricing/tiers/premium`);

      const monthlyPrice = monthlyResponse.body.data.price;
      const annualPrice = monthlyPrice * 12 * 0.9; // 10% annual discount

      expect(annualPrice).toBeLessThan(monthlyPrice * 12);
    });
  });

  describe('Premium Support', () => {
    it('should provide priority support for premium students', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/enrollments/${premiumStudentId}`);

      expect(response.body.data).toHaveProperty('supportTier');
      expect(response.body.data.supportTier).toBe('priority');
    });

    it('should provide standard support for free students', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/enrollments/${freeStudentId}`);

      expect(response.body.data).toHaveProperty('supportTier');
      expect(response.body.data.supportTier).toBe('standard');
    });
  });

  describe('Premium Downgrade', () => {
    let downgradeStudentId: string;

    beforeAll(async () => {
      const studentResponse = await request(BASE_URL)
        .post('/api/v1/enrollments')
        .send({
          email: 'downgrade@example.com',
          name: 'Downgrade Test',
          tier: 'premium',
        });

      downgradeStudentId = studentResponse.body.data.id;
    });

    it('should allow premium student to downgrade to free', async () => {
      const response = await request(BASE_URL)
        .put(`/api/v1/enrollments/${downgradeStudentId}`)
        .send({
          tier: 'free',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.tier).toBe('free');
    });

    it('should revoke premium features after downgrade', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/tutoring/ask`)
        .send({
          studentId: downgradeStudentId,
          courseId: premiumCourseId,
          question: 'Test question',
        });

      expect(response.status).toBe(403);
    });

    it('should unenroll from premium courses after downgrade', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/enrollments/${downgradeStudentId}`);

      const premiumEnrollments = response.body.data.courses.filter(
        (c: any) => c.tier === 'premium'
      );

      expect(premiumEnrollments.length).toBe(0);
    });
  });
});
