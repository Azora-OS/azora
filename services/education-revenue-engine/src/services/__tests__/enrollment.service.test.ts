import { enrollmentService } from '../enrollment.service';
import { prisma } from '../../index';

jest.mock('../../index', () => ({
  prisma: {
    enrollment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    course: {
      findUnique: jest.fn(),
    },
  },
}));

describe('EnrollmentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('enrollStudent', () => {
    it('should enroll a student in a course', async () => {
      const enrollmentData = {
        studentId: 'student-1',
        courseId: 'course-1',
        tier: 'free',
      };

      const mockCourse = {
        id: 'course-1',
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

      (prisma.enrollment.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);
      (prisma.enrollment.create as jest.Mock).mockResolvedValue(mockEnrollment);

      const result = await enrollmentService.enrollStudent(enrollmentData);

      expect(result).toEqual(mockEnrollment);
      expect(prisma.enrollment.create).toHaveBeenCalled();
    });

    it('should throw error if student already enrolled', async () => {
      const enrollmentData = {
        studentId: 'student-1',
        courseId: 'course-1',
        tier: 'free',
      };

      (prisma.enrollment.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing-enrollment',
      });

      await expect(enrollmentService.enrollStudent(enrollmentData)).rejects.toThrow(
        'Student already enrolled in this course'
      );
    });

    it('should throw error if course not found', async () => {
      const enrollmentData = {
        studentId: 'student-1',
        courseId: 'non-existent',
        tier: 'free',
      };

      (prisma.enrollment.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.course.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(enrollmentService.enrollStudent(enrollmentData)).rejects.toThrow(
        'Course not found'
      );
    });

    it('should throw error if student tier does not have access', async () => {
      const enrollmentData = {
        studentId: 'student-1',
        courseId: 'course-1',
        tier: 'free',
      };

      const mockCourse = {
        id: 'course-1',
        tier: 'premium', // Premium course
      };

      (prisma.enrollment.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);

      await expect(enrollmentService.enrollStudent(enrollmentData)).rejects.toThrow(
        'Student tier does not have access to this course'
      );
    });
  });

  describe('getEnrollment', () => {
    it('should retrieve an enrollment by ID', async () => {
      const mockEnrollment = {
        id: 'enrollment-1',
        studentId: 'student-1',
        courseId: 'course-1',
        tier: 'free',
        status: 'active',
        progress: 50,
        startDate: new Date(),
        completionDate: null,
      };

      (prisma.enrollment.findUnique as jest.Mock).mockResolvedValue(mockEnrollment);

      const result = await enrollmentService.getEnrollment('enrollment-1');

      expect(result).toEqual(mockEnrollment);
    });

    it('should return null if enrollment not found', async () => {
      (prisma.enrollment.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await enrollmentService.getEnrollment('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getStudentEnrollments', () => {
    it('should retrieve all enrollments for a student', async () => {
      const mockEnrollments = [
        {
          id: 'enrollment-1',
          studentId: 'student-1',
          courseId: 'course-1',
          tier: 'free',
          status: 'active',
          progress: 50,
        },
        {
          id: 'enrollment-2',
          studentId: 'student-1',
          courseId: 'course-2',
          tier: 'premium',
          status: 'completed',
          progress: 100,
        },
      ];

      (prisma.enrollment.findMany as jest.Mock).mockResolvedValue(mockEnrollments);

      const result = await enrollmentService.getStudentEnrollments('student-1');

      expect(result).toEqual(mockEnrollments);
      expect(prisma.enrollment.findMany).toHaveBeenCalledWith({
        where: { studentId: 'student-1' },
      });
    });
  });

  describe('updateProgress', () => {
    it('should update enrollment progress', async () => {
      const mockUpdatedEnrollment = {
        id: 'enrollment-1',
        studentId: 'student-1',
        courseId: 'course-1',
        tier: 'free',
        status: 'active',
        progress: 75,
      };

      (prisma.enrollment.update as jest.Mock).mockResolvedValue(mockUpdatedEnrollment);

      const result = await enrollmentService.updateProgress('enrollment-1', 75);

      expect(result).toEqual(mockUpdatedEnrollment);
      expect(prisma.enrollment.update).toHaveBeenCalledWith({
        where: { id: 'enrollment-1' },
        data: { progress: 75 },
      });
    });

    it('should throw error for invalid progress value', async () => {
      await expect(enrollmentService.updateProgress('enrollment-1', 150)).rejects.toThrow(
        'Progress must be between 0 and 100'
      );
    });
  });

  describe('completeEnrollment', () => {
    it('should mark enrollment as completed', async () => {
      const mockCompletedEnrollment = {
        id: 'enrollment-1',
        studentId: 'student-1',
        courseId: 'course-1',
        tier: 'free',
        status: 'completed',
        progress: 100,
        completionDate: new Date(),
      };

      (prisma.enrollment.update as jest.Mock).mockResolvedValue(mockCompletedEnrollment);

      const result = await enrollmentService.completeEnrollment('enrollment-1');

      expect(result.status).toBe('completed');
      expect(result.progress).toBe(100);
      expect(prisma.enrollment.update).toHaveBeenCalled();
    });
  });

  describe('dropEnrollment', () => {
    it('should mark enrollment as dropped', async () => {
      const mockDroppedEnrollment = {
        id: 'enrollment-1',
        studentId: 'student-1',
        courseId: 'course-1',
        tier: 'free',
        status: 'dropped',
        progress: 30,
      };

      (prisma.enrollment.update as jest.Mock).mockResolvedValue(mockDroppedEnrollment);

      const result = await enrollmentService.dropEnrollment('enrollment-1');

      expect(result.status).toBe('dropped');
      expect(prisma.enrollment.update).toHaveBeenCalled();
    });
  });
});
