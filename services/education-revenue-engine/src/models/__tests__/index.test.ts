import { CourseModel, EnrollmentModel, LearningOutcomeModel } from '../index';
import { getPrismaClient } from '../../utils/database';
import { NotFoundError, TierAccessError, EnrollmentError } from '../../utils/errors';

// Mock Prisma client
jest.mock('../../utils/database');

describe('Data Models', () => {
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      course: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      enrollment: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      assessment: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      learningOutcome: {
        create: jest.fn(),
        findMany: jest.fn(),
        aggregate: jest.fn(),
      },
    };

    (getPrismaClient as jest.Mock).mockReturnValue(mockPrisma);
  });

  describe('CourseModel', () => {
    describe('create', () => {
      it('should create a course with provided data', async () => {
        const courseData = {
          title: 'TypeScript Basics',
          description: 'Learn TypeScript fundamentals',
          instructorId: 'instructor-123',
          tier: 'free' as const,
          language: 'en',
          prerequisites: [],
        };

        mockPrisma.course.create.mockResolvedValue({
          id: 'course-123',
          ...courseData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const result = await CourseModel.create(courseData);

        expect(mockPrisma.course.create).toHaveBeenCalledWith({
          data: courseData,
        });
        expect(result.id).toBe('course-123');
        expect(result.title).toBe('TypeScript Basics');
      });

      it('should use default language if not provided', async () => {
        const courseData = {
          title: 'TypeScript Basics',
          description: 'Learn TypeScript fundamentals',
          instructorId: 'instructor-123',
          tier: 'free' as const,
        };

        mockPrisma.course.create.mockResolvedValue({
          id: 'course-123',
          ...courseData,
          language: 'en',
          prerequisites: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await CourseModel.create(courseData);

        expect(mockPrisma.course.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            language: 'en',
            prerequisites: [],
          }),
        });
      });
    });

    describe('findById', () => {
      it('should find a course by ID', async () => {
        const course = {
          id: 'course-123',
          title: 'TypeScript Basics',
          description: 'Learn TypeScript',
          instructorId: 'instructor-123',
          tier: 'free',
          language: 'en',
          prerequisites: [],
          modules: [],
          assessments: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockPrisma.course.findUnique.mockResolvedValue(course);

        const result = await CourseModel.findById('course-123');

        expect(mockPrisma.course.findUnique).toHaveBeenCalledWith({
          where: { id: 'course-123' },
          include: {
            modules: true,
            assessments: true,
          },
        });
        expect(result).toEqual(course);
      });

      it('should throw NotFoundError when course does not exist', async () => {
        mockPrisma.course.findUnique.mockResolvedValue(null);

        await expect(CourseModel.findById('nonexistent')).rejects.toThrow(NotFoundError);
      });
    });

    describe('findAll', () => {
      it('should find all courses with pagination', async () => {
        const courses = [
          {
            id: 'course-1',
            title: 'Course 1',
            description: 'Description 1',
            instructorId: 'instructor-1',
            tier: 'free',
            language: 'en',
            prerequisites: [],
            modules: [],
            assessments: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        mockPrisma.course.findMany.mockResolvedValue(courses);
        mockPrisma.course.count.mockResolvedValue(1);

        const result = await CourseModel.findAll({ page: 1, pageSize: 10 });

        expect(result.data).toEqual(courses);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.pageSize).toBe(10);
        expect(result.totalPages).toBe(1);
      });

      it('should filter by tier', async () => {
        mockPrisma.course.findMany.mockResolvedValue([]);
        mockPrisma.course.count.mockResolvedValue(0);

        await CourseModel.findAll({ tier: 'premium' });

        expect(mockPrisma.course.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ tier: 'premium' }),
          })
        );
      });
    });

    describe('update', () => {
      it('should update a course', async () => {
        const updatedCourse = {
          id: 'course-123',
          title: 'Updated Title',
          description: 'Updated Description',
          instructorId: 'instructor-123',
          tier: 'premium',
          language: 'en',
          prerequisites: [],
          modules: [],
          assessments: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockPrisma.course.update.mockResolvedValue(updatedCourse);

        const result = await CourseModel.update('course-123', {
          title: 'Updated Title',
          tier: 'premium',
        });

        expect(mockPrisma.course.update).toHaveBeenCalledWith({
          where: { id: 'course-123' },
          data: expect.objectContaining({
            title: 'Updated Title',
            tier: 'premium',
          }),
          include: {
            modules: true,
            assessments: true,
          },
        });
        expect(result.title).toBe('Updated Title');
      });
    });

    describe('delete', () => {
      it('should delete a course', async () => {
        mockPrisma.course.delete.mockResolvedValue({ id: 'course-123' });

        await CourseModel.delete('course-123');

        expect(mockPrisma.course.delete).toHaveBeenCalledWith({
          where: { id: 'course-123' },
        });
      });
    });
  });

  describe('EnrollmentModel', () => {
    describe('create', () => {
      it('should create an enrollment for a free course', async () => {
        const enrollmentData = {
          studentId: 'student-123',
          courseId: 'course-456',
          tier: 'free' as const,
        };

        mockPrisma.course.findUnique.mockResolvedValue({
          id: 'course-456',
          tier: 'free',
        });

        mockPrisma.enrollment.findFirst.mockResolvedValue(null);

        mockPrisma.enrollment.create.mockResolvedValue({
          id: 'enrollment-789',
          ...enrollmentData,
          status: 'active',
          progress: 0,
          startDate: new Date(),
          completionDate: null,
          course: { id: 'course-456', tier: 'free' },
          student: { id: 'student-123' },
        });

        const result = await EnrollmentModel.create(enrollmentData);

        expect(result.id).toBe('enrollment-789');
        expect(result.status).toBe('active');
        expect(result.progress).toBe(0);
      });

      it('should throw TierAccessError when free student tries to enroll in premium course', async () => {
        const enrollmentData = {
          studentId: 'student-123',
          courseId: 'course-456',
          tier: 'free' as const,
        };

        mockPrisma.course.findUnique.mockResolvedValue({
          id: 'course-456',
          tier: 'premium',
        });

        await expect(EnrollmentModel.create(enrollmentData)).rejects.toThrow(TierAccessError);
      });

      it('should throw NotFoundError when course does not exist', async () => {
        const enrollmentData = {
          studentId: 'student-123',
          courseId: 'nonexistent',
          tier: 'free' as const,
        };

        mockPrisma.course.findUnique.mockResolvedValue(null);

        await expect(EnrollmentModel.create(enrollmentData)).rejects.toThrow(NotFoundError);
      });

      it('should throw EnrollmentError for duplicate enrollment', async () => {
        const enrollmentData = {
          studentId: 'student-123',
          courseId: 'course-456',
          tier: 'free' as const,
        };

        mockPrisma.course.findUnique.mockResolvedValue({
          id: 'course-456',
          tier: 'free',
        });

        mockPrisma.enrollment.findFirst.mockResolvedValue({
          id: 'existing-enrollment',
        });

        await expect(EnrollmentModel.create(enrollmentData)).rejects.toThrow(EnrollmentError);
      });
    });

    describe('findById', () => {
      it('should find an enrollment by ID', async () => {
        const enrollment = {
          id: 'enrollment-123',
          studentId: 'student-123',
          courseId: 'course-456',
          tier: 'free',
          status: 'active',
          progress: 50,
          startDate: new Date(),
          completionDate: null,
          course: { id: 'course-456' },
          student: { id: 'student-123' },
          outcomes: [],
        };

        mockPrisma.enrollment.findUnique.mockResolvedValue(enrollment);

        const result = await EnrollmentModel.findById('enrollment-123');

        expect(result).toEqual(enrollment);
      });

      it('should throw NotFoundError when enrollment does not exist', async () => {
        mockPrisma.enrollment.findUnique.mockResolvedValue(null);

        await expect(EnrollmentModel.findById('nonexistent')).rejects.toThrow(NotFoundError);
      });
    });

    describe('findByStudentId', () => {
      it('should find enrollments by student ID', async () => {
        const enrollments = [
          {
            id: 'enrollment-1',
            studentId: 'student-123',
            courseId: 'course-1',
            tier: 'free',
            status: 'active',
            progress: 50,
            startDate: new Date(),
            completionDate: null,
            course: { id: 'course-1' },
            outcomes: [],
          },
        ];

        mockPrisma.enrollment.findMany.mockResolvedValue(enrollments);
        mockPrisma.enrollment.count.mockResolvedValue(1);

        const result = await EnrollmentModel.findByStudentId('student-123');

        expect(result.data).toEqual(enrollments);
        expect(result.total).toBe(1);
      });
    });

    describe('markCompleted', () => {
      it('should mark an enrollment as completed', async () => {
        mockPrisma.enrollment.update.mockResolvedValue({
          id: 'enrollment-123',
          status: 'completed',
          progress: 100,
          completionDate: new Date(),
        });

        const result = await EnrollmentModel.markCompleted('enrollment-123');

        expect(mockPrisma.enrollment.update).toHaveBeenCalledWith({
          where: { id: 'enrollment-123' },
          data: expect.objectContaining({
            status: 'completed',
            progress: 100,
          }),
        });
        expect(result.status).toBe('completed');
      });
    });
  });

  describe('LearningOutcomeModel', () => {
    describe('create', () => {
      it('should create a learning outcome', async () => {
        const outcomeData = {
          enrollmentId: 'enrollment-123',
          courseId: 'course-456',
          moduleId: 'module-789',
          assessmentScore: 85,
          timeSpent: 3600,
          conceptMastery: 80,
        };

        mockPrisma.learningOutcome.create.mockResolvedValue({
          id: 'outcome-123',
          ...outcomeData,
          completedAt: new Date(),
        });

        const result = await LearningOutcomeModel.create(outcomeData);

        expect(result.id).toBe('outcome-123');
        expect(result.assessmentScore).toBe(85);
      });
    });

    describe('calculateAverageScore', () => {
      it('should calculate average score for an enrollment', async () => {
        mockPrisma.learningOutcome.aggregate.mockResolvedValue({
          _avg: { assessmentScore: 82.5 },
        });

        const result = await LearningOutcomeModel.calculateAverageScore('enrollment-123');

        expect(result).toBe(82.5);
      });

      it('should return 0 when no outcomes exist', async () => {
        mockPrisma.learningOutcome.aggregate.mockResolvedValue({
          _avg: { assessmentScore: null },
        });

        const result = await LearningOutcomeModel.calculateAverageScore('enrollment-123');

        expect(result).toBe(0);
      });
    });
  });
});
