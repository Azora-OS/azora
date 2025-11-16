const express = require('express');
const { PrismaClient } = require('@prisma/client');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3011;
const SERVICE_NAME = process.env.SERVICE_NAME || 'enrollment-service';

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'healthy', 
      service: SERVICE_NAME,
      db: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      error: error.message,
      service: SERVICE_NAME
    });
  }
});

// API Documentation
app.get('/', (req, res) => {
  res.json({ 
    service: SERVICE_NAME,
    version: '1.0.0',
    description: 'Azora Enrollment Service - Student enrollment system',
    endpoints: {
      'GET /health': 'Service health check',
      'POST /api/enrollments': 'Create a new enrollment',
      'GET /api/enrollments': 'Get all enrollments',
      'GET /api/enrollments/:id': 'Get enrollment by ID',
      'PUT /api/enrollments/:id': 'Update enrollment',
      'DELETE /api/enrollments/:id': 'Delete enrollment',
      'GET /api/students/:studentId/enrollments': 'Get enrollments for student',
      'GET /api/courses/:courseId/enrollments': 'Get enrollments for course',
      'POST /api/waitlist': 'Add student to waitlist',
      'GET /api/waitlist/:courseId': 'Get waitlist for course',
      'DELETE /api/waitlist/:id': 'Remove student from waitlist',
      'GET /api/analytics/enrollment-trends': 'Get enrollment trends',
      'GET /api/analytics/course-popularity': 'Get course popularity stats'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Endpoint not found' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ ${SERVICE_NAME} running on port ${PORT}`);
  console.log(`🌍 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;