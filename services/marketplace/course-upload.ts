/**
 * Course Upload Service
 * Handles course creation, validation, and metadata storage
 */

import { PrismaClient, CourseLevel, CourseStatus } from '@prisma/client';
import { logger } from '../shared/logging';
import { ErrorHandler } from '../payment/error-handler';

const prisma = new PrismaClient();

export interface CourseUploadInput {
  instructorId: string;
  title: string;
  description: string;
  category: string;
  level: CourseLevel;
  duration: number; // in minutes
  price: number;
  currency?: string;
  thumbnail?: string;
}

export interface CourseResponse {
  id: string;
  instructorId: string;
  title: string;
  description: string;
  category: string;
  level: CourseLevel;
  duration: number;
  price: number;
  currency: string;
  status: CourseStatus;
  rating: number;
  enrollmentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CourseUploadService {
  /**
   * Validate course data
   */
  private validateCourseData(input: CourseUploadInput): string[] {
    const errors: string[] = [];

    if (!input.title || input.title.trim().length === 0) {
      errors.push('Course title is required');
    }

    if (input.title && input.title.length > 200) {
      errors.push('Course title must be less than 200 characters');
    }

    if (!input.description || input.description.trim().length === 0) {
      errors.push('Course description is required');
    }

    if (input.description && input.description.length < 50) {
      errors.push('Course description must be at least 50 characters');
    }

    if (!input.category || input.category.trim().length === 0) {
      errors.push('Course category is required');
    }

    if (!['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(input.level)) {
      errors.push('Invalid course level');
    }

    if (input.duration <= 0) {
      errors.push('Course duration must be greater than 0');
    }

    if (input.price < 0) {
      errors.push('Course price cannot be negative');
    }

    return errors;
  }

  /**
   * Upload a new course
   */
  async uploadCourse(input: CourseUploadInput): Promise<CourseResponse> {
    try {
      logger.info('Uploading course', { instructorId: input.instructorId, title: input.title });

      // Validate input
      const errors = this.validateCourseData(input);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }

      // Check if instructor exists
      const instructor = await prisma.user.findUnique({
        where: { id: input.instructorId },
      });

      if (!instructor) {
        throw new Error(`Instructor ${input.instructorId} not found`);
      }

      // Create course
      const course = await prisma.course.create({
        data: {
          instructorId: input.instructorId,
          title: input.title,
          description: input.description,
          category: input.category,
          level: input.level,
          duration: input.duration,
          price: input.price,
          currency: input.currency || 'ZAR',
          thumbnail: input.thumbnail,
          status: 'DRAFT',
        },
      });

      // Create instructor earnings record
      await prisma.instructorEarnings.create({
        data: {
          courseId: course.id,
          instructorId: input.instructorId,
          totalEarnings: 0,
          paidEarnings: 0,
          pendingEarnings: 0,
        },
      });

      logger.info('Course uploaded successfully', { courseId: course.id });
      return this.mapCourseResponse(course);
    } catch (error) {
      logger.error('Failed to upload course', { error, instructorId: input.instructorId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Update course
   */
  async updateCourse(courseId: string, input: Partial<CourseUploadInput>): Promise<CourseResponse> {
    try {
      logger.info('Updating course', { courseId });

      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        throw new Error(`Course ${courseId} not found`);
      }

      // Validate if updating data
      if (input.title || input.description || input.level) {
        const fullInput = {
          ...input,
          instructorId: course.instructorId,
          category: input.category || course.category,
          duration: input.duration || course.duration,
          level: input.level || course.level,
        } as CourseUploadInput;

        const errors = this.validateCourseData(fullInput);
        if (errors.length > 0) {
          throw new Error(`Validation failed: ${errors.join(', ')}`);
        }
      }

      const updated = await prisma.course.update({
        where: { id: courseId },
        data: {
          title: input.title,
          description: input.description,
          category: input.category,
          level: input.level,
          duration: input.duration,
          price: input.price,
          currency: input.currency,
          thumbnail: input.thumbnail,
        },
      });

      logger.info('Course updated successfully', { courseId });
      return this.mapCourseResponse(updated);
    } catch (error) {
      logger.error('Failed to update course', { error, courseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Publish a course
   */
  async publishCourse(courseId: string): Promise<CourseResponse> {
    try {
      logger.info('Publishing course', { courseId });

      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        throw new Error(`Course ${courseId} not found`);
      }

      if (course.status !== 'DRAFT') {
        throw new Error(`Course must be in DRAFT status to publish (current: ${course.status})`);
      }

      const updated = await prisma.course.update({
        where: { id: courseId },
        data: { status: 'PUBLISHED' },
      });

      logger.info('Course published successfully', { courseId });
      return this.mapCourseResponse(updated);
    } catch (error) {
      logger.error('Failed to publish course', { error, courseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Archive a course
   */
  async archiveCourse(courseId: string): Promise<CourseResponse> {
    try {
      logger.info('Archiving course', { courseId });

      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        throw new Error(`Course ${courseId} not found`);
      }

      const updated = await prisma.course.update({
        where: { id: courseId },
        data: { status: 'ARCHIVED' },
      });

      logger.info('Course archived successfully', { courseId });
      return this.mapCourseResponse(updated);
    } catch (error) {
      logger.error('Failed to archive course', { error, courseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get course by ID
   */
  async getCourse(courseId: string): Promise<CourseResponse | null> {
    try {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        return null;
      }

      return this.mapCourseResponse(course);
    } catch (error) {
      logger.error('Failed to get course', { error, courseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get courses by instructor
   */
  async getInstructorCourses(instructorId: string): Promise<CourseResponse[]> {
    try {
      const courses = await prisma.course.findMany({
        where: { instructorId },
        orderBy: { createdAt: 'desc' },
      });

      return courses.map((course) => this.mapCourseResponse(course));
    } catch (error) {
      logger.error('Failed to get instructor courses', { error, instructorId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Delete course
   */
  async deleteCourse(courseId: string): Promise<void> {
    try {
      logger.info('Deleting course', { courseId });

      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        throw new Error(`Course ${courseId} not found`);
      }

      // Check if course has enrollments
      const enrollmentCount = await prisma.enrollment.count({
        where: { courseId },
      });

      if (enrollmentCount > 0) {
        throw new Error('Cannot delete course with active enrollments');
      }

      await prisma.course.delete({
        where: { id: courseId },
      });

      logger.info('Course deleted successfully', { courseId });
    } catch (error) {
      logger.error('Failed to delete course', { error, courseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Map course to response format
   */
  private mapCourseResponse(course: any): CourseResponse {
    return {
      id: course.id,
      instructorId: course.instructorId,
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      duration: course.duration,
      price: course.price,
      currency: course.currency,
      status: course.status,
      rating: course.rating,
      enrollmentCount: course.enrollmentCount,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  }
}

export default new CourseUploadService();
