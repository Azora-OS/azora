import axios, { AxiosInstance } from 'axios';
import { prisma } from '../index';
import { logger } from '../utils/logger';
import Joi from 'joi';

const contentValidationSchema = Joi.object({
  courseId: Joi.string().required(),
  contentType: Joi.string().valid('course', 'assessment', 'feedback').required(),
  content: Joi.string().required().min(10),
  title: Joi.string().optional(),
  language: Joi.string().optional().default('en'),
});

interface ValidationViolation {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  location?: string;
}

interface ContentValidationResult {
  contentId: string;
  contentType: string;
  isValid: boolean;
  complianceScore: number;
  violations: ValidationViolation[];
  recommendations: string[];
  validatedAt: Date;
}

export class ContentValidationService {
  private constitutionalAIClient: AxiosInstance;
  private constitutionalAIUrl: string;
  private validationCache: Map<string, ContentValidationResult>;
  private cacheExpiry: number;

  constructor() {
    this.constitutionalAIUrl = process.env.CONSTITUTIONAL_AI_URL || 'http://localhost:3001';
    this.constitutionalAIClient = axios.create({
      baseURL: this.constitutionalAIUrl,
      timeout: 10000,
    });
    this.validationCache = new Map();
    this.cacheExpiry = 3600000; // 1 hour
  }

  /**
   * Validate course content
   */
  async validateCourseContent(data: any): Promise<ContentValidationResult> {
    try {
      const { error, value } = contentValidationSchema.validate(data);
      if (error) {
        throw new Error(`Validation error: ${error.message}`);
      }

      // Check cache first
      const cacheKey = this.generateCacheKey(value.courseId, value.content);
      const cached = this.validationCache.get(cacheKey);
      if (cached) {
        logger.info(`Cache hit for content validation: ${value.courseId}`);
        return cached;
      }

      // Get course context
      const course = await prisma.course.findUnique({
        where: { id: value.courseId },
      });

      if (!course) {
        throw new Error('Course not found');
      }

      // Call Constitutional AI for validation
      const response = await this.constitutionalAIClient.post('/api/constitutional-ai/validate', {
        content: value.content,
        title: value.title || course.title,
        contentType: value.contentType,
        language: value.language,
        context: {
          courseTitle: course.title,
          tier: course.tier,
        },
      });

      const result: ContentValidationResult = {
        contentId: `validation-${Date.now()}`,
        contentType: value.contentType,
        isValid: response.data.isValid,
        complianceScore: response.data.complianceScore || 0,
        violations: response.data.violations || [],
        recommendations: response.data.recommendations || [],
        validatedAt: new Date(),
      };

      // Cache the result
      this.validationCache.set(cacheKey, result);
      setTimeout(() => this.validationCache.delete(cacheKey), this.cacheExpiry);

      logger.info(
        `Content validated for course ${value.courseId}: Score ${result.complianceScore}, Valid: ${result.isValid}`
      );

      return result;
    } catch (error) {
      logger.error('Error validating course content:', error);
      throw error;
    }
  }

  /**
   * Validate assessment questions
   */
  async validateAssessmentQuestions(assessmentId: string): Promise<ContentValidationResult> {
    try {
      // Get assessment
      const assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
        include: { course: true },
      });

      if (!assessment) {
        throw new Error('Assessment not found');
      }

      // Combine all questions into one content block
      const questionsContent = assessment.questions.join('\n');

      // Validate questions
      const response = await this.constitutionalAIClient.post(
        '/api/constitutional-ai/validate',
        {
          content: questionsContent,
          title: assessment.title,
          contentType: 'assessment',
          context: {
            courseTitle: assessment.course.title,
            assessmentTitle: assessment.title,
            passingScore: assessment.passingScore,
          },
        }
      );

      const result: ContentValidationResult = {
        contentId: assessmentId,
        contentType: 'assessment',
        isValid: response.data.isValid,
        complianceScore: response.data.complianceScore || 0,
        violations: response.data.violations || [],
        recommendations: response.data.recommendations || [],
        validatedAt: new Date(),
      };

      logger.info(
        `Assessment questions validated: ${assessmentId}, Score: ${result.complianceScore}`
      );

