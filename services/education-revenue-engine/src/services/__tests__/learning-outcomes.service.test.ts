import { learningOutcomesService } from '../learning-outcomes.service';
import { prisma } from '../../index';

describe('LearningOutcomesService', () => {
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

    // Create learning outcomes with varying scores
    await prisma.learningOutcome.create({
      data: {
        enrollmentId,
        courseId,
        moduleId,
        assessmentScore: 90,
        timeSpent: 3600,
        conceptMastery: 90,
      },
    });

    await prisma.learningOutcome.create({
      data: {
        enrollmentId,
        courseId,
        moduleId,
        assessmentScore: 70,
        timeSpent: 2400,
        conceptMastery: 70,
      },
    });

    await prisma.learningOutcome.create({
      data: {
        enrollmentId,
        courseId,
        moduleId,
        assessmentScore: 45,
        timeSpent: 1800,
        conceptMastery: 45,
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

  describe('getStudentCourseAnalytics', () => {
    it('should return comprehensive learning analytics for a student in a course', async () => {
      const analytics = await learningOutcomesService.getStudentCourseAnalytics(studentId, courseId);

      expect(analytics).toBeDefined();
      expect(analytics.studentId).toBe(studentId);
      expect(analytics.courseId).toBe(courseId);
      expect(analytics.completionRate).toBeGreaterThan(0);
      expect(analytics.averageScore).toBeGreaterThan(0);
      expect(analytics.timeToMastery).toBeGreaterThan(0);
      expect(analytics.skillProficiency).toBeDefined();
      expect(analytics.assessmentScores.length).toBe(3);
      expect(analytics.conceptsMastered.length).toBeGreaterThan(0);
    });

    it('should throw error if enrollment not found', async () => {
      await expect(
        learningOutcomesService.getStudentCourseAnalytics('invalid-student', 'invalid-course')
      ).rejects.toThrow('Enrollment not found');
    });

    it('should categorize concepts correctly', async () => {
      const analytics = await learningOutcomesService.getStudentCourseAnalytics(studentId, courseId);

      // With scores 90, 70, 45:
      // 90 >= 80 -> mastered
      // 70 >= 50 and < 80 -> in progress
      // 45 < 50 -> struggling
      expect(analytics.conceptsMastered.length).toBeGreaterThan(0);
      expect(analytics.conceptsInProgress.length).toBeGreaterThan(0);
      expect(analytics.conceptsStruggling.length).toBeGreaterThan(0);
    });
  });

  describe('getStudentOverallAnalytics', () => {
    it('should return overall analytics for all student courses', async () => {
      const analytics = await learningOutcomesService.getStudentOverallAnalytics(studentId);

      expect(analytics).toBeDefined();
      expect(analytics.totalCourses).toBeGreaterThan(0);
      expect(analytics.completedCourses).toBeDefined();
      expect(analytics.activeCourses).toBeDefined();
      expect(analytics.averageCompletionRate).toBeDefined();
      expect(analytics.averageScore).toBeGreaterThan(0);
      expect(analytics.totalTimeSpent).toBeGreaterThan(0);
      expect(Array.isArray(analytics.courseAnalytics)).toBe(true);
    });
  });

  describe('getCourseOutcomes', () => {
    it('should return all learning outcomes for a course', async () => {
      const outcomes = await learningOutcomesService.getCourseOutcomes(courseId);

      expect(Array.isArray(outcomes)).toBe(true);
      expect(outcomes.length).toBe(3);
      expect(outcomes[0].courseId).toBe(courseId);
    });

    it('should return empty array if no outcomes exist', async () => {
      const newCourse = await prisma.course.create({
        data: {
          title: 'Empty Course',
          description: 'Course with no outcomes',
          instructorId: studentId,
          tier: 'free',
          language: 'en',
        },
      });

      const outcomes = await learningOutcomesService.getCourseOutcomes(newCourse.id);

      expect(Array.isArray(outcomes)).toBe(true);
      expect(outcomes.length).toBe(0);

      await prisma.course.delete({ where: { id: newCourse.id } });
    });
  });

  describe('getEnrollmentOutcomes', () => {
    it('should return all learning outcomes for an enrollment', async () => {
      const outcomes = await learningOutcomesService.getEnrollmentOutcomes(enrollmentId);

      expect(Array.isArray(outcomes)).toBe(true);
      expect(outcomes.length).toBe(3);
      expect(outcomes[0].enrollmentId).toBe(enrollmentId);
    });
  });

  describe('calculateCourseCompletionRate', () => {
    it('should calculate course completion rate', async () => {
      const result = await learningOutcomesService.calculateCourseCompletionRate(courseId);

      expect(result).toBeDefined();
      expect(result.completionRate).toBeDefined();
      expect(result.totalEnrollments).toBeGreaterThan(0);
      expect(result.completedEnrollments).toBeDefined();
    });
  });

  describe('calculateCourseTimeToMastery', () => {
    it('should calculate time to mastery statistics', async () => {
      const result = await learningOutcomesService.calculateCourseTimeToMastery(courseId);

      expect(result).toBeDefined();
      expect(result.averageTimeToMastery).toBeGreaterThan(0);
      expect(result.medianTimeToMastery).toBeGreaterThan(0);
      expect(result.minTime).toBeGreaterThan(0);
      expect(result.maxTime).toBeGreaterThan(0);
      expect(result.maxTime).toBeGreaterThanOrEqual(result.minTime);
    });

    it('should return zeros for course with no outcomes', async () => {
      const newCourse = await prisma.course.create({
        data: {
          title: 'Empty Course',
          description: 'Course with no outcomes',
          instructorId: studentId,
          tier: 'free',
          language: 'en',
        },
      });

      const result = await learningOutcomesService.calculateCourseTimeToMastery(newCourse.id);

      expect(result.averageTimeToMastery).toBe(0);
      expect(result.medianTimeToMastery).toBe(0);
      expect(result.minTime).toBe(0);
      expect(result.maxTime).toBe(0);

      await prisma.course.delete({ where: { id: newCourse.id } });
    });
  });

  describe('calculateCourseAverageScore', () => {
    it('should calculate average score statistics', async () => {
      const result = await learningOutcomesService.calculateCourseAverageScore(courseId);

      expect(result).toBeDefined();
      expect(result.averageScore).toBeGreaterThan(0);
      expect(result.medianScore).toBeGreaterThan(0);
      expect(result.minScore).toBeGreaterThan(0);
      expect(result.maxScore).toBeGreaterThan(0);
      expect(result.passRate).toBeDefined();
      expect(result.maxScore).toBeGreaterThanOrEqual(result.minScore);
    });

    it('should calculate pass rate correctly', async () => {
      const result = await learningOutcomesService.calculateCourseAverageScore(courseId);

      // With scores 90, 70, 45: 2 out of 3 pass (>= 70)
      expect(result.passRate).toBeCloseTo(66.67, 1);
    });
  });

  describe('identifyAtRiskStudents', () => {
    it('should identify at-risk students', async () => {
      const result = await learningOutcomesService.identifyAtRiskStudents(courseId, 50);

      expect(result).toBeDefined();
      expect(Array.isArray(result.atRiskStudents)).toBe(true);
      // Student with score 45 should be at risk
      expect(result.atRiskStudents.length).toBeGreaterThan(0);
    });

    it('should use custom score threshold', async () => {
      const result = await learningOutcomesService.identifyAtRiskStudents(courseId, 80);

      expect(result).toBeDefined();
      expect(Array.isArray(result.atRiskStudents)).toBe(true);
      // With threshold 80, students with 70 and 45 should be at risk
      expect(result.atRiskStudents.length).toBeGreaterThan(0);
    });
  });

  describe('getSkillProficiencyDistribution', () => {
    it('should get skill proficiency distribution', async () => {
      const result = await learningOutcomesService.getSkillProficiencyDistribution(courseId);

      expect(result).toBeDefined();
      expect(result.proficiencyLevels).toBeDefined();
      expect(result.proficiencyLevels.mastered).toBeDefined();
      expect(result.proficiencyLevels.proficient).toBeDefined();
      expect(result.proficiencyLevels.developing).toBeDefined();
      expect(result.proficiencyLevels.beginning).toBeDefined();
      expect(result.totalAssessments).toBe(3);
    });

    it('should categorize proficiency levels correctly', async () => {
      const result = await learningOutcomesService.getSkillProficiencyDistribution(courseId);

      // With mastery scores 90, 70, 45:
      // 90 >= 80 -> mastered
      // 70 >= 60 and < 80 -> proficient
      // 45 >= 40 and < 60 -> developing
      expect(result.proficiencyLevels.mastered).toBeGreaterThan(0);
      expect(result.proficiencyLevels.proficient).toBeGreaterThan(0);
      expect(result.proficiencyLevels.developing).toBeGreaterThan(0);
    });
  });

  describe('getModuleAnalytics', () => {
    it('should get module-level analytics', async () => {
      const result = await learningOutcomesService.getModuleAnalytics(courseId);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      const moduleAnalytic = result[0];
      expect(moduleAnalytic.moduleId).toBeDefined();
      expect(moduleAnalytic.moduleName).toBeDefined();
      expect(moduleAnalytic.totalAttempts).toBeGreaterThan(0);
      expect(moduleAnalytic.averageScore).toBeGreaterThan(0);
      expect(moduleAnalytic.completionRate).toBeGreaterThan(0);
      expect(moduleAnalytic.averageTimeSpent).toBeGreaterThan(0);
    });
  });
});
