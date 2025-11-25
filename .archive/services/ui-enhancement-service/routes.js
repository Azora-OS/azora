const express = require('express');
const router = express.Router();

router.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

router.get('/api/status', (req, res) => {
  res.json({ status: 'operational', service: 'ui-enhancement-service' });
});

router.get('/api/data', (req, res) => {
  res.json({ success: true, data: [] });
});

router.post('/api/data', (req, res) => {
  res.json({ success: true, data: req.body });
});

module.exports = router;
