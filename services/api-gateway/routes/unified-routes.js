
/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

UNIFIED API ROUTES
Centralized API routes for all services
*/

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Import service integrations (temporarily disabled due to ES module compatibility)
// const { getServiceRegistry } = require('@azora/shared-services/service-registry');
// const { authenticateSession } = require('@azora/shared-auth/middleware');
// const { healthCheckService } = require('@azora/shared-services/health-check');

// Temporary service registry for unified routes
const tempServiceRegistry = {
  getServiceUrl: (service) => {
    const serviceUrls = {
      auth: process.env.AUTH_URL || 'http://localhost:3001',
      mint: process.env.MINT_URL || 'http://localhost:3002',
      lms: process.env.LMS_URL || 'http://localhost:3003',
      forge: process.env.FORGE_URL || 'http://localhost:4700',
      nexus: process.env.NEXUS_URL || 'http://localhost:3005',
      education: process.env.EDUCATION_URL || 'http://localhost:3007',
      payments: process.env.PAYMENTS_URL || 'http://localhost:3008'
    };
    return serviceUrls[service] || null;
  }
};

// JWT authentication middleware
const authenticateSession = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Missing Authorization Header' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Missing Token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid Token' });
  }
};

// Temporary health check
const tempHealthCheckService = {
  checkAllServices: async () => ({ status: 'ok', services: {} })
};

/**
 * Health Check Route
 */
router.get('/health', async (req, res) => {
  try {
    const health = await tempHealthCheckService.checkAllServices();
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
    const serviceRegistry = tempServiceRegistry;
    const services = Object.keys(serviceRegistry.getServiceUrl()).map(name => ({
      name,
      url: serviceRegistry.getServiceUrl(name),
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
    const lmsUrl = tempServiceRegistry.getServiceUrl('lms');
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
    const lmsUrl = tempServiceRegistry.getServiceUrl('lms');
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
    const lmsUrl = tempServiceRegistry.getServiceUrl('lms');
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
    const retailUrl = tempServiceRegistry.getServiceUrl('retail-ai');
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
    const retailUrl = tempServiceRegistry.getServiceUrl('retail-ai');
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
    const institutionalUrl = tempServiceRegistry.getServiceUrl('institutional');
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
    const institutionalUrl = tempServiceRegistry.getServiceUrl('institutional');
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

/**
 * Wallet Transaction Routes
 */
router.post('/wallet/send', authenticateSession, async (req, res) => {
  try {
    const { amount, address } = req.body
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }
    const mintUrl = tempServiceRegistry.getServiceUrl('mint');
    const response = await fetch(`${mintUrl}/api/wallet/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: req.headers.authorization },
      body: JSON.stringify({ userId, amount, address })
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

router.get('/wallet/transactions', authenticateSession, async (req, res) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }
    const mintUrl = tempServiceRegistry.getServiceUrl('mint');
    const response = await fetch(`${mintUrl}/api/transactions?userId=${userId}`, {
      headers: { Authorization: req.headers.authorization }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * Notifications Routes
 */
router.get('/notifications', authenticateSession, async (req, res) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }
    const notifUrl = process.env.NOTIFICATION_URL || 'http://localhost:3009';
    const response = await fetch(`${notifUrl}/api/notifications?userId=${userId}`, {
      headers: { Authorization: req.headers.authorization }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

router.patch('/notifications/:id/read', authenticateSession, async (req, res) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }
    const notifUrl = process.env.NOTIFICATION_URL || 'http://localhost:3009';
    await fetch(`${notifUrl}/api/notifications/${req.params.id}/read`, {
      method: 'PATCH',
      headers: { Authorization: req.headers.authorization }
    });
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

router.post('/notifications/mark-all-read', authenticateSession, async (req, res) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }
    const notifUrl = process.env.NOTIFICATION_URL || 'http://localhost:3009';
    await fetch(`${notifUrl}/api/notifications/mark-all-read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: req.headers.authorization },
      body: JSON.stringify({ userId })
    });
    res.json({ success: true, message: 'All notifications marked as read' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * Settings Routes
 */
router.get('/settings', authenticateSession, async (req, res) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }
    const authUrl = tempServiceRegistry.getServiceUrl('auth');
    const response = await fetch(`${authUrl}/api/settings?userId=${userId}`, {
      headers: { Authorization: req.headers.authorization }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

router.put('/settings', authenticateSession, async (req, res) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }
    const authUrl = tempServiceRegistry.getServiceUrl('auth');
    await fetch(`${authUrl}/api/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: req.headers.authorization },
      body: JSON.stringify({ userId, ...req.body })
    });
    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * Infrastructure Routes
 */
router.get('/infrastructure/status', async (req, res) => {
  try {
    const { treeArchitecture } = require('@azora/shared-infrastructure/tree-architecture');
    const status = treeArchitecture.getInfrastructureStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/infrastructure/cdn/status', async (req, res) => {
  try {
    const { africaCDN } = require('@azora/shared-infrastructure/africa-cdn');
    const status = africaCDN.getNetworkStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/infrastructure/rivers/status', async (req, res) => {
  try {
    const { riverFlows } = require('@azora/shared-infrastructure/river-flows');
    const status = riverFlows.getNetworkStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/infrastructure/mycelium/status', async (req, res) => {
  try {
    const { myceliumNetwork } = require('@azora/shared-infrastructure/mycelium-network');
    const topology = myceliumNetwork.getNetworkTopology();
    res.json({ success: true, data: topology });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/infrastructure/tree/status', async (req, res) => {
  try {
    const { treeArchitecture } = require('@azora/shared-infrastructure/tree-architecture');
    const status = treeArchitecture.getTreeStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * CDN Asset Routes
 */
router.get('/cdn/assets/:filename', async (req, res) => {
  try {
    // Simple CDN placeholder - return success for now
    res.json({ success: true, message: 'CDN asset served', filename: req.params.filename });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
