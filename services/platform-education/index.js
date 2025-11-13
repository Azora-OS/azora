const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class PlatformEducation {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3074;
    this.students = new Map();
    this.curriculum = new Map();
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
      res.json({ status: 'healthy', service: 'platform-education', timestamp: new Date().toISOString(), students: this.students.size });
    });

    this.app.post('/api/students', (req, res) => {
      const id = Date.now().toString();
      const student = { id, ...req.body, enrolledAt: new Date() };
      this.students.set(id, student);
      res.status(201).json(student);
    });

    this.app.get('/api/students', (req, res) => {
      res.json({ students: Array.from(this.students.values()) });
    });

    this.app.get('/api/students/:id', (req, res) => {
      const student = this.students.get(req.params.id);
      if (!student) return res.status(404).json({ error: 'Student not found' });
      res.json(student);
    });

    this.app.post('/api/curriculum', (req, res) => {
      const id = Date.now().toString();
      const curriculum = { id, ...req.body, createdAt: new Date() };
      this.curriculum.set(id, curriculum);
      res.status(201).json(curriculum);
    });

    this.app.get('/api/curriculum', (req, res) => {
      res.json({ curriculum: Array.from(this.curriculum.values()) });
    });
  }

  start() {
    this.app.listen(this.port, () => console.log(`Platform Education running on port ${this.port}`));
  }
}

const service = new PlatformEducation();
if (require.main === module) service.start();
module.exports = service;
