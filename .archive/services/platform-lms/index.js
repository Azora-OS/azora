const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class PlatformLMS {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3075;
    this.courses = new Map();
    this.modules = new Map();
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
      res.json({ status: 'healthy', service: 'platform-lms', timestamp: new Date().toISOString(), courses: this.courses.size });
    });

    this.app.post('/api/lms/courses', (req, res) => {
      const id = Date.now().toString();
      const course = { id, ...req.body, modules: [], createdAt: new Date() };
      this.courses.set(id, course);
      res.status(201).json(course);
    });

    this.app.get('/api/lms/courses', (req, res) => {
      res.json({ courses: Array.from(this.courses.values()) });
    });

    this.app.post('/api/lms/courses/:id/modules', (req, res) => {
      const course = this.courses.get(req.params.id);
      if (!course) return res.status(404).json({ error: 'Course not found' });
      const moduleId = Date.now().toString();
      const module = { id: moduleId, courseId: course.id, ...req.body, createdAt: new Date() };
      this.modules.set(moduleId, module);
      course.modules.push(moduleId);
      res.status(201).json(module);
    });

    this.app.get('/api/lms/courses/:id/modules', (req, res) => {
      const course = this.courses.get(req.params.id);
      if (!course) return res.status(404).json({ error: 'Course not found' });
      const modules = course.modules.map(id => this.modules.get(id)).filter(Boolean);
      res.json({ modules });
    });
  }

  start() {
    this.app.listen(this.port, () => console.log(`Platform LMS running on port ${this.port}`));
  }
}

const service = new PlatformLMS();
if (require.main === module) service.start();
module.exports = service;
