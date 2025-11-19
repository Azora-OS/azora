import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class OutcomeValidationService {
  async validateOutcomes(courseId: string) {
    try {
      const outcomes = await prisma.learningOutcome.findMany({ where: { courseId } });
      const enrollments = await prisma.enrollment.findMany({ where: { courseId } });

      const avgScore = outcomes.length > 0
        ? outcomes.reduce((sum, o) => sum + o.assessmentScore, 0) / outcomes.length
        : 0;

      const completionRate = enrollments.length > 0
        ? (enrollments.filter(e => e.status === 'completed').length / enrollments.length) * 100
        : 0;

      const issues: string[] = [];
      if (completionRate < 50) issues.push('Low completion rate');
      if (avgScore < 70) issues.push('Low average scores');

      logger.info('Outcomes validated', { courseId });
      return { courseId, avgScore, completionRate, issues, flagged: issues.length > 0 };
    } catch (error) {
      logger.error('Error validating outcomes', { error, courseId });
      throw error;
    }
  }

  async recommendImprovements(courseId: string): Promise<string[]> {
    try {
      const validation = await this.validateOutcomes(courseId);
      const recommendations: string[] = [];

      if (validation.issues.some(i => i.includes('completion'))) {
        recommendations.push('Review course difficulty and pacing');
        recommendations.push('Add more interactive content');
      }
      if (validation.issues.some(i => i.includes('scores'))) {
        recommendations.push('Clarify learning objectives');
        recommendations.push('Provide more practice exercises');
      }

      logger.info('Improvements recommended', { courseId });
      return recommendations;
    } catch (error) {
      logger.error('Error recommending improvements', { error, courseId });
      throw error;
    }
  }
}

export const outcomeValidationService = new OutcomeValidationService();
