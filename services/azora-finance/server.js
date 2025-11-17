const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4003;

// Ubuntu Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
  credentials: true
}));
app.use(express.json());

// Ubuntu Rate Limiting
const ubuntuLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Ubuntu rate limit exceeded', ubuntu: 'Please slow down for community harmony' }
});
app.use(ubuntuLimiter);

// Ubuntu Health Check
app.get('/health', (req, res) => {
  res.json({
    service: 'azora-finance',
    status: 'healthy',
    ubuntu: 'I serve because we prosper together',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Ubuntu Philosophy Endpoint
app.get('/api/ubuntu/philosophy', (req, res) => {
  res.json({
    philosophy: 'Ngiyakwazi ngoba sikwazi - I am because we are',
    principles: [
      'My success enables your success',
      'My knowledge becomes our knowledge',
      'My work strengthens our foundation',
      'My security ensures our freedom'
    ],
    service: 'azora-finance',
    ubuntu: 'Ubuntu service excellence'
  });
});

// Service-specific routes

// Finance Routes
app.get('/api/wallet/balance', (req, res) => {
  res.json({
    balance: 1250.75,
    currency: 'AZR',
    usdValue: 2501.50,
    ubuntu: 'Ubuntu prosperity tracking'
  });
});

app.post('/api/mining/start', (req, res) => {
  res.json({
    success: true,
    miningRate: '10 AZR/hour',
    message: 'Ubuntu knowledge mining started',
    ubuntu: 'My knowledge generates our prosperity'
  });
});

// Ubuntu Error Handling
app.use((error, req, res, next) => {
  console.error('Ubuntu Service Error:', error);
  res.status(500).json({
    error: 'Ubuntu service error',
    ubuntu: 'We handle errors with Ubuntu grace',
    timestamp: new Date().toISOString()
  });
});

// Start Ubuntu Service
app.listen(PORT, () => {
  console.log(`🚀 azora-finance running on port ${PORT}`);
  console.log('⚡ Ubuntu: "I serve because we prosper together!"');
});