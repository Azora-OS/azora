import request from 'supertest';
import express from 'express';
import courseRoutes from '../course.routes';
import { courseService } from '../../services/course.service';

jest.mock('../../services/course.service');

const app = express();
app.use(express.json());
app.use('/api/v1/courses', courseRoutes);

describe('Course Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/courses', () => {
    it('should list courses', async () => {
      const mockCourses = [
        {
          id: 'course-1',
          title: 'Course 1',
          description: 'Description 1',
          instructorId: 'instructor-1',
          tier: 'free',
          modules: [],
          assessments: [],
        },
      ];

      (courseService.listCourses as jest.Mock).mockResolvedValue({
        courses: mockCourses,
        total: 1,
      });

      const response = await request(app).get('/api/v1/courses');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockCourses);
    });
  });

  describe('POST /api/v1/courses', () => {
    it('should create a course', async () => {
      const courseData = {
        title: 'New Course',
        description: 'Course description',
        instructorId: 'instructor-1',
        tier: 'free',
      };

      const mockCourse = {
        id: 'course-1',
        ...courseData,
        modules: [],
        assessments: [],
      };

      (courseService.createCourse as jest.Mock).mockResolvedValue(mockCourse);

      const response = await request(app)
        .post('/api/v1/courses')
        .send(courseData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockCourse);
    });
  });

  describe('GET /api/v1/courses/:id', () => {
    it('should get a course by ID', async () => {
      const mockCourse = {
        id: 'course-1',
        title: 'Course 1',
        description: 'Description',
        instructorId: 'instructor-1',
        tier: 'free',
        modules: [],
        assessments: [],
      };

      (courseService.getCourse as jest.Mock).mockResolvedValue(mockCourse);

      const response = await request(app).get('/api/v1/courses/course-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockCourse);
    });

    it('should return 404 if course not found', async () => {
      (courseService.getCourse as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/v1/courses/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/courses/:id', () => {
    it('should update a course', async () => {
      const updateData = { title: 'Updated Title' };
      const mockUpdatedCourse = {
        id: 'course-1',
        title: 'Updated Title',
        description: 'Description',
        instructorId: 'instructor-1',
        tier: 'free',
        modules: [],
        assessments: [],
      };

      (courseService.updateCourse as jest.Mock).mockResolvedValue(mockUpdatedCourse);

      const response = await request(app)
        .put('/api/v1/courses/course-1')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Title');
    });
  });

  describe('DELETE /api/v1/courses/:id', () => {
    it('should delete a course', async () => {
      (courseService.deleteCourse as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app).delete('/api/v1/courses/course-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/courses/:id/modules', () => {
    it('should create a module', async () => {
      const moduleData = {
        title: 'Module 1',
        content: 'Module content',
        order: 1,
        estimatedTime: 60,
      };

      const mockModule = {
        id: 'module-1',
        courseId: 'course-1',
        ...moduleData,
      };

      (courseService.createModule as jest.Mock).mockResolvedValue(mockModule);

      const response = await request(app)
        .post('/api/v1/courses/course-1/modules')
        .send(moduleData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockModule);
    });
  });

  describe('POST /api/v1/courses/:id/assessments', () => {
    it('should create an assessment', async () => {
      const assessmentData = {
        moduleId: 'module-1',
        title: 'Quiz 1',
        questions: ['Q1', 'Q2'],
        passingScore: 70,
      };

      const mockAssessment = {
        id: 'assessment-1',
        courseId: 'course-1',
        ...assessmentData,
      };

      (courseService.createAssessment as jest.Mock).mockResolvedValue(mockAssessment);

      const response = await request(app)
        .post('/api/v1/courses/course-1/assessments')
        .send(assessmentData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockAssessment);
    });
  });
});
