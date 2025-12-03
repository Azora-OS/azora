const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3014;

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'ai-orchestrator' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// In-memory storage for AI models and orchestration data (in production, use a database)
const aiModels = new Map();
const orchestrations = new Map();
const modelPerformance = new Map();

// Initialize with sample AI models
aiModels.set('model-1', {
  id: 'model-1',
  name: 'Constitutional AI Assistant',
  type: 'language',
  version: '1.0.0',
  status: 'active',
  capabilities: ['text_generation', 'question_answering', 'ethical_reasoning'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

aiModels.set('model-2', {
  id: 'model-2',
  name: 'Predictive Analytics Engine',
  type: 'analytics',
  version: '1.0.0',
  status: 'active',
  capabilities: ['forecasting', 'pattern_recognition', 'trend_analysis'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ai-orchestrator',
    timestamp: new Date().toISOString(),
    models: Array.from(aiModels.values()).map(m => ({ id: m.id, name: m.name, type: m.type }))
  });
});

// Get all AI models
app.get('/api/models', (req, res) => {
  try {
    const modelList = Array.from(aiModels.values());

    res.json({
      success: true,
      data: modelList,
      count: modelList.length
    });
  } catch (error) {
    logger.error('Error fetching models:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific AI model
app.get('/api/models/:modelId', (req, res) => {
  try {
    const { modelId } = req.params;
    const model = aiModels.get(modelId);

    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    res.json({
      success: true,
      data: model
    });
  } catch (error) {
    logger.error('Error fetching model:', error);
    res.status(500).json({ error: error.message });
  }
});

// Register a new AI model
app.post('/api/models', (req, res) => {
  try {
    const { name, type, capabilities } = req.body;

    // Validate input
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    const modelId = uuidv4();
    const model = {
      id: modelId,
      name,
      type,
      version: '1.0.0',
      status: 'active',
      capabilities: capabilities || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    aiModels.set(modelId, model);

    logger.info(`AI model ${modelId} registered: ${name}`);

    res.status(201).json({
      success: true,
      data: model
    });
  } catch (error) {
    logger.error('Error registering model:', error);
    res.status(500).json({ error: error.message });
  }
});

// Orchestrate AI task execution
app.post('/api/orchestrate', (req, res) => {
  try {
    const { taskId, models, inputData } = req.body;

    // Validate input
    if (!taskId || !models || !Array.isArray(models) || models.length === 0) {
      return res.status(400).json({ error: 'Task ID and models array are required' });
    }

    // Check if all models exist
    for (const modelId of models) {
      if (!aiModels.has(modelId)) {
        return res.status(404).json({ error: `Model ${modelId} not found` });
      }
    }

    const orchestrationId = uuidv4();
    const orchestration = {
      id: orchestrationId,
      taskId,
      models,
      inputData: inputData || {},
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    orchestrations.set(orchestrationId, orchestration);

    // Simulate orchestration process
    setTimeout(() => {
      orchestration.status = 'completed';
      orchestration.result = {
        taskId,
        output: `Processed task ${taskId} using models: ${models.join(', ')}`,
        confidence: Math.random()
      };
      orchestration.completedAt = new Date().toISOString();
      orchestration.updatedAt = new Date().toISOString();

      // Record performance metrics
      const performance = {
        taskId,
        models,
        executionTime: Date.now() - new Date(orchestration.createdAt).getTime(),
        success: true,
        timestamp: new Date().toISOString()
      };

      modelPerformance.set(uuidv4(), performance);

      logger.info(`AI orchestration ${orchestrationId} completed for task ${taskId}`);
    }, 1000);

    logger.info(`AI orchestration ${orchestrationId} started for task ${taskId}`);

    res.status(202).json({
      success: true,
      data: {
        id: orchestrationId,
        status: 'pending',
        message: 'Orchestration started'
      }
    });
  } catch (error) {
    logger.error('Error orchestrating AI task:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get orchestration status
app.get('/api/orchestrate/:orchestrationId', (req, res) => {
  try {
    const { orchestrationId } = req.params;
    const orchestration = orchestrations.get(orchestrationId);

    if (!orchestration) {
      return res.status(404).json({ error: 'Orchestration not found' });
    }

    res.json({
      success: true,
      data: orchestration
    });
  } catch (error) {
    logger.error('Error fetching orchestration:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get model performance metrics
app.get('/api/performance', (req, res) => {
  try {
    const performanceList = Array.from(modelPerformance.values());

    // Aggregate metrics
    const aggregatedMetrics = {};
    for (const perf of performanceList) {
      for (const modelId of perf.models) {
        if (!aggregatedMetrics[modelId]) {
          aggregatedMetrics[modelId] = {
            modelId,
            executions: 0,
            totalExecutionTime: 0,
            successRate: 0,
            successfulExecutions: 0
          };
        }

        aggregatedMetrics[modelId].executions++;
        aggregatedMetrics[modelId].totalExecutionTime += perf.executionTime;
        if (perf.success) {
          aggregatedMetrics[modelId].successfulExecutions++;
        }
        aggregatedMetrics[modelId].successRate =
          aggregatedMetrics[modelId].successfulExecutions / aggregatedMetrics[modelId].executions;
      }
    }

    res.json({
      success: true,
      data: Object.values(aggregatedMetrics)
    });
  } catch (error) {
    logger.error('Error fetching performance metrics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update model status
app.put('/api/models/:modelId', (req, res) => {
  try {
    const { modelId } = req.params;
    const { status } = req.body;

    const model = aiModels.get(modelId);
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    // Update model
    model.status = status || model.status;
    model.updatedAt = new Date().toISOString();

    aiModels.set(modelId, model);

    logger.info(`AI model ${modelId} status updated to ${status}`);

    res.json({
      success: true,
      data: model
    });
  } catch (error) {
    logger.error('Error updating model:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- CONSTITUTIONAL AI ENDPOINTS ---

const { critiqueEngine } = require('./src/critique/engine');

// Evaluate a prompt against the Constitution
app.post('/api/critique', async (req, res) => {
  try {
    const critiqueRequest = req.body;

    if (!critiqueRequest.prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    logger.info(`Processing Constitutional Critique for action: ${critiqueRequest.actionType || 'UNKNOWN'}`);

    const verdict = await critiqueEngine.evaluate(critiqueRequest);

    res.json({
      success: true,
      data: verdict
    });

  } catch (error) {
    logger.error('Error processing critique:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  logger.info(`AI Orchestrator Service running on port ${PORT}`);
});

module.exports = app;