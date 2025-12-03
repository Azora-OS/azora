const express = require('express');
const router = express.Router();
const tamperProofService = require('../index');

// Store data
router.post('/data', (req, res) => {
  try {
    const { userId, dataType, data, metadata } = req.body;

    if (!userId || !dataType || data === undefined) {
      return res.status(400).json({
        error: 'User ID, data type, and data are required'
      });
    }

    const result = tamperProofService.storeData(userId, dataType, data, metadata);

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Retrieve data
router.get('/data/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required'
      });
    }

    const data = tamperProofService.retrieveData(id, userId);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    if (error.message === 'Data not found') {
      return res.status(404).json({
        error: 'Data not found'
      });
    }
    if (error.message === 'Unauthorized access') {
      return res.status(403).json({
        error: 'Unauthorized access'
      });
    }
    res.status(500).json({
      error: error.message
    });
  }
});

// Update data
router.put('/data/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { userId, data, metadata } = req.body;

    if (!userId || data === undefined) {
      return res.status(400).json({
        error: 'User ID and data are required'
      });
    }

    const result = tamperProofService.updateData(id, userId, data, metadata);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error.message === 'Data not found') {
      return res.status(404).json({
        error: 'Data not found'
      });
    }
    if (error.message === 'Unauthorized access') {
      return res.status(403).json({
        error: 'Unauthorized access'
      });
    }
    res.status(500).json({
      error: error.message
    });
  }
});

// Delete data
router.delete('/data/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required'
      });
    }

    const result = tamperProofService.deleteData(id, userId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error.message === 'Data not found') {
      return res.status(404).json({
        error: 'Data not found'
      });
    }
    if (error.message === 'Unauthorized access') {
      return res.status(403).json({
        error: 'Unauthorized access'
      });
    }
    res.status(500).json({
      error: error.message
    });
  }
});

// List user data
router.get('/data/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const data = tamperProofService.listUserData(userId);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Verify all user data
router.get('/data/user/:userId/verify', (req, res) => {
  try {
    const { userId } = req.params;
    const results = tamperProofService.verifyAllUserData(userId);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Get audit trail
router.get('/data/:id/audit-trail', (req, res) => {
  try {
    const { id } = req.params;
    const auditTrail = tamperProofService.getAuditTrail(id);

    res.json({
      success: true,
      data: auditTrail
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;
