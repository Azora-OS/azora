const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SERVICE_NAME = process.env.SERVICE_NAME || 'service';

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: SERVICE_NAME,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.get('/api/status', (req, res) => {
  res.json({ 
    service: SERVICE_NAME,
    version: '1.0.0',
    status: 'operational'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
const routes = require('./routes');
app.use(routes);

app.listen(PORT, () => {
  console.log(`✅ ${SERVICE_NAME} running on port ${PORT}`);
  console.log(`🌍 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
