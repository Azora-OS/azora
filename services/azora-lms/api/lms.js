const express = require('express');
const router = express.Router();
const courseEngine = require('../engines/course-engine');
const enrollmentEngine = require('../engines/enrollment-engine');

router.post('/courses', (req, res) => {
  const { instructorId, courseData } = req.body;
  const course = courseEngine.createCourse(instructorId, courseData);
  res.json(course);
});

router.post('/courses/:id/modules', (req, res) => {
  const result = courseEngine.addModule(req.params.id, req.body);
  res.json(result);
});

router.post('/courses/:courseId/modules/:moduleId/lessons', (req, res) => {
  const result = courseEngine.addLesson(req.params.courseId, req.params.moduleId, req.body);
  res.json(result);
});

router.post('/courses/:id/publish', (req, res) => {
  const result = courseEngine.publishCourse(req.params.id);
  res.json(result);
});

router.get('/courses/:id', (req, res) => {
  const course = courseEngine.getCourse(req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json(course);
});

router.get('/courses/search', (req, res) => {
  const { q } = req.query;
  const results = courseEngine.searchCourses(q);
  res.json(results);
});

router.post('/enroll', (req, res) => {
  const { studentId, courseId, paymentInfo } = req.body;
  const enrollment = enrollmentEngine.enroll(studentId, courseId, paymentInfo);
  res.json(enrollment);
});

router.get('/enrollment/:studentId/:courseId', (req, res) => {
  const enrollment = enrollmentEngine.getEnrollment(req.params.studentId, req.params.courseId);
  if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });
  res.json(enrollment);
});

router.post('/progress', (req, res) => {
  const { studentId, courseId, lessonId } = req.body;
  const result = enrollmentEngine.updateProgress(studentId, courseId, lessonId);
  res.json(result);
});

router.get('/student/:studentId/enrollments', (req, res) => {
  const enrollments = enrollmentEngine.getStudentEnrollments(req.params.studentId);
  res.json(enrollments);
});

router.post('/complete', (req, res) => {
  const { studentId, courseId } = req.body;
  const result = enrollmentEngine.completeCourse(studentId, courseId);
  res.json(result);
});

module.exports = router;
