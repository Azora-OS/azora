/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import express from 'express';
const cors = require('cors');
const bodyParser = require('body-parser');
import lmsRoutes from './src/routes';
import FacultyManagementSystem from './src/lms-core';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Initialize LMS Core
const lms = new FacultyManagementSystem();

// API Routes
app.use('/api/lms', lmsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Azora LMS',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/lms/health',
      courses: '/api/lms/courses',
      progress: '/api/lms/progress/:studentId'
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Azora LMS service running on port ${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/api/lms/health`);
  console.log(`📖 API docs: http://localhost:${PORT}/`);
});

// Export for testing
export default app;
