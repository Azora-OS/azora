const express = require('express');
const { PrismaClient } = require('@prisma/client');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3013;
const SERVICE_NAME = process.env.SERVICE_NAME || 'azora-pricing';

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
    description: 'Azora Pricing Service - Dynamic pricing engine',
    endpoints: {
      'GET /health': 'Service health check',
      'POST /api/pricing/calculate': 'Calculate price for product/service',
      'POST /api/pricing/rules': 'Create a new pricing rule',
      'GET /api/pricing/rules': 'Get all pricing rules',
      'GET /api/pricing/rules/:id': 'Get pricing rule by ID',
      'PUT /api/pricing/rules/:id': 'Update pricing rule',
      'DELETE /api/pricing/rules/:id': 'Delete pricing rule',
      'POST /api/discounts': 'Create a new discount',
      'GET /api/discounts': 'Get all discounts',
      'GET /api/discounts/:id': 'Get discount by ID',
      'PUT /api/discounts/:id': 'Update discount',
      'DELETE /api/discounts/:id': 'Delete discount',
      'POST /api/promotions': 'Create a new promotion',
      'GET /api/promotions': 'Get all promotions'
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