const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

router.get('/api/courses', async (req, res) => {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: { instructor: { select: { id: true, name: true } } }
  });
  res.json({ success: true, data: courses });
});

router.post('/api/courses/:id/enroll', async (req, res) => {
  const { studentId } = req.body;
  const enrollment = await prisma.enrollment.create({
    data: { courseId: req.params.id, studentId, status: 'ACTIVE' }
  });
  res.json({ success: true, data: enrollment });
});

router.get('/api/progress/:studentId', async (req, res) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: req.params.studentId },
    include: { course: true }
  });
  res.json({ success: true, data: enrollments });
});

router.post('/api/courses', async (req, res) => {
  const { title, description, instructorId, price } = req.body;
  const course = await prisma.course.create({
    data: { title, description, instructorId, price, isPublished: false }
  });
  res.json({ success: true, data: course });
});

module.exports = router;
