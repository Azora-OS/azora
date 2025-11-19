const express = require('express');
const { authenticateToken, createRateLimit } = require('../middleware/auth');
const router = express.Router();

const generalLimit = createRateLimit(15 * 60 * 1000, 100);
const authLimit = createRateLimit(15 * 60 * 1000, 20);

const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
  education: process.env.EDUCATION_SERVICE_URL || 'http://localhost:4002',
  finance: process.env.FINANCE_SERVICE_URL || 'http://localhost:4003',
  marketplace: process.env.MARKETPLACE_SERVICE_URL || 'http://localhost:4004',
  analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:4014'
};

const proxyRequest = async (req, res, serviceUrl) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${serviceUrl}${req.path}`, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Service unavailable' });
  }
};

router.use('/api/auth/login', authLimit, (req, res) => proxyRequest(req, res, services.auth));
router.use('/api/auth/register', authLimit, (req, res) => proxyRequest(req, res, services.auth));
router.use('/api/education/*', generalLimit, authenticateToken, (req, res) => proxyRequest(req, res, services.education));
router.use('/api/finance/*', generalLimit, authenticateToken, (req, res) => proxyRequest(req, res, services.finance));
router.use('/api/marketplace/*', generalLimit, authenticateToken, (req, res) => proxyRequest(req, res, services.marketplace));
router.use('/api/analytics/*', generalLimit, authenticateToken, (req, res) => proxyRequest(req, res, services.analytics));

router.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

module.exports = router;