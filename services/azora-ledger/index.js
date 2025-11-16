const express = require('express');
const { PrismaClient } = require('@prisma/client');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3012;
const SERVICE_NAME = process.env.SERVICE_NAME || 'azora-ledger';

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
    description: 'Azora Ledger Service - Financial transaction ledger',
    endpoints: {
      'GET /health': 'Service health check',
      'POST /api/transactions': 'Create a new transaction',
      'GET /api/transactions': 'Get all transactions',
      'GET /api/transactions/:id': 'Get transaction by ID',
      'PUT /api/transactions/:id': 'Update transaction',
      'DELETE /api/transactions/:id': 'Delete transaction',
      'GET /api/accounts/:accountId/transactions': 'Get transactions for account',
      'GET /api/accounts/:accountId/balance': 'Get account balance',
      'POST /api/accounts': 'Create a new account',
      'GET /api/accounts': 'Get all accounts',
      'GET /api/accounts/:id': 'Get account by ID',
      'GET /api/reports/financial-summary': 'Get financial summary report',
      'GET /api/reports/account-activity': 'Get account activity report'
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