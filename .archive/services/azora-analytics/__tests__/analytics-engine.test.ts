/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

import { analyticsEngine, ProgressData } from '../analytics-engine';
import { gradingEngine } from '../../azora-assessment/grading-engine';
import { connectAzoraDatabase, azoraDatabase } from '../../shared/database/connection';

describe('AnalyticsEngine', () => {
  const testStudentId = 'analytics-student-123';
  const testStudentNumber = 'ASU2025007';
  const testCourseId = 'analytics-course-123';

  beforeAll(async () => {
    await connectAzoraDatabase(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/azora-education-test');
  });

  afterAll(async () => {
    await azoraDatabase.disconnect();
  });

  beforeEach(async () => {
    // Track some initial progress
    await analyticsEngine.trackProgress({
      studentId: testStudentId,
      studentNumber: testStudentNumber,
      courseId: testCourseId,
      completed: false,
      timeSpent: 60,
      lastAccessed: new Date(),
      progress: 30,
    });
  });

  describe('trackProgress', () => {
    it('should track progress successfully', async () => {
      const progressData: ProgressData = {
        studentId: testStudentId,
        studentNumber: testStudentNumber,
        courseId: testCourseId,
        moduleId: 'module-1',
        completed: true,
        completionDate: new Date(),
        timeSpent: 120,
        lastAccessed: new Date(),
        progress: 100,
        assessmentScores: [85, 90],
      };

      await analyticsEngine.trackProgress(progressData);

      const progress = analyticsEngine.getProgress(testStudentId, testCourseId);
      expect(progress.length).toBeGreaterThan(0);
      const tracked = progress.find(p => p.moduleId === 'module-1');
      expect(tracked).toBeDefined();
      expect(tracked?.completed).toBe(true);
      expect(tracked?.progress).toBe(100);
    });

    it('should update existing progress', async () => {
      await analyticsEngine.trackProgress({
        studentId: testStudentId,
        studentNumber: testStudentNumber,
        courseId: testCourseId,
        completed: false,
        timeSpent: 90,
        lastAccessed: new Date(),
        progress: 50,
      });

      const progress = analyticsEngine.getProgress(testStudentId, testCourseId);
      const updated = progress.find(p => !p.moduleId);
      expect(updated?.progress).toBe(50);
      expect(updated?.timeSpent).toBe(90);
    });
  });

  describe('getAnalytics', () => {
    it('should generate analytics for student', async () => {
      // Add more progress data
      await analyticsEngine.trackProgress({
        studentId: testStudentId,
        studentNumber: testStudentNumber,
        courseId: testCourseId,
        moduleId: 'module-1',
        completed: true,
        timeSpent: 120,
        lastAccessed: new Date(),
        progress: 100,
      });

      // Wait for analytics to update
      await new Promise(resolve => setTimeout(resolve, 200));

      const analytics = analyticsEngine.getAnalytics(testStudentId);

      expect(analytics).toBeDefined();
      expect(analytics?.studentId).toBe(testStudentId);
      expect(analytics?.courses).toBeDefined();
      expect(analytics?.overallProgress).toBeGreaterThanOrEqual(0);
      expect(analytics?.overallProgress).toBeLessThanOrEqual(100);
      expect(analytics?.strengths).toBeDefined();
      expect(analytics?.weaknesses).toBeDefined();
      expect(analytics?.recommendations).toBeDefined();
    });

    it('should return undefined for non-existent student', () => {
      const analytics = analyticsEngine.getAnalytics('non-existent');

      expect(analytics).toBeUndefined();
    });
  });

  describe('performGapAnalysis', () => {
    it('should perform gap analysis', async () => {
      // Ensure analytics exist
      await analyticsEngine.trackProgress({
        studentId: testStudentId,
        studentNumber: testStudentNumber,
        courseId: testCourseId,
        completed: true,
        timeSpent: 120,
        lastAccessed: new Date(),
        progress: 80,
      });

      await new Promise(resolve => setTimeout(resolve, 200));

      const analysis = await analyticsEngine.performGapAnalysis(testStudentId, [
        { skill: 'Mathematics', level: 90 },
        { skill: 'Programming', level: 85 },
      ]);

      expect(analysis).toBeDefined();
      expect(analysis.studentId).toBe(testStudentId);
      expect(analysis.gaps).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
      expect(analysis.priority).toBeDefined();
    });

    it('should throw error if analytics not found', async () => {
      await expect(
        analyticsEngine.performGapAnalysis('non-existent', [
          { skill: 'Test', level: 80 },
        ])
      ).rejects.toThrow('Analytics not found for student');
    });
  });

  describe('generatePredictiveInsights', () => {
    it('should generate predictive insights', async () => {
      // Create a high-performing student
      await analyticsEngine.trackProgress({
        studentId: 'high-performer',
        studentNumber: 'ASU2025008',
        courseId: testCourseId,
        completed: true,
        timeSpent: 100,
        lastAccessed: new Date(),
        progress: 95,
      });

      await new Promise(resolve => setTimeout(resolve, 200));

      const insights = analyticsEngine.generatePredictiveInsights('high-performer');

      expect(Array.isArray(insights)).toBe(true);
      insights.forEach(insight => {
        expect(insight.type).toBeDefined();
        expect(insight.studentId).toBe('high-performer');
        expect(insight.prediction).toBeDefined();
        expect(insight.confidence).toBeGreaterThanOrEqual(0);
        expect(insight.confidence).toBeLessThanOrEqual(100);
        expect(insight.factors).toBeDefined();
      });
    });

    it('should return empty array for non-existent student', () => {
      const insights = analyticsEngine.generatePredictiveInsights('non-existent');

      expect(insights).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should handle zero progress', async () => {
      await analyticsEngine.trackProgress({
        studentId: 'zero-progress',
        studentNumber: 'ASU2025009',
        courseId: testCourseId,
        completed: false,
        timeSpent: 0,
        lastAccessed: new Date(),
        progress: 0,
      });

      const analytics = analyticsEngine.getAnalytics('zero-progress');
      expect(analytics?.overallProgress).toBe(0);
    });

    it('should handle multiple courses', async () => {
      await analyticsEngine.trackProgress({
        studentId: 'multi-course',
        studentNumber: 'ASU2025010',
        courseId: 'course-1',
        completed: true,
        timeSpent: 100,
        lastAccessed: new Date(),
        progress: 100,
      });

      await analyticsEngine.trackProgress({
        studentId: 'multi-course',
        studentNumber: 'ASU2025010',
        courseId: 'course-2',
        completed: false,
        timeSpent: 50,
        lastAccessed: new Date(),
        progress: 50,
      });

      await new Promise(resolve => setTimeout(resolve, 200));

      const analytics = analyticsEngine.getAnalytics('multi-course');
      expect(analytics?.courses.length).toBe(2);
      expect(analytics?.overallProgress).toBe(75); // Average of 100 and 50
    });
  });
});
