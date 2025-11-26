const request = require('supertest');
const express = require('express');

function createTestApp() {
  const app = express();
  app.use(express.json());

  app.post('/api/evolution/train', (req, res) => {
    const { modelId, dataset, epochs } = req.body;

    if (!modelId || !dataset) {
      return res.status(400).json({ error: 'Model ID and dataset are required' });
    }

    const training = {
      trainingId: `train_${Date.now()}`,
      modelId,
      epochs: epochs || 10,
      status: 'in_progress',
      accuracy: 0,
      loss: 0,
      timestamp: new Date().toISOString()
    };

    res.json(training);
  });

  app.get('/api/evolution/model/:modelId', (req, res) => {
    const { modelId } = req.params;

    res.json({
      modelId,
      version: '1.0.0',
      accuracy: 0.95,
      parameters: 1000000,
      lastTrained: new Date().toISOString()
    });
  });

  app.post('/api/evolution/evaluate', (req, res) => {
    const { modelId, testData } = req.body;

    if (!modelId) {
      return res.status(400).json({ error: 'Model ID is required' });
    }

    const evaluation = {
      evaluationId: `eval_${Date.now()}`,
      modelId,
      accuracy: Math.random() * 0.3 + 0.7,
      precision: Math.random() * 0.3 + 0.7,
      recall: Math.random() * 0.3 + 0.7,
      f1Score: Math.random() * 0.3 + 0.7,
      timestamp: new Date().toISOString()
    };

    res.json(evaluation);
  });

  return app;
}

describe('AI Evolution Engine - Model Evolution Tests', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('POST /api/evolution/train', () => {
    it('should initiate model training', async () => {
      const response = await request(app)
        .post('/api/evolution/train')
        .send({
          modelId: 'model_123',
          dataset: 'training_data_v1',
          epochs: 20
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('trainingId');
      expect(response.body.modelId).toBe('model_123');
      expect(response.body.epochs).toBe(20);
    });

    it('should return error when model ID is missing', async () => {
      const response = await request(app)
        .post('/api/evolution/train')
        .send({ dataset: 'data' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Model ID and dataset are required');
    });

    it('should default to 10 epochs when not specified', async () => {
      const response = await request(app)
        .post('/api/evolution/train')
        .send({
          modelId: 'model_123',
          dataset: 'data'
        });

      expect(response.status).toBe(200);
      expect(response.body.epochs).toBe(10);
    });
  });

  describe('GET /api/evolution/model/:modelId', () => {
    it('should retrieve model information', async () => {
      const response = await request(app)
        .get('/api/evolution/model/model_123');

      expect(response.status).toBe(200);
      expect(response.body.modelId).toBe('model_123');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('accuracy');
      expect(response.body).toHaveProperty('parameters');
    });
  });

  describe('POST /api/evolution/evaluate', () => {
    it('should evaluate model performance', async () => {
      const response = await request(app)
        .post('/api/evolution/evaluate')
        .send({
          modelId: 'model_123',
          testData: 'test_dataset'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('evaluationId');
      expect(response.body).toHaveProperty('accuracy');
      expect(response.body).toHaveProperty('precision');
      expect(response.body).toHaveProperty('recall');
      expect(response.body).toHaveProperty('f1Score');
    });

    it('should return error when model ID is missing', async () => {
      const response = await request(app)
        .post('/api/evolution/evaluate')
        .send({ testData: 'data' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Model ID is required');
    });
  });
});
