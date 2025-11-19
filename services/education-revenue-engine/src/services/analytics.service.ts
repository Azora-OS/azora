import { prisma } from '../index';
import { LearningAnalytics, CohortAnalytics } from '../types';
import { logger } from '../utils/logger';

export class AnalyticsService {
  async getLearningAnalytics(studentId: string, courseId: string): Promise<LearningAnalytics> {
    try {
      const outcomes = await prisma.learningOutcome.findMany({
        where: {
          enrollment: {
            studentId,
            courseId,
          },
        },
      });

      const assessmentScores = outcomes.map(o => o.assessmentScore);
      const averageScore = assessmentScores.length > 0
        ? assessmentScores.reduce((a, b) => a + b, 0) / assessmentScores.length
        : 0;

      const enrollment = await prisma.enrollment.findFirst({
        where: { studentId, courseId },
      });

      const completionRate = enrollment?.progress || 0;

      // Simulate concept mastery tracking
      const conceptsMastered = outcomes
        .filter(o => o.conceptMastery >= 80)
        .map((_, i) => `Concept ${i + 1}`);

      const conceptsInProgress = outcomes
        .filter(o => o.conceptMastery >= 50 && o.conceptMastery < 80)
        .map((_, i) => `Concept ${i + 1}`);

      const conceptsStruggling = outcomes
        .filter(o => o.conceptMastery < 50)
        .map((_, i) => `Concept ${i + 1}`);

      const totalTimeSpent = outcomes.reduce((sum, o) => sum + o.timeSpent, 0);
      const timeToMastery = totalTimeSpent / 3600; // Convert to hours

      return {
        studentId,
        courseId,
        completionRate,
        timeToMastery,
        skillProficiency: new Map(),
        assessmentScores,
        averageScore: Math.round(averageScore * 100) / 100,
        conceptsMastered,
        conceptsInProgress,
        conceptsStruggling,
      };
    } catch (error) {
      logger.error('Error getting learning analytics:', error);
      throw error;
    }
  }

  async getCohortAnalytics(courseId: string, period?: string): Promise<CohortAnalytics> {
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: { courseId },
        include: {
          student: true,
          outcomes: true,
        },
      });

      const totalEnrollments = enrollments.length;
      const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;
      const completionRate = totalEnrollments > 0
        ? (completedEnrollments / totalEnrollments) * 100
        : 0;

      const allOutcomes = enrollments.flatMap(e => e.outcomes);
      const assessmentScores = allOutcomes.map(o => o.assessmentScore);
      const averageScore = assessmentScores.length > 0
        ? assessmentScores.reduce((a, b) => a + b, 0) / assessmentScores.length
        : 0;

      const totalTimeSpent = allOutcomes.reduce((sum, o) => sum + o.timeSpent, 0);
      const timeToCompletion = totalTimeSpent / 3600; // Convert to hours

      // Identify at-risk students (progress < 30%)
      const riskStudents = enrollments
        .filter(e => e.progress < 30 && e.status === 'active')
        .map(e => e.studentId);

      return {
        courseId,
        period: period || new Date().toISOString().slice(0, 7),
        totalEnrollments,
        completionRate: Math.round(completionRate * 100) / 100,
        averageScore: Math.round(averageScore * 100) / 100,
        timeToCompletion,
        demographicBreakdown: [],
        riskStudents,
      };
    } catch (error) {
      logger.error('Error getting cohort analytics:', error);
      throw error;
    }
  }

  async getStudentAtRiskList(courseId: string): Promise<string[]> {
    try {
      const atRiskEnrollments = await prisma.enrollment.findMany({
        where: {
          courseId,
          status: 'active',
          progress: { lt: 30 },
        },
        select: { studentId: true },
      });

      return atRiskEnrollments.map(e => e.studentId);
    } catch (error) {
      logger.error('Error getting at-risk students:', error);
      throw error;
    }
  }

  async getConversionFunnel(): Promise<any> {
    try {
      const freeUsers = await prisma.user.count({ where: { tier: 'free' } });
      const premiumUsers = await prisma.user.count({ where: { tier: 'premium' } });
      const proUsers = await prisma.user.count({ where: { tier: 'pro' } });

      const freeToPremiumpct = freeUsers > 0 ? (premiumUsers / freeUsers) * 100 : 0;
      const premiumToProPct = premiumUsers > 0 ? (proUsers / premiumUsers) * 100 : 0;

      return {
        freeUsers,
        premiumUsers,
        proUsers,
        freeToPremiumpct: Math.round(freeToPremiumpct * 100) / 100,
        premiumToProPct: Math.round(premiumToProPct * 100) / 100,
      };
    } catch (error) {
      logger.error('Error getting conversion funnel:', error);
      throw error;
    }
  }

  async getLifetimeValue(studentId: string): Promise<number> {
    try {
      const payments = await prisma.payment.findMany({
        where: {
          studentId,
          status: 'completed',
        },
      });

      const totalValue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
      return Math.round(totalValue * 100) / 100;
    } catch (error) {
      logger.error('Error calculating lifetime value:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
