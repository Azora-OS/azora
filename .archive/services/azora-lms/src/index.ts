/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import express from 'express';
import cors from 'cors';
import FacultyManagementSystem from './lms-core';

const app = express();
app.use(cors());
app.use(express.json());

const lms = new FacultyManagementSystem();

// Courses
app.post('/api/v1/lms/courses', async (req, res) => {
  try {
    const course = await lms.createCourse(req.body);
    res.json({ success: true, course });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/lms/courses/:courseId', async (req, res) => {
  const course = await lms.getCourse(req.params.courseId);
  if (!course) return res.status(404).json({ success: false, error: 'Course not found' });
  res.json({ success: true, course });
});

app.get('/api/v1/lms/instructor/:instructorId/courses', async (req, res) => {
  const courses = await lms.getInstructorCourses(req.params.instructorId);
  res.json({ success: true, courses });
});

app.put('/api/v1/lms/courses/:courseId', async (req, res) => {
  try {
    const course = await lms.updateCourse(req.params.courseId, req.body);
    res.json({ success: true, course });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/v1/lms/courses/:courseId/publish', async (req, res) => {
  try {
    await lms.publishCourse(req.params.courseId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Content
app.post('/api/v1/lms/content', async (req, res) => {
  try {
    const content = await lms.uploadContent(req.body);
    res.json({ success: true, content });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/v1/lms/content/:contentId/publish', async (req, res) => {
  try {
    await lms.publishContent(req.params.contentId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Assignments
app.post('/api/v1/lms/assignments', async (req, res) => {
  try {
    const assignment = await lms.createAssignment(req.body);
    res.json({ success: true, assignment });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/v1/lms/assignments/grade', async (req, res) => {
  try {
    await lms.gradeAssignment(req.body.submissionId, req.body.grade);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/v1/lms/assignments/bulk-grade', async (req, res) => {
  try {
    await lms.bulkGrade(req.body.grades);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Analytics
app.get('/api/v1/lms/courses/:courseId/analytics', async (req, res) => {
  try {
    const analytics = await lms.getCourseAnalytics(req.params.courseId);
    res.json({ success: true, analytics });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/lms/courses/:courseId/students/:studentNumber/progress', async (req, res) => {
  try {
    const progress = await lms.getStudentProgress(req.params.courseId, req.params.studentNumber);
    res.json({ success: true, progress });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/lms/courses/:courseId/at-risk', async (req, res) => {
  try {
    const students = await lms.identifyAtRiskStudents(req.params.courseId);
    res.json({ success: true, students });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Announcements
app.post('/api/v1/lms/courses/:courseId/announcements', async (req, res) => {
  try {
    await lms.sendAnnouncement(req.params.courseId, req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'azora-lms' });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`📚 Azora LMS on port ${PORT}`));

export default app;
