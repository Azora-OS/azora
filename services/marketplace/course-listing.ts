/**
 * Course Listing Service
 * Handles course search, filtering, and pagination
 */

import { PrismaClient, CourseLevel, CourseStatus } from '@prisma/client';
import { logger } from '../shared/logging';
import { ErrorHandler } from '../payment/error-handler';

const prisma = new PrismaClient();

export interface CourseListFilters {
  search?: string;
  category?: string;
  level?: CourseLevel;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  status?: CourseStatus;
  instructorId?: string;
}

export interface CourseListOptions {
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'price' | 'enrollments' | 'newest' | 'oldest';
  sortOrder?: 'asc' | 'desc';
}

export interface CourseListResponse {
  courses: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class CourseListingService {
  /**
   * List courses with filters and pagination
   */
  async listCourses(
    filters: CourseListFilters = {},
    options: CourseListOptions = {}
  ): Promise<CourseListResponse> {
    try {
      const page = Math.max(1, options.page || 1);
      const limit = Math.min(100, Math.max(1, options.limit || 20));
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {
        status: filters.status || 'PUBLISHED',
      };

      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { category: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      if (filters.category) {
        where.category = filters.category;
      }

      if (filters.level) {
        where.level = filters.level;
      }

      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        where.price = {};
        if (filters.minPrice !== undefined) {
          where.price.gte = filters.minPrice;
        }
        if (filters.maxPrice !== undefined) {
          where.price.lte = filters.maxPrice;
        }
      }

      if (filters.minRating !== undefined) {
        where.rating = { gte: filters.minRating };
      }

      if (filters.instructorId) {
        where.instructorId = filters.instructorId;
      }

      // Build order by
      let orderBy: any = { createdAt: 'desc' };
      if (options.sortBy) {
        const sortOrder = options.sortOrder || 'desc';
        switch (options.sortBy) {
          case 'rating':
            orderBy = { rating: sortOrder };
            break;
          case 'price':
            orderBy = { price: sortOrder };
            break;
          case 'enrollments':
            orderBy = { enrollmentCount: sortOrder };
            break;
          case 'newest':
            orderBy = { createdAt: 'desc' };
            break;
          case 'oldest':
            orderBy = { createdAt: 'asc' };
            break;
        }
      }

      // Get total count
      const total = await prisma.course.count({ where });

      // Get courses
      const courses = await prisma.course.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
      });

      logger.info('Courses listed', { total, page, limit });

      return {
        courses: courses.map((course) => ({
          ...course,
          reviewCount: course.reviews.length,
          reviews: undefined,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Failed to list courses', { error });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Search courses
   */
  async searchCourses(query: string, limit: number = 10): Promise<any[]> {
    try {
      logger.info('Searching courses', { query, limit });

      const courses = await prisma.course.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return courses;
    } catch (error) {
      logger.error('Failed to search courses', { error, query });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get featured courses
   */
  async getFeaturedCourses(limit: number = 10): Promise<any[]> {
    try {
      logger.info('Getting featured courses', { limit });

      const courses = await prisma.course.findMany({
        where: {
          status: 'PUBLISHED',
          rating: { gte: 4.0 },
        },
        orderBy: [{ rating: 'desc' }, { enrollmentCount: 'desc' }],
        take: limit,
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return courses;
    } catch (error) {
      logger.error('Failed to get featured courses', { error });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get trending courses
   */
  async getTrendingCourses(limit: number = 10): Promise<any[]> {
    try {
      logger.info('Getting trending courses', { limit });

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const courses = await prisma.course.findMany({
        where: {
          status: 'PUBLISHED',
          createdAt: { gte: sevenDaysAgo },
        },
        orderBy: { enrollmentCount: 'desc' },
        take: limit,
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return courses;
    } catch (error) {
      logger.error('Failed to get trending courses', { error });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const categories = await prisma.course.findMany({
        where: { status: 'PUBLISHED' },
        distinct: ['category'],
        select: { category: true },
      });

      return categories.map((c) => c.category).sort();
    } catch (error) {
      logger.error('Failed to get categories', { error });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get course statistics
   */
  async getCourseStats(): Promise<{
    totalCourses: number;
    publishedCourses: number;
    draftCourses: number;
    archivedCourses: number;
    averageRating: number;
    totalEnrollments: number;
  }> {
    try {
      const [total, published, draft, archived, enrollments] = await Promise.all([
        prisma.course.count(),
        prisma.course.count({ where: { status: 'PUBLISHED' } }),
        prisma.course.count({ where: { status: 'DRAFT' } }),
        prisma.course.count({ where: { status: 'ARCHIVED' } }),
        prisma.enrollment.count(),
      ]);

      const avgRatingResult = await prisma.course.aggregate({
        _avg: { rating: true },
      });

      return {
        totalCourses: total,
        publishedCourses: published,
        draftCourses: draft,
        archivedCourses: archived,
        averageRating: avgRatingResult._avg.rating || 0,
        totalEnrollments: enrollments,
      };
    } catch (error) {
      logger.error('Failed to get course stats', { error });
      throw ErrorHandler.handle(error);
    }
  }
}

export default new CourseListingService();
