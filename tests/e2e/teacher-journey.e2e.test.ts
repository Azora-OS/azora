/**
 * End-to-End Teacher Journey Tests
 * Tests complete flow: signup → create course → publish → students enroll → track analytics → receive payment
 */

import request from 'supertest';
import { PrismaClient } from '@prisma/client';

const BASE_URL = process.env.API_URL || 'http://localhost:3020';
const prisma = new PrismaClient();

describe('E2E: Teacher Journey', () => {
  let teacherId: string;
  let courseId: string;
  let studentId: string;
  let enrollmentId: string;

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Teacher Signup and Profile', () => {
    it('should allow teacher signup', async () => {
      const response = await request(BASE_URL)
        .post('/api/v1/teacher/signup')
        .send({
          email: 'teacher@example.com',
          name: 'Test Teacher',
          bio: 'Experienced educator',
          expertise: ['Mathematics', 'Physics'],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.role).toBe('teacher');

      teacherId = response.body.data.id;
    });

    it('should retrieve teacher profile', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/teacher/${teacherId}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(teacherId);
      expect(response.body.data.email).toBe('teacher@example.com');
    });
  });

  describe('Course Creation and Publishing', () => {
    it('should create course draft', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/teacher/courses`)
        .send({
          title: 'Advanced Mathematics',
          description: 'Learn advanced math concepts',
          tier: 'premium',
          language: 'en',
          modules: [
            {
              title: 'Module 1: Calculus',
              lessons: [
                {
                  title: 'Derivatives',
                  content: 'Learn about derivatives',
                  duration: 45,
                },
              ],
            },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.data.status).toBe('draft');
      expect(response.body.data.instructorId).toBe(teacherId);

      courseId = response.body.data.id;
    });

    it('should validate course content with Constitutional AI', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/quality/validate-course`)
        .send({
          courseId,
          instructorId: teacherId,
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('isValid');
      expect(response.body.data).toHaveProperty('feedback');
    });

    it('should publish course after validation', async () => {
      const response = await request(BASE_URL)
        .put(`/api/v1/teacher/courses/${courseId}`)
        .send({
          status: 'published',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('published');
    });

    it('should list teacher courses', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/teacher/courses`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Student Enrollment', () => {
    it('should create student for enrollment', async () => {
      const response = await request(BASE_URL)
        .post('/api/v1/enrollments')
        .send({
          email: 'student@example.com',
          name: 'Test Student',
          tier: 'premium',
        });

      expect(response.status).toBe(201);
      studentId = response.body.data.id;
    });

    it('should allow student to enroll in teacher course', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/enrollments/${studentId}/courses`)
        .send({
          courseId,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.status).toBe('active');

      enrollmentId = response.body.data.id;
    });

    it('should track enrollment in teacher analytics', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/teacher/analytics/${courseId}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('totalEnrollments');
      expect(response.body.data.totalEnrollments).toBeGreaterThan(0);
    });
  });

  describe('Teacher Analytics Dashboard', () => {
    it('should provide course analytics', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/teacher/analytics/${courseId}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('totalEnrollments');
      expect(response.body.data).toHaveProperty('completionRate');
      expect(response.body.data).toHaveProperty('averageScore');
      expect(response.body.data).toHaveProperty('revenue');
    });

    it('should provide student-level analytics', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/teacher/analytics/${courseId}/students`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data[0]).toHaveProperty('studentId');
      expect(response.body.data[0]).toHaveProperty('progress');
      expect(response.body.data[0]).toHaveProperty('score');
    });

    it('should calculate completion rates', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/teacher/analytics/${courseId}`);

      expect(response.body.data.completionRate).toBeGreaterThanOrEqual(0);
      expect(response.body.data.completionRate).toBeLessThanOrEqual(100);
    });

    it('should track learning outcomes', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/teacher/analytics/${courseId}`);

      expect(response.body.data).toHaveProperty('learningOutcomes');
      expect(Array.isArray(response.body.data.learningOutcomes)).toBe(true);
    });
  });

  describe('Revenue Tracking', () => {
    it('should calculate course revenue', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/teacher/revenue/${teacherId}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('totalRevenue');
      expect(response.body.data).toHaveProperty('courseRevenue');
    });

    it('should apply 70/30 revenue split', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/teacher/revenue/${teacherId}`);

      const totalRevenue = response.body.data.totalRevenue;
      const teacherShare = response.body.data.teacherShare;
      const platformShare = totalRevenue - teacherShare;

      const teacherPercentage = (teacherShare / totalRevenue) * 100;
      expect(teacherPercentage).toBeCloseTo(70, 1);
    });

    it('should track revenue by course', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/teacher/revenue/${teacherId}`);

      expect(response.body.data.courseRevenue).toHaveProperty(courseId);
    });

    it('should generate revenue reports', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/teacher/revenue/${teacherId}/report`)
        .query({
          period: 'monthly',
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('period');
      expect(response.body.data).toHaveProperty('revenue');
      expect(response.body.data).toHaveProperty('students');
    });
  });

  describe('Payment Processing', () => {
    it('should calculate instructor payment', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/teacher/revenue/${teacherId}`);

      const teacherShare = response.body.data.teacherShare;
      expect(teacherShare).toBeGreaterThan(0);
    });

    it('should process instructor payment', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/teacher/payments/process`)
        .send({
          instructorId: teacherId,
          amount: 7000, // $70 (70% of $100)
          currency: 'USD',
          paymentMethod: 'bank_transfer',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data).toHaveProperty('transactionId');
    });

    it('should track payment history', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/teacher/payments/${teacherId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should allow payment withdrawal request', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/teacher/payments/withdraw`)
        .send({
          instructorId: teacherId,
          amount: 5000,
          bankAccount: 'xxxx-xxxx-xxxx-1234',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.status).toBe('pending');
    });
  });

  describe('Content Validation', () => {
    it('should validate assessment questions', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/quality/validate-assessment`)
        .send({
          courseId,
          questions: [
            {
              id: 'q1',
              text: 'What is calculus?',
              options: ['A', 'B', 'C', 'D'],
              correctAnswer: 'A',
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('isValid');
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
  });

  describe('Course Updates', () => {
    it('should allow course updates', async () => {
      const response = await request(BASE_URL)
        .put(`/api/v1/teacher/courses/${courseId}`)
        .send({
          title: 'Advanced Mathematics - Updated',
          description: 'Updated description',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Advanced Mathematics - Updated');
    });

    it('should revalidate course after updates', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/quality/validate-course`)
        .send({
          courseId,
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('isValid');
    });

    it('should add new modules to course', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/teacher/courses/${courseId}/modules`)
        .send({
          title: 'Module 2: Integration',
          lessons: [
            {
              title: 'Integration Basics',
              content: 'Learn integration',
              duration: 45,
            },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
    });
  });

  describe('Teacher Performance', () => {
    it('should calculate teacher rating', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/teacher/${teacherId}/rating`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('rating');
      expect(response.body.data.rating).toBeGreaterThanOrEqual(0);
      expect(response.body.data.rating).toBeLessThanOrEqual(5);
    });

    it('should track student feedback', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/teacher/${teacherId}/feedback`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should provide performance metrics', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/teacher/${teacherId}/performance`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('totalStudents');
      expect(response.body.data).toHaveProperty('totalCourses');
      expect(response.body.data).toHaveProperty('averageRating');
    });
  });
});
