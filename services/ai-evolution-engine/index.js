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
const PORT = process.env.PORT || 3011;

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'ai-evolution-engine' },
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

// In-memory storage for models and evolution data (in production, use a database)
const models = new Map();
const evolutionHistory = [];
const feedbackData = [];

// Initialize with sample models
models.set('model-1', {
  id: 'model-1',
  name: 'Constitutional AI Assistant',
  version: '1.0.0',
  accuracy: 0.92,
  biasScore: 0.15,
  responseTime: 120,
  createdAt: new Date().toISOString(),
  lastUpdated: new Date().toISOString()
});

models.set('model-2', {
  id: 'model-2',
  name: 'Predictive Analytics Engine',
  version: '1.0.0',
  accuracy: 0.87,
  biasScore: 0.22,
  responseTime: 250,
  createdAt: new Date().toISOString(),
  lastUpdated: new Date().toISOString()
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ai-evolution-engine',
    timestamp: new Date().toISOString(),
    models: Array.from(models.values()).map(m => ({ id: m.id, name: m.name, version: m.version }))
  });
});

// Get all models
app.get('/api/models', (req, res) => {
  try {
    const modelList = Array.from(models.values()).map(model => {
      const { ...modelData } = model;
      return modelData;
    });

    res.json({
      success: true,
      data: modelList
    });
  } catch (error) {
    logger.error('Error fetching models:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific model by ID
app.get('/api/models/:modelId', (req, res) => {
  try {
    const { modelId } = req.params;
    const model = models.get(modelId);

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

// AI Model evolution endpoint
app.post('/api/evolve', (req, res) => {
  try {
    const { modelId, performanceData, feedback } = req.body;

    // Validate input
    if (!modelId) {
      return res.status(400).json({ error: 'Model ID is required' });
    }

    // Check if model exists
    const model = models.get(modelId);
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    // Simulate model evolution process
    const improvements = [];
    let accuracyImprovement = 0;
    let biasReduction = 0;
    let responseTimeImprovement = 0;

    // Analyze performance data
    if (performanceData) {
      if (performanceData.accuracy && performanceData.accuracy > model.accuracy) {
        accuracyImprovement = performanceData.accuracy - model.accuracy;
        improvements.push(`Enhanced accuracy by ${(accuracyImprovement * 100).toFixed(2)}%`);
      }

      if (performanceData.biasScore && performanceData.biasScore < model.biasScore) {
        biasReduction = model.biasScore - performanceData.biasScore;
        improvements.push(`Reduced bias by ${(biasReduction * 100).toFixed(2)}%`);
      }

      if (performanceData.responseTime && performanceData.responseTime < model.responseTime) {
        responseTimeImprovement = model.responseTime - performanceData.responseTime;
        improvements.push(`Improved response time by ${responseTimeImprovement}ms`);
      }
    }

    // Apply feedback improvements
    if (feedback && feedback.length > 0) {
      // In a real implementation, we would analyze feedback to determine improvements
      improvements.push(`Incorporated ${feedback.length} feedback items for optimization`);
    }

    // Update model
    const newVersion = incrementVersion(model.version);
    const updatedModel = {
      ...model,
      version: newVersion,
      accuracy: model.accuracy + accuracyImprovement,
      biasScore: Math.max(0, model.biasScore - biasReduction),
      responseTime: Math.max(0, model.responseTime - responseTimeImprovement),
      lastUpdated: new Date().toISOString()
    };

    models.set(modelId, updatedModel);

    // Record evolution
    const evolutionRecord = {
      id: uuidv4(),
      modelId,
      previousVersion: model.version,
      newVersion,
      improvements,
      performanceData,
      feedbackCount: feedback ? feedback.length : 0,
      timestamp: new Date().toISOString()
    };

    evolutionHistory.push(evolutionRecord);

    logger.info(`Model ${modelId} evolved to version ${newVersion}`);

    res.json({
      success: true,
      data: {
        model: updatedModel,
        evolution: evolutionRecord
      }
    });
  } catch (error) {
    logger.error('Error evolving model:', error);
    res.status(500).json({ error: error.message });
  }
});

// Adaptive learning endpoint
app.post('/api/adaptive-learning', (req, res) => {
  try {
    const { userData, context, preferences } = req.body;

    if (!userData || !userData.id) {
      return res.status(400).json({ error: 'User data with ID is required' });
    }

    // Simulate adaptive learning process
    const adaptations = [];

    if (preferences) {
      adaptations.push("Personalized response style based on preferences");
    }

    if (context) {
      adaptations.push("Context-aware recommendations");
    }

    // In a real implementation, we would update user profile with adaptive settings
    const adaptationResult = {
      userId: userData.id,
      adaptations,
      timestamp: new Date().toISOString(),
      confidence: 0.85 // Simulated confidence score
    };

    logger.info(`Adaptive learning applied for user ${userData.id}`);

    res.json({
      success: true,
      data: adaptationResult
    });
  } catch (error) {
    logger.error('Error applying adaptive learning:', error);
    res.status(500).json({ error: error.message });
  }
});

// Submit feedback for model improvement
app.post('/api/models/:modelId/feedback', (req, res) => {
  try {
    const { modelId } = req.params;
    const { feedback, rating, userId } = req.body;

    // Validate input
    if (!feedback) {
      return res.status(400).json({ error: 'Feedback is required' });
    }

    // Check if model exists
    const model = models.get(modelId);
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    // Record feedback
    const feedbackRecord = {
      id: uuidv4(),
      modelId,
      feedback,
      rating: rating || 0,
      userId: userId || 'anonymous',
      timestamp: new Date().toISOString()
    };

    feedbackData.push(feedbackRecord);

    logger.info(`Feedback recorded for model ${modelId}`);

    res.json({
      success: true,
      data: feedbackRecord
    });
  } catch (error) {
    logger.error('Error recording feedback:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get evolution history
app.get('/api/evolution-history', (req, res) => {
  try {
    res.json({
      success: true,
      data: evolutionHistory
    });
  } catch (error) {
    logger.error('Error fetching evolution history:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get feedback data
app.get('/api/feedback', (req, res) => {
  try {
    res.json({
      success: true,
      data: feedbackData
    });
  } catch (error) {
    logger.error('Error fetching feedback data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to increment version numbers
function incrementVersion(version) {
  const parts = version.split('.');
  const major = parseInt(parts[0]) || 0;
  const minor = parseInt(parts[1]) || 0;
  const patch = parseInt(parts[2]) || 0;

  // For this example, we'll increment the patch version
  return `${major}.${minor}.${patch + 1}`;
}

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
  logger.info(`AI Evolution Engine running on port ${PORT}`);
});

module.exports = app;
