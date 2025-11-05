/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status') || 'PUBLISHED';

    const courses = await prisma.course.findMany({
      where: {
        status: status as any,
      },
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
        modules: {
          include: {
            lessons: true,
          },
        },
        enrollments: {
          select: {
            id: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await prisma.course.count({
      where: {
        status: status as any,
      },
    });

    // Format response
    const formattedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      shortDescription: course.shortDescription,
      thumbnail: course.thumbnail,
      coverImage: course.coverImage,
      instructor: {
        id: course.instructor.id,
        name: `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim() || course.instructor.email,
        email: course.instructor.email,
        avatar: course.instructor.avatar,
      },
      category: course.category ? {
        id: course.category.id,
        name: course.category.name,
        slug: course.category.slug,
      } : null,
      level: course.level,
      language: course.language,
      duration: course.duration,
      price: course.price,
      currency: course.currency,
      enrolled: course.enrollments.length,
      modules: course.modules.length,
      tags: course.tags,
      publishedAt: course.publishedAt,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    }));

    return NextResponse.json({
      courses: formattedCourses,
      total,
      limit,
      offset,
      status: 'success',
    });
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      {
        courses: [],
        total: 0,
        error: error.message || 'Failed to fetch courses',
        status: 'error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}


