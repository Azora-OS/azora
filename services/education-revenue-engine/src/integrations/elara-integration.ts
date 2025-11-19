import axios, { AxiosInstance } from 'axios';
import { prisma } from '../index';
import { logger } from '../utils/logger';
import Joi from 'joi';

const tutoringQuestionSchema = Joi.object({
  studentId: Joi.string().required(),
  enrollmentId: Joi.string().required(),
  courseId: Joi.string().required(),
  moduleId: Joi.string().required(),
  question: Joi.string().required().min(5),
  context: Joi.object().optional(),
});

interface TutoringResponse {
  id: string;
  studentId: string;
  question: string;
  answer: string;
  confidence: number;
  sources: string[];
  timestamp: Date;
}

interface TutoringHistory {
  studentId: string;
  totalQuestions: number;
  responses: TutoringResponse[];
  averageConfidence: number;
}

export class TutoringService {
  private elaraClient: AxiosInstance;
  private elaraUrl: string;
  private responseCache: Map<string, TutoringResponse>;
  private cacheExpiry: number;

  constructor() {
    this.elaraUrl = process.env.ELARA_ORCHESTRATOR_URL || 'http://localhost:3009';
    this.elaraClient = axios.create({
      baseURL: this.elaraUrl,
      timeout: 10000,
    });
    this.responseCache = new Map();
    this.cacheExpiry = 3600000; // 1 hour
  }

  /**
   * Ask a tutoring question
   */
  async askQuestion(data: any): Promise<TutoringResponse> {
    try {
      const { error, value } = tutoringQuestionSchema.validate(data);
      if (error) {
        throw new Error(`Validation error: ${error.message}`);
      }

      // Get enrollment and course context
      const enrollment = await prisma.enrollment.findUnique({
        where: { id: value.enrollmentId },
        include: { course: true, student: true },
      });

      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      const module = await prisma.module.findUnique({
        where: { id: value.moduleId },
      });

      if (!module) {
        throw new Error('Module not found');
      }

      // Get student's previous learning outcomes for context
      const outcomes = await prisma.learningOutcome.findMany({
        where: { enrollmentId: value.enrollmentId },
        orderBy: { completedAt: 'desc' },
        take: 5,
      });

      // Build context for Elara
      const context = {
        studentName: enrollment.student.firstName,
        courseName: enrollment.course.title,
        moduleName: module.title,
        studentTier: enrollment.tier,
        previousOutcomes: outcomes.map((o: any) => ({
          score: o.assessmentScore,
          mastery: o.conceptMastery,
        })),
        ...value.context,
      };

      // Check cache first
      const cacheKey = this.generateCacheKey(value.question, value.courseId);
      const cachedResponse = this.responseCache.get(cacheKey);
      if (cachedResponse) {
        logger.info(`Cache hit for tutoring question: ${value.question}`);
        return cachedResponse;
      }

      // Call Elara Orchestrator
      const response = await this.elaraClient.post('/api/elara/ask', {
        question: value.question,
        context,
      });

      const tutoringResponse: TutoringResponse = {
        id: `tutoring-${Date.now()}`,
        studentId: value.studentId,
        question: value.question,
        answer: response.data.answer,
        confidence: response.data.confidence || 0.85,
        sources: response.data.sources || [],
        timestamp: new Date(),
      };

      // Cache the response
      this.responseCache.set(cacheKey, tutoringResponse);
      setTimeout(() => this.responseCache.delete(cacheKey), this.cacheExpiry);

      logger.info(`Tutoring question answered for student ${value.studentId}`);

      return tutoringResponse;
    } catch (error) {
      logger.error('Error asking tutoring question:', error);
      throw error;
    }
  }

  /**
   * Get tutoring history for a student
   */
  async getTutoringHistory(studentId: string): Promise<TutoringHistory> {
    try {
      // Get all enrollments for the student
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId },
      });

      if (enrollments.length === 0) {
        return {
          studentId,
          totalQuestions: 0,
          responses: [],
          averageConfidence: 0,
        };
      }

      // In a real implementation, we would store tutoring responses in the database
      // For now, we'll return a structure that can be extended
      const responses: TutoringResponse[] = [];

      const history: TutoringHistory = {
        studentId,
        totalQuestions: responses.length,
        responses,
        averageConfidence:
          responses.length > 0
            ? responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length
            : 0,
      };

      logger.info(`Retrieved tutoring history for student ${studentId}`);

      return history;
    } catch (error) {
      logger.error('Error getting tutoring history:', error);
      throw error;
    }
  }

  /**
   * Get personalized tutoring recommendations
   */
  async getRecommendations(studentId: string, enrollmentId: string): Promise<any> {
    try {
      const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: { course: true },
      });

      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      // Get learning outcomes to identify struggling areas
      const outcomes = await prisma.learningOutcome.findMany({
        where: { enrollmentId },
        orderBy: { completedAt: 'desc' },
        take: 10,
      });

      // Identify areas where student is struggling (mastery < 70%)
      const strugglingAreas = outcomes.filter((o: any) => o.conceptMastery < 70);

      // Call Elara for personalized recommendations
      const response = await this.elaraClient.post('/api/elara/execute', {
        command: 'generate-tutoring-recommendations',
        params: {
          studentId,
          courseId: enrollment.courseId,
          strugglingAreas: strugglingAreas.map((a: any) => ({
            moduleId: a.moduleId,
            mastery: a.conceptMastery,
          })),
          averageScore:
            outcomes.length > 0
              ? outcomes.reduce((sum: number, o: any) => sum + o.assessmentScore, 0) / outcomes.length
              : 0,
        },
      });

      logger.info(`Generated tutoring recommendations for student ${studentId}`);

      return {
        studentId,
        enrollmentId,
        recommendations: response.data.result || [],
        strugglingAreas: strugglingAreas.length,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error getting recommendations:', error);
      throw error;
    }
  }

  /**
   * Generate cache key for tutoring responses
   */
  private generateCacheKey(question: string, courseId: string): string {
    return `tutoring-${courseId}-${question.toLowerCase().replace(/\s+/g, '-')}`;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.responseCache.clear();
    logger.info('Tutoring response cache cleared');
  }
}

export const tutoringService = new TutoringService();
