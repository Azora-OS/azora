const express = require('express');
const router = express.Router();

// In-memory storage (replace with Prisma in production)
const courses = new Map();
const enrollments = new Map();
const lessons = new Map();

// Courses
router.get('/courses', (req, res) => {
  const { level, search } = req.query;
  let list = Array.from(courses.values());
  if (level) list = list.filter(c => c.level === level);
  if (search) list = list.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
  res.json({ success: true, data: list, count: list.length });
});

router.post('/courses', (req, res) => {
  const course = { id: `course_${Date.now()}`, ...req.body, createdAt: new Date(), enrolled: 0 };
  courses.set(course.id, course);
  res.status(201).json({ success: true, data: course });
});

router.get('/courses/:id', (req, res) => {
  const course = courses.get(req.params.id);
  if (!course) return res.status(404).json({ success: false, error: 'Course not found' });
  const courseLessons = Array.from(lessons.values()).filter(l => l.courseId === req.params.id);
  res.json({ success: true, data: { ...course, lessons: courseLessons } });
});

router.put('/courses/:id', (req, res) => {
  const course = courses.get(req.params.id);
  if (!course) return res.status(404).json({ success: false, error: 'Course not found' });
  Object.assign(course, req.body, { updatedAt: new Date() });
  res.json({ success: true, data: course });
});

router.delete('/courses/:id', (req, res) => {
  const deleted = courses.delete(req.params.id);
  res.json({ success: deleted, message: deleted ? 'Course deleted' : 'Course not found' });
});

// Lessons
router.post('/lessons', (req, res) => {
  const lesson = { id: `lesson_${Date.now()}`, ...req.body, createdAt: new Date() };
  lessons.set(lesson.id, lesson);
  res.status(201).json({ success: true, data: lesson });
});

router.get('/courses/:courseId/lessons', (req, res) => {
  const courseLessons = Array.from(lessons.values())
    .filter(l => l.courseId === req.params.courseId)
    .sort((a, b) => a.order - b.order);
  res.json({ success: true, data: courseLessons });
});

// Enrollments
router.post('/enroll', (req, res) => {
  const { courseId, studentId } = req.body;
  const course = courses.get(courseId);
  if (!course) return res.status(404).json({ success: false, error: 'Course not found' });
  
  const enrollment = {
    id: `enroll_${Date.now()}`,
    courseId,
    studentId,
    progress: 0,
    status: 'active',
    enrolledAt: new Date()
  };
  enrollments.set(enrollment.id, enrollment);
  course.enrolled++;
  res.status(201).json({ success: true, data: enrollment });
});

router.get('/enrollments/:studentId', (req, res) => {
  const studentEnrollments = Array.from(enrollments.values())
    .filter(e => e.studentId === req.params.studentId)
    .map(e => ({ ...e, course: courses.get(e.courseId) }));
  res.json({ success: true, data: studentEnrollments });
});

router.post('/enrollments/:id/progress', (req, res) => {
  const enrollment = enrollments.get(req.params.id);
  if (!enrollment) return res.status(404).json({ success: false, error: 'Enrollment not found' });
  
  const { lessonId } = req.body;
  enrollment.completedLessons = enrollment.completedLessons || [];
  if (!enrollment.completedLessons.includes(lessonId)) {
    enrollment.completedLessons.push(lessonId);
  }
  
  const totalLessons = Array.from(lessons.values()).filter(l => l.courseId === enrollment.courseId).length;
  enrollment.progress = totalLessons > 0 ? Math.round((enrollment.completedLessons.length / totalLessons) * 100) : 0;
  
  if (enrollment.progress === 100) {
    enrollment.status = 'completed';
    enrollment.completedAt = new Date();
  }
  
  res.json({ success: true, data: enrollment });
});

module.exports = router;
