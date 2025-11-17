const express = require('express');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3008;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// Import routes
const quantumRoutes = require('./api/routes');

// Routes
app.use('/api/quantum-tracking', quantumRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Quantum Tracking Service',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Azora Quantum Tracking Service API',
    description: 'Quantum-enhanced tracking and predictive analytics',
    endpoints: {
      'POST /api/quantum-tracking/track': 'Track quantum event',
      'GET /api/quantum-tracking/user/:userId': 'Get user tracking data',
      'GET /api/quantum-tracking/analytics/:userId': 'Get quantum analytics',
      'POST /api/quantum-tracking/model/train': 'Train predictive model',
      'POST /api/quantum-tracking/predict': 'Make quantum prediction',
      'DELETE /api/quantum-tracking/data/old': 'Clear old tracking data',
      'GET /api/health': 'Health check endpoint'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`⚛️ Quantum Tracking Service running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 API docs: http://localhost:${PORT}`);
});

module.exports = app;
