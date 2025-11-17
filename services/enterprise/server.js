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

// 🏢 AZORA ENTERPRISE - WHITE-LABEL SOLUTIONS
console.log('🌟 Azora Enterprise Solutions - Initializing...');

// Enterprise features storage
const enterprises = new Map();
const licenses = new Map();
const whiteLabels = new Map();

// 🎯 API ROUTES
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'azora-enterprise',
    ubuntu: 'I serve because we prosper together',
    enterprises: enterprises.size,
    licenses: licenses.size,
    timestamp: new Date().toISOString()
  });
});

// Enterprise Management
app.post('/api/enterprises', (req, res) => {
  try {
    const { name, domain, features, tier } = req.body;
    
    const enterprise = {
      id: `ent_${Date.now()}`,
      name,
      domain,
      features: features || ['basic'],
      tier: tier || 'STARTER',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };
    
    enterprises.set(enterprise.id, enterprise);
    
    res.status(201).json({
      success: true,
      message: 'Enterprise created successfully',
      data: enterprise
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create enterprise' });
  }
});

// License Management
app.post('/api/licenses', (req, res) => {
  try {
    const { enterpriseId, type, features, maxUsers } = req.body;
    
    const license = {
      id: `lic_${Date.now()}`,
      enterpriseId,
      type: type || 'STANDARD',
      features: features || [],
      maxUsers: maxUsers || 100,
      status: 'ACTIVE',
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    licenses.set(license.id, license);
    
    res.status(201).json({
      success: true,
      message: 'License created successfully',
      data: license
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create license' });
  }
});

// White-label Configuration
app.post('/api/white-label', (req, res) => {
  try {
    const { enterpriseId, branding, customDomain, features } = req.body;
    
    const whiteLabel = {
      id: `wl_${Date.now()}`,
      enterpriseId,
      branding: branding || {},
      customDomain,
      features: features || [],
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };
    
    whiteLabels.set(whiteLabel.id, whiteLabel);
    
    res.status(201).json({
      success: true,
      message: 'White-label configuration created',
      data: whiteLabel
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create white-label config' });
  }
});

const PORT = process.env.PORT || 3023;
app.listen(PORT, () => {
  console.log('🌟 Azora Enterprise running on port', PORT);
  console.log('🏢 Features: White-label, Licensing, Enterprise Management');
});

module.exports = app;