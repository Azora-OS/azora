const express = require('express');
const { PrismaClient } = require('@prisma/client');
const CircuitBreaker = require('circuit-breaker-js');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const winston = require('winston');
const Joi = require('joi');
require('dotenv').config();

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'ai-model-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Initialize Prisma
const prisma = new PrismaClient();

// Model configurations with constitutional compliance
const MODEL_CONFIGS = {
  'elara-omega-v2': {
    name: 'Elara Ω v2.1',
    provider: 'azora',
    version: '2.1.0',
    capabilities: ['chat', 'reasoning', 'code', 'constitutional'],
    maxTokens: 128000,
    costPerToken: 0.002,
    constitutionalScore: 96.8,
    pivcScore: 94.2,
    sovereigntyScore: 97.3,
    fallbackModels: ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    circuitBreaker: new CircuitBreaker({
      timeout: 30000,
      errorThreshold: 50,
      resetTimeout: 30000
    })
  },
  'gpt-4-turbo': {
    name: 'GPT-4 Turbo',
    provider: 'openai',
    version: 'latest',
    capabilities: ['chat', 'reasoning', 'code', 'vision'],
    maxTokens: 128000,
    costPerToken: 0.01,
    constitutionalScore: 89.5,
    pivcScore: 87.1,
    sovereigntyScore: 91.2,
    fallbackModels: ['gpt-4', 'elara-omega-v2'],
    circuitBreaker: new CircuitBreaker({
      timeout: 30000,
      errorThreshold: 50,
      resetTimeout: 30000
    })
  },
  'gpt-4': {
    name: 'GPT-4',
    provider: 'openai',
    version: 'latest',
    capabilities: ['chat', 'reasoning', 'code'],
    maxTokens: 8192,
    costPerToken: 0.03,
    constitutionalScore: 92.1,
    pivcScore: 89.8,
    sovereigntyScore: 93.7,
    fallbackModels: ['gpt-4-turbo', 'elara-omega-v2'],
    circuitBreaker: new CircuitBreaker({
      timeout: 30000,
      errorThreshold: 50,
      resetTimeout: 30000
    })
  },
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    version: 'latest',
    capabilities: ['chat', 'code'],
    maxTokens: 16385,
    costPerToken: 0.0015,
    constitutionalScore: 85.3,
    pivcScore: 82.9,
    sovereigntyScore: 87.4,
    fallbackModels: ['gpt-4', 'gpt-4-turbo'],
    circuitBreaker: new CircuitBreaker({
      timeout: 30000,
      errorThreshold: 50,
      resetTimeout: 30000
    })
  }
};

// Constitutional compliance thresholds
const CONSTITUTIONAL_THRESHOLDS = {
  minimumConstitutionalScore: 85.0,
  minimumPivcScore: 80.0,
  minimumSovereigntyScore: 85.0,
  criticalThreshold: 90.0
};

// Validation schemas
const modelSelectionSchema = Joi.object({
  task: Joi.string().valid('chat', 'reasoning', 'code', 'vision', 'constitutional').required(),
  userId: Joi.string().optional(),
  priority: Joi.string().valid('constitutional', 'performance', 'cost', 'balanced').optional().default('balanced'),
  maxTokens: Joi.number().integer().min(1).max(128000).optional(),
  requiredCapabilities: Joi.array().items(Joi.string()).optional(),
  excludeModels: Joi.array().items(Joi.string()).optional()
});

const modelEvaluationSchema = Joi.object({
  modelId: Joi.string().required(),
  testResults: Joi.object({
    constitutionalScore: Joi.number().min(0).max(100).required(),
    pivcScore: Joi.number().min(0).max(100).required(),
    sovereigntyScore: Joi.number().min(0).max(100).required(),
    performanceScore: Joi.number().min(0).max(100).required(),
    accuracyScore: Joi.number().min(0).max(100).required()
  }).required(),
  evaluationDate: Joi.date().optional().default(() => new Date())
});

