/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseId, userId } = body;

    if (!courseId || !userId) {
      return NextResponse.json(
        { error: 'courseId and userId are required' },
        { status: 400 }
      );
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json({
        success: true,
        enrollment: {
          id: existingEnrollment.id,
          userId: existingEnrollment.userId,
          courseId: existingEnrollment.courseId,
          status: existingEnrollment.status,
          progress: existingEnrollment.progress,
          createdAt: existingEnrollment.createdAt,
        },
        message: 'Already enrolled in this course',
      });
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        status: 'ACTIVE',
        progress: 0,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      enrollment: {
        id: enrollment.id,
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        status: enrollment.status,
        progress: enrollment.progress,
        createdAt: enrollment.createdAt,
        course: enrollment.course,
      },
      message: 'Successfully enrolled in course',
    });
  } catch (error: any) {
    console.error('Enrollment error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to enroll in course',
        success: false,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              },
            },
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      enrollments: enrollments.map(e => ({
        id: e.id,
        userId: e.userId,
        courseId: e.courseId,
        status: e.status,
        progress: e.progress,
        completedAt: e.completedAt,
        createdAt: e.createdAt,
        course: {
          id: e.course.id,
          title: e.course.title,
          slug: e.course.slug,
          description: e.course.description,
          thumbnail: e.course.thumbnail,
          instructor: {
            id: e.course.instructor.id,
            name: `${e.course.instructor.firstName || ''} ${e.course.instructor.lastName || ''}`.trim() || e.course.instructor.email,
          },
          category: e.course.category,
        },
      })),
      total: enrollments.length,
    });
  } catch (error: any) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch enrollments',
        success: false,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}


