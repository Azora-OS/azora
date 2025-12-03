import { cohortAnalyticsService } from '../cohort-analytics.service';
import { prisma } from '../../index';

describe('CohortAnalyticsService', () => {
  let courseId: string;
  let studentId1: string;
  let studentId2: string;
  let studentId3: string;
  let moduleId: string;

  beforeAll(async () => {
    // Create test data
    const user1 = await prisma.user.create({
      data: {
        email: `student1-${Date.now()}@test.com`,
        firstName: 'Student',
        lastName: 'One',
        userType: 'student',
        tier: 'free',
      },
    });
    studentId1 = user1.id;

    const user2 = await prisma.user.create({
      data: {
        email: `student2-${Date.now()}@test.com`,
        firstName: 'Student',
        lastName: 'Two',
        userType: 'student',
        tier: 'premium',
      },
    });
    studentId2 = user2.id;

    const user3 = await prisma.user.create({
      data: {
        email: `student3-${Date.now()}@test.com`,
        firstName: 'Student',
        lastName: 'Three',
        userType: 'student',
        tier: 'free',
      },
    });
    studentId3 = user3.id;

    const course = await prisma.course.create({
      data: {
        title: 'Cohort Test Course',
        description: 'Test course for cohort analytics',
        instructorId: studentId1,
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

    // Create enrollments
    const enrollment1 = await prisma.enrollment.create({
      data: {
        studentId: studentId1,
        courseId,
        tier: 'free',
        status: 'completed',
        progress: 100,
      },
    });

    const enrollment2 = await prisma.enrollment.create({
      data: {
        studentId: studentId2,
        courseId,
        tier: 'premium',
        status: 'active',
        progress: 60,
      },
    });

    const enrollment3 = await prisma.enrollment.create({
      data: {
        studentId: studentId3,
        courseId,
        tier: 'free',
        status: 'dropped',
        progress: 30,
      },
    });

    // Create learning outcomes
    await prisma.learningOutcome.create({
      data: {
        enrollmentId: enrollment1.id,
        courseId,
        moduleId,
        assessmentScore: 90,
        timeSpent: 3600,
        conceptMastery: 90,
      },
    });

    await prisma.learningOutcome.create({
      data: {
        enrollmentId: enrollment2.id,
        courseId,
        moduleId,
        assessmentScore: 70,
        timeSpent: 2400,
        conceptMastery: 70,
      },
    });

    await prisma.learningOutcome.create({
      data: {
        enrollmentId: enrollment3.id,
        courseId,
        moduleId,
        assessmentScore: 35,
        timeSpent: 1200,
        conceptMastery: 35,
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

  describe('getCohortAnalytics', () => {
    it('should return comprehensive cohort analytics', async () => {
      const analytics = await cohortAnalyticsService.getCohortAnalytics(courseId);

      expect(analytics).toBeDefined();
      expect(analytics.courseId).toBe(courseId);
      expect(analytics.totalEnrollments).toBe(3);
      expect(analytics.completionRate).toBeGreaterThan(0);
      expect(analytics.averageScore).toBeGreaterThan(0);
      expect(analytics.timeToCompletion).toBeGreaterThan(0);
      expect(Array.isArray(analytics.demographicBreakdown)).toBe(true);
      expect(Array.isArray(analytics.riskStudents)).toBe(true);
    });

    it('should calculate completion rate correctly', async () => {
      const analytics = await cohortAnalyticsService.getCohortAnalytics(courseId);

      // 1 completed out of 3 = 33.33%
      expect(analytics.completionRate).toBeCloseTo(33.33, 1);
    });

    it('should calculate average score correctly', async () => {
      const analytics = await cohortAnalyticsService.getCohortAnalytics(courseId);

      // (90 + 70 + 35) / 3 = 65
      expect(analytics.averageScore).toBeCloseTo(65, 1);
    });

    it('should identify demographic breakdown by tier', async () => {
      const analytics = await cohortAnalyticsService.getCohortAnalytics(courseId);

      expect(analytics.demographicBreakdown.length).toBeGreaterThan(0);
      const tiers = analytics.demographicBreakdown.map(d => d.value);
      expect(tiers).toContain('free');
      expect(tiers).toContain('premium');
    });

    it('should identify at-risk students', async () => {
      const analytics = await cohortAnalyticsService.getCohortAnalytics(courseId);

      // Student 3 has score 35 and progress 30, should be at risk
      expect(analytics.riskStudents.length).toBeGreaterThan(0);
      expect(analytics.riskStudents).toContain(studentId3);
    });
  });

  describe('getCohortAnalyticsByPeriod', () => {
    it('should return cohort analytics for a specific period', async () => {
      const currentPeriod = new Date().toISOString().slice(0, 7);
      const analytics = await cohortAnalyticsService.getCohortAnalyticsByPeriod(
        courseId,
        currentPeriod
      );

      expect(analytics).toBeDefined();
      expect(analytics.period).toBe(currentPeriod);
      expect(analytics.totalEnrollments).toBeGreaterThanOrEqual(0);
    });

    it('should return empty analytics for future period', async () => {
      const futurePeriod = '2099-12';
      const analytics = await cohortAnalyticsService.getCohortAnalyticsByPeriod(
        courseId,
        futurePeriod
      );

      expect(analytics.totalEnrollments).toBe(0);
      expect(analytics.completionRate).toBe(0);
    });
  });

  describe('compareCohortPerformance', () => {
    it('should compare performance across multiple periods', async () => {
      const currentPeriod = new Date().toISOString().slice(0, 7);
      const periods = [currentPeriod];

      const results = await cohortAnalyticsService.compareCohortPerformance(courseId, periods);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(periods.length);
    });
  });

  describe('getCohortPerformanceTrends', () => {
    it('should return performance trends over time', async () => {
      const trends = await cohortAnalyticsService.getCohortPerformanceTrends(courseId, 3);

      expect(Array.isArray(trends)).toBe(true);
      expect(trends.length).toBe(3);

      trends.forEach(trend => {
        expect(trend.period).toBeDefined();
        expect(trend.completionRate).toBeDefined();
        expect(trend.averageScore).toBeDefined();
        expect(trend.totalEnrollments).toBeDefined();
      });
    });
  });

  describe('getCohortSegmentation', () => {
    it('should segment cohort by performance level', async () => {
      const segmentation = await cohortAnalyticsService.getCohortSegmentation(courseId);

      expect(segmentation).toBeDefined();
      expect(segmentation.highPerformers).toBeDefined();
      expect(segmentation.proficient).toBeDefined();
      expect(segmentation.developing).toBeDefined();
      expect(segmentation.struggling).toBeDefined();
      expect(segmentation.totalStudents).toBe(3);
    });

    it('should categorize students correctly', async () => {
      const segmentation = await cohortAnalyticsService.getCohortSegmentation(courseId);

      // Student 1: 90 (high performer)
      // Student 2: 70 (proficient)
      // Student 3: 35 (struggling)
      expect(segmentation.highPerformers).toBeGreaterThan(0);
      expect(segmentation.proficient).toBeGreaterThan(0);
      expect(segmentation.struggling).toBeGreaterThan(0);
    });
  });

  describe('getCohortRetention', () => {
    it('should return retention metrics', async () => {
      const retention = await cohortAnalyticsService.getCohortRetention(courseId);

      expect(retention).toBeDefined();
      expect(retention.totalEnrolled).toBe(3);
      expect(retention.stillActive).toBeDefined();
      expect(retention.completed).toBeDefined();
      expect(retention.dropped).toBeDefined();
      expect(retention.retentionRate).toBeDefined();
      expect(retention.completionRate).toBeDefined();
    });

    it('should calculate retention rate correctly', async () => {
      const retention = await cohortAnalyticsService.getCohortRetention(courseId);

      // 1 completed + 1 active = 2 retained out of 3 = 66.67%
      expect(retention.retentionRate).toBeCloseTo(66.67, 1);
    });

    it('should calculate completion rate correctly', async () => {
      const retention = await cohortAnalyticsService.getCohortRetention(courseId);

      // 1 completed out of 3 = 33.33%
      expect(retention.completionRate).toBeCloseTo(33.33, 1);
    });
  });

  describe('getLearningVelocity', () => {
    it('should return learning velocity metrics', async () => {
      const velocity = await cohortAnalyticsService.getLearningVelocity(courseId);

      expect(velocity).toBeDefined();
      expect(velocity.averageModulesPerWeek).toBeDefined();
      expect(velocity.averageAssessmentsPerWeek).toBeDefined();
      expect(velocity.averageTimePerModule).toBeDefined();
    });

    it('should calculate average time per module', async () => {
      const velocity = await cohortAnalyticsService.getLearningVelocity(courseId);

      // Total time: 3600 + 2400 + 1200 = 7200 seconds
      // 1 module, so 7200 / 60 = 120 minutes
      expect(velocity.averageTimePerModule).toBeCloseTo(120, 0);
    });
  });
});