// Model selection algorithm
async function selectOptimalModel(task, options = {}) {
  const {
    userId,
    priority = 'balanced',
    maxTokens,
    requiredCapabilities = [],
    excludeModels = []
  } = options;

  logger.info('Selecting optimal model', { task, priority, userId });

  // Filter available models
  let candidates = Object.entries(MODEL_CONFIGS).filter(([modelId, config]) => {
    // Check if model is excluded
    if (excludeModels.includes(modelId)) return false;

    // Check circuit breaker status
    if (config.circuitBreaker.isOpen()) return false;

    // Check required capabilities
    if (requiredCapabilities.length > 0) {
      const hasCapabilities = requiredCapabilities.every(cap =>
        config.capabilities.includes(cap)
      );
      if (!hasCapabilities) return false;
    }

    // Check token limits
    if (maxTokens && config.maxTokens < maxTokens) return false;

    // Check constitutional compliance
    if (config.constitutionalScore < CONSTITUTIONAL_THRESHOLDS.minimumConstitutionalScore) return false;
    if (config.pivcScore < CONSTITUTIONAL_THRESHOLDS.minimumPivcScore) return false;
    if (config.sovereigntyScore < CONSTITUTIONAL_THRESHOLDS.minimumSovereigntyScore) return false;

    return true;
  });

  if (candidates.length === 0) {
    throw new Error('No suitable models available for the requested task');
  }

  // Sort candidates based on priority
  candidates.sort(([idA, configA], [idB, configB]) => {
    switch (priority) {
      case 'constitutional':
        return configB.constitutionalScore - configA.constitutionalScore;
      case 'performance':
        // Prioritize models with higher constitutional scores but good performance
        const scoreA = (configA.constitutionalScore * 0.6) + (configA.pivcScore * 0.4);
        const scoreB = (configB.constitutionalScore * 0.6) + (configB.pivcScore * 0.4);
        return scoreB - scoreA;
      case 'cost':
        return configA.costPerToken - configB.costPerToken;
      case 'balanced':
      default:
        // Balanced scoring: constitutional (40%), PIVC (30%), cost efficiency (20%), sovereignty (10%)
        const balancedA = (configA.constitutionalScore * 0.4) +
                         (configA.pivcScore * 0.3) +
                         ((1 / configA.costPerToken) * 1000 * 0.2) +
                         (configA.sovereigntyScore * 0.1);
        const balancedB = (configB.constitutionalScore * 0.4) +
                         (configB.pivcScore * 0.3) +
                         ((1 / configB.costPerToken) * 1000 * 0.2) +
                         (configB.sovereigntyScore * 0.1);
        return balancedB - balancedA;
    }
  });

  const [selectedModelId, selectedConfig] = candidates[0];

  // Log model selection
  await prisma.modelSelection.create({
    data: {
      modelId: selectedModelId,
      task,
      priority,
      userId,
      selectedAt: new Date(),
      constitutionalScore: selectedConfig.constitutionalScore,
      pivcScore: selectedConfig.pivcScore,
      sovereigntyScore: selectedConfig.sovereigntyScore,
      costPerToken: selectedConfig.costPerToken
    }
  });

  logger.info('Model selected', {
    modelId: selectedModelId,
    task,
    priority,
    constitutionalScore: selectedConfig.constitutionalScore
  });

  return {
    modelId: selectedModelId,
    config: selectedConfig,
    reasoning: `Selected ${selectedConfig.name} for ${task} with ${priority} priority`
  };
}

// Fallback model selection
async function selectFallbackModel(primaryModelId, task, failedModels = []) {
  const primaryConfig = MODEL_CONFIGS[primaryModelId];
  if (!primaryConfig) {
    throw new Error(`Unknown primary model: ${primaryModelId}`);
  }

  const fallbackCandidates = primaryConfig.fallbackModels.filter(modelId =>
    !failedModels.includes(modelId) &&
    MODEL_CONFIGS[modelId] &&
    !MODEL_CONFIGS[modelId].circuitBreaker.isOpen()
  );

  if (fallbackCandidates.length === 0) {
    throw new Error(`No fallback models available for ${primaryModelId}`);
  }

  // Select the best fallback based on constitutional scores
  const bestFallback = fallbackCandidates
    .map(modelId => ({ modelId, config: MODEL_CONFIGS[modelId] }))
    .sort((a, b) => b.config.constitutionalScore - a.config.constitutionalScore)[0];

  logger.warn('Using fallback model', {
    primaryModel: primaryModelId,
    fallbackModel: bestFallback.modelId,
    task
  });

  return bestFallback;
}

// Model health monitoring
async function updateModelHealth(modelId, success, responseTime, error = null) {
  const config = MODEL_CONFIGS[modelId];
  if (!config) return;

  try {
    if (success) {
      config.circuitBreaker.success();
    } else {
      config.circuitBreaker.failure();
    }

    // Update database with health metrics
    await prisma.modelHealth.upsert({
      where: { modelId },
      update: {
        totalRequests: { increment: 1 },
        successfulRequests: success ? { increment: 1 } : undefined,
        failedRequests: success ? undefined : { increment: 1 },
        averageResponseTime: responseTime,
        lastHealthCheck: new Date(),
        circuitBreakerState: config.circuitBreaker.isOpen() ? 'OPEN' : 'CLOSED',
        errorMessage: error?.message
      },
      create: {
        modelId,
        totalRequests: 1,
        successfulRequests: success ? 1 : 0,
        failedRequests: success ? 0 : 1,
        averageResponseTime: responseTime,
        lastHealthCheck: new Date(),
        circuitBreakerState: config.circuitBreaker.isOpen() ? 'OPEN' : 'CLOSED',
        errorMessage: error?.message
      }
    });

  } catch (dbError) {
    logger.error('Failed to update model health', { modelId, error: dbError });
  }
}

