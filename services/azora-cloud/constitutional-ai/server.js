const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { EnhancedConstitutionalAI } = require('./src/enhanced-constitutional-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4012;

// Initialize Enhanced Constitutional AI
const constitutionalAI = new EnhancedConstitutionalAI();

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
  message: {
    error: 'Too many requests',
    ubuntu: 'We protect our collective resources with Ubuntu wisdom'
  }
});

app.use(ubuntuLimiter);

// Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Enhanced Constitutional AI',
    ubuntu: 'I serve because we prosper together',
    timestamp: new Date().toISOString() 
  });
});

// Ubuntu Philosophy
app.get('/ubuntu/philosophy', (req, res) => {
  res.json({
    philosophy: 'Ngiyakwazi ngoba sikwazi - I am because we are',
    constitutionalPrinciples: constitutionalAI.ubuntuPrinciples,
    ubuntu: 'Enhanced Constitutional AI - Ubuntu wisdom in action'
  });
});

// Enhanced content validation
app.post('/validate', async (req, res) => {
  try {
    const { content, context } = req.body;
    
    if (!content) {
      return res.status(400).json({
        error: 'Content is required',
        ubuntu: 'Ubuntu validation requires meaningful content'
      });
    }

    const validation = await constitutionalAI.validateContent(content, context);
    
    res.json({
      success: true,
      validation,
      ubuntu: 'Ubuntu constitutional analysis complete'
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      ubuntu: 'Ubuntu constitutional analysis handles challenges with wisdom'
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong',
    ubuntu: 'Ubuntu communities face challenges together'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    ubuntu: 'Ubuntu guides us to the right path',
    availableEndpoints: [
      'GET /health',
      'GET /ubuntu/philosophy',
      'POST /validate'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🧠 Enhanced Constitutional AI running on port ${PORT}`);
  console.log(`🌍 Ubuntu Principles: Advanced ethical reasoning active`);
  console.log(`🎯 Ubuntu Philosophy: Ngiyakwazi ngoba sikwazi`);
});

module.exports = app;