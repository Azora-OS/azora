/**
 * End-to-End Student Journey Tests
 * Tests complete flow: signup → enroll → learn → assess → complete → certificate
 */

import request from 'supertest';
import { PrismaClient } from '@prisma/client';

const BASE_URL = process.env.API_URL || 'http://localhost:3020';
const prisma = new PrismaClient();

describe('E2E: Student Journey', () => {
  let studentId: string;
  let courseId: string;
  let enrollmentId: string;
  let assessmentId: string;
  let certificateId: string;

  beforeAll(async () => {
    // Setup: Create test course
    const courseResponse = await request(BASE_URL)
      .post('/api/v1/courses')
      .send({
        title: 'E2E Test Course',
        description: 'Test course for E2E testing',
        tier: 'free',
        instructorId: 'test-instructor',
        language: 'en',
        modules: [
          {
            title: 'Module 1',
            description: 'First module',
            lessons: [
              {
                title: 'Lesson 1',
                content: 'Test content',
                duration: 30,
              },
            ],
          },
        ],
      });

    courseId = courseResponse.body.data.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.$disconnect();
  });

  describe('Free Tier Student Journey', () => {
    it('should allow student signup', async () => {
      const response = await request(BASE_URL)
        .post('/api/v1/enrollments')
        .send({
          email: 'student@example.com',
          name: 'Test Student',
          tier: 'free',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.tier).toBe('free');

      studentId = response.body.data.id;
    });

    it('should allow free student to enroll in free course', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/enrollments/${studentId}/courses`)
        .send({
          courseId,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.status).toBe('active');

      enrollmentId = response.body.data.id;
    });

    it('should prevent free student from enrolling in premium course', async () => {
      // Create premium course
      const premiumCourseResponse = await request(BASE_URL)
        .post('/api/v1/courses')
        .send({
          title: 'Premium Course',
          description: 'Premium course',
          tier: 'premium',
          instructorId: 'test-instructor',
          language: 'en',
        });

      const premiumCourseId = premiumCourseResponse.body.data.id;

      const response = await request(BASE_URL)
        .post(`/api/v1/enrollments/${studentId}/courses`)
        .send({
          courseId: premiumCourseId,
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should track progress as student completes modules', async () => {
      const response = await request(BASE_URL)
        .put(`/api/v1/enrollments/${enrollmentId}/progress`)
        .send({
          moduleId: 'module-1',
          status: 'in_progress',
          percentComplete: 40,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.percentComplete).toBe(40);
    });

    it('should allow student to submit assessment', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/assessments/submit`)
        .send({
          enrollmentId,
          courseId,
          answers: [
            { questionId: 'q1', answer: 'correct' },
            { questionId: 'q2', answer: 'correct' },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('score');
      expect(response.body.data).toHaveProperty('passed');

      assessmentId = response.body.data.id;
    });

    it('should calculate learning outcomes after assessment', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/analytics/outcomes/${studentId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('completionRate');
      expect(response.body.data).toHaveProperty('skillsProficiency');
    });

    it('should mark course as completed when all modules done', async () => {
      const response = await request(BASE_URL)
        .put(`/api/v1/enrollments/${enrollmentId}`)
        .send({
          status: 'completed',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
    });

    it('should generate certificate upon course completion', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/certificates/generate`)
        .send({
          enrollmentId,
          studentId,
          courseId,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('verificationUrl');
      expect(response.body.data).toHaveProperty('issuedDate');

      certificateId = response.body.data.id;
    });

    it('should allow student to view certificate', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/certificates/${certificateId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(certificateId);
      expect(response.body.data.studentId).toBe(studentId);
    });

    it('should list all student certificates', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/certificates/student/${studentId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Conversion Offer Flow', () => {
    let conversionStudentId: string;
    let conversionEnrollmentId: string;

    it('should create free student for conversion test', async () => {
      const response = await request(BASE_URL)
        .post('/api/v1/enrollments')
        .send({
          email: 'conversion-student@example.com',
          name: 'Conversion Test Student',
          tier: 'free',
        });

      expect(response.status).toBe(201);
      conversionStudentId = response.body.data.id;
    });

    it('should enroll conversion student in course', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/enrollments/${conversionStudentId}/courses`)
        .send({
          courseId,
        });

      expect(response.status).toBe(201);
      conversionEnrollmentId = response.body.data.id;
    });

    it('should trigger conversion offer at 40% completion', async () => {
      // Update progress to 40%
      await request(BASE_URL)
        .put(`/api/v1/enrollments/${conversionEnrollmentId}/progress`)
        .send({
          moduleId: 'module-1',
          percentComplete: 40,
        });

      // Check for conversion offer
      const response = await request(BASE_URL)
        .get(`/api/v1/conversions/${conversionStudentId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('offers');
      expect(response.body.data.offers.length).toBeGreaterThan(0);
    });

    it('should provide upgrade discount offer', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/conversions/${conversionStudentId}`);

      const offers = response.body.data.offers;
      const upgradeOffer = offers.find((o: any) => o.type === 'upgrade_discount');

      expect(upgradeOffer).toBeDefined();
      expect(upgradeOffer.discount).toBe(50); // 50% discount for Premium
      expect(upgradeOffer.expiresAt).toBeDefined();
    });

    it('should allow student to accept conversion offer', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/conversions/accept`)
        .send({
          studentId: conversionStudentId,
          offerId: 'upgrade-discount-premium',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('accepted');
    });

    it('should process payment for upgrade', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/payments/process`)
        .send({
          studentId: conversionStudentId,
          amount: 4999, // $49.99 with 50% discount
          currency: 'USD',
          paymentMethod: 'stripe',
          tier: 'premium',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
    });

    it('should upgrade student tier after payment', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/enrollments/${conversionStudentId}`);

      expect(response.status).toBe(200);
      expect(response.body.data.tier).toBe('premium');
    });

    it('should track conversion event', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/analytics/conversion/metrics`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('conversionRate');
      expect(response.body.data.conversionRate).toBeGreaterThan(0);
    });
  });

  describe('Premium Tier Features', () => {
    let premiumStudentId: string;

    it('should create premium student', async () => {
      const response = await request(BASE_URL)
        .post('/api/v1/enrollments')
        .send({
          email: 'premium-student@example.com',
          name: 'Premium Student',
          tier: 'premium',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.tier).toBe('premium');
      premiumStudentId = response.body.data.id;
    });

    it('should allow premium student to access tutoring', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/tutoring/ask`)
        .send({
          studentId: premiumStudentId,
          courseId,
          question: 'What is the main concept?',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('response');
      expect(response.body.data).toHaveProperty('timestamp');
    });

    it('should allow premium student to access premium resources', async () => {
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
    });

    it('should provide advanced analytics for premium student', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/analytics/outcomes/${premiumStudentId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('detailedAnalytics');
      expect(response.body.data.detailedAnalytics).toBe(true);
    });

    it('should track premium feature usage', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/analytics/outcomes/${premiumStudentId}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('tutoringUsage');
      expect(response.body.data).toHaveProperty('resourcesAccessed');
    });
  });

  describe('Student Enrollment Limits', () => {
    it('should enforce free tier course limit', async () => {
      const freeStudent = await request(BASE_URL)
        .post('/api/v1/enrollments')
        .send({
          email: 'limit-test@example.com',
          name: 'Limit Test Student',
          tier: 'free',
        });

      const studentId = freeStudent.body.data.id;

      // Try to enroll in more than 3 courses (free limit)
      for (let i = 0; i < 4; i++) {
        const courseResponse = await request(BASE_URL)
          .post('/api/v1/courses')
          .send({
            title: `Course ${i}`,
            description: 'Test',
            tier: 'free',
            instructorId: 'test-instructor',
          });

        const response = await request(BASE_URL)
          .post(`/api/v1/enrollments/${studentId}/courses`)
          .send({
            courseId: courseResponse.body.data.id,
          });

        if (i < 3) {
          expect(response.status).toBe(201);
        } else {
          expect(response.status).toBe(403);
          expect(response.body.error).toContain('limit');
        }
      }
    });
  });

  describe('Student Progress Tracking', () => {
    let trackingStudentId: string;
    let trackingEnrollmentId: string;

    beforeAll(async () => {
      const studentResponse = await request(BASE_URL)
        .post('/api/v1/enrollments')
        .send({
          email: 'tracking-student@example.com',
          name: 'Tracking Student',
          tier: 'free',
        });

      trackingStudentId = studentResponse.body.data.id;

      const enrollmentResponse = await request(BASE_URL)
        .post(`/api/v1/enrollments/${trackingStudentId}/courses`)
        .send({
          courseId,
        });

      trackingEnrollmentId = enrollmentResponse.body.data.id;
    });

    it('should track time spent on modules', async () => {
      const response = await request(BASE_URL)
        .put(`/api/v1/enrollments/${trackingEnrollmentId}/progress`)
        .send({
          moduleId: 'module-1',
          timeSpent: 1800, // 30 minutes
          percentComplete: 50,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.timeSpent).toBe(1800);
    });

    it('should identify struggling students', async () => {
      // Submit failed assessment
      await request(BASE_URL)
        .post(`/api/v1/assessments/submit`)
        .send({
          enrollmentId: trackingEnrollmentId,
          courseId,
          answers: [
            { questionId: 'q1', answer: 'wrong' },
            { questionId: 'q2', answer: 'wrong' },
          ],
        });

      const response = await request(BASE_URL)
        .get(`/api/v1/analytics/outcomes/${trackingStudentId}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('strugglingConcepts');
    });

    it('should provide learning recommendations', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/analytics/outcomes/${trackingStudentId}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('recommendations');
      expect(Array.isArray(response.body.data.recommendations)).toBe(true);
    });
  });
});
