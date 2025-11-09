const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for course materials
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image, video, and PDF files are allowed'));
    }
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'lms-service' });
});

// Create course
app.post('/courses', async (req, res) => {
  try {
    const { title, description, instructorId, category, level, price } = req.body;

    if (!title || !instructorId) {
      return res.status(400).json({ error: 'Title and instructorId are required' });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        instructorId,
        category,
        level: level || 'beginner',
        price: price ? parseFloat(price) : 0
      }
    });

    res.json({ success: true, course });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Get courses
app.get('/courses', async (req, res) => {
  try {
    const { instructorId, category, level, status } = req.query;
    const where = {};

    if (instructorId) where.instructorId = instructorId;
    if (category) where.category = category;
    if (level) where.level = level;
    if (status) where.status = status;

    const courses = await prisma.course.findMany({
      where,
      include: {
        _count: {
          select: { lessons: true, enrollments: true }
        }
      }
    });

    res.json({ courses });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to get courses' });
  }
});

// Get course details
app.get('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        lessons: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { enrollments: true }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ course });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Failed to get course' });
  }
});

// Update course
app.put('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, level, price, status } = req.body;

    const course = await prisma.course.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(level && { level }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(status && { status })
      }
    });

    res.json({ success: true, course });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Create lesson
app.post('/courses/:courseId/lessons', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, content, order, duration, type } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const lesson = await prisma.lesson.create({
      data: {
        title,
        description,
        content,
        courseId,
        order: order || 0,
        duration: duration ? parseInt(duration) : null,
        type: type || 'text'
      }
    });

    res.json({ success: true, lesson });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

// Enroll in course
app.post('/courses/:courseId/enroll', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: 'studentId is required' });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId,
          studentId
        }
      }
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        courseId,
        studentId
      }
    });

    res.json({ success: true, enrollment });
  } catch (error) {
    console.error('Enroll error:', error);
    res.status(500).json({ error: 'Failed to enroll' });
  }
});

// Get student enrollments
app.get('/students/:studentId/enrollments', async (req, res) => {
  try {
    const { studentId } = req.params;

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            _count: {
              select: { lessons: true }
            }
          }
        },
        progress: {
          include: {
            lesson: true
          }
        }
      }
    });

    res.json({ enrollments });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ error: 'Failed to get enrollments' });
  }
});

// Update lesson progress
app.post('/progress', async (req, res) => {
  try {
    const { enrollmentId, lessonId, status, progress } = req.body;

    if (!enrollmentId || !lessonId) {
      return res.status(400).json({ error: 'enrollmentId and lessonId are required' });
    }

    const progressData = {
      status: status || 'in_progress',
      progress: progress ? parseFloat(progress) : 0
    };

    if (status === 'completed') {
      progressData.completedAt = new Date();
    } else if (status === 'in_progress' && !progressData.startedAt) {
      progressData.startedAt = new Date();
    }

    const lessonProgress = await prisma.progress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId,
          lessonId
        }
      },
      update: progressData,
      create: {
        enrollmentId,
        lessonId,
        ...progressData
      }
    });

    res.json({ success: true, progress: lessonProgress });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Get course progress for student
app.get('/courses/:courseId/progress/:studentId', async (req, res) => {
  try {
    const { courseId, studentId } = req.params;

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId,
          studentId
        }
      },
      include: {
        progress: {
          include: {
            lesson: true
          }
        },
        course: {
          include: {
            lessons: true
          }
        }
      }
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    const totalLessons = enrollment.course.lessons.length;
    const completedLessons = enrollment.progress.filter(p => p.status === 'completed').length;
    const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    res.json({
      enrollment,
      progress: {
        totalLessons,
        completedLessons,
        overallProgress: Math.round(overallProgress)
      }
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, async () => {
  console.log(`📚 Azora LMS Service running on port ${PORT}`);
  console.log(`🎓 Courses: GET/POST http://localhost:${PORT}/courses`);
  console.log(`📖 Lessons: POST http://localhost:${PORT}/courses/:id/lessons`);
  console.log(`🎯 Enroll: POST http://localhost:${PORT}/courses/:id/enroll`);
  console.log(`📊 Progress: POST http://localhost:${PORT}/progress`);

  try {
    await prisma.$connect();
    console.log('🗄️  Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
});