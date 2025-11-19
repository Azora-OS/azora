/**
 * ELARA - Central AI Orchestrator for Azora OS
 * 
 * Elara is the intelligent heart of Azora OS, capable of:
 * - Orchestrating all services
 * - Making intelligent routing decisions
 * - Managing system resources
 * - Ensuring constitutional compliance
 * - Optimizing performance and costs
 * - Providing natural language interface to the entire system
 */

import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { ElaraCore } from './core/elara-core';
import { ElaraAPI } from './api/elara-api';
import { ElaraOrchestrator } from './orchestrator/elara-orchestrator';
import { ElaraLogger } from './utils/logger';
import { ElaraMetrics } from './utils/metrics';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3100;
const logger = new ElaraLogger('Elara');
const metrics = new ElaraMetrics();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Elara
let elaraCore: ElaraCore;
let elaraAPI: ElaraAPI;
let elaraOrchestrator: ElaraOrchestrator;

/**
 * Initialize Elara system
 */
async function initializeElara(): Promise<void> {
  try {
    logger.info('🚀 Initializing Elara AI Orchestrator...');

    // Initialize core
    elaraCore = new ElaraCore({
      apiKey: process.env.OPENAI_API_KEY || '',
      pineconeKey: process.env.PINECONE_API_KEY || '',
      redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
      databaseUrl: process.env.DATABASE_URL || '',
    });

    await elaraCore.initialize();
    logger.info('✅ Elara Core initialized');

    // Initialize orchestrator
    elaraOrchestrator = new ElaraOrchestrator(elaraCore);
    await elaraOrchestrator.initialize();
    logger.info('✅ Elara Orchestrator initialized');

    // Initialize API
    elaraAPI = new ElaraAPI(elaraCore, elaraOrchestrator);
    elaraAPI.setupRoutes(app);
    logger.info('✅ Elara API initialized');

    logger.info('🎉 Elara AI Orchestrator ready!');
  } catch (error) {
    logger.error('Failed to initialize Elara:', error);
    process.exit(1);
  }
}

/**
 * Health check endpoint
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'elara-ai-orchestrator',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Metrics endpoint
 */
app.get('/metrics', (_req: Request, res: Response) => {
  res.json(metrics.getMetrics());
});

/**
 * Error handling middleware
 */
app.use((err: any, _req: Request, res: Response, _next: any) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

/**
 * Start server
 */
async function startServer(): Promise<void> {
  try {
    await initializeElara();

    app.listen(port, () => {
      logger.info(`🌟 Elara listening on port ${port}`);
      logger.info(`📊 Metrics available at http://localhost:${port}/metrics`);
      logger.info(`💚 Health check at http://localhost:${port}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  if (elaraCore) {
    await elaraCore.shutdown();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  if (elaraCore) {
    await elaraCore.shutdown();
  }
  process.exit(0);
});

export { app, elaraCore, elaraOrchestrator };
