import request from 'supertest';
import express from 'express';

// Mock before importing routes
jest.mock('../../integrations/constitutional-ai-integration');

import validationRoutes from '../validation.routes';
import { contentValidationService } from '../../integrations/constitutional-ai-integration';

const app = express();
app.use(express.json());
app.use('/api/v1/validation', validationRoutes);

describe('Validation Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/validation/course', () => {
    it('should validate course content successfully', async () => {
      const validationData = {
        courseId: 'course-1',
        content: 'This is a comprehensive course on TypeScript fundamentals.',
        title: 'TypeScript Basics',
        language: 'en',
      };

      const mockResult = {
        contentId: 'validation-1',
        contentType: 'course',
        isValid: true,
        complianceScore: 95,
        violations: [],
        recommendations: ['Add more practical examples'],
        validatedAt: new Date(),
      };

      (contentValidationService.validateCourseContent as jest.Mock).mockResolvedValue(
        mockResult
      );

      const response = await request(app)
        .post('/api/v1/validation/course')
        .send(validationData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBe(true);
      expect(response.body.data.complianceScore).toBe(95);
    });

    it('should detect content violations', async () => {
      const validationData = {
        courseId: 'course-1',
        content: 'Biased content that discriminates against certain groups.',
        title: 'Problematic Course',
        language: 'en',
      };

      const mockResult = {
        contentId: 'validation-2',
        contentType: 'course',
        isValid: false,
        complianceScore: 35,
        violations: [
          {
            type: 'bias',
            severity: 'high',
            message: 'Content contains discriminatory language',
            location: 'paragraph 1',
          },
        ],
        recommendations: ['Revise content to be more inclusive'],
        validatedAt: new Date(),
      };

      (contentValidationService.validateCourseContent as jest.Mock).mockResolvedValue(
        mockResult
      );

      const response = await request(app)
        .post('/api/v1/validation/course')
        .send(validationData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBe(false);
      expect(response.body.data.violations).toHaveLength(1);
      expect(response.body.data.violations[0].severity).toBe('high');
    });

    it('should handle validation errors', async () => {
      (contentValidationService.validateCourseContent as jest.Mock).mockRejectedValue(
        new Error('Course not found')
      );

      const response = await request(app)
        .post('/api/v1/validation/course')
        .send({
          courseId: 'non-existent',
          content: 'Some content',
        });

      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/v1/validation/assessment', () => {
    it('should validate assessment questions', async () => {
      const validationData = {
        assessmentId: 'assessment-1',
      };

      const mockResult = {
        contentId: 'assessment-1',
        contentType: 'assessment',
        isValid: true,
        complianceScore: 88,
        violations: [],
        recommendations: ['Add more challenging questions'],
        validatedAt: new Date(),
      };

      (contentValidationService.validateAssessmentQuestions as jest.Mock).mockResolvedValue(
        mockResult
      );

      const response = await request(app)
        .post('/api/v1/validation/assessment')
        .send(validationData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.contentType).toBe('assessment');
      expect(response.body.data.complianceScore).toBe(88);
    });

    it('should detect problematic assessment questions', async () => {
      const validationData = {
        assessmentId: 'assessment-2',
      };

      const mockResult = {
        contentId: 'assessment-2',
        contentType: 'assessment',
        isValid: false,
        complianceScore: 42,
        violations: [
          {
            type: 'clarity',
            severity: 'medium',
            message: 'Question is ambiguous',
            location: 'question 3',
          },
          {
            type: 'bias',
            severity: 'high',
            message: 'Question contains biased language',
            location: 'question 5',
          },
        ],
        recommendations: ['Rewrite ambiguous questions', 'Remove biased language'],
        validatedAt: new Date(),
      };

      (contentValidationService.validateAssessmentQuestions as jest.Mock).mockResolvedValue(
        mockResult
      );

      const response = await request(app)
        .post('/api/v1/validation/assessment')
        .send(validationData);

      expect(response.status).toBe(201);
      expect(response.body.data.isValid).toBe(false);
      expect(response.body.data.violations).toHaveLength(2);
    });
  });

  describe('POST /api/v1/validation/feedback', () => {
    it('should validate teacher feedback', async () => {
      const validationData = {
        enrollmentId: 'enrollment-1',
        feedback: 'Great work on the assignment! Your code is well-structured and efficient.',
      };

      const mockResult = {
        contentId: 'feedback-enrollment-1',
        contentType: 'feedback',
        isValid: true,
        complianceScore: 92,
        violations: [],
        recommendations: [],
        validatedAt: new Date(),
      };

      (contentValidationService.validateTeacherFeedback as jest.Mock).mockResolvedValue(
        mockResult
      );

      const response = await request(app)
        .post('/api/v1/validation/feedback')
        .send(validationData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBe(true);
      expect(response.body.data.complianceScore).toBe(92);
    });

    it('should detect inappropriate feedback', async () => {
      const validationData = {
        enrollmentId: 'enrollment-2',
        feedback: 'Your work is terrible and you are not smart enough for this course.',
      };

      const mockResult = {
        contentId: 'feedback-enrollment-2',
        contentType: 'feedback',
        isValid: false,
        complianceScore: 15,
        violations: [
          {
            type: 'safety',
            severity: 'critical',
            message: 'Feedback contains harmful language',
          },
        ],
        recommendations: ['Provide constructive feedback instead'],
        validatedAt: new Date(),
      };

      (contentValidationService.validateTeacherFeedback as jest.Mock).mockResolvedValue(
        mockResult
      );

      const response = await request(app)
        .post('/api/v1/validation/feedback')
        .send(validationData);

      expect(response.status).toBe(201);
      expect(response.body.data.isValid).toBe(false);
      expect(response.body.data.violations[0].severity).toBe('critical');
    });
  });

  describe('POST /api/v1/validation/bias', () => {
    it('should detect bias in content', async () => {
      const validationData = {
        content: 'Women are not good at programming.',
      };

      const mockResult = {
        hasBias: true,
        biasTypes: ['gender'],
        severity: 'high',
        recommendations: ['Revise to be gender-neutral'],
      };

      (contentValidationService.checkForBias as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/validation/bias')
        .send(validationData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.hasBias).toBe(true);
      expect(response.body.data.biasTypes).toContain('gender');
    });

    it('should return no bias for neutral content', async () => {
      const validationData = {
        content: 'TypeScript is a programming language that adds static typing to JavaScript.',
      };

      const mockResult = {
        hasBias: false,
        biasTypes: [],
        severity: 'none',
        recommendations: [],
      };

      (contentValidationService.checkForBias as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/validation/bias')
        .send(validationData);

      expect(response.status).toBe(200);
      expect(response.body.data.hasBias).toBe(false);
    });

    it('should require content parameter', async () => {
      const response = await request(app)
        .post('/api/v1/validation/bias')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/validation/accuracy', () => {
    it('should check accuracy of content', async () => {
      const validationData = {
        content: 'TypeScript is a superset of JavaScript that adds static typing.',
        context: { topic: 'TypeScript' },
      };

      const mockResult = {
        isAccurate: true,
        issues: [],
        confidence: 0.98,
        suggestions: [],
      };

      (contentValidationService.checkForAccuracy as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/validation/accuracy')
        .send(validationData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isAccurate).toBe(true);
      expect(response.body.data.confidence).toBe(0.98);
    });

    it('should detect inaccurate content', async () => {
      const validationData = {
        content: 'The Earth is flat.',
        context: { topic: 'Geography' },
      };

      const mockResult = {
        isAccurate: false,
        issues: ['Factually incorrect statement'],
        confidence: 0.99,
        suggestions: ['The Earth is spherical'],
      };

      (contentValidationService.checkForAccuracy as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/validation/accuracy')
        .send(validationData);

      expect(response.status).toBe(200);
      expect(response.body.data.isAccurate).toBe(false);
      expect(response.body.data.issues).toHaveLength(1);
    });
  });

  describe('POST /api/v1/validation/clarity', () => {
    it('should check clarity of content', async () => {
      const validationData = {
        content: 'TypeScript is a programming language. It adds static typing to JavaScript.',
      };

      const mockResult = {
        isClarity: true,
        readabilityScore: 85,
        issues: [],
        suggestions: [],
      };

      (contentValidationService.checkForClarity as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/validation/clarity')
        .send(validationData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.readabilityScore).toBe(85);
    });

    it('should detect unclear content', async () => {
      const validationData = {
        content:
          'The multifaceted paradigmatic juxtaposition of heterogeneous methodologies necessitates comprehensive elucidation.',
      };

      const mockResult = {
        isClarity: false,
        readabilityScore: 15,
        issues: ['Overly complex vocabulary', 'Unclear sentence structure'],
        suggestions: ['Use simpler language', 'Break into shorter sentences'],
      };

      (contentValidationService.checkForClarity as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/validation/clarity')
        .send(validationData);

      expect(response.status).toBe(200);
      expect(response.body.data.readabilityScore).toBe(15);
      expect(response.body.data.issues).toHaveLength(2);
    });
  });

  describe('POST /api/v1/validation/safety', () => {
    it('should check safety of content', async () => {
      const validationData = {
        content: 'Learn the fundamentals of web development with HTML, CSS, and JavaScript.',
      };

      const mockResult = {
        isSafe: true,
        harmTypes: [],
        severity: 'none',
        recommendations: [],
      };

      (contentValidationService.checkForSafety as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/validation/safety')
        .send(validationData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isSafe).toBe(true);
    });

    it('should detect unsafe content', async () => {
      const validationData = {
        content: 'Instructions on how to create harmful substances.',
      };

      const mockResult = {
        isSafe: false,
        harmTypes: ['dangerous-instructions'],
        severity: 'critical',
        recommendations: ['Remove harmful content'],
      };

      (contentValidationService.checkForSafety as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/validation/safety')
        .send(validationData);

      expect(response.status).toBe(200);
      expect(response.body.data.isSafe).toBe(false);
      expect(response.body.data.severity).toBe('critical');
    });

    it('should require content parameter', async () => {
      const response = await request(app)
        .post('/api/v1/validation/safety')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
