import request from 'supertest';
import express from 'express';
import courseRoutes from '../course.routes';
import enrollmentRoutes from '../enrollment.routes';
import assessmentRoutes from '../assessment.routes';
import { courseService } from '../../services/course.service';
import { enrollmentService } from '../../services/enrollment.service';
import { assessmentService } from '../../services/assessment.service';

jest.mock('../../services/course.service');
jest.mock('../../services/enrollment.service');
jest.mock('../../services/assessment.service');

const app = express();
app.use(express.json());
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/assessments', assessmentRoutes);

describe('Education Core Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Student Journey: Course Creation and Retrieval', () => {
    it('should create a course and retrieve it', async () => {
      const courseData = {
        title: 'Introduction to TypeScript',
        description: 'Learn TypeScript basics',
        instructorId: 'instructor-1',
        tier: 'free',
      };

      const mockCourse = {
        id: 'course-1',
        ...courseData,
        modules: [],
        assessments: [],
        prerequisites: [],
        language: 'en',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (courseService.createCourse as jest.Mock).mockResolvedValue(mockCourse);
      (courseService.getCourse as jest.Mock).mockResolvedValue(mockCourse);

      // Create course
      const createResponse = await request(app)
        .post('/api/v1/courses')
        .send(courseData);

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data.id).toBe('course-1');

      // Retrieve course
      const getResponse = await request(app).get('/api/v1/courses/course-1');

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data.title).toBe('Introduction to TypeScript');
    });
  });

  describe('Complete Student Journey: Enrollment Flow', () => {
    it('should enroll student in course and track progress', async () => {
      const enrollmentData = {
        studentId: 'student-1',
        courseId: 'course-1',
        tier: 'free',
      };

      const mockEnrollment = {
        id: 'enrollment-1',
        ...enrollmentData,
        status: 'active',
        progress: 0,
        startDate: new Date(),
        completionDate: null,
      };

      const updatedEnrollment = {
        ...mockEnrollment,
        progress: 50,
      };

      (enrollmentService.enrollStudent as jest.Mock).mockResolvedValue(mockEnrollment);
      (enrollmentService.getEnrollment as jest.Mock).mockResolvedValue(mockEnrollment);
      (enrollmentService.updateProgress as jest.Mock).mockResolvedValue(updatedEnrollment);

      // Enroll student
      const enrollResponse = await request(app)
        .post('/api/v1/enrollments')
        .send(enrollmentData);

      expect(enrollResponse.status).toBe(201);
      expect(enrollResponse.body.success).toBe(true);
      expect(enrollResponse.body.data.status).toBe('active');
      expect(enrollResponse.body.data.progress).toBe(0);

      // Get enrollment
      const getResponse = await request(app).get('/api/v1/enrollments/enrollment-1');

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.success).toBe(true);

      // Update progress
      const updateResponse = await request(app)
        .put('/api/v1/enrollments/enrollment-1/progress')
        .send({ progress: 50 });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data.progress).toBe(50);
    });

    it('should complete enrollment and mark as completed', async () => {
      const completedEnrollment = {
        id: 'enrollment-1',
        studentId: 'student-1',
        courseId: 'course-1',
        tier: 'free',
        status: 'completed',
        progress: 100,
        startDate: new Date(),
        completionDate: new Date(),
      };

      (enrollmentService.completeEnrollment as jest.Mock).mockResolvedValue(completedEnrollment);

      const response = await request(app).post('/api/v1/enrollments/enrollment-1/complete');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data.progress).toBe(100);
    });

    it('should drop enrollment', async () => {
      const droppedEnrollment = {
        id: 'enrollment-1',
        studentId: 'student-1',
        courseId: 'course-1',
        tier: 'free',
        status: 'dropped',
        progress: 30,
        startDate: new Date(),
        completionDate: null,
      };

      (enrollmentService.dropEnrollment as jest.Mock).mockResolvedValue(droppedEnrollment);

      const response = await request(app).post('/api/v1/enrollments/enrollment-1/drop');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('dropped');
    });
  });

  describe('Complete Student Journey: Progress Tracking', () => {
    it('should track student progress across modules', async () => {
      const mockEnrollments = [
        {
          id: 'enrollment-1',
          studentId: 'student-1',
          courseId: 'course-1',
          tier: 'free',
          status: 'active',
          progress: 25,
        },
        {
          id: 'enrollment-2',
          studentId: 'student-1',
          courseId: 'course-2',
          tier: 'free',
          status: 'active',
          progress: 50,
        },
      ];

      (enrollmentService.getStudentEnrollments as jest.Mock).mockResolvedValue(mockEnrollments);

      const response = await request(app).get('/api/v1/enrollments/student/student-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].progress).toBe(25);
      expect(response.body.data[1].progress).toBe(50);
    });
  });

  describe('Complete Student Journey: Assessment Submission', () => {
    it('should submit assessment and record learning outcome', async () => {
      const submissionData = {
        enrollmentId: 'enrollment-1',
        answers: ['answer1', 'answer2', 'answer3'],
        timeSpent: 1200,
      };

      const mockResult = {
        score: 85,
        passed: true,
        feedback: 'Congratulations! You passed with a score of 85%.',
        outcome: {
          id: 'outcome-1',
          enrollmentId: 'enrollment-1',
          courseId: 'course-1',
          moduleId: 'module-1',
          assessmentScore: 85,
          timeSpent: 1200,
          conceptMastery: 85,
          completedAt: new Date(),
        },
      };

      (assessmentService.submitAssessment as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/assessments/assessment-1/submit')
        .send(submissionData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.score).toBe(85);
      expect(response.body.data.passed).toBe(true);
      expect(response.body.data.outcome).toBeDefined();
      expect(response.body.data.outcome.conceptMastery).toBe(85);
    });

    it('should handle multiple assessment attempts', async () => {
      const firstAttempt = {
        score: 60,
        passed: false,
        feedback: 'You scored 60%. You need 70% to pass. Try again!',
        outcome: {
          id: 'outcome-1',
          assessmentScore: 60,
          timeSpent: 900,
          conceptMastery: 60,
        },
      };

      const secondAttempt = {
        score: 80,
        passed: true,
        feedback: 'Congratulations! You passed with a score of 80%.',
        outcome: {
          id: 'outcome-2',
          assessmentScore: 80,
          timeSpent: 1200,
          conceptMastery: 80,
        },
      };

      (assessmentService.submitAssessment as jest.Mock)
        .mockResolvedValueOnce(firstAttempt)
        .mockResolvedValueOnce(secondAttempt);

      // First attempt
      const firstResponse = await request(app)
        .post('/api/v1/assessments/assessment-1/submit')
        .send({
          enrollmentId: 'enrollment-1',
          answers: ['answer1', 'answer2'],
          timeSpent: 900,
        });

      expect(firstResponse.status).toBe(201);
      expect(firstResponse.body.data.passed).toBe(false);

      // Second attempt
      const secondResponse = await request(app)
        .post('/api/v1/assessments/assessment-1/submit')
        .send({
          enrollmentId: 'enrollment-1',
          answers: ['answer1', 'answer2', 'answer3'],
          timeSpent: 1200,
        });

      expect(secondResponse.status).toBe(201);
      expect(secondResponse.body.data.passed).toBe(true);
    });

    it('should retrieve assessment results and statistics', async () => {
      const mockResults = {
        assessment: {
          id: 'assessment-1',
          courseId: 'course-1',
          moduleId: 'module-1',
          title: 'Module 1 Quiz',
          questions: ['Q1', 'Q2', 'Q3'],
          passingScore: 70,
        },
        submissions: [
          { id: 'outcome-1', assessmentScore: 100, timeSpent: 1200 },
          { id: 'outcome-2', assessmentScore: 85, timeSpent: 1500 },
          { id: 'outcome-3', assessmentScore: 60, timeSpent: 900 },
        ],
        averageScore: 81.67,
        passRate: 66.67,
      };

      (assessmentService.getAssessmentResults as jest.Mock).mockResolvedValue(mockResults);

      const response = await request(app).get('/api/v1/assessments/assessment-1/results');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.averageScore).toBeCloseTo(81.67, 1);
      expect(response.body.data.passRate).toBeCloseTo(66.67, 1);
      expect(response.body.data.submissions).toHaveLength(3);
    });
  });

  describe('Complete Student Journey: Full Flow', () => {
    it('should complete full student journey from enrollment to assessment', async () => {
      // Step 1: Create course
      const courseData = {
        title: 'Advanced TypeScript',
        description: 'Master TypeScript',
        instructorId: 'instructor-1',
        tier: 'free',
      };

      const mockCourse = {
        id: 'course-1',
        ...courseData,
        modules: [{ id: 'module-1', title: 'Module 1' }],
        assessments: [{ id: 'assessment-1', title: 'Quiz 1' }],
      };

      (courseService.createCourse as jest.Mock).mockResolvedValue(mockCourse);

      const courseResponse = await request(app)
        .post('/api/v1/courses')
        .send(courseData);

      expect(courseResponse.status).toBe(201);

      // Step 2: Enroll student
      const enrollmentData = {
        studentId: 'student-1',
        courseId: 'course-1',
        tier: 'free',
      };

      const mockEnrollment = {
        id: 'enrollment-1',
        ...enrollmentData,
        status: 'active',
        progress: 0,
      };

      (enrollmentService.enrollStudent as jest.Mock).mockResolvedValue(mockEnrollment);

      const enrollResponse = await request(app)
        .post('/api/v1/enrollments')
        .send(enrollmentData);

      expect(enrollResponse.status).toBe(201);

      // Step 3: Update progress
      const updatedEnrollment = { ...mockEnrollment, progress: 50 };
      (enrollmentService.updateProgress as jest.Mock).mockResolvedValue(updatedEnrollment);

      const progressResponse = await request(app)
        .put('/api/v1/enrollments/enrollment-1/progress')
        .send({ progress: 50 });

      expect(progressResponse.status).toBe(200);

      // Step 4: Submit assessment
      const submissionData = {
        enrollmentId: 'enrollment-1',
        answers: ['answer1', 'answer2', 'answer3'],
        timeSpent: 1200,
      };

      const mockResult = {
        score: 90,
        passed: true,
        feedback: 'Congratulations! You passed with a score of 90%.',
        outcome: {
          id: 'outcome-1',
          enrollmentId: 'enrollment-1',
          courseId: 'course-1',
          moduleId: 'module-1',
          assessmentScore: 90,
          timeSpent: 1200,
          conceptMastery: 90,
        },
      };

      (assessmentService.submitAssessment as jest.Mock).mockResolvedValue(mockResult);

      const assessmentResponse = await request(app)
        .post('/api/v1/assessments/assessment-1/submit')
        .send(submissionData);

      expect(assessmentResponse.status).toBe(201);
      expect(assessmentResponse.body.data.passed).toBe(true);

      // Step 5: Complete enrollment
      const completedEnrollment = { ...mockEnrollment, status: 'completed', progress: 100 };
      (enrollmentService.completeEnrollment as jest.Mock).mockResolvedValue(completedEnrollment);

      const completeResponse = await request(app).post('/api/v1/enrollments/enrollment-1/complete');

      expect(completeResponse.status).toBe(200);
      expect(completeResponse.body.data.status).toBe('completed');
    });
  });

  describe('Error Handling', () => {
    it('should handle course not found', async () => {
      (courseService.getCourse as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/v1/courses/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should handle enrollment not found', async () => {
      (enrollmentService.getEnrollment as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/v1/enrollments/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should handle invalid progress value', async () => {
      const response = await request(app)
        .put('/api/v1/enrollments/enrollment-1/progress')
        .send({ progress: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle assessment submission errors', async () => {
      (assessmentService.submitAssessment as jest.Mock).mockRejectedValue(
        new Error('Assessment not found')
      );

      const response = await request(app)
        .post('/api/v1/assessments/assessment-1/submit')
        .send({
          enrollmentId: 'enrollment-1',
          answers: ['answer1'],
          timeSpent: 600,
        });

      expect(response.status).toBe(500);
    });
  });
});
