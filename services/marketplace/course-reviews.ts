/**
 * Course Reviews Service
 * Handles course reviews, ratings, and moderation
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../shared/logging';
import { ErrorHandler } from '../payment/error-handler';

const prisma = new PrismaClient();

export interface ReviewInput {
  courseId: string;
  userId: string;
  rating: number; // 1-5
  comment?: string;
}

export interface ReviewResponse {
  id: string;
  courseId: string;
  userId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class CourseReviewsService {
  /**
   * Validate review data
   */
  private validateReview(input: ReviewInput): string[] {
    const errors: string[] = [];

    if (input.rating < 1 || input.rating > 5) {
      errors.push('Rating must be between 1 and 5');
    }

    if (input.comment && input.comment.length > 1000) {
      errors.push('Comment must be less than 1000 characters');
    }

    return errors;
  }

  /**
   * Submit a review
   */
  async submitReview(input: ReviewInput): Promise<ReviewResponse> {
    try {
      logger.info('Submitting review', { courseId: input.courseId, userId: input.userId });

      // Validate input
      const errors = this.validateReview(input);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }

      // Check if user has purchased the course
      const purchase = await prisma.coursePurchase.findUnique({
        where: {
          courseId_userId: {
            courseId: input.courseId,
            userId: input.userId,
          },
        },
      });

      if (!purchase) {
        throw new Error('User must purchase course before reviewing');
      }

      // Check if review already exists
      const existingReview = await prisma.courseReview.findUnique({
        where: {
          courseId_userId: {
            courseId: input.courseId,
            userId: input.userId,
          },
        },
      });

      if (existingReview) {
        // Update existing review
        const updated = await prisma.courseReview.update({
          where: { id: existingReview.id },
          data: {
            rating: input.rating,
            comment: input.comment,
          },
        });

        logger.info('Review updated', { reviewId: updated.id });
        return this.mapReviewResponse(updated);
      }

      // Create new review
      const review = await prisma.courseReview.create({
        data: {
          courseId: input.courseId,
          userId: input.userId,
          rating: input.rating,
          comment: input.comment,
        },
      });

      // Update course rating
      await this.updateCourseRating(input.courseId);

      logger.info('Review submitted', { reviewId: review.id });
      return this.mapReviewResponse(review);
    } catch (error) {
      logger.error('Failed to submit review', { error, ...input });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get reviews for a course
   */
  async getCourseReviews(
    courseId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    reviews: ReviewResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const [reviews, total] = await Promise.all([
        prisma.courseReview.findMany({
          where: { courseId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.courseReview.count({ where: { courseId } }),
      ]);

      return {
        reviews: reviews.map((r) => this.mapReviewResponse(r)),
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Failed to get course reviews', { error, courseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get user's review for a course
   */
  async getUserReview(courseId: string, userId: string): Promise<ReviewResponse | null> {
    try {
      const review = await prisma.courseReview.findUnique({
        where: {
          courseId_userId: {
            courseId,
            userId,
          },
        },
      });

      if (!review) {
        return null;
      }

      return this.mapReviewResponse(review);
    } catch (error) {
      logger.error('Failed to get user review', { error, courseId, userId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string): Promise<void> {
    try {
      logger.info('Deleting review', { reviewId });

      const review = await prisma.courseReview.findUnique({
        where: { id: reviewId },
      });

      if (!review) {
        throw new Error(`Review ${reviewId} not found`);
      }

      await prisma.courseReview.delete({
        where: { id: reviewId },
      });

      // Update course rating
      await this.updateCourseRating(review.courseId);

      logger.info('Review deleted', { reviewId });
    } catch (error) {
      logger.error('Failed to delete review', { error, reviewId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Update course rating based on reviews
   */
  private async updateCourseRating(courseId: string): Promise<void> {
    try {
      const stats = await prisma.courseReview.aggregate({
        where: { courseId },
        _avg: { rating: true },
        _count: true,
      });

      const averageRating = stats._avg.rating || 0;

      await prisma.course.update({
        where: { id: courseId },
        data: { rating: Math.round(averageRating * 10) / 10 }, // Round to 1 decimal
      });

      logger.debug('Course rating updated', { courseId, rating: averageRating });
    } catch (error) {
      logger.error('Failed to update course rating', { error, courseId });
    }
  }

  /**
   * Get review statistics for a course
   */
  async getCourseReviewStats(courseId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  }> {
    try {
      const reviews = await prisma.courseReview.findMany({
        where: { courseId },
        select: { rating: true },
      });

      const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      reviews.forEach((review) => {
        distribution[review.rating]++;
      });

      const averageRating =
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;

      return {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length,
        ratingDistribution: distribution,
      };
    } catch (error) {
      logger.error('Failed to get review stats', { error, courseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get top rated courses
   */
  async getTopRatedCourses(limit: number = 10): Promise<any[]> {
    try {
      const courses = await prisma.course.findMany({
        where: {
          status: 'PUBLISHED',
          reviews: {
            some: {},
          },
        },
        orderBy: { rating: 'desc' },
        take: limit,
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
      });

      return courses.map((course) => ({
        ...course,
        reviewCount: course.reviews.length,
        reviews: undefined,
      }));
    } catch (error) {
      logger.error('Failed to get top rated courses', { error });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Map review to response format
   */
  private mapReviewResponse(review: any): ReviewResponse {
    return {
      id: review.id,
      courseId: review.courseId,
      userId: review.userId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }
}

export default new CourseReviewsService();
