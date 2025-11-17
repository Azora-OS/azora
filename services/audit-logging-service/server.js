const express = require('express');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3005;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// Import routes
const auditRoutes = require('./api/routes');

// Routes
app.use('/api/audit', auditRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Audit Logging Service',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Azora Audit Logging Service API',
    endpoints: {
      'POST /api/audit/security': 'Log a security event',
      'POST /api/audit/user-action': 'Log a user action',
      'POST /api/audit/system': 'Log a system event',
      'POST /api/audit/data-access': 'Log a data access event',
      'GET /api/audit/logs': 'Get audit logs with filtering',
      'GET /api/audit/security/stats': 'Get security statistics',
      'DELETE /api/audit/logs/old': 'Clear old audit logs',
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
  console.log(`🔍 Audit Logging Service running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 API docs: http://localhost:${PORT}`);
});

module.exports = app;
