
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

// Modules
router.post('/modules', async (req, res) => {
  try {
    const module = await prisma.module.create({ data: req.body });
    res.status(201).json({ success: true, data: module });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error creating module' });
  }
});

router.get('/courses/:courseId/modules', async (req, res) => {
  try {
    const modules = await prisma.module.findMany({
      where: { courseId: req.params.courseId },
      include: { lessons: true },
      orderBy: { order: 'asc' }
    });
    res.json({ success: true, data: modules });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching modules' });
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

router.get('/modules/:moduleId/lessons', async (req, res) => {
  try {
    const lessons = await prisma.lesson.findMany({
      where: { moduleId: req.params.moduleId },
      orderBy: { order: 'asc' }
    });
    res.json({ success: true, data: lessons });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching lessons' });
  }
});

// Assessments
router.post('/assessments', async (req, res) => {
  const { courseId, title, questions, passingScore } = req.body;
  try {
    res.status(201).json({ 
      success: true, 
      data: { id: Date.now().toString(), courseId, title, questions, passingScore } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error creating assessment' });
  }
});

router.get('/courses/:courseId/assessments', async (req, res) => {
  try {
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching assessments' });
  }
});

// Content management
router.post('/conte