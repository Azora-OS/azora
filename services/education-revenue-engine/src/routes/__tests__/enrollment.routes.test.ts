import request from 'supertest';
import express from 'express';
import enrollmentRoutes from '../enrollment.routes';
import { enrollmentService } from '../../services/enrollment.service';

jest.mock('../../services/enrollment.service');

const app = express();
app.use(express.json());
app.use('/api/v1/enrollments', enrollmentRoutes);

describe('Enrollment Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/enrollments', () => {
    it('should enroll a student', async () => {
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

      const response = await request(app)
        .post('/api/v1/enrollments')
        .send(enrollmentData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockEnrollment);
    });
  });

  describe('GET /api/v1/enrollments/:id', () => {
    it('should get an enrollment', async () => {
      const mockEnrollment = {
        id: 'enrollment-1',
        studentId: 'student-1',
        courseId: 'course-1',
        tier: 'free',
        status: 'active',
        progress: 50,
      };

      (enrollmentService.getEnrollment as jest.Mock).mockResolvedValue(mockEnrollment);

      const response = await request(app).get('/api/v1/enrollments/enrollment-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockEnrollment);
    });

    it('should return 404 if enrollment not found', async () => {
      (enrollmentService.getEnrollment as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/v1/enrollments/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/enrollments/student/:studentId', () => {
    it('should get student enrollments', async () => {
      const mockEnrollments = [
        {
          id: 'enrollment-1',
          studentId: 'student-1',
          courseId: 'course-1',
          tier: 'free',
          status: 'active',
          progress: 50,
        },
      ];

      (enrollmentService.getStudentEnrollments as jest.Mock).mockResolvedValue(mockEnrollments);

      const response = await request(app).get('/api/v1/enrollments/student/student-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockEnrollments);
    });
  });

  describe('PUT /api/v1/enrollments/:id/progress', () => {
    it('should update progress', async () => {
      const mockUpdatedEnrollment = {
        id: 'enrollment-1',
        studentId: 'student-1',
        courseId: 'course-1',
        tier: 'free',
        status: 'active',
        progress: 75,
      };

      (enrollmentService.updateProgress as jest.Mock).mockResolvedValue(mockUpdatedEnrollment);

      const response = await request(app)
        .put('/api/v1/enrollments/enrollment-1/progress')
        .send({ progress: 75 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.progress).toBe(75);
    });

    it('should return 400 for invalid progress', async () => {
      const response = await request(app)
        .put('/api/v1/enrollments/enrollment-1/progress')
        .send({ progress: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/enrollments/:id/complete', () => {
    it('should complete an enrollment', async () => {
      const mockCompletedEnrollment = {
        id: 'enrollment-1',
        studentId: 'student-1',
        courseId: 'course-1',
        tier: 'free',
        status: 'completed',
        progress: 100,
      };

      (enrollmentService.completeEnrollment as jest.Mock).mockResolvedValue(mockCompletedEnrollment);

      const response = await request(app).post('/api/v1/enrollments/enrollment-1/complete');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
    });
  });

  describe('POST /api/v1/enrollments/:id/drop', () => {
    it('should drop an enrollment', async () => {
      const mockDroppedEnrollment = {
        id: 'enrollment-1',
        studentId: 'student-1',
        courseId: 'course-1',
        tier: 'free',
        status: 'dropped',
        progress: 30,
      };

      (enrollmentService.dropEnrollment as jest.Mock).mockResolvedValue(mockDroppedEnrollment);

      const response = await request(app).post('/api/v1/enrollments/enrollment-1/drop');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('dropped');
    });
  });
});
