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

// 🔍 AZORA KYC/AML - COMPLIANCE & VERIFICATION
console.log('🌟 Azora KYC/AML Service - Initializing...');

const verifications = new Map();
const riskAssessments = new Map();

// 🎯 API ROUTES
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'kyc-aml-service',
    ubuntu: 'I verify because we trust together',
    verifications: verifications.size,
    timestamp: new Date().toISOString()
  });
});

// Submit KYC verification
app.post('/api/kyc/verify', (req, res) => {
  try {
    const { userId, documentType, documentData } = req.body;
    
    const verification = {
      id: `kyc_${Date.now()}`,
      userId,
      documentType,
      status: 'PENDING',
      riskLevel: 'LOW',
      submittedAt: new Date().toISOString()
    };
    
    verifications.set(verification.id, verification);
    
    res.status(201).json({
      success: true,
      message: 'KYC verification submitted',
      data: verification
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit verification' });
  }
});

// Get verification status
app.get('/api/kyc/:userId/status', (req, res) => {
  try {
    const { userId } = req.params;
    
    const userVerification = Array.from(verifications.values())
      .find(v => v.userId === userId);
    
    if (!userVerification) {
      return res.status(404).json({ error: 'No verification found' });
    }
    
    res.json({
      success: true,
      data: userVerification
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get verification status' });
  }
});

const PORT = process.env.PORT || 3027;
app.listen(PORT, () => {
  console.log('🌟 Azora KYC/AML Service running on port', PORT);
});

module.exports = app;