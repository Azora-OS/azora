/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

UNIFIED API ROUTES
Centralized API routes for all services
*/

const express = require('express');
const router = express.Router();

// Import service integrations
const { getServiceRegistry } = require('@azora/shared-services/service-registry');
const { authenticateSession } = require('@azora/shared-auth/middleware');
const { healthCheckService } = require('@azora/shared-services/health-check');

/**
 * Health Check Route
 */
router.get('/health', async (req, res) => {
  try {
    const health = await healthCheckService.getHealthReport();
    res.json({ success: true, data: health });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Health check failed' });
  }
});

/**
 * Service Status Route
 */
router.get('/services/status', async (req, res) => {
  try {
    const serviceRegistry = getServiceRegistry();
    const services = Array.from(serviceRegistry.services.entries()).map(([name, info]) => ({
      name,
      url: info.url,
      health: info.health,
      lastHealthCheck: info.lastHealthCheck,
    }));
    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get service status' });
  }
});

/**
 * Design API Routes (wallet, progress, health, dashboard)
 */
router.get('/design/wallet-balance', authenticateSession, async (req, res) => {
  try {
    const { designDataService } = require('@azora/shared-design/data-service');
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    const balance = await designDataService.getUserWalletBalance(userId);
    res.json({ success: true, data: balance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/design/student-progress', authenticateSession, async (req, res) => {
  try {
    const { designDataService } = require('@azora/shared-design/data-service');
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    const progress = await designDataService.getStudentProgress(userId);
    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/design/health-check', async (req, res) => {
  try {
    const { designDataService } = require('@azora/shared-design/data-service');
    const health = await designDataService.getSystemHealth();
    res.json({ success: true, data: health });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/design/dashboard', authenticateSession, async (req, res) => {
  try {
    const { designDataService } = require('@azora/shared-design/data-service');
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    const dashboard = await designDataService.getUserDashboardData(userId);
    res.json({ success: true, data: dashboard });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * LMS Routes (courses, enrollments, progress)
 */
router.get('/lms/courses', authenticateSession, async (req, res) => {
  try {
    const serviceRegistry = getServiceRegistry();
    const lmsUrl = serviceRegistry.getServiceUrl('lms');
    if (!lmsUrl) {
      return res.status(503).json({ success: false, error: 'LMS service unavailable' });
    }
    const response = await fetch(`${lmsUrl}/api/courses`, {
      headers: { Authorization: req.headers.authorization },
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/lms/enrollments', authenticateSession, async (req, res) => {
  try {
    const serviceRegistry = getServiceRegistry();
    const lmsUrl = serviceRegistry.getServiceUrl('lms');
    if (!lmsUrl) {
      return res.status(503).json({ success: false, error: 'LMS service unavailable' });
    }
    const response = await fetch(`${lmsUrl}/api/enrollments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: req.headers.authorization,
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/lms/enrollments/:id/progress', authenticateSession, async (req, res) => {
  try {
    const serviceRegistry = getServiceRegistry();
    const lmsUrl = serviceRegistry.getServiceUrl('lms');
    if (!lmsUrl) {
      return res.status(503).json({ success: false, error: 'LMS service unavailable' });
    }
    const response = await fetch(`${lmsUrl}/api/enrollments/${req.params.id}/progress`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: req.headers.authorization,
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Retail AI Routes
 */
router.get('/retail-ai/inventory', authenticateSession, async (req, res) => {
  try {
    const serviceRegistry = getServiceRegistry();
    const retailUrl = serviceRegistry.getServiceUrl('retail-ai');
    if (!retailUrl) {
      return res.status(503).json({ success: false, error: 'Retail AI service unavailable' });
    }
    const response = await fetch(`${retailUrl}/api/inventory`, {
      headers: { Authorization: req.headers.authorization },
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/retail-ai/forecast/:itemId', authenticateSession, async (req, res) => {
  try {
    const serviceRegistry = getServiceRegistry();
    const retailUrl = serviceRegistry.getServiceUrl('retail-ai');
    if (!retailUrl) {
      return res.status(503).json({ success: false, error: 'Retail AI service unavailable' });
    }
    const days = req.query.days || 30;
    const response = await fetch(`${retailUrl}/api/forecast/${req.params.itemId}?days=${days}`, {
      headers: { Authorization: req.headers.authorization },
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Institutional Routes
 */
router.get('/institutional/students', authenticateSession, async (req, res) => {
  try {
    const serviceRegistry = getServiceRegistry();
    const institutionalUrl = serviceRegistry.getServiceUrl('institutional');
    if (!institutionalUrl) {
      return res.status(503).json({ success: false, error: 'Institutional service unavailable' });
    }
    const response = await fetch(`${institutionalUrl}/api/students`, {
      headers: { Authorization: req.headers.authorization },
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/institutional/students/register', authenticateSession, async (req, res) => {
  try {
    const serviceRegistry = getServiceRegistry();
    const institutionalUrl = serviceRegistry.getServiceUrl('institutional');
    if (!institutionalUrl) {
      return res.status(503).json({ success: false, error: 'Institutional service unavailable' });
    }
    const response = await fetch(`${institutionalUrl}/api/students/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: req.headers.authorization,
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
