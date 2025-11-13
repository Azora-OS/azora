const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class AnalyticsEngine {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3059;
    this.data = new Map();
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
      res.json({ status: 'healthy', service: 'analytics-engine', timestamp: new Date().toISOString(), items: this.data.size });
    });

    this.app.get('/api/analytics-engine', this.getMetrics.bind(this));
    this.app.get('/api/analytics-engine', this.getDashboard.bind(this));
    this.app.get('/api/analytics-engine', this.getReports.bind(this));
  }

  getMetrics(req, res) {
    const id = Date.now().toString();
    const item = { id, ...req.body, createdAt: new Date() };
    this.data.set(id, item);
    res.status(201).json(item);
  }

  getDashboard(req, res) {
    const id = Date.now().toString();
    const item = { id, ...req.body, createdAt: new Date() };
    this.data.set(id, item);
    res.status(201).json(item);
  }

  getReports(req, res) {
    const id = Date.now().toString();
    const item = { id, ...req.body, createdAt: new Date() };
    this.data.set(id, item);
    res.status(201).json(item);
  }

  start() {
    this.app.listen(this.port, () => console.log(`analytics-engine running on port ${this.port}`));
  }
}

const service = new AnalyticsEngine();
if (require.main === module) service.start();
module.exports = service;
