/**
 * GET /api/courses/list
 * List courses with search, filtering, and pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { CourseListingService } from '@/services/marketplace/course-listing';
import { logger } from '@/services/shared/logging';
import { ErrorHandler } from '@/services/payment/error-handler';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const level = searchParams.get('level') as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | undefined;
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined;
    const status = searchParams.get('status') as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | undefined;
    const instructorId = searchParams.get('instructorId') || undefined;
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') as 'rating' | 'price' | 'enrollments' | 'newest' | 'oldest' | undefined;
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | undefined;

    logger.info('Listing courses', { search, category, level, page, limit });

    const courseListingService = new CourseListingService();
    const result = await courseListingService.listCourses(
      {
        search,
        category,
        level,
        minPrice,
        maxPrice,
        minRating,
        status,
        instructorId,
      },
      {
        page,
        limit,
        sortBy,
        sortOrder,
      }
    );

    logger.info('Courses listed successfully', { total: result.total, page: result.page });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    logger.error('Failed to list courses', { error });
    const errorResponse = ErrorHandler.handle(error);
    return NextResponse.json(errorResponse, { status: 400 });
  }
}
