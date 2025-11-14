const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class AiEvolutionEngine {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3051;
    this.models = new Map();
    this.evolutionHistory = [];
    this.performanceMetrics = new Map();
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
      res.json({ status: 'healthy', service: 'ai-evolution-engine', models: this.models.size, timestamp: new Date().toISOString() });
    });

    this.app.post('/api/models/register', this.registerModel.bind(this));
    this.app.post('/api/models/:modelId/evolve', this.evolveModel.bind(this));
    this.app.post('/api/models/:modelId/metrics', this.recordMetrics.bind(this));
    this.app.get('/api/models/:modelId/performance', this.getPerformance.bind(this));
    this.app.get('/api/evolution/history', this.getEvolutionHistory.bind(this));
    this.app.post('/api/evolution/trigger', this.triggerEvolution.bind(this));
  }

  registerModel(req, res) {
    const { modelId, name, version, type, parameters } = req.body;
    this.models.set(modelId, { modelId, name, version, type, parameters, registeredAt: new Date(), generation: 1 });
    res.status(201).json({ success: true, modelId });
  }

  async evolveModel(req, res) {
    const { modelId } = req.params;
    const { strategy, targetMetric } = req.body;
    const model = this.models.get(modelId);
    
    if (!model) return res.status(404).json({ error: 'Model not found' });

    const evolved = await this.performEvolution(model, strategy, targetMetric);
    this.models.set(modelId, evolved);
    this.evolutionHistory.push({ modelId, from: model.generation, to: evolved.generation, strategy, timestamp: new Date() });
    
    res.json({ success: true, model: evolved });
  }

  async performEvolution(model, strategy, targetMetric) {
    const metrics = this.performanceMetrics.get(model.modelId) || [];
    const avgPerformance = metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length : 0;

    let evolutionFactor = 1.0;
    if (avgPerformance < 0.7) evolutionFactor = 1.2;
    else if (avgPerformance < 0.85) evolutionFactor = 1.1;

    return {
      ...model,
      generation: model.generation + 1,
      parameters: { ...model.parameters, learningRate: (model.parameters.learningRate || 0.001) * evolutionFactor },
      evolvedAt: new Date(),
      evolutionStrategy: strategy,
      performanceImprovement: evolutionFactor - 1
    };
  }

  recordMetrics(req, res) {
    const { modelId } = req.params;
    const { accuracy, precision, recall, f1Score, latency } = req.body;
    
    const metrics = this.performanceMetrics.get(modelId) || [];
    metrics.push({ accuracy, precision, recall, f1Score, latency, score: f1Score || accuracy, timestamp: new Date() });
    this.performanceMetrics.set(modelId, metrics.slice(-100));
    
    res.json({ success: true, metricsRecorded: metrics.length });
  }

  getPerformance(req, res) {
    const metrics = this.performanceMetrics.get(req.params.modelId) || [];
    const recent = metrics.slice(-10);
    const avg = recent.length > 0 ? recent.reduce((sum, m) => sum + m.score, 0) / recent.length : 0;
    res.json({ metrics: recent, average: avg, total: metrics.length });
  }

  getEvolutionHistory(req, res) {
    res.json({ history: this.evolutionHistory.slice(-50) });
  }

  async triggerEvolution(req, res) {
    const { threshold = 0.8 } = req.body;
    const evolved = [];

    for (const [modelId, model] of this.models.entries()) {
      const metrics = this.performanceMetrics.get(modelId) || [];
      if (metrics.length > 0) {
        const recent = metrics.slice(-10);
        const avg = recent.reduce((sum, m) => sum + m.score, 0) / recent.length;
        
        if (avg < threshold) {
          const evolvedModel = await this.performEvolution(model, 'auto-trigger', 'performance');
          this.models.set(modelId, evolvedModel);
          evolved.push(modelId);
        }
      }
    }

    res.json({ success: true, evolved, count: evolved.length });
  }

  start() {
    this.app.listen(this.port, () => console.log(`AI Evolution Engine running on port ${this.port}`));
  }
}

const service = new AiEvolutionEngine();
if (require.main === module) service.start();
module.exports = service;
