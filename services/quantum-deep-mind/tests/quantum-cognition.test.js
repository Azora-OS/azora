const request = require('supertest');
const app = require('../index');

describe('Quantum Deep Mind - Quantum Cognition Tests', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('quantum-deep-mind');
    });
  });

  describe('POST /api/simulate-consciousness', () => {
    it('should simulate quantum consciousness', async () => {
      const response = await request(app)
        .post('/api/simulate-consciousness')
        .send({
          parameters: { complexity: 'high' },
          depth: 15
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('simulationId');
      expect(response.body.depth).toBe(15);
      expect(response.body).toHaveProperty('neuralComplexity');
      expect(response.body).toHaveProperty('quantumCoherence');
      expect(response.body).toHaveProperty('emergentProperties');
    });

    it('should default to depth 10 when not specified', async () => {
      const response = await request(app)
        .post('/api/simulate-consciousness')
        .send({ parameters: {} });

      expect(response.status).toBe(200);
      expect(response.body.depth).toBe(10);
    });

    it('should include emergent properties', async () => {
      const response = await request(app)
        .post('/api/simulate-consciousness')
        .send({ parameters: {}, depth: 5 });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.emergentProperties)).toBe(true);
      expect(response.body.emergentProperties.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/train-qnn', () => {
    it('should train quantum neural network', async () => {
      const response = await request(app)
        .post('/api/train-qnn')
        .send({
          dataset: 'quantum_dataset_v1',
          architecture: 'deep_quantum',
          epochs: 50
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('modelId');
      expect(response.body.architecture).toBe('deep_quantum');
      expect(response.body.epochsCompleted).toBe(50);
      expect(response.body).toHaveProperty('accuracy');
      expect(response.body).toHaveProperty('loss');
      expect(response.body).toHaveProperty('quantumAdvantage');
    });

    it('should report quantum advantage', async () => {
      const response = await request(app)
        .post('/api/train-qnn')
        .send({
          dataset: 'test_data',
          architecture: 'quantum',
          epochs: 10
        });

      expect(response.status).toBe(200);
      expect(response.body.quantumAdvantage).toBeGreaterThanOrEqual(5);
      expect(response.body.quantumAdvantage).toBeLessThanOrEqual(15);
    });

    it('should include model parameters count', async () => {
      const response = await request(app)
        .post('/api/train-qnn')
        .send({
          dataset: 'data',
          architecture: 'qnn',
          epochs: 5
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('parameters');
      expect(typeof response.body.parameters).toBe('number');
    });
  });

  describe('POST /api/model-cognition', () => {
    it('should model cognitive processes', async () => {
      const response = await request(app)
        .post('/api/model-cognition')
        .send({
          cognitiveTask: { id: 'task_123', type: 'reasoning' },
          complexity: 'high'
        });

      expect(response.status).toBe(200);
      expect(response.body.taskId).toBe('task_123');
      expect(response.body.complexity).toBe('high');
      expect(response.body).toHaveProperty('processingLayers');
      expect(response.body).toHaveProperty('quantumEntanglement');
      expect(response.body).toHaveProperty('cognitiveFidelity');
    });

    it('should include cognitive insights', async () => {
      const response = await request(app)
        .post('/api/model-cognition')
        .send({
          cognitiveTask: { id: 'task_456', type: 'learning' },
          complexity: 'medium'
        });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.insights)).toBe(true);
      expect(response.body.insights.length).toBeGreaterThan(0);
    });

    it('should report cognitive fidelity', async () => {
      const response = await request(app)
        .post('/api/model-cognition')
        .send({
          cognitiveTask: { id: 'task_789', type: 'memory' },
          complexity: 'low'
        });

      expect(response.status).toBe(200);
      expect(response.body.cognitiveFidelity).toBeGreaterThanOrEqual(0.7);
      expect(response.body.cognitiveFidelity).toBeLessThanOrEqual(1.0);
    });
  });
});
