const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4005;

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
    service: 'azora-ai',
    status: 'healthy',
    ubuntu: 'I serve because we prosper together',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Ubuntu Philosophy Endpoint
app.get('/api/ubuntu/philosophy', (req, res) => {
  res.json({
    philosophy: 'Ngiyakwazi ngoba sikwazi - I can because we can',
    principles: [
      'My success enables your success',
      'My knowledge becomes our knowledge',
      'My work strengthens our foundation',
      'My security ensures our freedom'
    ],
    service: 'azora-ai',
    ubuntu: 'Ubuntu service excellence'
  });
});

// Service-specific routes

// AI Routes
app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  
  res.json({
    response: `Ubuntu AI Response: I understand your message "${message}". As an Ubuntu AI, I believe that together we can achieve great things. How can I help you grow today?`,
    ubuntu: 'Ubuntu AI conversation',
    philosophy: 'I think because we understand together'
  });
});

app.get('/api/ai/family', (req, res) => {
  res.json({
    family: [
      { name: 'Elara', role: 'Mother & Teacher', mood: 'nurturing' },
      { name: 'Themba', role: 'Student Success', mood: 'enthusiastic' },
      { name: 'Naledi', role: 'Career Guide', mood: 'ambitious' }
    ],
    ubuntu: 'Ubuntu AI family active'
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
  console.log(`🚀 ${serviceName} running on port ${PORT}`);
  console.log('⚡ Ubuntu: "I serve because we prosper together!"');
});