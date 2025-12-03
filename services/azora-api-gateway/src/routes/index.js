const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const router = express.Router();

// Ubuntu Service Discovery
const services = {
  education: 'http://localhost:4001',
  finance: 'http://localhost:4002', 
  marketplace: 'http://localhost:4003',
  auth: 'http://localhost:4004',
  ai: 'http://localhost:4005',
  blockchain: 'http://localhost:4009',
  analytics: 'http://localhost:4010'
};

// Ubuntu Philosophy Endpoint
router.get('/ubuntu/philosophy', (req, res) => {
  res.json({
    philosophy: 'Ngiyakwazi ngoba sikwazi - I can because we can',
    principles: [
      'My success enables your success',
      'My knowledge becomes our knowledge',
      'My work strengthens our foundation',
      'My security ensures our freedom'
    ],
    services: Object.keys(services),
    ubuntu: 'API Gateway - Ubuntu service orchestration'
  });
});

// Service Proxies
Object.entries(services).forEach(([service, target]) => {
  router.use(`/${service}`, createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: { [`^/${service}`]: '' },
    onError: (err, req, res) => {
      res.status(503).json({
        error: `Ubuntu service ${service} unavailable`,
        ubuntu: 'We handle service errors with Ubuntu grace'
      });
    }
  }));
});

module.exports = router;