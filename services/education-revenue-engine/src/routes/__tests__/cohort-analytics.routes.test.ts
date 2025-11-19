import request from 'supertest';
import app from '../../index';
import { prisma } from '../../index';

describe('Cohort Analytics Routes', () => {
  let courseId: string;
  let studentId: string;
  let moduleId: string;

  beforeAll(async () => {
    // Create test data
    const user = await prisma.user.create({
      data: {
        email: `cohort-test-${Date.now()}@test.com`,
        firstName: 'Test',
        lastName: 'User',
        userType: 'student',
        tier: 'free',
      },
    });
    studentId = user.id;

    const course = await prisma.course.create({
      data: {
        title: 'Cohort Test Course',
        description: 'Test course for cohort analytics',
        instructorId: studentId,
        tier: 'free',
        language: 'en',
      },
    });
    courseId = course.id;

    const module = await prisma.module.create({
      data: {
        courseId,
        title: 'Test Module',
        content: 'Test content',
        order: 1,
        estimatedTime: 60,
      },
    });
    moduleId = module.id;

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId,
        courseId,
        tier: 'free',
        status: 'active',
        progress: 50,
      },
    });

    await prisma.learningOutcome.create({
      data: {
        enrollmentId: enrollment.id,
        courseId,
        moduleId,
        assessmentScore: 85,
        timeSpent: 3600,
        conceptMastery: 85,
      },
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.learningOutcome.deleteMany({});
    await prisma.enrollment.deleteMany({});
    await prisma.module.deleteMany({});
    await prisma.course.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe('GET /api/v1/analytics/cohort/:courseId', () => {
    it('should get cohort analytics', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/cohort/${courseId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.courseId).toBe(courseId);
      expect(response.body.data.totalEnrollments).toBeGreaterThan(0);
      expect(response.body.data.completionRate).toBeDefined();
      expect(response.body.data.averageScore).toBeDefined();
    });

    it('should return 400 if courseId is missing', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/cohort/')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v1/analytics/cohort/:courseId/period/:period', () => {
    it('should get cohort analytics for a specific period', async () => {
      const currentPeriod = new Date().toISOString().slice(0, 7);
      const response = await request(app)
        .get(`/api/v1/analytics/cohort/${courseId}/period/${currentPeriod}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.period).toBe(currentPeriod);
    });

    it('should return 400 for invalid period format', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/cohort/${courseId}/period/invalid-period`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('YYYY-MM');
    });

    it('should return 400 if period is missing', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/cohort/${courseId}/period/`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/analytics/cohort/:courseId/compare', () => {
    it('should compare cohort performance across periods', async () => {
      const currentPeriod = new Date().toISOString().slice(0, 7);
      const response = await request(app)
        .post(`/api/v1/analytics/cohort/${courseId}/compare`)
        .send({
          periods: [currentPeriod],
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
    });

    it('should return 400 if periods array is missing', async () => {
      const response = await request(app)
        .post(`/api/v1/analytics/cohort/${courseId}/compare`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('periods');
    });

    it('should return 400 for invalid period format in array', async () => {
      const response = await request(app)
        .post(`/api/v1/analytics/cohort/${courseId}/compare`)
        .send({
          periods: ['invalid-period'],
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('YYYY-MM');
    });
  });

  describe('GET /api/v1/analytics/cohort/:courseId/trends', () => {
    it('should get performance trends', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/cohort/${courseId}/trends`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(12); // default 12 months
    });

    it('should accept monthsBack query parameter', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/cohort/${courseId}/trends?monthsBack=6`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(6);
    });
  });

  describe('GET /api/v1/analytics/cohort/:courseId/segmentation', () => {
    it('should get cohort segmentation', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/cohort/${courseId}/segmentation`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.highPerformers).toBeDefined();
      expect(response.body.data.proficient).toBeDefined();
      expect(response.body.data.developing).toBeDefined();
      expect(response.body.data.struggling).toBeDefined();
      expect(response.body.data.totalStudents).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/analytics/cohort/:courseId/retention', () => {
    it('should get retention metrics', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/cohort/${courseId}/retention`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.totalEnrolled).toBeGreaterThan(0);
      expect(response.body.data.stillActive).toBeDefined();
      expect(response.body.data.completed).toBeDefined();
      expect(response.body.data.dropped).toBeDefined();
      expect(response.body.data.retentionRate).toBeDefined();
      expect(response.body.data.completionRate).toBeDefined();
    });
  });

  describe('GET /api/v1/analytics/cohort/:courseId/velocity', () => {
    it('should get learning velocity metrics', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/cohort/${courseId}/velocity`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.averageModulesPerWeek).toBeDefined();
      expect(response.body.data.averageAssessmentsPerWeek).toBeDefined();
      expect(response.body.data.averageTimePerModule).toBeDefined();
    });
  });
});
