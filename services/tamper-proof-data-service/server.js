const express = require('express');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3006;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// Import routes
const dataRoutes = require('./api/routes');

// Routes
app.use('/api/tamper-proof', dataRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    ubuntu: 'I serve because we prosper together',
    service: 'tamper-proof-data-service',
    timestamp: new Date().toISOString()
  });
});

// Compatibility alias for older clients/tests
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    ubuntu: 'I serve because we prosper together',
    service: 'tamper-proof-data-service',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'tamper-proof-data-service',
    message: 'Welcome to the Azora Tamper-Proof Data Service API',
    endpoints: {
      'POST /api/tamper-proof/data': 'Store tamper-proof data',
      'GET /api/tamper-proof/data/:id': 'Retrieve tamper-proof data',
      'PUT /api/tamper-proof/data/:id': 'Update tamper-proof data',
      'DELETE /api/tamper-proof/data/:id': 'Delete tamper-proof data',
      'GET /api/tamper-proof/data/user/:userId': 'List all data for a user',
      'GET /api/tamper-proof/data/user/:userId/verify': 'Verify all data for a user',
      'GET /api/tamper-proof/data/:id/audit-trail': 'Get audit trail for data',
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
if (require.main === module) {
  app.listen(PORT, () => {
  console.log(`🔒 Tamper-Proof Data Service running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 API docs: http://localhost:${PORT}`);
  });
}

module.exports = app;
