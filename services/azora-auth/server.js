const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4004;

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
    service: 'azora-auth',
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
    service: 'azora-auth',
    ubuntu: 'Ubuntu service excellence'
  });
});

// Service-specific routes

// Auth Routes
const jwt = require('jsonwebtoken');

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  // Mock authentication
  if (email && password) {
    const token = jwt.sign(
      { userId: 1, email, name: 'Ubuntu User' },
      'ubuntu-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: { id: 1, email, name: 'Ubuntu User' },
      ubuntu: 'Ubuntu authentication successful'
    });
  } else {
    res.status(401).json({
      error: 'Invalid credentials',
      ubuntu: 'Ubuntu security maintained'
    });
  }
});

app.get('/api/profile', (req, res) => {
  res.json({
    user: { id: 1, name: 'Ubuntu User', email: 'user@azora.world' },
    ubuntu: 'Ubuntu profile access'
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
  console.log(`🚀 azora-auth running on port ${PORT}`);
  console.log('⚡ Ubuntu: "I serve because we prosper together!"');
});