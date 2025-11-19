import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { structuredLogger } from './utils/structured-logger';
import enrollmentRoutes from './routes/enrollment.routes';
import courseRoutes from './routes/course.routes';
import assessmentRoutes from './routes/assessment.routes';
import tutoringRoutes from './routes/tutoring.routes';
import contextRoutes from './routes/context.routes';
import validationRoutes from './routes/validation.routes';
import pricingRoutes from './routes/pricing.routes';
import conversionRoutes from './routes/conversion.routes';
import paymentRoutes from './routes/payment.routes';
import revenueRoutes from './routes/revenue.routes';
import learningOutcomesRoutes from './routes/learning-outcomes.routes';
import cohortAnalyticsRoutes from './routes/cohort-analytics.routes';
import monitoringRoutes from './routes/monitoring.routes';
import alertsRoutes from './routes/alerts.routes';
import { pricingService } from './services/pricing.service';
import { alertsService } from './services/alerts.service';
import {
  requestIdMiddleware,
  httpLoggingMiddleware,
  errorHandlingMiddleware,
  systemMetricsMiddleware,
  slowRequestMiddleware,
  requestBodyLoggingMiddleware,
} from './middleware/monitoring.middleware';

// Load environment variables
dotenv.config();

// Initialize Prisma
export const prisma = new PrismaClient();

// Initialize Express
const app: Express = express();
const PORT = process.env.PORT || 3020;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Monitoring middleware
app.use(requestIdMiddleware);
app.use(systemMetricsMiddleware);
app.use(httpLoggingMiddleware);
app.use(slowRequestMiddleware(1000)); // Log requests slower than 1 second
app.use(requestBodyLoggingMiddleware);

// Monitoring Routes (before API routes)
app.use('/monitoring', monitoringRoutes);
app.use('/alerts', alertsRoutes);

// API Routes
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/assessments', assessmentRoutes);
app.use('/api/v1/tutoring', tutoringRoutes);
app.use('/api/v1/context', contextRoutes);
app.use('/api/v1/validation', validationRoutes);
app.use('/api/v1/pricing', pricingRoutes);
app.use('/api/v1/conversions', conversionRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/revenue', revenueRoutes);
app.use('/api/v1/analytics', learningOutcomesRoutes);
app.use('/api/v1/analytics', cohortAnalyticsRoutes);

// Error handling middleware
app.use(errorHandlingMiddleware);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    timestamp: new Date()
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    structuredLogger.info('Database connection successful');

    // Initialize default pricing tiers
    await pricingService.initializeDefaultTiers();
    structuredLogger.info('Pricing tiers initialized');

    // Start alert checking
    const alertCheckInterval = parseInt(process.env.ALERT_CHECK_INTERVAL || '60000');
    alertsService.startAlertChecking(alertCheckInterval);
    structuredLogger.info('Alert checking started', undefined, {
      intervalMs: alertCheckInterval,
    });

    app.listen(PORT, () => {
      structuredLogger.info(`Education Revenue Engine running on port ${PORT}`, undefined, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
      });
    });
  } catch (error) {
    structuredLogger.error('Failed to start server:', error as Error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  structuredLogger.info('Shutting down gracefully...');
  alertsService.stopAlertChecking();
  await prisma.$disconnect();
  process.exit(0);
});

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
