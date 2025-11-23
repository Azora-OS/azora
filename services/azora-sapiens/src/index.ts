import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';

import qualificationRoutes from './routes/qualificationRoutes';
import tutoringRoutes from './routes/tutoringRoutes';
import chatRoutes from './routes/chatRoutes';

dotenv.config();

// Import auth middleware
const { authenticateToken, rateLimiter } = require('@azora/shared-auth');

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '3001', 10);
const SERVICE_NAME: string = process.env.SERVICE_NAME || 'azora-sapiens';

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(rateLimiter({ max: 30 }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: SERVICE_NAME,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/qualifications', qualificationRoutes);
app.use('/api/tutoring', authenticateToken, tutoringRoutes);
app.use('/api/chat', chatRoutes);

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ ${SERVICE_NAME} running on port ${PORT}`);
  console.log(`🌍 Health check: http://localhost:${PORT}/health`);
});

export default app;
