/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express, { Application } from 'express';
import cors from 'cors';
import { analyticsEngine } from './services/analytics-engine';
import { clientManagement } from './services/client-management';
import { billingIntegration } from './services/billing-integration';
import enterpriseDashboard from './routes/enterprise-dashboard';

const app: Application = express();
const PORT = process.env.RETAIL_AI_PORT || 3020;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/dashboard', enterpriseDashboard);

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'retail-ai-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🏪 Retail AI Service running on port ${PORT}`);
    console.log(`📊 Analytics Engine: Active`);
    console.log(`👥 Client Management: Active`);
    console.log(`💰 Billing Integration: Active`);
  });
}

export { app, analyticsEngine, clientManagement, billingIntegration };
