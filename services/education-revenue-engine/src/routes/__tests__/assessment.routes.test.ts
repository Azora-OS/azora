import request from 'supertest';
import express from 'express';
import assessmentRoutes from '../assessment.routes';
import { assessmentService } from '../../services/assessment.service';

jest.mock('../../services/assessment.service');

const app = express();
app.use(express.json());
app.use('/api/v1/assessments', assessmentRoutes);

describe('Assessment Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/assessments/:id/submit', () => {
    it('should submit an assessment and return score', async () => {
      const submissionData = {
        enrollmentId: 'enrollment-1',
        answers: ['answer1', 'answer2', 'answer3'],
        timeSpent: 1200,
      };

      const mockResult = {
        score: 100,
        passed: true,
        feedback: 'Congratulations! You passed with a score of 100%.',
        outcome: {
          id: 'outcome-1',
          enrollmentId: 'enrollment-1',
          courseId: 'course-1',
          moduleId: 'module-1',
          assessmentScore: 100,
          timeSpent: 1200,
          conceptMastery: 100,
          completedAt: new Date(),
        },
      };

      (assessmentService.submitAssessment as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/assessments/assessment-1/submit')
        .send(submissionData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.score).toBe(100);
      expect(response.body.data.passed).toBe(true);
    });

    it('should handle failed assessment submission', async () => {
      const submissionData = {
        enrollmentId: 'enrollment-1',
        answers: ['answer1'],
        timeSpent: 600,
      };

      const mockResult = {
        score: 50,
        passed: false,
        feedback: 'You scored 50%. You need 70% to pass. Try again!',
        outcome: {
          id: 'outcome-1',
          enrollmentId: 'enrollment-1',
          courseId: 'course-1',
          moduleId: 'module-1',
          assessmentScore: 50,
          timeSpent: 600,
          conceptMastery: 50,
          completedAt: new Date(),
        },
      };

      (assessmentService.submitAssessment as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/assessments/assessment-1/submit')
        .send(submissionData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.score).toBe(50);
      expect(response.body.data.passed).toBe(false);
    });

    it('should handle validation errors', async () => {
      (assessmentService.submitAssessment as jest.Mock).mockRejectedValue(
        new Error('Validation error: enrollmentId is required')
      );

      const response = await request(app)
        .post('/api/v1/assessments/assessment-1/submit')
        .send({ answers: ['answer1'] });

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/v1/assessments/:id/results', () => {
    it('should get assessment results', async () => {
      const mockResults = {
        assessment: {
          id: 'assessment-1',
          courseId: 'course-1',
          moduleId: 'module-1',
          title: 'Quiz 1',
          questions: ['Q1', 'Q2', 'Q3'],
          passingScore: 70,
        },
        submissions: [
          {
            id: 'outcome-1',
            assessmentScore: 100,
            timeSpent: 1200,
          },
          {
            id: 'outcome-2',
            assessmentScore: 85,
            timeSpent: 1500,
          },
        ],
        averageScore: 92.5,
        passRate: 100,
      };

      (assessmentService.getAssessmentResults as jest.Mock).mockResolvedValue(mockResults);

      const response = await request(app).get('/api/v1/assessments/assessment-1/results');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.averageScore).toBe(92.5);
      expect(response.body.data.passRate).toBe(100);
    });

    it('should handle assessment not found', async () => {
      (assessmentService.getAssessmentResults as jest.Mock).mockRejectedValue(
        new Error('Assessment not found')
      );

      const response = await request(app).get('/api/v1/assessments/non-existent/results');

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/v1/assessments/student/:studentId/history', () => {
    it('should get student assessment history', async () => {
      const mockHistory = {
        assessments: [
          {
            id: 'outcome-1',
            enrollmentId: 'enrollment-1',
            courseId: 'course-1',
            moduleId: 'module-1',
            assessmentScore: 100,
            timeSpent: 1200,
            conceptMastery: 100,
            completedAt: new Date(),
          },
          {
            id: 'outcome-2',
            enrollmentId: 'enrollment-2',
            courseId: 'course-2',
            moduleId: 'module-2',
            assessmentScore: 85,
            timeSpent: 1500,
            conceptMastery: 85,
            completedAt: new Date(),
          },
        ],
        totalAttempts: 2,
        averageScore: 92.5,
        passedCount: 2,
      };

      (assessmentService.getStudentAssessmentHistory as jest.Mock).mockResolvedValue(mockHistory);

      const response = await request(app).get('/api/v1/assessments/student/student-1/history');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalAttempts).toBe(2);
      expect(response.body.data.averageScore).toBe(92.5);
      expect(response.body.data.passedCount).toBe(2);
    });

    it('should return empty history for new student', async () => {
      const mockHistory = {
        assessments: [],
        totalAttempts: 0,
        averageScore: 0,
        passedCount: 0,
      };

      (assessmentService.getStudentAssessmentHistory as jest.Mock).mockResolvedValue(mockHistory);

      const response = await request(app).get('/api/v1/assessments/student/new-student/history');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalAttempts).toBe(0);
    });
  });
});
