const express = require('express');
const cors = require('cors');
const chatRoutes = require('./api/chat');

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'AI Family Service',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to the Azora AI Family Service API',
    endpoints: {
      'POST /api/chat/chat': 'Send a message to a specific AI family member',
      'POST /api/chat/auto-chat': 'Send a message and let the system choose the best family member',
      'GET /api/chat/greeting': 'Get a personalized greeting from a family member',
      'POST /api/chat/consult-family': 'Get insights from multiple family members on a topic',
      'GET /api/chat/family-config': 'Get configuration of all AI family members',
      'GET /api/chat/interaction-stats': 'Get statistics on family interactions',
      'GET /api/health': 'Health check endpoint'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🤖 Azora AI Family Service running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 API docs: http://localhost:${PORT}`);
});

module.exports = app;