import request from 'supertest';
import express from 'express';
import tutoringRoutes from '../tutoring.routes';
import { tutoringService } from '../../integrations/elara-integration';

jest.mock('../../integrations/elara-integration');

const app = express();
app.use(express.json());
app.use('/api/v1/tutoring', tutoringRoutes);

describe('Tutoring Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/tutoring/ask', () => {
    it('should ask a tutoring question and get an answer', async () => {
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

      const response = await request(app)
        .post('/api/v1/tutoring/ask')
        .send(questionData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.answer).toBe(
        'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.'
      );
      expect(response.body.data.confidence).toBe(0.95);
    });

    it('should handle validation errors', async () => {
      (tutoringService.askQuestion as jest.Mock).mockRejectedValue(
        new Error('Validation error: question is required')
      );

      const response = await request(app)
        .post('/api/v1/tutoring/ask')
        .send({
          studentId: 'student-1',
          enrollmentId: 'enrollment-1',
          courseId: 'course-1',
          moduleId: 'module-1',
        });

      expect(response.status).toBe(500);
    });

    it('should handle Elara service errors', async () => {
      (tutoringService.askQuestion as jest.Mock).mockRejectedValue(
        new Error('Failed to connect to Elara Orchestrator')
      );

      const response = await request(app)
        .post('/api/v1/tutoring/ask')
        .send({
          studentId: 'student-1',
          enrollmentId: 'enrollment-1',
          courseId: 'course-1',
          moduleId: 'module-1',
          question: 'What is TypeScript?',
        });

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/v1/tutoring/history/:studentId', () => {
    it('should get tutoring history for a student', async () => {
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

      const response = await request(app).get('/api/v1/tutoring/history/student-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalQuestions).toBe(5);
      expect(response.body.data.responses).toHaveLength(2);
      expect(response.body.data.averageConfidence).toBe(0.935);
    });

    it('should return empty history for new student', async () => {
      const mockHistory = {
        studentId: 'new-student',
        totalQuestions: 0,
        responses: [],
        averageConfidence: 0,
      };

      (tutoringService.getTutoringHistory as jest.Mock).mockResolvedValue(mockHistory);

      const response = await request(app).get('/api/v1/tutoring/history/new-student');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalQuestions).toBe(0);
      expect(response.body.data.responses).toHaveLength(0);
    });
  });

  describe('GET /api/v1/tutoring/recommendations/:studentId/:enrollmentId', () => {
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

      const response = await request(app).get(
        '/api/v1/tutoring/recommendations/student-1/enrollment-1'
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.recommendations).toHaveLength(2);
      expect(response.body.data.strugglingAreas).toBe(2);
    });

    it('should handle missing enrollment', async () => {
      (tutoringService.getRecommendations as jest.Mock).mockRejectedValue(
        new Error('Enrollment not found')
      );

      const response = await request(app).get(
        '/api/v1/tutoring/recommendations/student-1/non-existent'
      );

      expect(response.status).toBe(500);
    });

    it('should return empty recommendations for student with no struggling areas', async () => {
      const mockRecommendations = {
        studentId: 'student-2',
        enrollmentId: 'enrollment-2',
        recommendations: [],
        strugglingAreas: 0,
        timestamp: new Date(),
      };

      (tutoringService.getRecommendations as jest.Mock).mockResolvedValue(
        mockRecommendations
      );

      const response = await request(app).get(
        '/api/v1/tutoring/recommendations/student-2/enrollment-2'
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.recommendations).toHaveLength(0);
      expect(response.body.data.strugglingAreas).toBe(0);
    });
  });
});
