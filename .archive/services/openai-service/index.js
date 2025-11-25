const express = require('express');
const OpenAI = require('openai');
const { RateLimiterMemory } = require('rate-limiter-flexible');
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
  defaultMeta: { service: 'openai-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Rate limiting configurations
const rateLimiters = {
  // Global rate limiter: 1000 requests per hour per IP
  global: new RateLimiterMemory({
    keyPrefix: 'openai_global',
    points: 1000,
    duration: 60 * 60, // 1 hour
  }),

  // Chat completions: 100 requests per minute per user
  chat: new RateLimiterMemory({
    keyPrefix: 'openai_chat',
    points: 100,
    duration: 60, // 1 minute
  }),

  // Image generation: 50 requests per hour per user
  images: new RateLimiterMemory({
    keyPrefix: 'openai_images',
    points: 50,
    duration: 60 * 60, // 1 hour
  }),

  // Embeddings: 500 requests per hour per user
  embeddings: new RateLimiterMemory({
    keyPrefix: 'openai_embeddings',
    points: 500,
    duration: 60 * 60, // 1 hour
  })
};

// Model configurations
const MODELS = {
  'gpt-4': {
    name: 'gpt-4',
    maxTokens: 8192,
    inputCost: 0.03, // per 1K tokens
    outputCost: 0.06, // per 1K tokens
    capabilities: ['chat', 'reasoning', 'code']
  },
  'gpt-4-turbo': {
    name: 'gpt-4-turbo-preview',
    maxTokens: 128000,
    inputCost: 0.01,
    outputCost: 0.03,
    capabilities: ['chat', 'reasoning', 'code', 'vision']
  },
  'gpt-3.5-turbo': {
    name: 'gpt-3.5-turbo',
    maxTokens: 16385,
    inputCost: 0.0015,
    outputCost: 0.002,
    capabilities: ['chat', 'code']
  },
  'dall-e-3': {
    name: 'dall-e-3',
    capabilities: ['image-generation'],
    cost: 0.04 // per image
  },
  'text-embedding-ada-002': {
    name: 'text-embedding-ada-002',
    maxTokens: 8191,
    cost: 0.0001, // per 1K tokens
    capabilities: ['embeddings']
  }
};

// Validation schemas
const chatCompletionSchema = Joi.object({
  model: Joi.string().valid(...Object.keys(MODELS)).required(),
  messages: Joi.array().items(
    Joi.object({
      role: Joi.string().valid('system', 'user', 'assistant').required(),
      content: Joi.string().required(),
      name: Joi.string().optional()
    })
  ).min(1).required(),
  max_tokens: Joi.number().integer().min(1).max(4096).optional(),
  temperature: Joi.number().min(0).max(2).optional(),
  top_p: Joi.number().min(0).max(1).optional(),
  frequency_penalty: Joi.number().min(-2).max(2).optional(),
  presence_penalty: Joi.number().min(-2).max(2).optional(),
  user: Joi.string().optional()
});

const imageGenerationSchema = Joi.object({
  prompt: Joi.string().min(1).max(1000).required(),
  model: Joi.string().valid('dall-e-3').optional().default('dall-e-3'),
  n: Joi.number().integer().min(1).max(10).optional().default(1),
  size: Joi.string().valid('1024x1024', '1792x1024', '1024x1792').optional().default('1024x1024'),
  quality: Joi.string().valid('standard', 'hd').optional().default('standard'),
  style: Joi.string().valid('vivid', 'natural').optional().default('vivid'),
  user: Joi.string().optional()
});

const embeddingSchema = Joi.object({
  input: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ).required(),
  model: Joi.string().valid('text-embedding-ada-002').optional().default('text-embedding-ada-002'),
  encoding_format: Joi.string().valid('float', 'base64').optional().default('float'),
  dimensions: Joi.number().integer().min(1).max(1536).optional(),
  user: Joi.string().optional()
});

// Middleware functions
async function rateLimitMiddleware(req, res, next) {
  const userId = req.headers['x-user-id'] || req.ip;
  const endpoint = req.path.split('/')[1]; // chat, images, embeddings

  try {
    // Check global rate limit
    await rateLimiters.global.consume(userId);

    // Check endpoint-specific rate limit
    if (rateLimiters[endpoint]) {
      await rateLimiters[endpoint].consume(userId);
    }

    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: secs,
      message: `Too many requests. Try again in ${secs} seconds.`
    });
  }
}

function validateRequest(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message
      });
    }
    next();
  };
}

