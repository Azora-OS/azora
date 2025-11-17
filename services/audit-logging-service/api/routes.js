const express = require('express');
const router = express.Router();
const auditService = require('../index');

// Log a security event
router.post('/security', (req, res) => {
  try {
    const { userId, action, resource, details } = req.body;

    if (!action || !resource) {
      return res.status(400).json({
        error: 'Action and resource are required'
      });
    }

    const auditEntry = auditService.logSecurityEvent(userId, action, resource, details);

    res.status(201).json({
      success: true,
      data: auditEntry
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Log a user action
router.post('/user-action', (req, res) => {
  try {
    const { userId, action, resource, details } = req.body;

    if (!userId || !action || !resource) {
      return res.status(400).json({
        error: 'User ID, action, and resource are required'
      });
    }

    const auditEntry = auditService.logUserAction(userId, action, resource, details);

    res.status(201).json({
      success: true,
      data: auditEntry
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Log a system event
router.post('/system', (req, res) => {
  try {
    const { service, action, details } = req.body;

    if (!service || !action) {
      return res.status(400).json({
        error: 'Service and action are required'
      });
    }

    const auditEntry = auditService.logSystemEvent(service, action, details);

    res.status(201).json({
      success: true,
      data: auditEntry
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Log data access
router.post('/data-access', (req, res) => {
  try {
    const { userId, action, resource, details } = req.body;

    if (!userId || !action || !resource) {
      return res.status(400).json({
        error: 'User ID, action, and resource are required'
      });
    }

    const auditEntry = auditService.logDataAccess(userId, action, resource, details);

    res.status(201).json({
      success: true,
      data: auditEntry
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Get audit logs with filtering
router.get('/logs', (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      userId: req.query.userId,
      action: req.query.action,
      resource: req.query.resource,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50
    };

    const logs = auditService.getAuditLogs(filters);

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Get security statistics
router.get('/security/stats', (req, res) => {
  try {
    const stats = auditService.getSecurityStats();

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

// Clear old logs
router.delete('/logs/old', (req, res) => {
  try {
    const retentionDays = parseInt(req.query.days) || 90;
    const removedCount = auditService.clearOldLogs(retentionDays);

    res.json({
      success: true,
      message: `Removed ${removedCount} old audit logs`,
      removedCount
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;
