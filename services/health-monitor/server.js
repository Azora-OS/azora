const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4005;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'health-monitor',
    timestamp: new Date().toISOString()
  });
});

// Get service health status
app.get('/api/health/:serviceId', (req, res) => {
  const { serviceId } = req.params;
  
  // Simulate fetching health status for a specific service
  res.status(200).json({
    serviceId,
    status: 'healthy',
    lastChecked: new Date().toISOString(),
    responseTime: Math.floor(Math.random() * 100) + 1 // Random response time between 1-100ms
  });
});

// Get all services health status
app.get('/api/health', (req, res) => {
  // Simulate fetching health status for all services
  const services = [
    { id: 'auth-service', status: 'healthy', lastChecked: new Date().toISOString() },
    { id: 'user-service', status: 'healthy', lastChecked: new Date().toISOString() },
    { id: 'payment-service', status: 'degraded', lastChecked: new Date().toISOString() },
    { id: 'notification-service', status: 'healthy', lastChecked: new Date().toISOString() }
  ];
  
  res.status(200).json({
    success: true,
    data: services,
    count: services.length
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Health Monitor service running on port ${PORT}`);
});

module.exports = app;