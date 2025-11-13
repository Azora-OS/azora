const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class QuantumTracking {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3048;
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
      res.json({ status: 'healthy', service: 'quantum-tracking', timestamp: new Date().toISOString() });
    });

    this.app.get('/api/quantum-tracking', this.getAll.bind(this));
    this.app.post('/api/quantum-tracking', this.create.bind(this));
    this.app.get('/api/quantum-tracking/:id', this.getById.bind(this));
    this.app.put('/api/quantum-tracking/:id', this.update.bind(this));
    this.app.delete('/api/quantum-tracking/:id', this.delete.bind(this));
  }

  getAll(req, res) {
    res.json({ data: Array.from(this.data.values()) });
  }

  create(req, res) {
    const id = Date.now().toString();
    const item = { id, ...req.body, createdAt: new Date() };
    this.data.set(id, item);
    res.status(201).json(item);
  }

  getById(req, res) {
    const item = this.data.get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  }

  update(req, res) {
    const item = this.data.get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    Object.assign(item, req.body, { updatedAt: new Date() });
    res.json(item);
  }

  delete(req, res) {
    if (!this.data.has(req.params.id)) return res.status(404).json({ error: 'Not found' });
    this.data.delete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  }

  start() {
    this.app.listen(this.port, () => console.log(`Quantum Tracking Service running on port ${this.port}`));
  }
}

const service = new QuantumTracking();
if (require.main === module) service.start();
module.exports = service;
