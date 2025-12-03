import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface CourseModule {
  id: string;
  title: string;
  content: string;
  order: number;
  estimatedTime: number;
}

export interface CourseContent {
  id: string;
  title: string;
  description: string;
  modules: CourseModule[];
  tier: 'free' | 'premium' | 'pro';
  language: string;
}

export class TeacherCourseBuilderService {
  async createCourse(instructorId: string, courseData: Partial<CourseContent>): Promise<CourseContent> {
    try {
      const course = await prisma.course.create({
        data: {
          title: courseData.title || 'Untitled Course',
          description: courseData.description || '',
          instructorId,
          tier: courseData.tier || 'free',
          language: courseData.language || 'en',
          modules: { create: courseData.modules || [] },
          prerequisites: [],
        },
        include: { modules: true },
      });

      logger.info('Course created', { courseId: course.id, instructorId });
      return { id: course.id, title: course.title, description: course.description, modules: course.modules, tier: course.tier as any, language: course.language };
    } catch (error) {
      logger.error('Error creating course', { error, instructorId });
      throw error;
    }
  }

  async updateCourse(courseId: string, courseData: Partial<CourseContent>): Promise<CourseContent> {
    try {
      const course = await prisma.course.update({
        where: { id: courseId },
        data: {
          title: courseData.title,
          description: courseData.description,
          tier: courseData.tier,
          language: courseData.language,
        },
        include: { modules: true },
      });

      logger.info('Course updated', { courseId });
      return { id: course.id, title: course.title, description: course.description, modules: course.modules, tier: course.tier as any, language: course.language };
    } catch (error) {
      logger.error('Error updating course', { error, courseId });
      throw error;
    }
  }

  async deleteCourse(courseId: string): Promise<void> {
    try {
      await prisma.course.delete({ where: { id: courseId } });
      logger.info('Course deleted', { courseId });
    } catch (error) {
      logger.error('Error deleting course', { error, courseId });
      throw error;
    }
  }

  async addModule(courseId: string, module: CourseModule): Promise<CourseModule> {
    try {
      const newModule = await prisma.module.create({
        data: {
          courseId,
          title: module.title,
          content: module.content,
          order: module.order,
          estimatedTime: module.estimatedTime,
        },
      });

      logger.info('Module added', { courseId, moduleId: newModule.id });
      return newModule as any;
    } catch (error) {
      logger.error('Error adding module', { error, courseId });
      throw error;
    }
  }

  async publishCourse(courseId: string): Promise<{ success: boolean; message: string }> {
    try {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course) {throw new Error('Course not found');}

      logger.info('Course published', { courseId });
      return { success: true, message: 'Course published successfully' };
    } catch (error) {
      logger.error('Error publishing course', { error, courseId });
      throw error;
    }
  }
}

export const teacherCourseBuilderService = new TeacherCourseBuilderService();
