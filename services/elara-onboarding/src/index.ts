/**
 * Elara Onboarding Service
 * 
 * Main entry point for the onboarding service
 */

import express, { Express } from 'express';
import userTypeDetectionRoutes from './routes/user-type-detection.routes';
import pricingRoutes from './routes/pricing.routes';
import onboardingRoutes from './routes/onboarding.routes';
import complianceRoutes from './routes/compliance.routes';
import contractRoutes from './routes/contract.routes';
import notificationRoutes from './routes/notification.routes';
import { ElaraLogger } from './utils/logger';

const app: Express = express();
const logger = new ElaraLogger('OnboardingService');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/user-type-detection', userTypeDetectionRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api', onboardingRoutes);
app.use('/api', complianceRoutes);
app.use('/api', contractRoutes);
app.use('/api', notificationRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'elara-onboarding',
    timestamp: new Date(),
  });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// Start server
const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
  logger.success(`Elara Onboarding Service running on port ${PORT}`);
});

export default app;
