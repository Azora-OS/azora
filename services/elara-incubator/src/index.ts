import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import businessRoutes from './routes/business.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import legalRoutes from './routes/legal.routes.js';
import fundRoutes from './routes/fund.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Status endpoint
app.get('/api/v1/status', (_req, res) => {
  res.json({ 
    success: true, 
    message: 'Elara Incubator API is running',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/v1/businesses', businessRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/legal', legalRoutes);
app.use('/api/v1/fund', fundRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Elara Incubator service running on port ${PORT}`);
});

export default app;
