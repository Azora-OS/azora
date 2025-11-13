#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

class AzoraLMS {
  constructor() {
    this.courses = new Map();
    this.enrollments = new Map();
    this.certificates = new Map();
    this.initSampleData();
  }

  initSampleData() {
    this.courses.set('js-101', {
      id: 'js-101',
      title: 'JavaScript Fundamentals',
      description: 'Learn JavaScript from scratch with Ubuntu principles',
      instructor: 'Elara AI',
      duration: '8 weeks',
      modules: 12,
      enrolled: 245,
      rating: 4.8
    });
  }

  createCourse(courseData) {
    const course = {
      id: `course_${Date.now()}`,
      ...courseData,
      createdAt: new Date(),
      enrolled: 0,
      rating: 0
    };
    this.courses.set(course.id, course);
    return course;
  }

  enrollStudent(courseId, studentId) {
    const enrollment = {
      id: `enrollment_${Date.now()}`,
      courseId,
      studentId,
      enrolledAt: new Date(),
      progress: 0,
      status: 'active'
    };
    this.enrollments.set(enrollment.id, enrollment);
    
    const course = this.courses.get(courseId);
    if (course) {
      course.enrolled += 1;
    }
    
    return enrollment;
  }

  generateCertificate(courseId, studentId) {
    const certificate = {
      id: `cert_${Date.now()}`,
      courseId,
      studentId,
      issuedAt: new Date(),
      blockchainHash: `0x${Math.random().toString(16).substr(2, 40)}`,
      verified: true
    };
    this.certificates.set(certificate.id, certificate);
    return certificate;
  }
}

const lms = new AzoraLMS();

app.get('/api/courses', (req, res) => {
  res.json({ success: true, data: Array.from(lms.courses.values()) });
});

app.post('/api/courses', (req, res) => {
  try {
    const course = lms.createCourse(req.body);
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/enroll', (req, res) => {
  try {
    const { courseId, studentId } = req.body;
    const enrollment = lms.enrollStudent(courseId, studentId);
    res.json({ success: true, data: enrollment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/certificates', (req, res) => {
  try {
    const { courseId, studentId } = req.body;
    const certificate = lms.generateCertificate(courseId, studentId);
    res.json({ success: true, data: certificate });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({
    service: 'Azora LMS',
    status: 'healthy',
    timestamp: new Date(),
    stats: { courses: lms.courses.size, enrollments: lms.enrollments.size },
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 4015;
app.listen(PORT, () => {
  console.log(`🎓 Azora LMS running on port ${PORT}`);
});

module.exports = app;