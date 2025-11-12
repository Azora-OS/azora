const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { getPrismaClient } = require('../shared/database');
const logger = require('../shared/logger');
const { AppError, errorHandler, asyncHandler } = require('../shared/errorHandler');
const { authMiddleware } = require('../auth-service');

const app = express();
const prisma = getPrismaClient();

app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});
app.use('/api/', limiter);

// Get all courses
app.get('/api/courses', asyncHandler(async (req, res) => {
  const { status = 'PUBLISHED', limit = 50 } = req.query;
  
  const courses = await prisma.course.findMany({
    where: { status },
    take: parseInt(limit),
    select: {
      id: true,
      title: true,
      description: true,
      duration: true,
      price: true,
      currency: true,
      status: true,
      createdAt: true,
      _count: {
        select: { enrollments: true }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: courses });
}));

// Get course by ID
app.get('/api/courses/:id', asyncHandler(async (req, res) => {
  const course = await prisma.course.findUnique({
    where: { id: req.params.id },
    include: {
      modules: {
        orderBy: { order: 'asc' },
      },
      _count: {
        select: { enrollments: true }
      }
    },
  });

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  res.json({ success: true, data: course });
}));

// Enroll in course
app.post('/api/courses/:id/enroll', authMiddleware, asyncHandler(async (req, res) => {
  const courseId = req.params.id;
  const userId = req.user.userId;

  // Check if course exists
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (course.status !== 'PUBLISHED') {
    throw new AppError('Course is not available for enrollment', 400);
  }

  // Check if already enrolled
  const existing = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (existing) {
    throw new AppError('Already enrolled in this course', 400);
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      userId,
      courseId,
      status: 'ACTIVE',
    },
    include: {
      course: {
        select: {
          title: true,
          description: true,
        },
      },
    },
  });

  logger.info(`User ${userId} enrolled in course ${courseId}`);

  res.status(201).json({
    success: true,
    data: enrollment,
  });
}));

// Get user enrollments
app.get('/api/enrollments', authMiddleware, asyncHandler(async (req, res) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: req.user.userId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          description: true,
          duration: true,
          price: true,
          currency: true,
        },
      },
    },
    orderBy: { enrolledAt: 'desc' },
  });

  res.json({ success: true, data: enrollments });
}));

// Update progress
app.patch('/api/enrollments/:id/progress', authMiddleware, asyncHandler(async (req, res) => {
  const { progress } = req.body;
  
  if (progress < 0 || progress > 100) {
    throw new AppError('Progress must be between 0 and 100', 400);
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: req.params.id },
  });

  if (!enrollment) {
    throw new AppError('Enrollment not found', 404);
  }

  if (enrollment.userId !== req.user.userId) {
    throw new AppError('Not authorized', 403);
  }

  const updated = await prisma.enrollment.update({
    where: { id: req.params.id },
    data: {
      progress: parseFloat(progress),
      ...(progress >= 100 && { status: 'COMPLETED', completedAt: new Date() }),
    },
  });

  logger.info(`Progress updated for enrollment ${req.params.id}: ${progress}%`);

  res.json({ success: true, data: updated });
}));

// Create course (educators only)
app.post('/api/courses', authMiddleware, asyncHandler(async (req, res) => {
  if (req.user.role !== 'EDUCATOR' && req.user.role !== 'ADMIN') {
    throw new AppError('Only educators can create courses', 403);
  }

  const { title, description, duration, price, currency = 'ZAR', modules = [] } = req.body;

  if (!title || !description) {
    throw new AppError('Title and description are required', 400);
  }

  const course = await prisma.course.create({
    data: {
      title,
      description,
      instructor: req.user.userId,
      duration: parseInt(duration) || 0,
      price: parseFloat(price) || 0,
      currency,
      status: 'DRAFT',
      modules: {
        create: modules.map((mod, index) => ({
          title: mod.title,
          content: mod.content,
          order: index + 1,
        })),
      },
    },
    include: {
      modules: true,
    },
  });

  logger.info(`Course created: ${course.id} by ${req.user.email}`);

  res.status(201).json({ success: true, data: course });
}));

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'education-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

module.exports = app;

if (require.main === module) {
  const PORT = process.env.EDUCATION_PORT || 4002;
  app.listen(PORT, () => {
    logger.info(`✅ Education service running on port ${PORT}`);
  });
}
