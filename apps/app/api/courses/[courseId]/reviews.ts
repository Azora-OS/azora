/**
 * GET /api/courses/[courseId]/reviews - Get course reviews
 * POST /api/courses/[courseId]/reviews - Submit course review
 */

import { NextRequest, NextResponse } from 'next/server';
import { CourseReviewsService } from '@/services/marketplace/course-reviews';
import { logger } from '@/services/shared/logging';
import { ErrorHandler } from '@/services/payment/error-handler';

interface ReviewSubmissionRequest {
  rating: number;
  comment?: string;
}

export async function GET(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    logger.info('Getting course reviews', { courseId: params.courseId, page, limit });

    const reviewService = new CourseReviewsService();
    const result = await reviewService.getCourseReviews(params.courseId, page, limit);

    logger.info('Course reviews retrieved', { courseId: params.courseId, total: result.total });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    logger.error('Failed to get course reviews', { error, courseId: params.courseId });
    const errorResponse = ErrorHandler.handle(error);
    return NextResponse.json(errorResponse, { status: 400 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    // Get user from JWT token
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ReviewSubmissionRequest = await request.json();

    // Validate required fields
    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    logger.info('Submitting course review', { userId, courseId: params.courseId, rating: body.rating });

    const reviewService = new CourseReviewsService();
    const review = await reviewService.submitReview({
      courseId: params.courseId,
      userId,
      rating: body.rating,
      comment: body.comment,
    });

    logger.info('Course review submitted', { reviewId: review.id });

    return NextResponse.json(
      {
        success: true,
        review,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Failed to submit course review', { error, courseId: params.courseId });
    const errorResponse = ErrorHandler.handle(error);
    return NextResponse.json(errorResponse, { status: 400 });
  }
}