function errorHandler(err, req, res, next) {
  logger.error('API Error:', err);

  if (err instanceof OpenAI.APIError) {
    return res.status(err.status || 500).json({
      error: 'OpenAI API Error',
      message: err.message,
      type: err.type,
      code: err.code
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong on our end'
  });
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
    service: 'openai-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Models endpoint
app.get('/models', (req, res) => {
  res.json({
    models: Object.values(MODELS),
    total: Object.keys(MODELS).length
  });
});

// Chat completions endpoint
app.post('/chat/completions',
  rateLimitMiddleware,
  validateRequest(chatCompletionSchema),
  async (req, res) => {
    try {
      const { model, ...params } = req.body;
      const modelConfig = MODELS[model];

      if (!modelConfig || !modelConfig.capabilities.includes('chat')) {
        return res.status(400).json({
          error: 'Invalid model',
          message: `Model ${model} does not support chat completions`
        });
      }

      logger.info('Processing chat completion', {
        model,
        userId: req.headers['x-user-id'] || req.ip,
        messageCount: params.messages.length
      });

      const completion = await openai.chat.completions.create({
        model: modelConfig.name,
        ...params
      });

      // Calculate estimated cost
      const usage = completion.usage;
      const inputCost = (usage.prompt_tokens / 1000) * modelConfig.inputCost;
      const outputCost = (usage.completion_tokens / 1000) * modelConfig.outputCost;
      const totalCost = inputCost + outputCost;

      res.json({
        ...completion,
        _metadata: {
          estimatedCost: totalCost,
          currency: 'USD',
          model: modelConfig.name
        }
      });

    } catch (error) {
      logger.error('Chat completion error:', error);
      next(error);
    }
  }
);

// Image generation endpoint
app.post('/images/generations',
  rateLimitMiddleware,
  validateRequest(imageGenerationSchema),
  async (req, res) => {
    try {
      const params = req.body;
      const modelConfig = MODELS[params.model];

      logger.info('Processing image generation', {
        model: params.model,
        userId: req.headers['x-user-id'] || req.ip,
        promptLength: params.prompt.length
      });

      const image = await openai.images.generate(params);

      // Calculate estimated cost
      const cost = modelConfig.cost * (params.n || 1);

      res.json({
        ...image,
        _metadata: {
          estimatedCost: cost,
          currency: 'USD',
          model: modelConfig.name
        }
      });

    } catch (error) {
      logger.error('Image generation error:', error);
      next(error);
    }
  }
);

// Embeddings endpoint
app.post('/embeddings',
  rateLimitMiddleware,
  validateRequest(embeddingSchema),
  async (req, res) => {
    try {
      const { model, ...params } = req.body;
      const modelConfig = MODELS[model];

      if (!modelConfig || !modelConfig.capabilities.includes('embeddings')) {
        return res.status(400).json({
          error: 'Invalid model',
          message: `Model ${model} does not support embeddings`
        });
      }

      logger.info('Processing embeddings', {
        model,
        userId: req.headers['x-user-id'] || req.ip,
        inputCount: Array.isArray(params.input) ? params.input.length : 1
      });

      const embedding = await openai.embeddings.create({
        model: modelConfig.name,
        ...params
      });

      // Calculate estimated cost
      const tokenCount = embedding.usage.total_tokens;
      const cost = (tokenCount / 1000) * modelConfig.cost;

      res.json({
        ...embedding,
        _metadata: {
          estimatedCost: cost,
          currency: 'USD',
          model: modelConfig.name
        }
      });

    } catch (error) {
      logger.error('Embeddings error:', error);
      next(error);
    }
  }
);

// Rate limit status endpoint
app.get('/rate-limit/status', async (req, res) => {
  const userId = req.headers['x-user-id'] || req.ip;

  try {
    const globalStatus = await rateLimiters.global.get(userId);
    const chatStatus = await rateLimiters.chat.get(userId);
    const imagesStatus = await rateLimiters.images.get(userId);
    const embeddingsStatus = await rateLimiters.embeddings.get(userId);

    res.json({
      userId,
      limits: {
        global: {
          remaining: Math.max(0, 1000 - (globalStatus?.consumedPoints || 0)),
          resetTime: globalStatus?.msBeforeNext || 0
        },
        chat: {
          remaining: Math.max(0, 100 - (chatStatus?.consumedPoints || 0)),
          resetTime: chatStatus?.msBeforeNext || 0
        },
        images: {
          remaining: Math.max(0, 50 - (imagesStatus?.consumedPoints || 0)),
          resetTime: imagesStatus?.msBeforeNext || 0
        },
        embeddings: {
          remaining: Math.max(0, 500 - (embeddingsStatus?.consumedPoints || 0)),
          resetTime: embeddingsStatus?.msBeforeNext || 0
        }
      }
    });
  } catch (error) {
    logger.error('Rate limit status error:', error);
    res.status(500).json({ error: 'Failed to get rate limit status' });
  }
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

const PORT = process.env.PORT || 3006;

app.listen(PORT, () => {
  logger.info(`OpenAI service listening on port ${PORT}`);
  console.log(`🚀 OpenAI service running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;