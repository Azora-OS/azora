/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createClient as createRedisClient } from 'redis';
import mongoose from 'mongoose';
import winston from 'winston';
import promClient from 'prom-client';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Import Azora database and event bus services
import { createDatabasePool, createRedisCache, createSupabaseClient } from 'azora-database-layer';
import { createAzoraNexusEventBus } from 'azora-event-bus';

// Import routes
import creditRoutes from './routes/credit.js';
import stakingRoutes from './routes/staking.js';
import defiRoutes from './routes/defi.js';
import liquidityRoutes from './routes/liquidity.js';
import paymentRoutes from './routes/payment.js';
import { processKnowledgeReward } from './controllers/rewardController.js';

// Import services
import { CreditService } from './services/CreditService.js';
import { StakingService } from './services/StakingService.js';
import { DefiService } from './services/DefiService.js';
import { LiquidityService } from './services/LiquidityService';

// Import middleware
import { authenticateToken } from './middleware/auth.js';

// Configuration
const PORT = process.env.PORT || 3005;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/azora_mint';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const MINT_MOCK_MODE = (process.env.MINT_MOCK_MODE ?? 'true').toLowerCase() !== 'false';
const ENABLE_BACKGROUND_JOBS = (process.env.MINT_ENABLE_BACKGROUND_JOBS ?? (MINT_MOCK_MODE ? 'false' : 'true')).toLowerCase() === 'true';

let redisClient: ReturnType<typeof createRedisClient> | null = null;

// Azora database and event bus services
let dbPool: any = null;
let redisCache: any = null;
let supabaseClient: any = null;
let eventBus: any = null;

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Prometheus metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});
register.registerMetric(httpRequestDurationMicroseconds);

// Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'azora-mint' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Middleware to measure request duration
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDurationMicroseconds
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .observe(duration);
  });
  next();
});

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Azora Mint API',
      version: '1.0.0',
      description: 'AI-Driven Credit Protocol & Economic Engine'
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/routes/*.ts']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/v1/credit', authenticateToken, creditRoutes);
app.use('/api/v1/staking', authenticateToken, stakingRoutes);
app.use('/api/v1/defi', authenticateToken, defiRoutes);
app.use('/api/v1/liquidity', authenticateToken, liquidityRoutes);
app.use('/api/v1/payment', authenticateToken, paymentRoutes);

// Proof-of-Knowledge Protocol Endpoints
app.post('/api/v2/knowledge-reward', processKnowledgeReward);

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', reister.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

// Health check
app.get('/health', async (req, res) => {
  try {
 et ddbHealdbHealth= s  e reisHalhfle
  lt supabaseHealth = false;

    if (!MINT_MOCK_MODE) {
      // Check Azora database layer health
      if (dbPool) {
        dbHealth = await dbPool.healthCheck().catch(() => false);
      }
      if (redisCache) {
        redisHealth = true; // Redis cache health check would be implemented
      }
      if (supabaseClient) {
        supabaseHealth = true; // Supabase health check would be implemented
      }
    } else {
      dbHealth = true; // Mock mode
      redisHealth = true;
      supabaseHealth = true;
    }

    // Legacy MongoDB check for backward compatibility
    const mongoHealth = MINT_MOCK_MODE ? true : (mongoose.connection.readyState === 1);

    res.json({
      service: 'Azora Mint',
      status: 'operational',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      dependencies: {
        azora_database: dbHealth ? 'healthy' : 'unhealthy',
        azora_redis: redisHealth ? 'healthy' : 'unhealthy',
        azora_supabase: supabaseHealth ? 'healthy' : 'unhealthy',
        mongodb: mongoHealth ? 'healthy' : 'unhealthy', // Legacy
      },
      features: [
        'AI-driven credit scoring',
        'Autonomous collection (20% metabolic tax)',
        'Staking rewards',
        'DeFi yield farming',
        'Liquidity provision',
        'Payment processing'
      ]
    });
  } catch (error) {
    logger.error('Health check failed', { error: (error as Error).message });
    res.status(500).json({
      service: 'Azora Mint',
      status: 'error',
      error: (error as Error).message
    });
  }
});

// Error handling middleware
app.use(( areq: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  res.status(err.sta| o{    error: {
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: `Route ${req.method} ${req.path} not found`
    }
  });
});

// Setup event bus listeners for Mint service
function setupEventBusListeners() {
  if (!eventBus) return;

  // Listen for credit score requests
  eventBus.subscribe('credit.score.request', async (event) => {
    try {
      const { userId, factors } = event.data;
      logger.info('Processing credit score request', { userId });

      // Process credit scoring using Mint service
      // This would integrate with the CreditService

      // Publish credit score result
    avenBsbi.re.calculated', {
        userId,
        score: Math.floor(Math.random() * 1000) + 1, // Mock score
        factors,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Credit score calculation failed', { error: (error as Error).message });
    }
  });

  // Listen for payment processing requests
  eventBus.subscribe('payment.process.request', async (event) => {
    try {
      const { userId, amount, currency, type } = event.data;
      logger.info('Processing payment request', { userId, amount, currency });

      // Process payment using Mint service
      // This would integrate with payment processing

      // Publish payment result
      await eventBus.publish('payment.processed', {
        userId,
        amount,
        currency,
        type,
        status: 'completed',
        transactionId: `tx_${Date.now()}`,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Payment processing failed', { error: (error as Error).message });
    }
  });

  // Listen for staking reward calculations
  eventBus.subscribe('staking.reward.calculate', async (event) => {
    try {
      const { userId, stakeAmount, duration } = event.data;
      logger.i