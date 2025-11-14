
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mark a lesson as complete
router.post('/:enrollmentId/lessons/:lessonId/complete', async (req, res) => {
  const { enrollmentId, lessonId } = req.params;
  try {
    const lessonProgress = await prisma.lessonProgress.create({
      data: {
        enrollmentId,
        lessonId,
        completed: true,
        completedAt: new Date(),
      },
    });
    res.status(201).json(lessonProgress);
  } catch (error) {
    res.status(500).json({ error: 'Error marking lesson as complete.' });
  }
});

// Get overall progress for an enrollment
router.get('/:enrollmentId/progress', async (req, res) => {
  const { enrollmentId } = req.params;
  try {
    const enrollment = await prisma.enrollment.findUnique({ where: { id: enrollmentId } });
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found.' });
    }

    const completedLessons = await prisma.lessonProgress.count({
      where: {
        enrollmentId,
        completed: true,
      },
    });

    const totalLessons = await prisma.lesson.count({
      where: { courseId: enrollment.courseId },
    });

    const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
    res.json({ progress });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching progress.' });
  }
});

// Get completion status of all lessons for an enrollment
router.get('/:enrollmentId/lessons', async (req, res) => {
  const { enrollmentId } = req.params;
  try {
    const lessonProgress = await prisma.lessonProgress.findMany({
      where: { enrollmentId },
    });
    res.json(lessonProgress);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching lesson status.' });
  }
});

module.exports = router;
