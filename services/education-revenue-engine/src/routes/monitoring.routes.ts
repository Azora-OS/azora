/**
 * Monitoring Routes
 * Endpoints for health checks, metrics, and diagnostics
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { HealthCheckService } from '../services/health-check.service';
import { getMetrics } from '../utils/metrics';
import { structuredLogger } from '../utils/structured-logger';

const router = Router();
const healthCheckService = new HealthCheckService(prisma);

/**
 * GET /health
 * Basic health check endpoint
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = await healthCheckService.getHealthStatus();
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 503 : 503;

    res.status(statusCode).json(health);
  } catch (error) {
    structuredLogger.error('Health check failed', error as Error);
    res.status(503).json({
      status: 'unhealthy',
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /health/live
 * Kubernetes liveness probe endpoint
 */
router.get('/health/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /health/ready
 * Kubernetes readiness probe endpoint
 */
router.get('/health/ready', async (req: Request, res: Response) => {
  try {
    const health = await healthCheckService.getHealthStatus();
    const isReady = health.status !== 'unhealthy';

    res.status(isReady ? 200 : 503).json({
      status: isReady ? 'ready' : 'not_ready',
      checks: health.checks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /metrics
 * Prometheus metrics endpoint
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = await getMetrics();
    res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.send(metrics);
  } catch (error) {
    structuredLogger.error('Failed to get metrics', error as Error);
    res.status(500).json({
      error: 'Failed to get metrics',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /diagnostics
 * Detailed diagnostics endpoint
 */
router.get('/diagnostics', async (req: Request, res: Response) => {
  try {
    const diagnostics = await healthCheckService.getDiagnostics();
    res.json(diagnostics);
  } catch (error) {
    structuredLogger.error('Failed to get diagnostics', error as Error);
    res.status(500).json({
      error: 'Failed to get diagnostics',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /status
 * Detailed status endpoint
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const health = await healthCheckService.getHealthStatus();

    // Get additional statistics
    const userCount = await prisma.user.count();
    const courseCount = await prisma.course.count();
    const enrollmentCount = await prisma.enrollment.count();

    res.json({
      health,
      statistics: {
        totalUsers: userCount,
        totalCourses: courseCount,
        totalEnrollments: enrollmentCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    structuredLogger.error('Failed to get status', error as Error);
    res.status(500).json({
      error: 'Failed to get status',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
