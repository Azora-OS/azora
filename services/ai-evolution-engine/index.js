const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class AiEvolutionEngine {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3051;
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
      res.json({ status: 'healthy', service: 'ai-evolution-engine', timestamp: new Date().toISOString() });
    });

    this.app.get('/api/ai-evolution-engine', this.getAll.bind(this));
    this.app.post('/api/ai-evolution-engine', this.create.bind(this));
    this.app.get('/api/ai-evolution-engine/:id', this.getById.bind(this));
    this.app.put('/api/ai-evolution-engine/:id', this.update.bind(this));
    this.app.delete('/api/ai-evolution-engine/:id', this.delete.bind(this));
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
    this.app.listen(this.port, () => console.log(`AI Evolution Engine running on port ${this.port}`));
  }
}

const service = new AiEvolutionEngine();
if (require.main === module) service.start();
module.exports = service;
