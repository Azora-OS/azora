/**
 * POST /api/courses/upload
 * Upload a new course to the marketplace
 */

import { NextRequest, NextResponse } from 'next/server';
import { CourseUploadService } from '@/services/marketplace/course-upload';
import { logger } from '@/services/shared/logging';
import { ErrorHandler } from '@/services/payment/error-handler';

interface CourseUploadRequest {
  title: string;
  description: string;
  category: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration: number;
  price: number;
  currency?: string;
  thumbnail?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get user from JWT token
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CourseUploadRequest = await request.json();

    // Validate required fields
    if (!body.title || !body.description || !body.category || !body.level || !body.duration) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, category, level, duration' },
        { status: 400 }
      );
    }

    logger.info('Uploading course', { userId, title: body.title });

    const courseUploadService = new CourseUploadService();
    const course = await courseUploadService.uploadCourse({
      instructorId: userId,
      title: body.title,
      description: body.description,
      category: body.category,
      level: body.level,
      duration: body.duration,
      price: body.price || 0,
      currency: body.currency,
      thumbnail: body.thumbnail,
    });

    logger.info('Course uploaded successfully', { courseId: course.id });

    return NextResponse.json(
      {
        success: true,
        course,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Failed to upload course', { error });
    const errorResponse = ErrorHandler.handle(error);
    return NextResponse.json(errorResponse, { status: 400 });
  }
}
