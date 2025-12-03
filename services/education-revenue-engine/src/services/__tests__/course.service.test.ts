import { courseService } from '../course.service';
import { prisma } from '../../index';

// Mock Prisma
jest.mock('../../index', () => ({
  prisma: {
    course: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    module: {
      create: jest.fn(),
    },
    assessment: {
      create: jest.fn(),
    },
  },
}));

describe('CourseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCourse', () => {
    it('should create a course with valid data', async () => {
      const courseData = {
        title: 'Introduction to TypeScript',
        description: 'Learn TypeScript from basics to advanced',
        instructorId: 'instructor-1',
        tier: 'free',
        prerequisites: [],
        language: 'en',
      };

      const mockCourse = {
        id: 'course-1',
        ...courseData,
        modules: [],
        assessments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.course.create as jest.Mock).mockResolvedValue(mockCourse);

      const result = await courseService.createCourse(courseData);

      expect(result).toEqual(mockCourse);
      expect(prisma.course.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: courseData.title,
          instructorId: courseData.instructorId,
        }),
        include: {
          modules: true,
          assessments: true,
        },
      });
    });

    it('should throw error for invalid course data', async () => {
      const invalidData = {
        title: 'TS', // Too short
        description: 'Short',
        instructorId: 'instructor-1',
        tier: 'invalid-tier',
      };

      await expect(courseService.createCourse(invalidData)).rejects.toThrow();
    });

    it('should throw error when title is missing', async () => {
      const invalidData = {
        description: 'Learn TypeScript from basics to advanced',
        instructorId: 'instructor-1',
        tier: 'free',
      };

      await expect(courseService.createCourse(invalidData)).rejects.toThrow();
    });
  });

  describe('getCourse', () => {
    it('should retrieve a course by ID', async () => {
      const mockCourse = {
        id: 'course-1',
        title: 'Introduction to TypeScript',
        description: 'Learn TypeScript',
        instructorId: 'instructor-1',
        tier: 'free',
        prerequisites: [],
        language: 'en',
        modules: [],
        assessments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);

      const result = await courseService.getCourse('course-1');

      expect(result).toEqual(mockCourse);
      expect(prisma.course.findUnique).toHaveBeenCalledWith({
        where: { id: 'course-1' },
        include: {
          modules: true,
          assessments: true,
        },
      });
    });

    it('should return null if course not found', async () => {
      (prisma.course.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await courseService.getCourse('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('listCourses', () => {
    it('should list courses with pagination', async () => {
      const mockCourses = [
        {
          id: 'course-1',
          title: 'Course 1',
          description: 'Description 1',
          instructorId: 'instructor-1',
          tier: 'free',
          prerequisites: [],
          language: 'en',
          modules: [],
          assessments: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.course.findMany as jest.Mock).mockResolvedValue(mockCourses);
      (prisma.course.count as jest.Mock).mockResolvedValue(1);

      const result = await courseService.listCourses(undefined, undefined, 1, 10);

      expect(result.courses).toEqual(mockCourses);
      expect(result.total).toBe(1);
    });

    it('should filter courses by tier', async () => {
      (prisma.course.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.course.count as jest.Mock).mockResolvedValue(0);

      await courseService.listCourses('premium', undefined, 1, 10);

      expect(prisma.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tier: 'premium' },
        })
      );
    });
  });

  describe('updateCourse', () => {
    it('should update a course', async () => {
      const updateData = {
        title: 'Updated Title',
        description: 'Updated description for the course',
      };

      const mockUpdatedCourse = {
        id: 'course-1',
        title: 'Updated Title',
        description: 'Updated description for the course',
        instructorId: 'instructor-1',
        tier: 'free',
        prerequisites: [],
        language: 'en',
        modules: [],
        assessments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.course.update as jest.Mock).mockResolvedValue(mockUpdatedCourse);

      const result = await courseService.updateCourse('course-1', updateData);

      expect(result).toEqual(mockUpdatedCourse);
      expect(prisma.course.update).toHaveBeenCalled();
    });
  });

  describe('deleteCourse', () => {
    it('should delete a course', async () => {
      (prisma.course.delete as jest.Mock).mockResolvedValue({});

      await courseService.deleteCourse('course-1');

      expect(prisma.course.delete).toHaveBeenCalledWith({
        where: { id: 'course-1' },
      });
    });
  });

  describe('createModule', () => {
    it('should create a module with valid data', async () => {
      const moduleData = {
        courseId: 'course-1',
        title: 'Module 1: Basics',
        content: 'Module content here',
        order: 1,
        estimatedTime: 60,
      };

      const mockModule = {
        id: 'module-1',
        ...moduleData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.module.create as jest.Mock).mockResolvedValue(mockModule);

      const result = await courseService.createModule(moduleData);

      expect(result).toEqual(mockModule);
      expect(prisma.module.create).toHaveBeenCalled();
    });
  });

  describe('createAssessment', () => {
    it('should create an assessment with valid data', async () => {
      const assessmentData = {
        courseId: 'course-1',
        moduleId: 'module-1',
        title: 'Quiz 1',
        questions: ['Question 1', 'Question 2'],
        passingScore: 70,
      };

      const mockAssessment = {
        id: 'assessment-1',
        ...assessmentData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.assessment.create as jest.Mock).mockResolvedValue(mockAssessment);

      const result = await courseService.createAssessment(assessmentData);

      expect(result).toEqual(mockAssessment);
      expect(prisma.assessment.create).toHaveBeenCalled();
    });
  });
});
