const express = require('express');
const { PrismaClient } = require('@prisma/client');
const compression = require('compression');
const { helmetConfig, corsConfig, createRateLimiter, errorHandler } = require('../shared/middleware');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3010;
const SERVICE_NAME = process.env.SERVICE_NAME || 'azora-education';

// Security middleware stack
app.use(helmetConfig);
app.use(corsConfig);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(createRateLimiter(100));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'healthy', 
      service: SERVICE_NAME,
      db: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      error: error.message,
      service: SERVICE_NAME
    });
  }
});

// API Documentation
app.get('/', (req, res) => {
  res.json({ 
    service: SERVICE_NAME,
    version: '1.0.0',
    description: 'Azora Education Service - Course catalog, student enrollment, progress tracking',
    endpoints: {
      'GET /health': 'Service health check',
      'POST /api/courses': 'Create a new course',
      'GET /api/courses': 'Get all courses',
      'GET /api/courses/:id': 'Get course by ID',
      'PUT /api/courses/:id': 'Update course',
      'DELETE /api/courses/:id': 'Delete course',
      'POST /api/courses/:id/modules': 'Add module to course',
      'GET /api/courses/:id/modules': 'Get course modules',
      'PUT /api/modules/:id': 'Update module',
      'DELETE /api/modules/:id': 'Delete module',
      'POST /api/students': 'Register a new student',
      'GET /api/students/:id': 'Get student profile',
      'PUT /api/students/:id': 'Update student profile',
      'POST /api/enrollments': 'Enroll student in course',
      'GET /api/enrollments': 'Get all enrollments',
      'GET /api/enrollments/:id': 'Get enrollment by ID',
      'PUT /api/enrollments/:id/progress': 'Update enrollment progress',
      'DELETE /api/enrollments/:id': 'Drop enrollment',
      'POST /api/progress': 'Update learning progress',
      'GET /api/progress/:studentId/:moduleId': 'Get progress for student and module',
      'GET /api/students/:studentId/courses': 'Get courses for student',
      'GET /api/courses/:courseId/students': 'Get students in course',
      'POST /api/assessments': 'Create assessment',
      'POST /api/assessments/:id/submissions': 'Submit assessment',
      'GET /api/assessments/:id/submissions/:studentId': 'Get assessment submission',
      'POST /api/wallets': 'Create wallet for student',
      'GET /api/wallets/:studentId': 'Get wallet for student',
      'POST /api/transactions': 'Create transaction',
      'GET /api/transactions/:walletId': 'Get transactions for wallet'
    }
  });
});

// Create a new course
app.post('/api/courses', async (req, res) => {
  try {
    const courseData = req.body;
    
    const course = await prisma.course.create({
      data: courseData
    });

    res.status(201).json({ 
      success: true, 
      message: 'Course created successfully',
      data: course 
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(400).json({ 
      success: false, 
      error: 'Failed to create course',
      message: error.message 
    });
  }
});

// Get all courses
app.get('/api/courses', async (req, res) => {
  try {
    const { category, level, published, search } = req.query;
    const where = {};
    
    if (category) where.category = category;
    if (level) where.level = level;
    if (published !== undefined) where.published = published === 'true';
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const courses = await prisma.course.findMany({
      where,
      include: { 
        _count: { 
          select: { 
            enrollments: true,
            modules: true
          } 
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ 
      success: true, 
      data: courses 
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch courses',
      message: error.message 
    });
  }
});

// Get course by ID
app.get('/api/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { enrollments: true }
        }
      }
    });
    
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        error: 'Course not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: course 
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch course',
      message: error.message 
    });
  }
});

// Update course
app.put('/api/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const course = await prisma.course.update({
      where: { id },
      data: updateData
    });

    res.json({ 
      success: true, 
      message: 'Course updated successfully',
      data: course 
    });
  } catch (error) {
    console.error('Error updating course:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Course not found' 
      });
    }
    res.status(400).json({ 
      success: false, 
      error: 'Failed to update course',
      message: error.message 
    });
  }
});

// Delete course
app.delete('/api/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.course.delete({
      where: { id }
    });

    res.json({ 
      success: true, 
      message: 'Course deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Course not found' 
      });
    }
    res.status(400).json({ 
      success: false, 
      error: 'Failed to delete course',
      message: error.message 
    });
  }
});

// Add module to course
app.post('/api/courses/:id/modules', async (req, res) => {
  try {
    const { id } = req.params;
    const moduleData = req.body;
    
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id }
    });
    
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        error: 'Course not found' 
      });
    }
    
    // Create module
    const module = await prisma.module.create({
      data: {
        courseId: id,
        ...moduleData
      }
    });

    res.status(201).json({ 
      success: true, 
      message: 'Module added successfully',
      data: module 
    });
  } catch (error) {
    console.error('Error adding module:', error);
    res.status(400).json({ 
      success: false, 
      error: 'Failed to add module',
      message: error.message 
    });
  }
});

