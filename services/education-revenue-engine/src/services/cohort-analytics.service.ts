import { prisma } from '../index';
import { CohortAnalytics, DemographicData } from '../types';
import { logger } from '../utils/logger';

export class CohortAnalyticsService {
  /**
   * Get comprehensive cohort analytics for a course
   */
  async getCohortAnalytics(courseId: string, period?: string): Promise<CohortAnalytics> {
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: { courseId },
        include: {
          student: true,
        },
      });

      if (enrollments.length === 0) {
        return {
          courseId,
          period: period || new Date().toISOString().slice(0, 7),
          totalEnrollments: 0,
          completionRate: 0,
          averageScore: 0,
          timeToCompletion: 0,
          demographicBreakdown: [],
          riskStudents: [],
        };
      }

      // Calculate completion rate
      const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;
      const completionRate = (completedEnrollments / enrollments.length) * 100;

      // Get all outcomes for the course
      const outcomes = await prisma.learningOutcome.findMany({
        where: { courseId },
      });

      // Calculate average score
      const averageScore = outcomes.length > 0
        ? outcomes.reduce((sum, o) => sum + o.assessmentScore, 0) / outcomes.length
        : 0;

      // Calculate time to completion (in hours)
      const enrollmentTimes = new Map<string, number>();
      outcomes.forEach(outcome => {
        const current = enrollmentTimes.get(outcome.enrollmentId) || 0;
        enrollmentTimes.set(outcome.enrollmentId, current + outcome.timeSpent);
      });

      const times = Array.from(enrollmentTimes.values());
      const timeToCompletion = times.length > 0
        ? (times.reduce((a, b) => a + b, 0) / times.length) / 3600
        : 0;

      // Identify at-risk students
      const riskStudents = await this.identifyRiskStudents(courseId);

      // Get demographic breakdown
      const demographicBreakdown = await this.getDemographicBreakdown(courseId);

      return {
        courseId,
        period: period || new Date().toISOString().slice(0, 7),
        totalEnrollments: enrollments.length,
        completionRate,
        averageScore,
        timeToCompletion,
        demographicBreakdown,
        riskStudents,
      };
    } catch (error) {
      logger.error('Error getting cohort analytics:', error);
      throw error;
    }
  }

  /**
   * Get cohort analytics for a specific time period
   */
  async getCohortAnalyticsByPeriod(courseId: string, period: string): Promise<CohortAnalytics> {
    try {
      // Parse period (YYYY-MM format)
      const [year, month] = period.split('-');
      const startDate = new Date(`${year}-${month}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      const enrollments = await prisma.enrollment.findMany({
        where: {
          courseId,
          startDate: {
            gte: startDate,
            lt: endDate,
          },
        },
        include: {
          student: true,
        },
      });

      if (enrollments.length === 0) {
        return {
          courseId,
          period,
          totalEnrollments: 0,
          completionRate: 0,
          averageScore: 0,
          timeToCompletion: 0,
          demographicBreakdown: [],
          riskStudents: [],
        };
      }

      // Calculate completion rate
      const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;
      const completionRate = (completedEnrollments / enrollments.length) * 100;

      // Get outcomes for enrollments in this period
      const enrollmentIds = enrollments.map(e => e.id);
      const outcomes = await prisma.learningOutcome.findMany({
        where: {
          enrollmentId: {
            in: enrollmentIds,
          },
        },
      });

      // Calculate average score
      const averageScore = outcomes.length > 0
        ? outcomes.reduce((sum, o) => sum + o.assessmentScore, 0) / outcomes.length
        : 0;

      // Calculate time to completion
      const enrollmentTimes = new Map<string, number>();
      outcomes.forEach(outcome => {
        const current = enrollmentTimes.get(outcome.enrollmentId) || 0;
        enrollmentTimes.set(outcome.enrollmentId, current + outcome.timeSpent);
      });

      const times = Array.from(enrollmentTimes.values());
      const timeToCompletion = times.length > 0
        ? (times.reduce((a, b) => a + b, 0) / times.length) / 3600
        : 0;

      // Identify at-risk students in this period
      const riskStudents = await this.identifyRiskStudentsInPeriod(courseId, period);

      // Get demographic breakdown for this period
      const demographicBreakdown = await this.getDemographicBreakdownForPeriod(courseId, period);

      return {
        courseId,
        period,
        totalEnrollments: enrollments.length,
        completionRate,
        averageScore,
        timeToCompletion,
        demographicBreakdown,
        riskStudents,
      };
    } catch (error) {
      logger.error('Error getting cohort analytics by period:', error);
      throw error;
    }
  }

  /**
   * Get demographic breakdown for a course
   */
  private async getDemographicBreakdown(courseId: string): Promise<DemographicData[]> {
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: { courseId },
        include: {
          student: true,
        },
      });

      if (enrollments.length === 0) {
        return [];
      }

      // Group by tier (demographic category)
      const tierGroups = new Map<string, typeof enrollments>();
      enrollments.forEach(enrollment => {
        const tier = enrollment.tier;
        if (!tierGroups.has(tier)) {
          tierGroups.set(tier, []);
        }
        tierGroups.get(tier)!.push(enrollment);
      });

      const demographicData: DemographicData[] = [];

      for (const [tier, tierEnrollments] of tierGroups) {
        const completedCount = tierEnrollments.filter(e => e.status === 'completed').length;
        const completionRate = (completedCount / tierEnrollments.length) * 100;

        // Get outcomes for this tier
        const enrollmentIds = tierEnrollments.map(e => e.id);
        const outcomes = await prisma.learningOutcome.findMany({
          where: {
            enrollmentId: {
              in: enrollmentIds,
            },
          },
        });

        const averageScore = outcomes.length > 0
          ? outcomes.reduce((sum, o) => sum + o.assessmentScore, 0) / outcomes.length
          : 0;

        demographicData.push({
          category: 'tier',
          value: tier,
          count: tierEnrollments.length,
          completionRate,
          averageScore,
        });
      }

      return demographicData;
    } catch (error) {
      logger.error('Error getting demographic breakdown:', error);
      throw error;
    }
  }

  /**
   * Get demographic breakdown for a specific period
   */
  private async getDemographicBreakdownForPeriod(
    courseId: string,
    period: string
  ): Promise<DemographicData[]> {
    try {
      const [year, month] = period.split('-');
      const startDate = new Date(`${year}-${month}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      const enrollments = await prisma.enrollment.findMany({
        where: {
          courseId,
          startDate: {
            gte: startDate,
            lt: endDate,
          },
        },
        include: {
          student: true,
        },
      });

      if (enrollments.length === 0) {
        return [];
      }

      // Group by tier
      const tierGroups = new Map<string, typeof enrollments>();
      enrollments.forEach(enrollment => {
        const tier = enrollment.tier;
        if (!tierGroups.has(tier)) {
          tierGroups.set(tier, []);
        }
        tierGroups.get(tier)!.push(enrollment);
      });

      const demographicData: DemographicData[] = [];

      for (const [tier, tierEnrollments] of tierGroups) {
        const completedCount = tierEnrollments.filter(e => e.status === 'completed').length;
        const completionRate = (completedCount / tierEnrollments.length) * 100;

        const enrollmentIds = tierEnrollments.map(e => e.id);
        const outcomes = await prisma.learningOutcome.findMany({
          where: {
            enrollmentId: {
              in: enrollmentIds,
            },
          },
        });

        const averageScore = outcomes.length > 0
          ? outcomes.reduce((sum, o) => sum + o.assessmentScore, 0) / outcomes.length
          : 0;

        demographicData.push({
          category: 'tier',
          value: tier,
          count: tierEnrollments.length,
          completionRate,
          averageScore,
        });
      }

      return demographicData;
    } catch (error) {
      logger.error('Error getting demographic breakdown for period:', error);
      throw error;
    }
  }

  /**
   * Identify at-risk students in a course
   */
  private async identifyRiskStudents(courseId: string): Promise<string[]> {
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: { courseId },
      });

      const riskStudents: string[] = [];

      for (const enrollment of enrollments) {
        const outcomes = await prisma.learningOutcome.findMany({
          where: { enrollmentId: enrollment.id },
        });

        if (outcomes.length === 0) continue;

        const averageScore = outcomes.reduce((sum, o) => sum + o.assessmentScore, 0) / outcomes.length;

        // Consider at-risk if average score < 50 or completion < 50%
        if (averageScore < 50 || enrollment.progress < 50) {
          riskStudents.push(enrollment.studentId);
        }
      }

      return [...new Set(riskStudents)]; // Remove duplicates
    } catch (error) {
      logger.error('Error identifying risk students:', error);
      throw error;
    }
  }

  /**
   * Identify at-risk students in a specific period
   */
  private async identifyRiskStudentsInPeriod(courseId: string, period: string): Promise<string[]> {
    try {
      const [year, month] = period.split('-');
      const startDate = new Date(`${year}-${month}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      const enrollments = await prisma.enrollment.findMany({
        where: {
          courseId,
          startDate: {
            gte: startDate,
            lt: endDate,
          },
        },
      });

      const riskStudents: string[] = [];

      for (const enrollment of enrollments) {
        const outcomes = await prisma.learningOutcome.findMany({
          where: { enrollmentId: enrollment.id },
        });

        if (outcomes.length === 0) continue;

        const averageScore = outcomes.reduce((sum, o) => sum + o.assessmentScore, 0) / outcomes.length;

        if (averageScore < 50 || enrollment.progress < 50) {
          riskStudents.push(enrollment.studentId);
        }
      }

      return [...new Set(riskStudents)];
    } catch (error) {
      logger.error('Error identifying risk students in period:', error);
      throw error;
    }
  }

  /**
   * Compare cohort performance across multiple periods
   */
  async compareCohortPerformance(
    courseId: string,
    periods: string[]
  ): Promise<Array<CohortAnalytics>> {
    try {
      const results: CohortAnalytics[] = [];

      for (const period of periods) {
        const analytics = await this.getCohortAnalyticsByPeriod(courseId, period);
        results.push(analytics);
      }

      return results;
    } catch (error) {
      logger.error('Error comparing cohort performance:', error);
      throw error;
    }
  }

  /**
   * Get cohort performance trends over time
   */
  async getCohortPerformanceTrends(
    courseId: string,
    monthsBack: number = 12
  ): Promise<Array<{
    period: string;
    completionRate: number;
    averageScore: number;
    totalEnrollments: number;
  }>> {
    try {
      const trends = [];
      const now = new Date();

      for (let i = monthsBack - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const period = date.toISOString().slice(0, 7);

        const analytics = await this.getCohortAnalyticsByPeriod(courseId, period);

        trends.push({
          period,
          completionRate: analytics.completionRate,
          averageScore: analytics.averageScore,
          totalEnrollments: analytics.totalEnrollments,
        });
      }

      return trends;
    } catch (error) {
      logger.error('Error getting cohort performance trends:', error);
      throw error;
    }
  }

  /**
   * Get cohort segmentation by performance level
   */
  async getCohortSegmentation(courseId: string): Promise<{
    highPerformers: number; // >= 80
    proficient: number; // 60-79
    developing: number; // 40-59
    struggling: number; // < 40
    totalStudents: number;
  }> {
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: { courseId },
      });

      const segmentation = {
        highPerformers: 0,
        proficient: 0,
        developing: 0,
        struggling: 0,
        totalStudents: enrollments.length,
      };

      for (const enrollment of enrollments) {
        const outcomes = await prisma.learningOutcome.findMany({
          where: { enrollmentId: enrollment.id },
        });

        if (outcomes.length === 0) continue;

        const averageScore = outcomes.reduce((sum, o) => sum + o.assessmentScore, 0) / outcomes.length;

        if (averageScore >= 80) {
          segmentation.highPerformers++;
        } else if (averageScore >= 60) {
          segmentation.proficient++;
        } else if (averageScore >= 40) {
          segmentation.developing++;
        } else {
          segmentation.struggling++;
        }
      }

      return segmentation;
    } catch (error) {
      logger.error('Error getting cohort segmentation:', error);
      throw error;
    }
  }

  /**
   * Get cohort retention metrics
   */
  async getCohortRetention(courseId: string): Promise<{
    totalEnrolled: number;
    stillActive: number;
    completed: number;
    dropped: number;
    retentionRate: number;
    completionRate: number;
  }> {
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: { courseId },
      });

      const stillActive = enrollments.filter(e => e.status === 'active').length;
      const completed = enrollments.filter(e => e.status === 'completed').length;
      const dropped = enrollments.filter(e => e.status === 'dropped').length;

      const retentionRate = enrollments.length > 0
        ? ((stillActive + completed) / enrollments.length) * 100
        : 0;

      const completionRate = enrollments.length > 0
        ? (completed / enrollments.length) * 100
        : 0;

      return {
        totalEnrolled: enrollments.length,
        stillActive,
        completed,
        dropped,
        retentionRate,
        completionRate,
      };
    } catch (error) {
      logger.error('Error getting cohort retention:', error);
      throw error;
    }
  }

  /**
   * Get learning velocity (progress over time)
   */
  async getLearningVelocity(courseId: string): Promise<{
    averageModulesPerWeek: number;
    averageAssessmentsPerWeek: number;
    averageTimePerModule: number; // in minutes
  }> {
    try {
      const outcomes = await prisma.learningOutcome.findMany({
        where: { courseId },
      });

      if (outcomes.length === 0) {
        return {
          averageModulesPerWeek: 0,
          averageAssessmentsPerWeek: 0,
          averageTimePerModule: 0,
        };
      }

      // Calculate time span
      const dates = outcomes.map(o => o.completedAt.getTime());
      const minDate = Math.min(...dates);
      const maxDate = Math.max(...dates);
      const weekSpan = (maxDate - minDate) / (1000 * 60 * 60 * 24 * 7);

      // Count unique modules and assessments
      const uniqueModules = new Set(outcomes.map(o => o.moduleId)).size;
      const totalAssessments = outcomes.length;

      // Calculate average time per module
      const totalTime = outcomes.reduce((sum, o) => sum + o.timeSpent, 0);
      const averageTimePerModule = uniqueModules > 0 ? (totalTime / uniqueModules) / 60 : 0; // convert to minutes

      return {
        averageModulesPerWeek: weekSpan > 0 ? uniqueModules / weekSpan : 0,
        averageAssessmentsPerWeek: weekSpan > 0 ? totalAssessments / weekSpan : 0,
        averageTimePerModule,
      };
    } catch (error) {
      logger.error('Error getting learning velocity:', error);
      throw error;
    }
  }
}

export const cohortAnalyticsService = new CohortAnalyticsService();
