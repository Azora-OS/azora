
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const progressRouter = require('./progress');

// Mount the progress router
router.use('/progress', progressRouter);

// Courses
router.get('/courses', async (req, res) => {
  const { level, search } = req.query;
  const where = {};
  if (level) where.level = level;
  if (search) where.title = { contains: search, mode: 'insensitive' };
  try {
    const courses = await prisma.course.findMany({ where });
    res.json({ success: true, data: courses, count: courses.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching courses' });
  }
});

router.post('/courses', async (req, res) => {
  try {
    const course = await prisma.course.create({ data: req.body });
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error creating course' });
  }
});

router.get('/courses/:id', async (req, res) => {
  try {
    const course = await prisma.course.findUnique({ 
      where: { id: req.params.id },
      include: { lessons: true }
    });
    if (!course) return res.status(404).json({ success: false, error: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching course' });
  }
});

router.put('/courses/:id', async (req, res) => {
  try {
    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(404).json({ success: false, error: 'Course not found' });
  }
});

router.delete('/courses/:id', async (req, res) => {
  try {
    await prisma.course.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    res.status(404).json({ success: false, error: 'Course not found' });
  }
});

// Lessons
router.post('/lessons', async (req, res) => {
  try {
    const lesson = await prisma.lesson.create({ data: req.body });
    res.status(201).json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error creating lesson' });
  }
});

router.get('/courses/:courseId/lessons', async (req, res) => {
  try {
    const lessons = await prisma.lesson.findMany({
      where: { courseId: req.params.courseId },
      orderBy: { order: 'asc' }
    });
    res.json({ success: true, data: lessons });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching lessons' });
  }
});

// Enrollments
router.post('/enroll', async (req, res) => {
  const { courseId, studentId } = req.body;
  try {
    const enrollment = await prisma.enrollment.create({
      data: { courseId, studentId }
    });
    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error creating enrollment' });
  }
});

router.get('/enrollments/:studentId', async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: req.params.studentId },
      include: { course: true }
    });
    res.json({ success: true, data: enrollments });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching enrollments' });
  }
});

module.exports = router;
