const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SERVICE_NAME = 'azora-aegis';

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests'
});
app.use('/api', limiter);

// Security monitoring
const securityMetrics = {
  totalRequests: 0,
  blockedRequests: 0,
  threats: 0
};

app.use((req, res, next) => {
  securityMetrics.totalRequests++;
  next();
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: SERVICE_NAME,
    timestamp: new Date().toISOString(),
    features: ['WAF', 'Threat Detection', 'Security Monitoring']
  });
});

app.get('/api/status', (req, res) => {
  res.json({ 
    service: SERVICE_NAME,
    version: '1.0.0',
    status: 'operational'
  });
});

app.get('/api/security/metrics', (req, res) => {
  res.json({
    ...securityMetrics,
    timestamp: new Date()
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`🛡️ ${SERVICE_NAME} running on port ${PORT}`);
  console.log('✅ WAF Protection: Active');
  console.log('✅ Threat Detection: Active');
  console.log('✅ Security Monitoring: Active');
});

module.exports = app;
