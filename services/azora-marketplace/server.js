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
    service: 'azora-marketplace',
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
    service: 'azora-marketplace',
    ubuntu: 'Ubuntu service excellence'
  });
});

// Service-specific routes

// Marketplace Routes
app.get('/api/jobs', (req, res) => {
  res.json({
    jobs: [
      { id: 1, title: 'Ubuntu AI Developer', company: 'TechCorp', salary: '$120k', remote: true },
      { id: 2, title: 'Constitutional AI Researcher', company: 'EthicsLab', salary: '$150k', remote: true },
      { id: 3, title: 'Blockchain Ubuntu Engineer', company: 'CryptoDAO', salary: '$140k', remote: false }
    ],
    ubuntu: 'Ubuntu opportunity marketplace'
  });
});

app.post('/api/jobs/:id/apply', (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    jobId: id,
    message: 'Application submitted successfully',
    ubuntu: 'My work strengthens our foundation'
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
  console.log(`🚀 azora-marketplace running on port ${PORT}`);
  console.log('⚡ Ubuntu: "I serve because we prosper together!"');
});