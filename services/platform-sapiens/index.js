const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class PlatformSapiens {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3076;
    this.sessions = new Map();
    this.learningPaths = new Map();
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
      res.json({ status: 'healthy', service: 'platform-sapiens', timestamp: new Date().toISOString(), sessions: this.sessions.size });
    });

    this.app.post('/api/sapiens/sessions', (req, res) => {
      const id = Date.now().toString();
      const session = { id, ...req.body, messages: [], startedAt: new Date() };
      this.sessions.set(id, session);
      res.status(201).json(session);
    });

    this.app.post('/api/sapiens/sessions/:id/message', (req, res) => {
      const session = this.sessions.get(req.params.id);
      if (!session) return res.status(404).json({ error: 'Session not found' });
      const message = { role: 'user', content: req.body.message, timestamp: new Date() };
      session.messages.push(message);
      const response = { role: 'assistant', content: `AI response to: ${req.body.message}`, timestamp: new Date() };
      session.messages.push(response);
      res.json({ message: response });
    });

    this.app.get('/api/sapiens/learning-paths', (req, res) => {
      res.json({ paths: Array.from(this.learningPaths.values()) });
    });

    this.app.post('/api/sapiens/learning-paths', (req, res) => {
      const id = Date.now().toString();
      const path = { id, ...req.body, createdAt: new Date() };
      this.learningPaths.set(id, path);
      res.status(201).json(path);
    });
  }

  start() {
    this.app.listen(this.port, () => console.log(`Platform Sapiens running on port ${this.port}`));
  }
}

const service = new PlatformSapiens();
if (require.main === module) service.start();
module.exports = service;
