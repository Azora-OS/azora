/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

LMS SERVICE - REAL DATA IMPLEMENTATION
Removes all mocks and implements real business logic
*/

import express, { Request, Response } from 'express';
import cors from 'cors';
import { authenticateSession, AuthRequest } from '@azora/shared-auth/middleware';
import { prisma } from '@azora/shared-database/prisma';
import { eventBus } from '@azora/shared-services/event-bus';

const app = express();
const PORT = process.env.LMS_PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'lms-service',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    dataSource: 'real',
    constitutionalCompliance: 'Article XVI: No Mock Protocol - ENFORCED',
  });
});

// ============================================================================
// COURSE MANAGEMENT - REAL DATA
// ============================================================================

app.get('/api/courses', authenticateSession, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { published, search } = req.query;

    const where: any = {};
    if (published !== undefined) {
      where.published = published === 'true';
    }
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
        enrollments: {
          select: {
            id: true,
            userId: true,
            progress: true,
            completed: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            lessons: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Emit event
    await eventBus.publish('lms.courses.queried', {
      userId: req.user.userId,
      courseCount: courses.length,
      filters: { published, search },
    });

    res.json({
      success: true,
      data: courses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        price: Number(course.price),
        currency: course.currency,
        published: course.published,
        lessonCount: course.lessons.length,
        enrollmentCount: course._count.enrollments,
        lessons: course.lessons.map(l => ({
          id: l.id,
          title: l.title,
          order: l.order,
          duration: l.duration,
        })),
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      })),
      source: 'database',
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch courses',
    });
  }
});

// ============================================================================
// ENROLLMENT MANAGEMENT - REAL DATA
// ============================================================================

app.post('/api/enrollments', authenticateSession, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: req.user.userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        error: 'Already enrolled in this course',
        enrollment: existingEnrollment,
      });
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: req.user.userId,
        courseId,
        progress: 0,
        completed: false,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });

    // Emit event
    await eventBus.publish('lms.enrollment.created', {
      userId: req.user.userId,
      courseId,
      enrollmentId: enrollment.id,
    });

    res.json({
      success: true,
      data: enrollment,
      source: 'database',
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error('Error creating enrollment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create enrollment',
    });
  }
});

// ============================================================================
// PROGRESS TRACKING - REAL DATA
// ============================================================================

app.get('/api/enrollments/:enrollmentId/progress', authenticateSession, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { enrollmentId } = req.params;

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    // Verify ownership
    if (enrollment.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const totalLessons = enrollment.course.lessons.length;
    const completedLessons = Math.floor((enrollment.progress / 100) * totalLessons);

    res.json({
      success: true,
      data: {
        enrollmentId: enrollment.id,
        courseId: enrollment.courseId,
        courseTitle: enrollment.course.title,
        progress: enrollment.progress,
        completed: enrollment.completed,
        totalLessons,
        completedLessons,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
        lastActivity: enrollment.updatedAt,
      },
      source: 'database',
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error('Error fetching progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch progress',
    });
  }
});

app.patch('/api/enrollments/:enrollmentId/progress', authenticateSession, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { enrollmentId } = req.params;
    const { progress, completed } = req.body;

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    // Verify ownership
    if (enrollment.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Update progress
    const updateData: any = {};
    if (progress !== undefined) {
      updateData.progress = Math.min(100, Math.max(0, progress));
    }
    if (completed !== undefined) {
      updateData.completed = completed;
      if (completed && !enrollment.completedAt) {
        updateData.completedAt = new Date();
      }
    }

    const updated = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: updateData,
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Emit event
    await eventBus.publish('lms.progress.updated', {
      userId: req.user.userId,
      enrollmentId,
      progress: updated.progress,
      completed: updated.completed,
    });

    res.json({
      success: true,
      data: updated,
      source: 'database',
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error('Error updating progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update progress',
    });
  }
});

// ============================================================================
// ASSIGNMENT MANAGEMENT - REAL DATA
// ============================================================================

app.get('/api/assignments', authenticateSession, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user's enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.user.userId },
      include: {
        course: {
          include: {
            lessons: true,
          },
        },
      },
    });

    // For now, assignments are tied to lessons
    // In production, create Assignment model
    const assignments = enrollments.flatMap(enrollment =>
      enrollment.course.lessons.map(lesson => ({
        id: `assignment-${lesson.id}`,
        enrollmentId: enrollment.id,
        courseId: enrollment.courseId,
        courseTitle: enrollment.course.title,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        progress: enrollment.progress,
        completed: enrollment.completed,
        dueDate: null, // Would come from Assignment model
      }))
    );

    res.json({
      success: true,
      data: assignments,
      source: 'database',
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assignments',
    });
  }
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

const server = app.listen(PORT, () => {
  console.log('='.repeat(80));
  console.log('Azora LMS Service - REAL DATA v2.0');
  console.log('='.repeat(80));
  console.log(`Server listening on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log('Data source: Database');
  console.log('Constitutional Compliance: Article XVI - NO MOCK PROTOCOL');
  console.log('='.repeat(80));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Shutdown] SIGTERM received');
  server.close(() => process.exit(0));
});

export default app;
