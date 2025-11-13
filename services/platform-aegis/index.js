const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class PlatformAegis {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3079;
    this.policies = new Map();
    this.violations = [];
    this.audits = [];
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
      res.json({ status: 'healthy', service: 'platform-aegis', timestamp: new Date().toISOString(), policies: this.policies.size });
    });

    this.app.post('/api/aegis/policies', (req, res) => {
      const id = Date.now().toString();
      const policy = { id, ...req.body, createdAt: new Date() };
      this.policies.set(id, policy);
      res.status(201).json(policy);
    });

    this.app.get('/api/aegis/policies', (req, res) => {
      res.json({ policies: Array.from(this.policies.values()) });
    });

    this.app.post('/api/aegis/check', (req, res) => {
      const { action, resource, user } = req.body;
      const allowed = Array.from(this.policies.values()).some(p => 
        p.action === action && p.resource === resource
      );
      if (!allowed) {
        this.violations.push({ action, resource, user, timestamp: new Date() });
      }
      res.json({ allowed });
    });

    this.app.get('/api/aegis/violations', (req, res) => {
      res.json({ violations: this.violations.slice(-100) });
    });

    this.app.post('/api/aegis/audit', (req, res) => {
      const audit = { id: Date.now().toString(), ...req.body, timestamp: new Date() };
      this.audits.push(audit);
      res.json({ audit });
    });
  }

  start() {
    this.app.listen(this.port, () => console.log(`Platform Aegis running on port ${this.port}`));
  }
}

const service = new PlatformAegis();
if (require.main === module) service.start();
module.exports = service;
