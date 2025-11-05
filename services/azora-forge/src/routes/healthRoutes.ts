/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Router, Request, Response } from 'express';
// import mongoose from 'mongoose';
// import { getMetrics } from '../middleware/metrics';
import logger from '../middleware/requestLogger';

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Basic health check
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'azora-forge',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * @swagger
 * /api/health/ready:
 *   get:
 *     summary: Readiness check (includes database connectivity)
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check database connectivity
    // const db = mongoose.connection.db;
    // if (!db) {
    //   throw new Error('Database not connected');
    // }
    // await db.admin().ping();

    res.json({
      success: true,
      status: 'ready',
      service: 'azora-forge',
      database: 'mock-connected', // Mock for now
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      success: false,
      status: 'not ready',
      service: 'azora-forge',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/health/live:
 *   get:
 *     summary: Liveness check
 */
router.get('/live', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'alive',
    service: 'azora-forge',
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /api/health/metrics:
 *   get:
 *     summary: Prometheus metrics
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    // const metrics = await getMetrics();
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send('# Mock metrics\nup 1\n');
  } catch (error) {
    logger.error('Error getting metrics:', error);
    res.status(500).json({ success: false, error: 'Failed to get metrics' });
  }
});

/**
 * @swagger
 * /api/health/stats:
 *   get:
 *     summary: Service statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // const db = mongoose.connection.db;
    // if (!db) {
    //   throw new Error('Database not connected');
    // }

    // const [
    //   totalListings,
    //   activeListings,
    //   totalCategories,
    //   totalTransactions
    // ] = await Promise.all([
    //   db.collection('listings').countDocuments(),
    //   db.collection('listings').countDocuments({ status: 'active' }),
    //   db.collection('categories').countDocuments({ isActive: true }),
    //   db.collection('transactions').countDocuments()
    // ]);

    res.json({
      success: true,
      data: {
        listings: {
          total: 0, // Mock data
          active: 0
        },
        categories: 0,
        transactions: 0,
        database: {
          name: 'mock-db',
          collections: 0
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting stats:', error);
    res.status(500).json({ success: false, error: 'Failed to get statistics' });
  }
});

export default router;