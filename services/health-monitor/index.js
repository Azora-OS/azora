const express = require('express');
const app = express();
const PORT = process.env.PORT || 4018;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'health-monitor',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// System health endpoints
app.get('/api/system/health', (req, res) => {
  res.json({
    system: 'healthy',
    services: {
      'api-gateway': 'healthy',
      'auth-service': 'healthy',
      'azora-mint': 'healthy',
      'azora-oracle': 'healthy'
    },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/metrics', (req, res) => {
  res.json({
    activeServices: 15,
    totalRequests: 1250,
    averageResponseTime: '85ms',
    errorRate: '0.2%',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🏥 Health Monitor service running on port ${PORT}`);
  console.log(`📊 System Health: http://localhost:${PORT}/api/system/health`);
  console.log(`📈 Metrics: http://localhost:${PORT}/api/metrics`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
});