      return result;
    } catch (error) {
      logger.error('Error validating assessment questions:', error);
      throw error;
    }
  }

  /**
   * Validate teacher feedback
   */
  async validateTeacherFeedback(
    enrollmentId: string,
    feedback: string
  ): Promise<ContentValidationResult> {
    try {
      // Get enrollment context
      const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: { course: true, student: true },
      });

      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      // Validate feedback
      const response = await this.constitutionalAIClient.post(
        '/api/constitutional-ai/validate',
        {
          content: feedback,
          contentType: 'feedback',
          context: {
            courseTitle: enrollment.course.title,
            studentName: enrollment.student.firstName,
            enrollmentId,
          },
        }
      );

      const result: ContentValidationResult = {
        contentId: `feedback-${enrollmentId}`,
        contentType: 'feedback',
        isValid: response.data.isValid,
        complianceScore: response.data.complianceScore || 0,
        violations: response.data.violations || [],
        recommendations: response.data.recommendations || [],
        validatedAt: new Date(),
      };

      logger.info(
        `Teacher feedback validated for enrollment ${enrollmentId}, Score: ${result.complianceScore}`
      );

      return result;
    } catch (error) {
      logger.error('Error validating teacher feedback:', error);
      throw error;
    }
  }

  /**
   * Check for bias in content
   */
  async checkForBias(content: string): Promise<{
    hasBias: boolean;
    biasTypes: string[];
    severity: string;
    recommendations: string[];
  }> {
    try {
      const response = await this.constitutionalAIClient.post(
        '/api/constitutional-ai/check-bias',
        {
          content,
        }
      );

      logger.info(`Bias check completed: ${response.data.hasBias ? 'Bias detected' : 'No bias'}`);

      return {
        hasBias: response.data.hasBias || false,
        biasTypes: response.data.biasTypes || [],
        severity: response.data.severity || 'none',
        recommendations: response.data.recommendations || [],
      };
    } catch (error) {
      logger.error('Error checking for bias:', error);
      throw error;
    }
  }

  /**
   * Check for accuracy issues
   */
  async checkForAccuracy(content: string, context?: any): Promise<{
    isAccurate: boolean;
    issues: string[];
    confidence: number;
    suggestions: string[];
  }> {
    try {
      const response = await this.constitutionalAIClient.post(
        '/api/constitutional-ai/check-accuracy',
        {
          content,
          context,
        }
      );

      logger.info(
        `Accuracy check completed: ${response.data.isAccurate ? 'Accurate' : 'Issues found'}`
      );

      return {
        isAccurate: response.data.isAccurate || false,
        issues: response.data.issues || [],
        confidence: response.data.confidence || 0,
        suggestions: response.data.suggestions || [],
      };
    } catch (error) {
      logger.error('Error checking for accuracy:', error);
      throw error;
    }
  }

  /**
   * Check for clarity issues
   */
  async checkForClarity(content: string): Promise<{
    isClarity: boolean;
    readabilityScore: number;
    issues: string[];
    suggestions: string[];
  }> {
    try {
      const response = await this.constitutionalAIClient.post(
        '/api/constitutional-ai/check-clarity',
        {
          content,
        }
      );

      logger.info(`Clarity check completed: Readability score ${response.data.readabilityScore}`);

      return {
        isClarity: response.data.isClarity || true,
        readabilityScore: response.data.readabilityScore || 0,
        issues: response.data.issues || [],
        suggestions: response.data.suggestions || [],
      };
    } catch (error) {
      logger.error('Error checking for clarity:', error);
      throw error;
    }
  }

  /**
   * Check for safety issues
   */
  async checkForSafety(content: string): Promise<{
    isSafe: boolean;
    harmTypes: string[];
    severity: string;
    recommendations: string[];
  }> {
    try {
      const response = await this.constitutionalAIClient.post(
        '/api/constitutional-ai/check-safety',
        {
          content,
        }
      );

      logger.info(`Safety check completed: ${response.data.isSafe ? 'Safe' : 'Unsafe content'}`);

      return {
        isSafe: response.data.isSafe || true,
        harmTypes: response.data.harmTypes || [],
        severity: response.data.severity || 'none',
        recommendations: response.data.recommendations || [],
      };
    } catch (error) {
      logger.error('Error checking for safety:', error);
      throw error;
    }
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(courseId: string, content: string): string {
    const hash = content.substring(0, 50).replace(/\s+/g, '-').toLowerCase();
    return `validation-${courseId}-${hash}`;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.validationCache.clear();
    logger.info('Content validation cache cleared');
  }
}

export const contentValidationService = new ContentValidationService();
