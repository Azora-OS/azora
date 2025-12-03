import { prisma } from '../index';
import { Enrollment } from '../types';
import { logger } from '../utils/logger';
import Joi from 'joi';

const enrollmentSchema = Joi.object({
  studentId: Joi.string().required(),
  courseId: Joi.string().required(),
  tier: Joi.string().valid('free', 'premium', 'pro').required(),
});

export class EnrollmentService {
  async enrollStudent(data: any): Promise<Enrollment> {
    try {
      const { error, value } = enrollmentSchema.validate(data);
      if (error) {
        throw new Error(`Validation error: ${error.message}`);
      }

      // Check if student already enrolled
      const existing = await prisma.enrollment.findFirst({
        where: {
          studentId: value.studentId,
          courseId: value.courseId,
        },
      });

      if (existing) {
        throw new Error('Student already enrolled in this course');
      }

      // Check tier access
      const course = await prisma.course.findUnique({
        where: { id: value.courseId },
      });

      if (!course) {
        throw new Error('Course not found');
      }

      // Verify student tier has access to course tier
      const tierHierarchy = { free: 0, premium: 1, pro: 2 };
      if (tierHierarchy[value.tier as keyof typeof tierHierarchy] < tierHierarchy[course.tier as keyof typeof tierHierarchy]) {
        throw new Error('Student tier does not have access to this course');
      }

      const enrollment = await prisma.enrollment.create({
        data: {
          studentId: value.studentId,
          courseId: value.courseId,
          tier: value.tier,
          status: 'active',
        },
      });

      logger.info(`Student enrolled: ${value.studentId} in course ${value.courseId}`);
      return enrollment as Enrollment;
    } catch (error) {
      logger.error('Error enrolling student:', error);
      throw error;
    }
  }

  async getEnrollment(enrollmentId: string): Promise<Enrollment | null> {
    try {
      const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
      });

      return enrollment as Enrollment | null;
    } catch (error) {
      logger.error('Error getting enrollment:', error);
      throw error;
    }
  }

  async getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId },
      });

      return enrollments as Enrollment[];
    } catch (error) {
      logger.error('Error getting student enrollments:', error);
      throw error;
    }
  }

  async updateProgress(enrollmentId: string, progress: number): Promise<Enrollment> {
    try {
      if (progress < 0 || progress > 100) {
        throw new Error('Progress must be between 0 and 100');
      }

      const enrollment = await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: { progress },
      });

      logger.info(`Progress updated for enrollment ${enrollmentId}: ${progress}%`);
      return enrollment as Enrollment;
    } catch (error) {
      logger.error('Error updating progress:', error);
      throw error;
    }
  }

  async completeEnrollment(enrollmentId: string): Promise<Enrollment> {
    try {
      const enrollment = await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          status: 'completed',
          progress: 100,
          completionDate: new Date(),
        },
      });

      logger.info(`Enrollment completed: ${enrollmentId}`);
      return enrollment as Enrollment;
    } catch (error) {
      logger.error('Error completing enrollment:', error);
      throw error;
    }
  }

  async dropEnrollment(enrollmentId: string): Promise<Enrollment> {
    try {
      const enrollment = await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: { status: 'dropped' },
      });

      logger.info(`Enrollment dropped: ${enrollmentId}`);
      return enrollment as Enrollment;
    } catch (error) {
      logger.error('Error dropping enrollment:', error);
      throw error;
    }
  }
}

export const enrollmentService = new EnrollmentService();