// Get course modules
app.get('/api/courses/:id/modules', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id }
    });
    
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        error: 'Course not found' 
      });
    }
    
    const modules = await prisma.module.findMany({
      where: { courseId: id },
      orderBy: { order: 'asc' }
    });
    
    res.json({ 
      success: true, 
      data: modules 
    });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch modules',
      message: error.message 
    });
  }
});

// Update module
app.put('/api/modules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const module = await prisma.module.update({
      where: { id },
      data: updateData
    });

    res.json({ 
      success: true, 
      message: 'Module updated successfully',
      data: module 
    });
  } catch (error) {
    console.error('Error updating module:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Module not found' 
      });
    }
    res.status(400).json({ 
      success: false, 
      error: 'Failed to update module',
      message: error.message 
    });
  }
});

// Delete module
app.delete('/api/modules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.module.delete({
      where: { id }
    });

    res.json({ 
      success: true, 
      message: 'Module deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting module:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Module not found' 
      });
    }
    res.status(400).json({ 
      success: false, 
      error: 'Failed to delete module',
      message: error.message 
    });
  }
});

// Register a new student
app.post('/api/students', async (req, res) => {
  try {
    const studentData = req.body;
    
    const student = await prisma.student.create({
      data: studentData
    });

    res.status(201).json({ 
      success: true, 
      message: 'Student registered successfully',
      data: student 
    });
  } catch (error) {
    console.error('Error registering student:', error);
    res.status(400).json({ 
      success: false, 
      error: 'Failed to register student',
      message: error.message 
    });
  }
});

// Get student profile
app.get('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: {
            course: true
          }
        },
        wallet: true,
        progress: true
      }
    });
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        error: 'Student not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: student 
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch student',
      message: error.message 
    });
  }
});

// Update student profile
app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const student = await prisma.student.update({
      where: { id },
      data: updateData
    });

    res.json({ 
      success: true, 
      message: 'Student profile updated successfully',
      data: student 
    });
  } catch (error) {
    console.error('Error updating student:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Student not found' 
      });
    }
    res.status(400).json({ 
      success: false, 
      error: 'Failed to update student',
      message: error.message 
    });
  }
});

// Enroll student in course
app.post('/api/enrollments', async (req, res) => {
  try {
    const { studentId, courseId } = req.body;

    // Check if course exists
    const course = await prisma.course.findUnique({ 
      where: { id: courseId } 
    });
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        error: 'Course not found' 
      });
    }

    // Check if student exists
    const student = await prisma.student.findUnique({ 
      where: { id: studentId } 
    });
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        error: 'Student not found' 
      });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId
        }
      }
    });
    
    if (existingEnrollment) {
      return res.status(400).json({ 
        success: false, 
        error: 'Student already enrolled in this course' 
      });
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: { 
        studentId, 
        courseId 
      },
      include: { 
        course: true 
      }
    });

    res.status(201).json({ 
      success: true, 
      message: 'Student enrolled successfully',
      data: enrollment 
    });
  } catch (error) {
    console.error('Error enrolling student:', error);
    res.status(400).json({ 
      success: false, 
      error: 'Failed to enroll student',
      message: error.message 
    });
  }
});

// Get all enrollments
app.get('/api/enrollments', async (req, res) => {
  try {
    const { studentId, courseId } = req.query;
    const where = {};
    
    if (studentId) where.studentId = studentId;
    if (courseId) where.courseId = courseId;
    
    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        student: true,
        course: true
      },
      orderBy: { enrolledAt: 'desc' }
    });
    
    res.json({ 
      success: true, 
      data: enrollments 
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch enrollments',
      message: error.message 
    });
  }
});

// Get enrollment by ID
app.get('/api/enrollments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        student: true,
        course: true
      }
    });
    
    if (!enrollment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Enrollment not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: enrollment 
    });
  } catch (error) {
    console.error('Error fetching enrollment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch enrollment',
      message: error.message 
    });
  }
});

// Update enrollment progress
app.put('/api/enrollments/:id/progress', async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;
    
    const enrollment = await prisma.enrollment.update({
      where: { id },
      data: { progress }
    });

    res.json({ 
      success: true, 
      message: 'Enrollment progress updated successfully',
      data: enrollment 
    });
  } catch (error) {
    console.error('Error updating enrollment progress:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Enrollment not found' 
      });
    }
    res.status(400).json({ 
      success: false, 
      error: 'Failed to update enrollment progress',
      message: error.message 
    });
  }
});

// Drop enrollment
app.delete('/api/enrollments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.enrollment.delete({
      where: { id }
    });

    res.json({ 
      success: true, 
      message: 'Enrollment dropped successfully' 
    });
  } catch (error) {
    console.error('Error dropping enrollment:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Enrollment not found' 
      });
    }
    res.status(400).json({ 
      success: false, 
      error: 'Failed to drop enrollment',
      message: error.message 
    });
  }
});

