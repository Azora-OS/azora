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
    const { courseId, lessonId, userId, timeSpent } = body;

    if (!courseId || !userId) {
      return NextResponse.json(
        { error: 'courseId and userId are required' },
        { status: 400 }
      );
    }

    // Update or create progress record
    if (lessonId) {
      await prisma.courseProgress.upsert({
        where: {
          userId_courseId_lessonId: {
            userId,
            courseId,
            lessonId,
          },
        },
        create: {
          userId,
          courseId,
          lessonId,
          completed: true,
          progress: 100,
          timeSpent: timeSpent || 0,
          lastAccessed: new Date(),
        },
        update: {
          completed: true,
          progress: 100,
          timeSpent: (timeSpent || 0) + (await prisma.courseProgress.findUnique({
            where: {
              userId_courseId_lessonId: {
                userId,
                courseId,
                lessonId,
              },
            },
          }))?.timeSpent || 0,
          lastAccessed: new Date(),
        },
      });
    }

    // Recalculate course progress
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 404 }
      );
    }

    const totalLessons = enrollment.course.modules.reduce(
      (sum, module) => sum + module.lessons.length,
      0
    );

    const completedLessons = await prisma.courseProgress.count({
      where: {
        userId,
        courseId,
        completed: true,
      },
    });

    const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    // Update enrollment progress
    const updatedEnrollment = await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      data: {
        progress,
        ...(progress >= 100 && !enrollment.completedAt ? {
          completedAt: new Date(),
          status: 'COMPLETED',
        } : {}),
      },
    });

    // Calculate AZR earned (50 base + bonus for completion)
    const azrEarned = lessonId ? 50 : 0;
    const completionBonus = progress >= 100 ? 500 : 0;

    return NextResponse.json({
      success: true,
      progress: {
        courseId,
        lessonId,
        completed: true,
        progress,
        completedLessons,
        totalLessons,
        completedAt: lessonId ? new Date().toISOString() : undefined,
        azrEarned: azrEarned + completionBonus,
        enrollment: {
          id: updatedEnrollment.id,
          status: updatedEnrollment.status,
          progress: updatedEnrollment.progress,
          completedAt: updatedEnrollment.completedAt,
        },
      },
      message: 'Progress saved successfully',
    });
  } catch (error: any) {
    console.error('Progress update error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to update progress',
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
    const courseId = searchParams.get('courseId');

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'userId and courseId are required' },
        { status: 400 }
      );
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 404 }
      );
    }

    const progressRecords = await prisma.courseProgress.findMany({
      where: {
        userId,
        courseId,
      },
    });

    const totalLessons = enrollment.course.modules.reduce(
      (sum, module) => sum + module.lessons.length,
      0
    );

    const completedLessons = progressRecords.filter(p => p.completed).length;
    const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return NextResponse.json({
      success: true,
      progress: {
        courseId,
        progress,
        completedLessons,
        totalLessons,
        enrollment: {
          id: enrollment.id,
          status: enrollment.status,
          progress: enrollment.progress,
          completedAt: enrollment.completedAt,
          createdAt: enrollment.createdAt,
        },
        completedLessons: progressRecords.map(p => ({
          lessonId: p.lessonId,
          completed: p.completed,
          timeSpent: p.timeSpent,
          lastAccessed: p.lastAccessed,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch progress',
        success: false,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}


