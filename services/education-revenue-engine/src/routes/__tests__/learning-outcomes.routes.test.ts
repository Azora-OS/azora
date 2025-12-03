import request from 'supertest';
import app from '../../index';
import { prisma } from '../../index';
import { logger } from '../../utils/logger';

describe('Learning Outcomes Routes', () => {
  let studentId: string;
  let courseId: string;
  let enrollmentId: string;
  let moduleId: string;

  beforeAll(async () => {
    // Create test data
    const user = await prisma.user.create({
      data: {
        email: `student-${Date.now()}@test.com`,
        firstName: 'Test',
        lastName: 'Student',
        userType: 'student',
        tier: 'free',
      },
    });
    studentId = user.id;

    const course = await prisma.course.create({
      data: {
        title: 'Test Course',
        description: 'Test course for learning outcomes',
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
        progress: 0,
      },
    });
    enrollmentId = enrollment.id;

    // Create learning outcomes
    await prisma.learningOutcome.create({
      data: {
        enrollmentId,
        courseId,
        moduleId,
        assessmentScore: 85,
        timeSpent: 3600,
        conceptMastery: 85,
      },
    });

    await prisma.learningOutcome.create({
      data: {
        enrollmentId,
        courseId,
        moduleId,
        assessmentScore: 75,
        timeSpent: 2400,
        conceptMastery: 75,
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

  describe('GET /api/v1/analytics/outcomes/:studentId/:courseId', () => {
    it('should get student course analytics', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/outcomes/${studentId}/${courseId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.studentId).toBe(studentId);
      expect(response.body.data.courseId).toBe(courseId);
      expect(response.body.data.completionRate).toBeGreaterThan(0);
      expect(response.body.data.averageScore).toBeGreaterThan(0);
      expect(response.body.data.conceptsMastered).toBeDefined();
      expect(response.body.data.conceptsInProgress).toBeDefined();
      expect(response.body.data.conceptsStruggling).toBeDefined();
    });

    it('should return 400 if studentId is missing', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/outcomes//${courseId}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 if courseId is missing', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/outcomes/${studentId}/`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v1/analytics/outcomes/:studentId', () => {
    it('should get student overall analytics', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/outcomes/${studentId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.totalCourses).toBeGreaterThan(0);
      expect(response.body.data.averageScore).toBeGreaterThan(0);
      expect(response.body.data.courseAnalytics).toBeDefined();
      expect(Array.isArray(response.body.data.courseAnalytics)).toBe(true);
    });

    it('should return 400 if studentId is missing', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/outcomes/')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/analytics/course/:courseId/outcomes', () => {
    it('should get all course outcomes', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/course/${courseId}/outcomes`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return 400 if courseId is missing', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/course//outcomes')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/analytics/enrollment/:enrollmentId/outcomes', () => {
    it('should get enrollment outcomes', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/enrollment/${enrollmentId}/outcomes`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return 400 if enrollmentId is missing', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/enrollment//outcomes')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/analytics/course/:courseId/completion-rate', () => {
    it('should get course completion rate', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/course/${courseId}/completion-rate`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.completionRate).toBeDefined();
      expect(response.body.data.totalEnrollments).toBeGreaterThan(0);
      expect(response.body.data.completedEnrollments).toBeDefined();
    });
  });

  describe('GET /api/v1/analytics/course/:courseId/time-to-mastery', () => {
    it('should get course time to mastery', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/course/${courseId}/time-to-mastery`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.averageTimeToMastery).toBeDefined();
      expect(response.body.data.medianTimeToMastery).toBeDefined();
      expect(response.body.data.minTime).toBeDefined();
      expect(response.body.data.maxTime).toBeDefined();
    });
  });

  describe('GET /api/v1/analytics/course/:courseId/average-score', () => {
    it('should get course average score', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/course/${courseId}/average-score`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.averageScore).toBeGreaterThan(0);
      expect(response.body.data.medianScore).toBeDefined();
      expect(response.body.data.minScore).toBeDefined();
      expect(response.body.data.maxScore).toBeDefined();
      expect(response.body.data.passRate).toBeDefined();
    });
  });

  describe('GET /api/v1/analytics/course/:courseId/at-risk-students', () => {
    it('should identify at-risk students', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/course/${courseId}/at-risk-students`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data.atRiskStudents)).toBe(true);
    });

    it('should accept scoreThreshold query parameter', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/course/${courseId}/at-risk-students?scoreThreshold=60`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('GET /api/v1/analytics/course/:courseId/skill-proficiency', () => {
    it('should get skill proficiency distribution', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/course/${courseId}/skill-proficiency`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.proficiencyLevels).toBeDefined();
      expect(response.body.data.proficiencyLevels.mastered).toBeDefined();
      expect(response.body.data.proficiencyLevels.proficient).toBeDefined();
      expect(response.body.data.proficiencyLevels.developing).toBeDefined();
      expect(response.body.data.proficiencyLevels.beginning).toBeDefined();
      expect(response.body.data.totalAssessments).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/analytics/course/:courseId/modules', () => {
    it('should get module-level analytics', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/course/${courseId}/modules`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      const moduleAnalytic = response.body.data[0];
      expect(moduleAnalytic.moduleId).toBeDefined();
      expect(moduleAnalytic.moduleName).toBeDefined();
      expect(moduleAnalytic.totalAttempts).toBeDefined();
      expect(moduleAnalytic.averageScore).toBeDefined();
      expect(moduleAnalytic.completionRate).toBeDefined();
      expect(moduleAnalytic.averageTimeSpent).toBeDefined();
    });
  });
});
