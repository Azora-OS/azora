import { tutoringService } from '../elara-integration';
import { contextRetrievalService } from '../knowledge-ocean-integration';
import { contentValidationService } from '../constitutional-ai-integration';

jest.mock('../elara-integration');
jest.mock('../knowledge-ocean-integration');
jest.mock('../constitutional-ai-integration');

describe('AI Engines Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Elara Orchestrator Integration', () => {
    describe('Tutoring Service', () => {
      it('should ask a question and receive tutoring response', async () => {
        const questionData = {
          studentId: 'student-1',
          enrollmentId: 'enrollment-1',
          courseId: 'course-1',
          moduleId: 'module-1',
          question: 'What is TypeScript?',
          context: { difficulty: 'beginner' },
        };

        const mockResponse = {
          id: 'tutoring-1',
          studentId: 'student-1',
          question: 'What is TypeScript?',
          answer: 'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.',
          confidence: 0.95,
          sources: ['typescript-docs', 'course-module-1'],
          timestamp: new Date(),
        };

        (tutoringService.askQuestion as jest.Mock).mockResolvedValue(mockResponse);

        const result = await tutoringService.askQuestion(questionData);

        expect(result).toBeDefined();
        expect(result.answer).toBe(
          'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.'
        );
        expect(result.confidence).toBe(0.95);
        expect(tutoringService.askQuestion).toHaveBeenCalledWith(questionData);
      });

      it('should handle Elara service errors gracefully', async () => {
        const questionData = {
          studentId: 'student-1',
          enrollmentId: 'enrollment-1',
          courseId: 'course-1',
          moduleId: 'module-1',
          question: 'What is TypeScript?',
        };

        const error = new Error('Failed to connect to Elara Orchestrator');
        (tutoringService.askQuestion as jest.Mock).mockRejectedValue(error);

        await expect(tutoringService.askQuestion(questionData)).rejects.toThrow(
          'Failed to connect to Elara Orchestrator'
        );
      });

      it('should retrieve tutoring history for a student', async () => {
        const mockHistory = {
          studentId: 'student-1',
          totalQuestions: 5,
          responses: [
            {
              id: 'tutoring-1',
              studentId: 'student-1',
              question: 'What is TypeScript?',
              answer: 'TypeScript is a typed superset of JavaScript.',
              confidence: 0.95,
              sources: ['typescript-docs'],
              timestamp: new Date(),
            },
            {
              id: 'tutoring-2',
              studentId: 'student-1',
              question: 'How do I use interfaces?',
              answer: 'Interfaces define the structure of objects.',
              confidence: 0.92,
              sources: ['typescript-docs'],
              timestamp: new Date(),
            },
          ],
          averageConfidence: 0.935,
        };

        (tutoringService.getTutoringHistory as jest.Mock).mockResolvedValue(mockHistory);

        const result = await tutoringService.getTutoringHistory('student-1');

        expect(result.totalQuestions).toBe(5);
        expect(result.responses).toHaveLength(2);
        expect(result.averageConfidence).toBe(0.935);
      });

      it('should get personalized tutoring recommendations', async () => {
        const mockRecommendations = {
          studentId: 'student-1',
          enrollmentId: 'enrollment-1',
          recommendations: [
            {
              topic: 'Interfaces',
              difficulty: 'intermediate',
              suggestedResources: ['interface-tutorial', 'interface-examples'],
              estimatedTime: 30,
            },
            {
              topic: 'Generics',
              difficulty: 'advanced',
              suggestedResources: ['generics-guide', 'generics-patterns'],
              estimatedTime: 45,
            },
          ],
          strugglingAreas: 2,
          timestamp: new Date(),
        };

        (tutoringService.getRecommendations as jest.Mock).mockResolvedValue(
          mockRecommendations
        );

        const result = await tutoringService.getRecommendations('student-1', 'enrollment-1');

        expect(result.recommendations).toHaveLength(2);
        expect(result.strugglingAreas).toBe(2);
      });
    });
  });

  describe('Knowledge Ocean Integration', () => {
    describe('Context Retrieval Service', () => {
      it('should retrieve context with 70/30 rule compliance', async () => {
        const retrievalData = {
          studentId: 'student-1',
          courseId: 'course-1',
          moduleId: 'module-1',
          query: 'What is TypeScript?',
          language: 'en',
          topK: 10,
        };

        const mockResult = {
          query: 'What is TypeScript?',
          resources: [
            {
              id: 'resource-1',
              title: 'TypeScript Handbook',
              content: 'TypeScript is a typed superset of JavaScript...',
              source: 'internal' as const,
              relevanceScore: 0.95,
              url: 'https://www.typescriptlang.org/docs/',
            },
            {
              id: 'resource-2',
              title: 'TypeScript Tutorial',
              content: 'Learn TypeScript basics...',
              source: 'internal' as const,
              relevanceScore: 0.92,
              url: 'https://example.com/ts-tutorial',
            },
            {
              id: 'resource-3',
              title: 'TypeScript Best Practices',
              content: 'Best practices for TypeScript development...',
              source: 'internal' as const,
              relevanceScore: 0.88,
              url: 'https://example.com/ts-best-practices',
            },
            {
              id: 'resource-4',
              title: 'TypeScript on Stack Overflow',
              content: 'Common TypeScript questions and answers...',
              source: 'external' as const,
              relevanceScore: 0.85,
              url: 'https://stackoverflow.com/questions/tagged/typescript',
            },
            {
              id: 'resource-5',
              title: 'TypeScript GitHub',
              content: 'TypeScript repository and issues...',
              source: 'external' as const,
              relevanceScore: 0.80,
              url: 'https://github.com/microsoft/TypeScript',
            },
          ],
          internalCount: 3,
          externalCount: 2,
          internalPercentage: 60,
          externalPercentage: 40,
          retrievalTime: 245,
          timestamp: new Date(),
        };

        (contextRetrievalService.retrieveContext as jest.Mock).mockResolvedValue(mockResult);

        const result = await contextRetrievalService.retrieveContext(retrievalData);

        expect(result.resources).toHaveLength(5);
        expect(result.internalCount).toBe(3);
        expect(result.externalCount).toBe(2);
        expect(result.retrievalTime).toBeLessThan(300);
      });

      it('should enforce 70/30 rule for resource distribution', async () => {
        const retrievalData = {
          studentId: 'student-1',
          courseId: 'course-1',
          moduleId: 'module-1',
          query: 'What is TypeScript?',
          language: 'en',
          topK: 10,
        };

        const internalResources = Array(7)
          .fill(null)
          .map((_, i) => ({
            id: `resource-${i + 1}`,
            title: `Resource ${i + 1}`,
            content: 'Content...',
            source: 'internal' as const,
            relevanceScore: 0.9 - i * 0.05,
          }));

        const externalResources = Array(3)
          .fill(null)
          .map((_, i) => ({
            id: `resource-${i + 8}`,
            title: `Resource ${i + 8}`,
            content: 'Content...',
            source: 'external' as const,
            relevanceScore: 0.6 - i * 0.05,
          }));

        const mockResult = {
          query: 'What is TypeScript?',
          resources: [...internalResources, ...externalResources],
          internalCount: 7,
          externalCount: 3,
          internalPercentage: 70,
          externalPercentage: 30,
          retrievalTime: 250,
          timestamp: new Date(),
        };

        (contextRetrievalService.retrieveContext as jest.Mock).mockResolvedValue(mockResult);

        const result = await contextRetrievalService.retrieveContext(retrievalData);

        expect(result.internalPercentage).toBe(70);
        expect(result.externalPercentage).toBe(30);
      });

      it('should handle Knowledge Ocean retrieval errors', async () => {
        const retrievalData = {
          studentId: 'student-1',
          courseId: 'course-1',
          moduleId: 'module-1',
          query: 'What is TypeScript?',
          language: 'en',
          topK: 10,
        };

        const error = new Error('Failed to connect to Knowledge Ocean');
        (contextRetrievalService.retrieveContext as jest.Mock).mockRejectedValue(error);

        await expect(contextRetrievalService.retrieveContext(retrievalData)).rejects.toThrow(
          'Failed to connect to Knowledge Ocean'
        );
      });

      it('should retrieve language-specific resources', async () => {
        const mockResources = [
          {
            id: 'resource-1',
            title: 'TypeScript Handbook (Spanish)',
            content: 'TypeScript es un superconjunto tipado de JavaScript...',
            source: 'internal' as const,
            relevanceScore: 0.95,
            url: 'https://www.typescriptlang.org/es/docs/',
          },
          {
            id: 'resource-2',
            title: 'TypeScript Tutorial (Spanish)',
            content: 'Aprende los conceptos básicos de TypeScript...',
            source: 'internal' as const,
            relevanceScore: 0.92,
            url: 'https://example.com/ts-tutorial-es',
          },
        ];

        (contextRetrievalService.getLanguageSpecificResources as jest.Mock).mockResolvedValue(
          mockResources
        );

        const result = await contextRetrievalService.getLanguageSpecificResources(
          'course-1',
          'module-1',
          'es'
        );

        expect(result).toHaveLength(2);
        expect(result[0].title).toContain('Spanish');
      });

      it('should rank resources by relevance', async () => {
        const resources = [
          {
            id: 'resource-1',
            title: 'Resource 1',
            content: 'Content 1',
            source: 'internal' as const,
            relevanceScore: 0.85,
          },
          {
            id: 'resource-2',
            title: 'Resource 2',
            content: 'Content 2',
            source: 'external' as const,
            relevanceScore: 0.92,
          },
          {
            id: 'resource-3',
            title: 'Resource 3',
            content: 'Content 3',
            source: 'internal' as const,
            relevanceScore: 0.78,
          },
        ];

        const rankedResources = [
          {
            id: 'resource-2',
            title: 'Resource 2',
            content: 'Content 2',
            source: 'external' as const,
            relevanceScore: 0.92,
          },
          {
            id: 'resource-1',
            title: 'Resource 1',
            content: 'Content 1',
            source: 'internal' as const,
            relevanceScore: 0.85,
          },
          {
            id: 'resource-3',
            title: 'Resource 3',
            content: 'Content 3',
            source: 'internal' as const,
            relevanceScore: 0.78,
          },
        ];

        (contextRetrievalService.rankResources as jest.Mock).mockResolvedValue(rankedResources);

        const result = await contextRetrievalService.rankResources(resources);

        expect(result).toHaveLength(3);
        expect(result[0].relevanceScore).toBe(0.92);
        expect(result[1].relevanceScore).toBe(0.85);
        expect(result[2].relevanceScore).toBe(0.78);
      });
    });
  });

  describe('Constitutional AI Integration', () => {
    describe('Content Validation Service', () => {
      it('should validate course content successfully', async () => {
        const validationData = {
          courseId: 'course-1',
          contentType: 'course' as const,
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

        const result = await contentValidationService.validateCourseContent(validationData);

        expect(result.isValid).toBe(true);
        expect(result.complianceScore).toBe(95);
        expect(result.violations).toHaveLength(0);
      });

      it('should detect content violations', async () => {
        const validationData = {
          courseId: 'course-1',
          contentType: 'course' as const,
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
              severity: 'high' as const,
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

        const result = await contentValidationService.validateCourseContent(validationData);

        expect(result.isValid).toBe(false);
        expect(result.violations).toHaveLength(1);
        expect(result.violations[0].severity).toBe('high');
      });

      it('should validate assessment questions', async () => {
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

        const result = await contentValidationService.validateAssessmentQuestions('assessment-1');

        expect(result.contentType).toBe('assessment');
        expect(result.complianceScore).toBe(88);
      });

      it('should detect problematic assessment questions', async () => {
        const mockResult = {
          contentId: 'assessment-2',
          contentType: 'assessment',
          isValid: false,
          complianceScore: 42,
          violations: [
            {
              type: 'clarity',
              severity: 'medium' as const,
              message: 'Question is ambiguous',
              location: 'question 3',
            },
            {
              type: 'bias',
              severity: 'high' as const,
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

        const result = await contentValidationService.validateAssessmentQuestions('assessment-2');

        expect(result.isValid).toBe(false);
        expect(result.violations).toHaveLength(2);
      });

      it('should validate teacher feedback', async () => {
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

        const result = await contentValidationService.validateTeacherFeedback(
          'enrollment-1',
          'Great work on the assignment!'
        );

        expect(result.isValid).toBe(true);
        expect(result.complianceScore).toBe(92);
      });

      it('should detect inappropriate feedback', async () => {
        const mockResult = {
          contentId: 'feedback-enrollment-2',
          contentType: 'feedback',
          isValid: false,
          complianceScore: 15,
          violations: [
            {
              type: 'safety',
              severity: 'critical' as const,
              message: 'Feedback contains harmful language',
            },
          ],
          recommendations: ['Provide constructive feedback instead'],
          validatedAt: new Date(),
        };

        (contentValidationService.validateTeacherFeedback as jest.Mock).mockResolvedValue(
          mockResult
        );

        const result = await contentValidationService.validateTeacherFeedback(
          'enrollment-2',
          'Your work is terrible and you are not smart enough for this course.'
        );

        expect(result.isValid).toBe(false);
        expect(result.violations[0].severity).toBe('critical');
      });

      it('should check for bias in content', async () => {
        const mockResult = {
          hasBias: true,
          biasTypes: ['gender'],
          severity: 'high',
          recommendations: ['Revise to be gender-neutral'],
        };

        (contentValidationService.checkForBias as jest.Mock).mockResolvedValue(mockResult);

        const result = await contentValidationService.checkForBias(
          'Women are not good at programming.'
        );

        expect(result.hasBias).toBe(true);
        expect(result.biasTypes).toContain('gender');
        expect(result.severity).toBe('high');
      });

      it('should return no bias for neutral content', async () => {
        const mockResult = {
          hasBias: false,
          biasTypes: [],
          severity: 'none',
          recommendations: [],
        };

        (contentValidationService.checkForBias as jest.Mock).mockResolvedValue(mockResult);

        const result = await contentValidationService.checkForBias(
          'TypeScript is a programming language that adds static typing to JavaScript.'
        );

        expect(result.hasBias).toBe(false);
      });

      it('should check for accuracy issues', async () => {
        const mockResult = {
          isAccurate: false,
          issues: ['Factually incorrect statement'],
          confidence: 0.99,
          suggestions: ['The Earth is spherical'],
        };

        (contentValidationService.checkForAccuracy as jest.Mock).mockResolvedValue(mockResult);

        const result = await contentValidationService.checkForAccuracy('The Earth is flat.');

        expect(result.isAccurate).toBe(false);
        expect(result.issues).toHaveLength(1);
      });

      it('should check for clarity issues', async () => {
        const mockResult = {
          isClarity: false,
          readabilityScore: 15,
          issues: ['Overly complex vocabulary', 'Unclear sentence structure'],
          suggestions: ['Use simpler language', 'Break into shorter sentences'],
        };

        (contentValidationService.checkForClarity as jest.Mock).mockResolvedValue(mockResult);

        const result = await contentValidationService.checkForClarity(
          'The multifaceted paradigmatic juxtaposition of heterogeneous methodologies necessitates comprehensive elucidation.'
        );

        expect(result.readabilityScore).toBe(15);
        expect(result.issues).toHaveLength(2);
      });

      it('should check for safety issues', async () => {
        const mockResult = {
          isSafe: false,
          harmTypes: ['dangerous-instructions'],
          severity: 'critical',
          recommendations: ['Remove harmful content'],
        };

        (contentValidationService.checkForSafety as jest.Mock).mockResolvedValue(mockResult);

        const result = await contentValidationService.checkForSafety(
          'Instructions on how to create harmful substances.'
        );

        expect(result.isSafe).toBe(false);
        expect(result.severity).toBe('critical');
      });

      it('should handle Constitutional AI validation errors', async () => {
        const validationData = {
          courseId: 'course-1',
          contentType: 'course' as const,
          content: 'Some content',
          title: 'Course',
          language: 'en',
        };

        const error = new Error('Constitutional AI service unavailable');
        (contentValidationService.validateCourseContent as jest.Mock).mockRejectedValue(error);

        await expect(contentValidationService.validateCourseContent(validationData)).rejects.toThrow(
          'Constitutional AI service unavailable'
        );
      });
    });
  });

  describe('AI Engines Error Handling and Fallbacks', () => {
    it('should handle Elara Orchestrator timeout with fallback', async () => {
      const error = new Error('Elara Orchestrator timeout');
      (tutoringService.askQuestion as jest.Mock).mockRejectedValue(error);

      await expect(
        tutoringService.askQuestion({
          studentId: 'student-1',
          enrollmentId: 'enrollment-1',
          courseId: 'course-1',
          moduleId: 'module-1',
          question: 'What is TypeScript?',
        })
      ).rejects.toThrow('Elara Orchestrator timeout');
    });

    it('should handle Knowledge Ocean connection failure with fallback', async () => {
      const error = new Error('Knowledge Ocean connection failed');
      (contextRetrievalService.retrieveContext as jest.Mock).mockRejectedValue(error);

      await expect(
        contextRetrievalService.retrieveContext({
          studentId: 'student-1',
          courseId: 'course-1',
          moduleId: 'module-1',
          query: 'What is TypeScript?',
          language: 'en',
          topK: 10,
        })
      ).rejects.toThrow('Knowledge Ocean connection failed');
    });

    it('should handle Constitutional AI validation failure with fallback', async () => {
      const error = new Error('Constitutional AI validation failed');
      (contentValidationService.validateCourseContent as jest.Mock).mockRejectedValue(error);

      await expect(
        contentValidationService.validateCourseContent({
          courseId: 'course-1',
          contentType: 'course',
          content: 'Some content',
          title: 'Course',
          language: 'en',
        })
      ).rejects.toThrow('Constitutional AI validation failed');
    });
  });

  describe('AI Engines Combined Workflow', () => {
    it('should execute complete tutoring workflow with all AI engines', async () => {
      // Step 1: Student asks a question (Elara)
      const questionData = {
        studentId: 'student-1',
        enrollmentId: 'enrollment-1',
        courseId: 'course-1',
        moduleId: 'module-1',
        question: 'What is TypeScript?',
      };

      const tutoringResponse = {
        id: 'tutoring-1',
        studentId: 'student-1',
        question: 'What is TypeScript?',
        answer: 'TypeScript is a typed superset of JavaScript.',
        confidence: 0.95,
        sources: ['typescript-docs'],
        timestamp: new Date(),
      };

      (tutoringService.askQuestion as jest.Mock).mockResolvedValue(tutoringResponse);

      const tutorResult = await tutoringService.askQuestion(questionData);
      expect(tutorResult.answer).toBeDefined();

      // Step 2: Retrieve context resources (Knowledge Ocean)
      const contextData = {
        studentId: 'student-1',
        courseId: 'course-1',
        moduleId: 'module-1',
        query: 'What is TypeScript?',
        language: 'en',
        topK: 10,
      };

      const contextResponse = {
        query: 'What is TypeScript?',
        resources: [
          {
            id: 'resource-1',
            title: 'TypeScript Handbook',
            content: 'TypeScript is a typed superset of JavaScript...',
            source: 'internal' as const,
            relevanceScore: 0.95,
          },
          {
            id: 'resource-2',
            title: 'TypeScript on Stack Overflow',
            content: 'Common TypeScript questions...',
            source: 'external' as const,
            relevanceScore: 0.85,
          },
        ],
        internalCount: 1,
        externalCount: 1,
        internalPercentage: 50,
        externalPercentage: 50,
        retrievalTime: 245,
        timestamp: new Date(),
      };

      (contextRetrievalService.retrieveContext as jest.Mock).mockResolvedValue(contextResponse);

      const contextResult = await contextRetrievalService.retrieveContext(contextData);
      expect(contextResult.resources).toHaveLength(2);

      // Step 3: Validate the tutoring response (Constitutional AI)
      const validationData = {
        courseId: 'course-1',
        contentType: 'feedback' as const,
        content: tutorResult.answer,
        title: 'Tutoring Response',
        language: 'en',
      };

      const validationResponse = {
        contentId: 'validation-1',
        contentType: 'feedback',
        isValid: true,
        complianceScore: 95,
        violations: [],
        recommendations: [],
        validatedAt: new Date(),
      };

      (contentValidationService.validateCourseContent as jest.Mock).mockResolvedValue(
        validationResponse
      );

      const validationResult = await contentValidationService.validateCourseContent(validationData);
      expect(validationResult.isValid).toBe(true);

      // Verify all services were called
      expect(tutoringService.askQuestion).toHaveBeenCalledWith(questionData);
      expect(contextRetrievalService.retrieveContext).toHaveBeenCalledWith(contextData);
      expect(contentValidationService.validateCourseContent).toHaveBeenCalledWith(validationData);
    });

    it('should handle partial AI engine failures gracefully', async () => {
      // Elara succeeds
      const tutoringResponse = {
        id: 'tutoring-1',
        studentId: 'student-1',
        question: 'What is TypeScript?',
        answer: 'TypeScript is a typed superset of JavaScript.',
        confidence: 0.95,
        sources: ['typescript-docs'],
        timestamp: new Date(),
      };

      (tutoringService.askQuestion as jest.Mock).mockResolvedValue(tutoringResponse);

      // Knowledge Ocean fails
      (contextRetrievalService.retrieveContext as jest.Mock).mockRejectedValue(
        new Error('Knowledge Ocean unavailable')
      );

      // Constitutional AI succeeds
      const validationResponse = {
        contentId: 'validation-1',
        contentType: 'feedback',
        isValid: true,
        complianceScore: 95,
        violations: [],
        recommendations: [],
        validatedAt: new Date(),
      };

      (contentValidationService.validateCourseContent as jest.Mock).mockResolvedValue(
        validationResponse
      );

      // Execute workflow
      const tutorResult = await tutoringService.askQuestion({
        studentId: 'student-1',
        enrollmentId: 'enrollment-1',
        courseId: 'course-1',
        moduleId: 'module-1',
        question: 'What is TypeScript?',
      });

      expect(tutorResult).toBeDefined();

      // Knowledge Ocean fails as expected
      await expect(
        contextRetrievalService.retrieveContext({
          studentId: 'student-1',
          courseId: 'course-1',
          moduleId: 'module-1',
          query: 'What is TypeScript?',
          language: 'en',
          topK: 10,
        })
      ).rejects.toThrow('Knowledge Ocean unavailable');

      // Constitutional AI still works
      const validationResult = await contentValidationService.validateCourseContent({
        courseId: 'course-1',
        contentType: 'feedback',
        content: tutorResult.answer,
        title: 'Tutoring Response',
        language: 'en',
      });

      expect(validationResult.isValid).toBe(true);
    });
  });
});
