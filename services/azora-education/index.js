const express = require('express');
const { PrismaClient } = require('@prisma/client');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3074;

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'healthy', service: 'azora-education', db: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});

// Student Registration
app.post('/api/students', async (req, res) => {
  try {
    const { userId, firstName, lastName, email, dateOfBirth, grade, country } = req.body;
    
    const student = await prisma.student.create({
      data: { userId, firstName, lastName, email, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null, grade, country },
      include: { wallet: true }
    });

    await prisma.wallet.create({ data: { studentId: student.id } });

    res.status(201).json({ success: true, student });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get Student Profile
app.get('/api/students/:id', async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: { enrollments: { include: { course: true } }, wallet: true, progress: true }
    });
    
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });
    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Course Enrollment
app.post('/api/enrollments', async (req, res) => {
  try {
    const { studentId, courseId } = req.body;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return res.status(404).json({ success: false, error: 'Course not found' });

    const wallet = await prisma.wallet.findUnique({ where: { studentId } });
    if (wallet.balance < course.price) {
      return res.status(400).json({ success: false, error: 'Insufficient balance' });
    }

    const enrollment = await prisma.enrollment.create({
      data: { studentId, courseId },
      include: { course: true }
    });

    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: 'payment',
        amount: -course.price,
        currency: course.currency,
        description: `Enrollment in ${course.title}`,
        reference: courseId
      }
    });

    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: course.price } }
    });

    res.status(201).json({ success: true, enrollment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get Courses
app.get('/api/courses', async (req, res) => {
  try {
    const { category, level } = req.query;
    const courses = await prisma.course.findMany({
      where: {
        published: true,
        ...(category && { category }),
        ...(level && { level })
      },
      include: { _count: { select: { enrollments: true } } }
    });
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update Progress
app.post('/api/progress', async (req, res) => {
  try {
    const { studentId, moduleId, completed, timeSpent, score } = req.body;

    const progress = await prisma.learningProgress.upsert({
      where: { studentId_moduleId: { studentId, moduleId } },
      update: { completed, timeSpent, score, ...(completed && { completedAt: new Date() }) },
      create: { studentId, moduleId, completed, timeSpent, score }
    });

    res.json({ success: true, progress });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Azora Education running on port ${port}`);
});

module.exports = app;
