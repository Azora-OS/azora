import { prisma } from '../index';
import { Course, Module, Assessment } from '../types';
import { logger } from '../utils/logger';
import Joi from 'joi';

// Validation schemas
const courseSchema = Joi.object({
  title: Joi.string().required().min(3).max(255),
  description: Joi.string().required().min(10),
  instructorId: Joi.string().required(),
  tier: Joi.string().valid('free', 'premium', 'pro').required(),
  prerequisites: Joi.array().items(Joi.string()),
  language: Joi.string().default('en'),
});

const moduleSchema = Joi.object({
  courseId: Joi.string().required(),
  title: Joi.string().required().min(3),
  content: Joi.string().required(),
  order: Joi.number().required().min(1),
  estimatedTime: Joi.number().required().min(1),
});

const assessmentSchema = Joi.object({
  courseId: Joi.string().required(),
  moduleId: Joi.string().required(),
  title: Joi.string().required().min(3),
  questions: Joi.array().items(Joi.string()).required(),
  passingScore: Joi.number().min(0).max(100).default(70),
});

export class CourseService {
  async createCourse(data: any): Promise<Course> {
    try {
      const { error, value } = courseSchema.validate(data);
      if (error) {
        throw new Error(`Validation error: ${error.message}`);
      }

      const course = await prisma.course.create({
        data: {
          title: value.title,
          description: value.description,
          instructorId: value.instructorId,
          tier: value.tier,
          prerequisites: value.prerequisites || [],
          language: value.language,
        },
        include: {
          modules: true,
          assessments: true,
        },
      });

      logger.info(`Course created: ${course.id}`);
      return course as Course;
    } catch (error) {
      logger.error('Error creating course:', error);
      throw error;
    }
  }

  async getCourse(courseId: string): Promise<Course | null> {
    try {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          modules: true,
          assessments: true,
        },
      });

      return course as Course | null;
    } catch (error) {
      logger.error('Error getting course:', error);
      throw error;
    }
  }

  async listCourses(
    tier?: string,
    language?: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ courses: Course[]; total: number }> {
    try {
      const where: any = {};
      if (tier) where.tier = tier;
      if (language) where.language = language;

      const [courses, total] = await Promise.all([
        prisma.course.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: {
            modules: true,
            assessments: true,
          },
        }),
        prisma.course.count({ where }),
      ]);

      return {
        courses: courses as Course[],
        total,
      };
    } catch (error) {
      logger.error('Error listing courses:', error);
      throw error;
    }
  }

  async updateCourse(courseId: string, data: any): Promise<Course> {
    try {
      const { error, value } = courseSchema.validate(data, { presence: 'optional' });
      if (error) {
        throw new Error(`Validation error: ${error.message}`);
      }

      const course = await prisma.course.update({
        where: { id: courseId },
        data: value,
        include: {
          modules: true,
          assessments: true,
        },
      });

      logger.info(`Course updated: ${courseId}`);
      return course as Course;
    } catch (error) {
      logger.error('Error updating course:', error);
      throw error;
    }
  }

  async deleteCourse(courseId: string): Promise<void> {
    try {
      await prisma.course.delete({
        where: { id: courseId },
      });

      logger.info(`Course deleted: ${courseId}`);
    } catch (error) {
      logger.error('Error deleting course:', error);
      throw error;
    }
  }

  async createModule(data: any): Promise<Module> {
    try {
      const { error, value } = moduleSchema.validate(data);
      if (error) {
        throw new Error(`Validation error: ${error.message}`);
      }

      const module = await prisma.module.create({
        data: {
          courseId: value.courseId,
          title: value.title,
          content: value.content,
          order: value.order,
          estimatedTime: value.estimatedTime,
        },
      });

      logger.info(`Module created: ${module.id}`);
      return module as Module;
    } catch (error) {
      logger.error('Error creating module:', error);
      throw error;
    }
  }

  async createAssessment(data: any): Promise<Assessment> {
    try {
      const { error, value } = assessmentSchema.validate(data);
      if (error) {
        throw new Error(`Validation error: ${error.message}`);
      }

      const assessment = await prisma.assessment.create({
        data: {
          courseId: value.courseId,
          moduleId: value.moduleId,
          title: value.title,
          questions: value.questions,
          passingScore: value.passingScore,
        },
      });

      logger.info(`Assessment created: ${assessment.id}`);
      return assessment as Assessment;
    } catch (error) {
      logger.error('Error creating assessment:', error);
      throw error;
    }
  }
}

export const courseService = new CourseService();
