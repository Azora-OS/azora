const express = require('express');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3007;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// Import routes
const shieldRoutes = require('./api/routes');

// Routes
app.use('/api/shield', shieldRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Shield Service',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Azora Shield Service API',
    description: 'Security monitoring and threat detection service',
    endpoints: {
      'POST /api/shield/analyze': 'Analyze a request for security threats',
      'GET /api/shield/events': 'Get security events with filtering',
      'POST /api/shield/block-ip': 'Block an IP address',
      'POST /api/shield/unblock-ip': 'Unblock an IP address',
      'GET /api/shield/ip-status/:ip': 'Check if an IP is blocked',
      'GET /api/shield/stats': 'Get threat statistics',
      'DELETE /api/shield/events/old': 'Clear old security events',
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
  console.log(`🛡️ Shield Service running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 API docs: http://localhost:${PORT}`);
});

module.exports = app;
