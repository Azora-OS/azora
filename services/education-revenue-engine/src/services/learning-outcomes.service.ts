import { prisma } from '../index';
import { LearningAnalytics, LearningOutcome } from '../types';
import { logger } from '../utils/logger';

export class LearningOutcomesService {
  /**
   * Get comprehensive learning analytics for a student in a specific course
   */
  async getStudentCourseAnalytics(studentId: string, courseId: string): Promise<LearningAnalytics> {
    try {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          studentId,
          courseId,
        },
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
        where: {
          enrollmentId: enrollment.id,
          courseId,
        },
      });

      // Calculate completion rate
      const totalModules = enrollment.course.modules.length;
      const completedModules = new Set(outcomes.map(o => o.moduleId)).size;
      const completionRate = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

      // Calculate assessment scores
      const assessmentScores = outcomes.map(o => o.assessmentScore);
      const averageScore = assessmentScores.length > 0
        ? assessmentScores.reduce((a, b) => a + b, 0) / assessmentScores.length
        : 0;

      // Calculate time to mastery (in hours)
      const totalTimeSpent = outcomes.reduce((sum, o) => sum + o.timeSpent, 0);
      const timeToMastery = totalTimeSpent / 3600; // convert seconds to hours

      // Categorize concepts based on mastery
      const conceptsMastered: string[] = [];
      const conceptsInProgress: string[] = [];
      const conceptsStruggling: string[] = [];

      outcomes.forEach(outcome => {
        const moduleName = `Module ${outcome.moduleId}`;
        if (outcome.conceptMastery >= 80) {
          conceptsMastered.push(moduleName);
        } else if (outcome.conceptMastery >= 50) {
          conceptsInProgress.push(moduleName);
        } else {
          conceptsStruggling.push(moduleName);
        }
      });

      // Build skill proficiency map
      const skillProficiency = new Map<string, number>();
      outcomes.forEach(outcome => {
        const skillKey = `Module ${outcome.moduleId}`;
        skillProficiency.set(skillKey, outcome.conceptMastery);
      });

      return {
        studentId,
        courseId,
        completionRate,
        timeToMastery,
        skillProficiency,
        assessmentScores,
        averageScore,
        conceptsMastered: [...new Set(conceptsMastered)],
        conceptsInProgress: [...new Set(conceptsInProgress)],
        conceptsStruggling: [...new Set(conceptsStruggling)],
      };
    } catch (error) {
      logger.error('Error getting student course analytics:', error);
      throw error;
    }
  }

  /**
   * Get learning analytics for all courses a student is enrolled in
   */
  async getStudentOverallAnalytics(studentId: string): Promise<{
    totalCourses: number;
    completedCourses: number;
    activeCourses: number;
    averageCompletionRate: number;
    averageScore: number;
    totalTimeSpent: number;
    courseAnalytics: LearningAnalytics[];
  }> {
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId },
        include: {
          course: {
            include: {
              modules: true,
            },
          },
        },
      });

      const courseAnalytics: LearningAnalytics[] = [];
      let totalCompletionRate = 0;
      let totalScore = 0;
      let totalTimeSpent = 0;
      let scoreCount = 0;

      for (const enrollment of enrollments) {
        const analytics = await this.getStudentCourseAnalytics(studentId, enrollment.courseId);
        courseAnalytics.push(analytics);
        totalCompletionRate += analytics.completionRate;
        totalScore += analytics.averageScore;
        totalTimeSpent += analytics.timeToMastery * 3600; // convert back to seconds
        scoreCount++;
      }

      const completedCourses = enrollments.filter(e => e.status === 'completed').length;
      const activeCourses = enrollments.filter(e => e.status === 'active').length;

      return {
        totalCourses: enrollments.length,
        completedCourses,
        activeCourses,
        averageCompletionRate: enrollments.length > 0 ? totalCompletionRate / enrollments.length : 0,
        averageScore: scoreCount > 0 ? totalScore / scoreCount : 0,
        totalTimeSpent,
        courseAnalytics,
      };
    } catch (error) {
      logger.error('Error getting student overall analytics:', error);
      throw error;
    }
  }

  /**
   * Get learning outcomes for a specific course
   */
  async getCourseOutcomes(courseId: string): Promise<LearningOutcome[]> {
    try {
      const outcomes = await prisma.learningOutcome.findMany({
        where: { courseId },
        orderBy: { completedAt: 'desc' },
      });

      return outcomes as LearningOutcome[];
    } catch (error) {
      logger.error('Error getting course outcomes:', error);
      throw error;
    }
  }

  /**
   * Get learning outcomes for a specific enrollment
   */
  async getEnrollmentOutcomes(enrollmentId: string): Promise<LearningOutcome[]> {
    try {
      const outcomes = await prisma.learningOutcome.findMany({
        where: { enrollmentId },
        orderBy: { completedAt: 'asc' },
      });

      return outcomes as LearningOutcome[];
    } catch (error) {
      logger.error('Error getting enrollment outcomes:', error);
      throw error;
    }
  }

  /**
   * Calculate completion rate for a course
   */
  async calculateCourseCompletionRate(courseId: string): Promise<{
    completionRate: number;
    totalEnrollments: number;
    completedEnrollments: number;
  }> {
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: { courseId },
      });

      const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;
      const completionRate = enrollments.length > 0
        ? (completedEnrollments / enrollments.length) * 100
        : 0;

      return {
        completionRate,
        totalEnrollments: enrollments.length,
        completedEnrollments,
      };
    } catch (error) {
      logger.error('Error calculating course completion rate:', error);
      throw error;
    }
  }

  /**
   * Calculate average time to mastery for a course
   */
  async calculateCourseTimeToMastery(courseId: string): Promise<{
    averageTimeToMastery: number; // in hours
    medianTimeToMastery: number; // in hours
    minTime: number; // in hours
    maxTime: number; // in hours
  }> {
    try {
      const outcomes = await prisma.learningOutcome.findMany({
        where: { courseId },
      });

      if (outcomes.length === 0) {
        return {
          averageTimeToMastery: 0,
          medianTimeToMastery: 0,
          minTime: 0,
          maxTime: 0,
        };
      }

      // Group by enrollment to get total time per student
      const enrollmentTimes = new Map<string, number>();
      outcomes.forEach(outcome => {
        const current = enrollmentTimes.get(outcome.enrollmentId) || 0;
        enrollmentTimes.set(outcome.enrollmentId, current + outcome.timeSpent);
      });

      const times = Array.from(enrollmentTimes.values()).map(t => t / 3600); // convert to hours
      times.sort((a, b) => a - b);

      const averageTimeToMastery = times.reduce((a, b) => a + b, 0) / times.length;
      const medianTimeToMastery = times[Math.floor(times.length / 2)];
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);

      return {
        averageTimeToMastery,
        medianTimeToMastery,
        minTime,
        maxTime,
      };
    } catch (error) {
      logger.error('Error calculating course time to mastery:', error);
      throw error;
    }
  }

  /**
   * Calculate average assessment score for a course
   */
  async calculateCourseAverageScore(courseId: string): Promise<{
    averageScore: number;
    medianScore: number;
    minScore: number;
    maxScore: number;
    passRate: number; // percentage of students with score >= 70
  }> {
    try {
      const outcomes = await prisma.learningOutcome.findMany({
        where: { courseId },
      });

      if (outcomes.length === 0) {
        return {
          averageScore: 0,
          medianScore: 0,
          minScore: 0,
          maxScore: 0,
          passRate: 0,
        };
      }

      const scores = outcomes.map(o => o.assessmentScore).sort((a, b) => a - b);
      const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const medianScore = scores[Math.floor(scores.length / 2)];
      const minScore = Math.min(...scores);
      const maxScore = Math.max(...scores);
      const passRate = (scores.filter(s => s >= 70).length / scores.length) * 100;

      return {
        averageScore,
        medianScore,
        minScore,
        maxScore,
        passRate,
      };
    } catch (error) {
      logger.error('Error calculating course average score:', error);
      throw error;
    }
  }

  /**
   * Identify at-risk students in a course (low completion or low scores)
   */
  async identifyAtRiskStudents(courseId: string, scoreThreshold: number = 50): Promise<{
    atRiskStudents: Array<{
      studentId: string;
      enrollmentId: string;
      averageScore: number;
      completionRate: number;
      riskFactors: string[];
    }>;
  }> {
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: { courseId },
        include: {
          course: {
            include: {
              modules: true,
            },
          },
        },
      });

      const atRiskStudents = [];

      for (const enrollment of enrollments) {
        const outcomes = await prisma.learningOutcome.findMany({
          where: { enrollmentId: enrollment.id },
        });

        if (outcomes.length === 0) {continue;}

        const totalModules = enrollment.course.modules.length;
        const completedModules = new Set(outcomes.map(o => o.moduleId)).size;
        const completionRate = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
        const averageScore = outcomes.reduce((sum, o) => sum + o.assessmentScore, 0) / outcomes.length;

        const riskFactors: string[] = [];
        if (averageScore < scoreThreshold) {
          riskFactors.push(`Low average score: ${averageScore.toFixed(2)}`);
        }
        if (completionRate < 50) {
          riskFactors.push(`Low completion rate: ${completionRate.toFixed(2)}%`);
        }

        if (riskFactors.length > 0) {
          atRiskStudents.push({
            studentId: enrollment.studentId,
            enrollmentId: enrollment.id,
            averageScore,
            completionRate,
            riskFactors,
          });
        }
      }

      return { atRiskStudents };
    } catch (error) {
      logger.error('Error identifying at-risk students:', error);
      throw error;
    }
  }

  /**
   * Get skill proficiency distribution for a course
   */
  async getSkillProficiencyDistribution(courseId: string): Promise<{
    proficiencyLevels: {
      mastered: number; // >= 80
      proficient: number; // 60-79
      developing: number; // 40-59
      beginning: number; // < 40
    };
    totalAssessments: number;
  }> {
    try {
      const outcomes = await prisma.learningOutcome.findMany({
        where: { courseId },
      });

      const proficiencyLevels = {
        mastered: 0,
        proficient: 0,
        developing: 0,
        beginning: 0,
      };

      outcomes.forEach(outcome => {
        if (outcome.conceptMastery >= 80) {
          proficiencyLevels.mastered++;
        } else if (outcome.conceptMastery >= 60) {
          proficiencyLevels.proficient++;
        } else if (outcome.conceptMastery >= 40) {
          proficiencyLevels.developing++;
        } else {
          proficiencyLevels.beginning++;
        }
      });

      return {
        proficiencyLevels,
        totalAssessments: outcomes.length,
      };
    } catch (error) {
      logger.error('Error getting skill proficiency distribution:', error);
      throw error;
    }
  }

  /**
   * Get module-level analytics for a course
   */
  async getModuleAnalytics(courseId: string): Promise<Array<{
    moduleId: string;
    moduleName: string;
    totalAttempts: number;
    averageScore: number;
    completionRate: number;
    averageTimeSpent: number; // in minutes
  }>> {
    try {
      const modules = await prisma.module.findMany({
        where: { courseId },
      });

      const moduleAnalytics = [];

      for (const module of modules) {
        const outcomes = await prisma.learningOutcome.findMany({
          where: {
            courseId,
            moduleId: module.id,
          },
        });

        if (outcomes.length === 0) {
          moduleAnalytics.push({
            moduleId: module.id,
            moduleName: module.title,
            totalAttempts: 0,
            averageScore: 0,
            completionRate: 0,
            averageTimeSpent: 0,
          });
          continue;
        }

        const averageScore = outcomes.reduce((sum, o) => sum + o.assessmentScore, 0) / outcomes.length;
        const averageTimeSpent = (outcomes.reduce((sum, o) => sum + o.timeSpent, 0) / outcomes.length) / 60; // convert to minutes

        // Get unique students who completed this module
        const uniqueStudents = new Set(outcomes.map(o => o.enrollmentId)).size;
        const totalEnrollments = await prisma.enrollment.count({
          where: { courseId },
        });
        const completionRate = totalEnrollments > 0 ? (uniqueStudents / totalEnrollments) * 100 : 0;

        moduleAnalytics.push({
          moduleId: module.id,
          moduleName: module.title,
          totalAttempts: outcomes.length,
          averageScore,
          completionRate,
          averageTimeSpent,
        });
      }

      return moduleAnalytics;
    } catch (error) {
      logger.error('Error getting module analytics:', error);
      throw error;
    }
  }
}

export const learningOutcomesService = new LearningOutcomesService();
