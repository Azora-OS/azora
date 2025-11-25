const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class MlInferenceService {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3065;
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
      res.json({ status: 'healthy', service: 'ml-inference-service', timestamp: new Date().toISOString(), items: this.data.size });
    });

    this.app.post('/api/ml-inference', this.predict.bind(this));
    this.app.post('/api/ml-inference', this.train.bind(this));
    this.app.post('/api/ml-inference', this.evaluate.bind(this));
  }

  predict(req, res) {
    const id = Date.now().toString();
    const item = { id, ...req.body, createdAt: new Date() };
    this.data.set(id, item);
    res.status(201).json(item);
  }

  train(req, res) {
    const id = Date.now().toString();
    const item = { id, ...req.body, createdAt: new Date() };
    this.data.set(id, item);
    res.status(201).json(item);
  }

  evaluate(req, res) {
    const id = Date.now().toString();
    const item = { id, ...req.body, createdAt: new Date() };
    this.data.set(id, item);
    res.status(201).json(item);
  }

  start() {
    this.app.listen(this.port, () => console.log(`ml-inference-service running on port ${this.port}`));
  }
}

const service = new MlInferenceService();
if (require.main === module) service.start();
module.exports = service;
