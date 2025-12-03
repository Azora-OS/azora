const express = require('express');
const router = express.Router();
const shieldService = require('../index');

// Analyze a request (for testing purposes)
router.post('/analyze', (req, res) => {
  try {
    // Create a mock request object for analysis
    const mockReq = {
      ip: req.body.ip || req.ip || '127.0.0.1',
      method: req.body.method || 'GET',
      url: req.body.url || '/',
      query: req.body.query || {},
      body: req.body.body || {},
      headers: req.body.headers || {},
      get: (header) => req.body.headers?.[header.toLowerCase()] || null
    };

    const analysis = shieldService.analyzeRequest(mockReq);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Get security events with filtering
router.get('/events', (req, res) => {
  try {
    const filters = {
      ip: req.query.ip,
      minRiskScore: req.query.minRiskScore ? parseInt(req.query.minRiskScore) : null,
      threatType: req.query.threatType,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50
    };

    const events = shieldService.getSecurityEvents(filters);

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Block an IP address
router.post('/block-ip', (req, res) => {
  try {
    const { ip } = req.body;

    if (!ip) {
      return res.status(400).json({
        error: 'IP address is required'
      });
    }

    shieldService.blockIP(ip);

    res.json({
      success: true,
      message: `IP address ${ip} blocked successfully`
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Unblock an IP address
router.post('/unblock-ip', (req, res) => {
  try {
    const { ip } = req.body;

    if (!ip) {
      return res.status(400).json({
        error: 'IP address is required'
      });
    }

    shieldService.unblockIP(ip);

    res.json({
      success: true,
      message: `IP address ${ip} unblocked successfully`
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Check if IP is blocked
router.get('/ip-status/:ip', (req, res) => {
  try {
    const { ip } = req.params;
    const isBlocked = shieldService.isIPBlocked(ip);

    res.json({
      success: true,
      data: {
        ip,
        isBlocked
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Get threat statistics
router.get('/stats', (req, res) => {
  try {
    const stats = shieldService.getThreatStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Clear old events
router.delete('/events/old', (req, res) => {
  try {
    const retentionDays = parseInt(req.query.days) || 30;
    const removedCount = shieldService.clearOldEvents(retentionDays);

    res.json({
      success: true,
      message: `Removed ${removedCount} old security events`,
      removedCount
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;
