const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class CourseManagementService {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3055;
    this.courses = new Map();
    this.enrollments = new Map();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(compression());
    this.app.use(express.json());
  }

  setupRoutes() {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', service: 'course-management-service', timestamp: new Date().toISOString() });
    });

    this.app.post('/api/courses', this.createCourse.bind(this));
    this.app.get('/api/courses', this.getCourses.bind(this));
    this.app.get('/api/courses/:id', this.getCourse.bind(this));
    this.app.post('/api/courses/:id/enroll', this.enrollStudent.bind(this));
    this.app.get('/api/students/:studentId/courses', this.getStudentCourses.bind(this));
    this.app.post('/api/courses/:id/progress', this.updateProgress.bind(this));
  }

  createCourse(req, res) {
    const { title, description, instructorId, duration, price } = req.body;
    const id = `COURSE-${Date.now()}`;
    const course = { id, title, description, instructorId, duration, price, students: 0, createdAt: new Date() };
    this.courses.set(id, course);
    res.status(201).json(course);
  }

  getCourses(req, res) {
    res.json({ courses: Array.from(this.courses.values()) });
  }

  getCourse(req, res) {
    const course = this.courses.get(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  }

  enrollStudent(req, res) {
    const { studentId } = req.body;
    const course = this.courses.get(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    const enrollmentId = `ENR-${Date.now()}`;
    const enrollment = { enrollmentId, courseId: course.id, studentId, progress: 0, enrolledAt: new Date() };
    this.enrollments.set(enrollmentId, enrollment);
    course.students++;
    res.json({ enrollment });
  }

  getStudentCourses(req, res) {
    const enrollments = Array.from(this.enrollments.values()).filter(e => e.studentId === req.params.studentId);
    res.json({ enrollments });
  }

  updateProgress(req, res) {
    const { studentId, progress } = req.body;
    const enrollment = Array.from(this.enrollments.values()).find(e => e.courseId === req.params.id && e.studentId === studentId);
    if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });
    enrollment.progress = progress;
    res.json({ enrollment });
  }

  start() {
    this.app.listen(this.port, () => console.log(`Course Management Service running on port ${this.port}`));
  }
}

const service = new CourseManagementService();
if (require.main === module) service.start();
module.exports = service;
