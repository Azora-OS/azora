import { prisma } from '../index';
import { logger } from '../utils/logger';
import Joi from 'joi';

const assessmentSubmissionSchema = Joi.object({
  enrollmentId: Joi.string().required(),
  assessmentId: Joi.string().required(),
  answers: Joi.array().items(Joi.string()).required(),
  timeSpent: Joi.number().required().min(0),
});

export class AssessmentService {
  async submitAssessment(data: any): Promise<{
    score: number;
    passed: boolean;
    feedback: string;
    outcome: any;
  }> {
    try {
      const { error, value } = assessmentSubmissionSchema.validate(data);
      if (error) {
        throw new Error(`Validation error: ${error.message}`);
      }

      // Get assessment
      const assessment = await prisma.assessment.findUnique({
        where: { id: value.assessmentId },
        include: {
          module: true,
          course: true,
        },
      });

      if (!assessment) {
        throw new Error('Assessment not found');
      }

      // Get enrollment
      const enrollment = await prisma.enrollment.findUnique({
        where: { id: value.enrollmentId },
      });

      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      // Calculate score (simple: percentage of correct answers)
      // In production, would use more sophisticated grading
      const score = Math.round((value.answers.length / assessment.questions.length) * 100);
      const passed = score >= assessment.passingScore;

      // Record learning outcome
      const outcome = await prisma.learningOutcome.create({
        data: {
          enrollmentId: value.enrollmentId,
          courseId: assessment.courseId,
          moduleId: assessment.moduleId,
          assessmentScore: score,
          timeSpent: value.timeSpent,
          conceptMastery: score,
        },
      });

      // Update enrollment progress
      const outcomes = await prisma.learningOutcome.findMany({
        where: { enrollmentId: value.enrollmentId },
      });

      const modules = await prisma.module.findMany({
        where: { courseId: assessment.courseId },
      });

      const completedModules = new Set(outcomes.map((o: any) => o.moduleId)).size;
      const progress = Math.round((completedModules / modules.length) * 100);

      await prisma.enrollment.update({
        where: { id: value.enrollmentId },
        data: { progress },
      });

      const feedback = passed
        ? `Congratulations! You passed with a score of ${score}%.`
        : `You scored ${score}%. You need ${assessment.passingScore}% to pass. Try again!`;

      logger.info(`Assessment submitted: ${value.assessmentId}, Score: ${score}, Passed: ${passed}`);

      return {
        score,
        passed,
        feedback,
        outcome,
      };
    } catch (error) {
      logger.error('Error submitting assessment:', error);
      throw error;
    }
  }

  async getAssessmentResults(assessmentId: string): Promise<{
    assessment: any;
    submissions: any[];
    averageScore: number;
    passRate: number;
  }> {
    try {
      const assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
      });

      if (!assessment) {
        throw new Error('Assessment not found');
      }

      const outcomes = await prisma.learningOutcome.findMany({
        where: {
          // This is a simplified query - in production would need assessment submission tracking
        },
      });

      const averageScore = outcomes.length > 0
        ? outcomes.reduce((sum: number, o: any) => sum + o.assessmentScore, 0) / outcomes.length
        : 0;

      const passRate = outcomes.length > 0
        ? (outcomes.filter((o: any) => o.assessmentScore >= assessment.passingScore).length / outcomes.length) * 100
        : 0;

      return {
        assessment,
        submissions: outcomes,
        averageScore,
        passRate,
      };
    } catch (error) {
      logger.error('Error getting assessment results:', error);
      throw error;
    }
  }

  async getStudentAssessmentHistory(studentId: string): Promise<{
    assessments: any[];
    totalAttempts: number;
    averageScore: number;
    passedCount: number;
  }> {
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId },
      });

      const outcomes = await Promise.all(
        enrollments.map((e: any) =>
          prisma.learningOutcome.findMany({
            where: { enrollmentId: e.id },
          })
        )
      );

      const allOutcomes = outcomes.flat();
      const averageScore = allOutcomes.length > 0
        ? allOutcomes.reduce((sum: number, o: any) => sum + o.assessmentScore, 0) / allOutcomes.length
        : 0;

      const passedCount = allOutcomes.filter((o: any) => o.assessmentScore >= 70).length;

      return {
        assessments: allOutcomes,
        totalAttempts: allOutcomes.length,
        averageScore,
        passedCount,
      };
    } catch (error) {
      logger.error('Error getting student assessment history:', error);
      throw error;
    }
  }
}

export const assessmentService = new AssessmentService();