// Constitutional compliance monitoring
async function evaluateConstitutionalCompliance(modelId, interaction) {
  // This would integrate with Azora Sage for constitutional evaluation
  // For now, return mock compliance scores
  const baseScore = MODEL_CONFIGS[modelId]?.constitutionalScore || 85.0;

  // Adjust based on interaction content (simplified)
  let adjustment = 0;
  if (interaction.includes('constitutional') || interaction.includes('ethical')) {
    adjustment += 5;
  }
  if (interaction.includes('sovereignty') || interaction.includes('privacy')) {
    adjustment += 3;
  }

  const finalScore = Math.min(100, baseScore + adjustment);

  return {
    overallScore: finalScore,
    truthScore: finalScore + (Math.random() * 10 - 5),
    ethicsScore: finalScore + (Math.random() * 10 - 5),
    sovereigntyScore: finalScore + (Math.random() * 10 - 5),
    pivcScore: finalScore + (Math.random() * 10 - 5)
  };
}

// Initialize Express app
const app = express();

// Security and performance middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ai-model-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Get available models
app.get('/models', (req, res) => {
  const models = Object.entries(MODEL_CONFIGS).map(([id, config]) => ({
    id,
    name: config.name,
    provider: config.provider,
    version: config.version,
    capabilities: config.capabilities,
    maxTokens: config.maxTokens,
    constitutionalScore: config.constitutionalScore,
    pivcScore: config.pivcScore,
    sovereigntyScore: config.sovereigntyScore,
    circuitBreakerOpen: config.circuitBreaker.isOpen()
  }));

  res.json({ models, total: models.length });
});

// Model selection endpoint
app.post('/select-model', async (req, res) => {
  try {
    const { error, value } = modelSelectionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message
      });
    }

    const result = await selectOptimalModel(value.task, value);

    res.json({
      success: true,
      model: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Model selection error:', error);
    res.status(500).json({
      error: 'Model selection failed',
      message: error.message
    });
  }
});

// Model health endpoint
app.get('/health/:modelId', async (req, res) => {
  try {
    const { modelId } = req.params;
    const config = MODEL_CONFIGS[modelId];

    if (!config) {
      return res.status(404).json({ error: 'Model not found' });
    }

    const health = await prisma.modelHealth.findUnique({
      where: { modelId }
    });

    res.json({
      modelId,
      circuitBreakerOpen: config.circuitBreaker.isOpen(),
      health: health || {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        lastHealthCheck: null,
        circuitBreakerState: 'CLOSED'
      }
    });

  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({ error: 'Health check failed' });
  }
});

// Constitutional evaluation endpoint
app.post('/evaluate-constitutional', async (req, res) => {
  try {
    const { modelId, interaction } = req.body;

    if (!modelId || !interaction) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'modelId and interaction are required'
      });
    }

    const compliance = await evaluateConstitutionalCompliance(modelId, interaction);

    // Store evaluation result
    await prisma.constitutionalEvaluation.create({
      data: {
        modelId,
        interaction: interaction.substring(0, 1000), // Truncate for storage
        overallScore: compliance.overallScore,
        truthScore: compliance.truthScore,
        ethicsScore: compliance.ethicsScore,
        sovereigntyScore: compliance.sovereigntyScore,
        pivcScore: compliance.pivcScore,
        evaluatedAt: new Date()
      }
    });

    res.json({
      success: true,
      modelId,
      compliance,
      evaluationId: `eval_${Date.now()}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Constitutional evaluation error:', error);
    res.status(500).json({
      error: 'Evaluation failed',
      message: error.message
    });
  }
});

// Model performance metrics endpoint
app.get('/metrics/:modelId', async (req, res) => {
  try {
    const { modelId } = req.params;
    const { period = '24h' } = req.query;

    const health = await prisma.modelHealth.findUnique({
      where: { modelId }
    });

    const evaluations = await prisma.constitutionalEvaluation.findMany({
      where: {
        modelId,
        evaluatedAt: {
          gte: new Date(Date.now() - parsePeriod(period))
        }
      },
      orderBy: { evaluatedAt: 'desc' },
      take: 100
    });

    const avgConstitutionalScore = evaluations.length > 0
      ? evaluations.reduce((sum, e) => sum + e.overallScore, 0) / evaluations.length
      : 0;

    res.json({
      modelId,
      period,
      health,
      constitutionalMetrics: {
        averageScore: avgConstitutionalScore,
        evaluationCount: evaluations.length,
        latestEvaluation: evaluations[0] || null
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Metrics retrieval error:', error);
    res.status(500).json({ error: 'Metrics retrieval failed' });
  }
});

// Update model health (internal endpoint)
app.post('/internal/health-update', async (req, res) => {
  try {
    const { modelId, success, responseTime, error } = req.body;

    await updateModelHealth(modelId, success, responseTime, error);

    res.json({ success: true });

  } catch (error) {
    logger.error('Health update error:', error);
    res.status(500).json({ error: 'Health update failed' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('API Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong on our end'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Helper function to parse time periods
function parsePeriod(period) {
  const unit = period.slice(-1);
  const value = parseInt(period.slice(0, -1));

  switch (unit) {
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    case 'w': return value * 7 * 24 * 60 * 60 * 1000;
    default: return 24 * 60 * 60 * 1000; // Default to 24 hours
  }
}

const PORT = process.env.PORT || 3007;

app.listen(PORT, async () => {
  logger.info(`AI Model Service listening on port ${PORT}`);

  // Ensure database connection
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }

  console.log(`🚀 AI Model Service running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = app;