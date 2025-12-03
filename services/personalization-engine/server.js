const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(compression());

// Input validation middleware
const validateInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].replace(/<script[^>]*>.*?<\/script>/gi, '');
        req.body[key] = req.body[key].replace(/javascript:/gi, '');
      }
    });
  }
  next();
};
app.use(validateInput);

app.use(express.json({ limit: '10mb' }));

// 🎯 AZORA PERSONALIZATION - AI-DRIVEN CUSTOMIZATION
console.log('🌟 Azora Personalization Engine - Initializing...');

const profiles = new Map();
const recommendations = new Map();

// 🎯 API ROUTES
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'personalization-engine',
    ubuntu: 'I personalize because we are unique together',
    profiles: profiles.size,
    timestamp: new Date().toISOString()
  });
});

// Create user profile
app.post('/api/profiles', (req, res) => {
  try {
    const { userId, preferences, learningStyle, interests } = req.body;
    
    const profile = {
      id: `profile_${Date.now()}`,
      userId,
      preferences: preferences || {},
      learningStyle: learningStyle || 'visual',
      interests: interests || [],
      createdAt: new Date().toISOString()
    };
    
    profiles.set(profile.id, profile);
    
    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      data: profile
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

// Get recommendations
app.get('/api/users/:userId/recommendations', (req, res) => {
  try {
    const { userId } = req.params;
    
    const userProfile = Array.from(profiles.values())
      .find(p => p.userId === userId);
    
    const recs = {
      courses: ['AI Fundamentals', 'Ubuntu Philosophy', 'Quantum Computing'],
      content: ['Video: Introduction to AI', 'Article: Ubuntu in Tech'],
      connections: ['Similar learners in your area']
    };
    
    res.json({
      success: true,
      data: recs
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

const PORT = process.env.PORT || 3028;
app.listen(PORT, () => {
  console.log('🌟 Azora Personalization Engine running on port', PORT);
});

module.exports = app;