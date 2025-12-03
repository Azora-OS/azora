import { prisma } from '../index';
import { LearningOutcome } from '../types';
import { logger } from '../utils/logger';

export class ProgressService {
  async recordOutcome(data: {
    enrollmentId: string;
    courseId: string;
    moduleId: string;
    assessmentScore: number;
    timeSpent: number;
  }): Promise<LearningOutcome> {
    try {
      const outcome = await prisma.learningOutcome.create({
        data: {
          enrollmentId: data.enrollmentId,
          courseId: data.courseId,
          moduleId: data.moduleId,
          assessmentScore: data.assessmentScore,
          timeSpent: data.timeSpent,
          conceptMastery: Math.min(data.assessmentScore, 100),
        },
      });

      logger.info(`Learning outcome recorded: ${outcome.id}`);
      return outcome as LearningOutcome;
    } catch (error) {
      logger.error('Error recording learning outcome:', error);
      throw error;
    }
  }

  async getEnrollmentProgress(enrollmentId: string): Promise<{
    enrollment: any;
    outcomes: LearningOutcome[];
    completionRate: number;
    averageScore: number;
    timeSpent: number;
  }> {
    try {
      const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: {
          course: {
            include: {
              modules: true,
            },
          },
        },
      });

      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      const outcomes = await prisma.learningOutcome.findMany({
        where: { enrollmentId },
      });

      const totalModules = enrollment.course.modules.length;
      const completedModules = new Set(outcomes.map(o => o.moduleId)).size;
      const completionRate = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
      const averageScore = outcomes.length > 0
        ? outcomes.reduce((sum, o) => sum + o.assessmentScore, 0) / outcomes.length
        : 0;
      const timeSpent = outcomes.reduce((sum, o) => sum + o.timeSpent, 0);

      return {
        enrollment,
        outcomes: outcomes as LearningOutcome[],
        completionRate,
        averageScore,
        timeSpent,
      };
    } catch (error) {
      logger.error('Error getting enrollment progress:', error);
      throw error;
    }
  }

  async getStudentProgress(studentId: string): Promise<{
    enrollments: any[];
    totalCourses: number;
    completedCourses: number;
    averageScore: number;
    totalTimeSpent: number;
  }> {
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId },
        include: {
          course: true,
          outcomes: true,
        },
      });

      const completedCourses = enrollments.filter(e => e.status === 'completed').length;
      const allOutcomes = enrollments.flatMap(e => e.outcomes);
      const averageScore = allOutcomes.length > 0
        ? allOutcomes.reduce((sum, o) => sum + o.assessmentScore, 0) / allOutcomes.length
        : 0;
      const totalTimeSpent = allOutcomes.reduce((sum, o) => sum + o.timeSpent, 0);

      return {
        enrollments,
        totalCourses: enrollments.length,
        completedCourses,
        averageScore,
        totalTimeSpent,
      };
    } catch (error) {
      logger.error('Error getting student progress:', error);
      throw error;
    }
  }

  async identifyStruggling(enrollmentId: string, threshold: number = 50): Promise<{
    isStruggling: boolean;
    averageScore: number;
    strugglingConcepts: string[];
  }> {
    try {
      const outcomes = await prisma.learningOutcome.findMany({
        where: { enrollmentId },
      });

      const averageScore = outcomes.length > 0
        ? outcomes.reduce((sum, o) => sum + o.assessmentScore, 0) / outcomes.length
        : 0;

      const strugglingConcepts = outcomes
        .filter(o => o.assessmentScore < threshold)
        .map(o => `Module ${o.moduleId}`);

      return {
        isStruggling: averageScore < threshold,
        averageScore,
        strugglingConcepts,
      };
    } catch (error) {
      logger.error('Error identifying struggling student:', error);
      throw error;
    }
  }
}

export const progressService = new ProgressService();
