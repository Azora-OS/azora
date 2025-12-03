const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const routes = require('./dist/routes/index');

const app = express();
const PORT = process.env.PORT || 4000;

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
    service: 'azora-api-gateway',
    status: 'healthy',
    ubuntu: 'Ubuntu service excellence',
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
    service: 'azora-api-gateway',
    ubuntu: 'Ubuntu service excellence'
  });
});

// Mount TypeScript routes
app.use('/', routes);

// Default Ubuntu Routes
app.get('/api/status', (req, res) => {
  res.json({
    service: 'azora-api-gateway',
    status: 'operational',
    ubuntu: 'Ubuntu service ready'
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
  console.log(`🚀 azora-api-gateway running on port ${PORT}`);
  console.log(`🌍 Ubuntu Gateway: Service orchestration active`);
  console.log(`🎯 Ubuntu Philosophy: Ngiyakwazi ngoba sikwazi`);
});