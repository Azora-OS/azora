const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class PlatformForge {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3077;
    this.jobs = new Map();
    this.freelancers = new Map();
    this.contracts = new Map();
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
      res.json({ status: 'healthy', service: 'platform-forge', timestamp: new Date().toISOString(), jobs: this.jobs.size });
    });

    this.app.post('/api/forge/jobs', (req, res) => {
      const id = Date.now().toString();
      const job = { id, ...req.body, status: 'open', postedAt: new Date() };
      this.jobs.set(id, job);
      res.status(201).json(job);
    });

    this.app.get('/api/forge/jobs', (req, res) => {
      res.json({ jobs: Array.from(this.jobs.values()) });
    });

    this.app.post('/api/forge/freelancers', (req, res) => {
      const id = Date.now().toString();
      const freelancer = { id, ...req.body, joinedAt: new Date() };
      this.freelancers.set(id, freelancer);
      res.status(201).json(freelancer);
    });

    this.app.post('/api/forge/contracts', (req, res) => {
      const id = Date.now().toString();
      const contract = { id, ...req.body, status: 'active', createdAt: new Date() };
      this.contracts.set(id, contract);
      res.status(201).json(contract);
    });

    this.app.get('/api/forge/contracts/:id', (req, res) => {
      const contract = this.contracts.get(req.params.id);
      if (!contract) return res.status(404).json({ error: 'Contract not found' });
      res.json(contract);
    });
  }

  start() {
    this.app.listen(this.port, () => console.log(`Platform Forge running on port ${this.port}`));
  }
}

const service = new PlatformForge();
if (require.main === module) service.start();
module.exports = service;
