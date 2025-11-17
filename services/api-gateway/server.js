const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'api-gateway',
    ubuntu: 'I serve because we prosper together',
    timestamp: new Date().toISOString() 
  });
});

// API routes
app.get('/api/status', (req, res) => {
  res.json({
    gateway: 'active',
    services: {
      auth: 'http://localhost:4001',
      education: 'http://localhost:4002',
      finance: 'http://localhost:4003',
      marketplace: 'http://localhost:4004'
    }
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
  });
}

module.exports = app;