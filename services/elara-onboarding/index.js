const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    service: 'elara-onboarding',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Basic routes
app.get('/', (req, res) => {
  res.json({
    message: 'elara-onboarding is running',
    version: '1.0.0',
    endpoints: ['/health', '/api']
  });
});

app.get('/api', (req, res) => {
  res.json({
    service: 'elara-onboarding',
    message: 'API endpoint active'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ${serviceName} running on port ${PORT}`);
});

module.exports = app;