// Update learning progress
app.post('/api/progress', async (req, res) => {
  try {
    const { studentId, moduleId, completed, timeSpent, score } = req.body;

    const progress = await prisma.learningProgress.upsert({
      where: { 
        studentId_moduleId: { 
          studentId, 
          moduleId 
        } 
      },
      update: { 
        completed, 
        timeSpent, 
        score, 
        ...(completed && { completedAt: new Date() }) 
      },
      create: { 
        studentId, 
        moduleId, 
        completed, 
        timeSpent, 
        score 
      }
    });

    res.json({ 
      success: true, 
      message: 'Learning progress updated successfully',
      data: progress 
    });
  } catch (error) {
    console.error('Error updating learning progress:', error);
    res.status(400).json({ 
      success: false, 
      error: 'Failed to update learning progress',
      message: error.message 
    });
  }
});

// Get progress for student and module
app.get('/api/progress/:studentId/:moduleId', async (req, res) => {
  try {
    const { studentId, moduleId } = req.params;
    
    const progress = await prisma.learningProgress.findUnique({
      where: {
        studentId_moduleId: {
          studentId,
          moduleId
        }
      }
    });
    
    if (!progress) {
      return res.status(404).json({ 
        success: false, 
        error: 'Progress record not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: progress 
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch progress',
      message: error.message 
    });
  }
});

// Get courses for student
app.get('/api/students/:studentId/courses', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        error: 'Student not found' 
      });
    }
    
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            _count: {
              select: { enrollments: true }
            }
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    });
    
    const courses = enrollments.map(enrollment => enrollment.course);
    
    res.json({ 
      success: true, 
      data: courses 
    });
  } catch (error) {
    console.error('Error fetching student courses:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch student courses',
      message: error.message 
    });
  }
});

// Get students in course
app.get('/api/courses/:courseId/students', async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });
    
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        error: 'Course not found' 
      });
    }
    
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        student: true
      },
      orderBy: { enrolledAt: 'desc' }
    });
    
    const students = enrollments.map(enrollment => enrollment.student);
    
    res.json({ 
      success: true, 
      data: students 
    });
  } catch (error) {
    console.error('Error fetching course students:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch course students',
      message: error.message 
    });
  }
});

// Create assessment
app.post('/api/assessments', async (req, res) => {
  try {
    const assessmentData = req.body;
    
    const assessment = await prisma.assessmentSubmission.create({
      data: assessmentData
    });

    res.status(201).json({ 
      success: true, 
      message: 'Assessment created successfully',
      data: assessment 
    });
  } catch (error) {
    console.error('Error creating assessment:', error);
    res.status(400).json({ 
      success: false, 
      error: 'Failed to create assessment',
      message: error.message 
    });
  }
});

// Submit assessment
app.post('/api/assessments/:id/submissions', async (req, res) => {
  try {
    const { id } = req.params;
    const submissionData = req.body;
    
    const submission = await prisma.assessmentSubmission.create({
      data: {
        assessmentId: id,
        ...submissionData
      }
    });

    res.status(201).json({ 
      success: true, 
      message: 'Assessment submitted successfully',
      data: submission 
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(400).json({ 
      success: false, 
      error: 'Failed to submit assessment',
      message: error.message 
    });
  }
});

// Get assessment submission
app.get('/api/assessments/:id/submissions/:studentId', async (req, res) => {
  try {
    const { id, studentId } = req.params;
    
    const submission = await prisma.assessmentSubmission.findUnique({
      where: {
        studentId_assessmentId: {
          studentId,
          assessmentId: id
        }
      }
    });
    
    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        error: 'Assessment submission not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: submission 
    });
  } catch (error) {
    console.error('Error fetching assessment submission:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch assessment submission',
      message: error.message 
    });
  }
});

// Create wallet for student
app.post('/api/wallets', async (req, res) => {
  try {
    const walletData = req.body;
    
    const wallet = await prisma.wallet.create({
      data: walletData
    });

    res.status(201).json({ 
      success: true, 
      message: 'Wallet created successfully',
      data: wallet 
    });
  } catch (error) {
    console.error('Error creating wallet:', error);
    res.status(400).json({ 
      success: false, 
      error: 'Failed to create wallet',
      message: error.message 
    });
  }
});

// Get wallet for student
app.get('/api/wallets/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const wallet = await prisma.wallet.findUnique({
      where: { studentId }
    });
    
    if (!wallet) {
      return res.status(404).json({ 
        success: false, 
        error: 'Wallet not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: wallet 
    });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch wallet',
      message: error.message 
    });
  }
});

// Create transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const transactionData = req.body;
    
    const transaction = await prisma.transaction.create({
      data: transactionData
    });

    res.status(201).json({ 
      success: true, 
      message: 'Transaction created successfully',
      data: transaction 
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(400).json({ 
      success: false, 
      error: 'Failed to create transaction',
      message: error.message 
    });
  }
});

// Get transactions for wallet
app.get('/api/transactions/:walletId', async (req, res) => {
  try {
    const { walletId } = req.params;
    
    // Check if wallet exists
    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId }
    });
    
    if (!wallet) {
      return res.status(404).json({ 
        success: false, 
        error: 'Wallet not found' 
      });
    }
    
    const transactions = await prisma.transaction.findMany({
      where: { walletId },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ 
      success: true, 
      data: transactions 
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch transactions',
      message: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Endpoint not found' 
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`✅ ${SERVICE_NAME} running on port ${PORT}`);
  console.log(`🌍 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;