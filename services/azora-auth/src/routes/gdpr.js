const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/jwt');

// Data export endpoint
router.get('/export', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Mock data export (replace with actual database queries)
    const userData = {
      profile: { id: userId, email: req.user.email, name: req.user.name },
      courses: [],
      payments: [],
      activity: [],
      exportDate: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: userData,
      format: 'json'
    });
  } catch (err) {
    res.status(500).json({ error: 'Data export failed' });
  }
});

// Data deletion request
router.post('/delete', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Schedule deletion (30-day retention)
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);
    
    res.json({
      success: true,
      message: 'Deletion scheduled',
      scheduledFor: deletionDate.toISOString(),
      retentionPeriod: '30 days'
    });
  } catch (err) {
    res.status(500).json({ error: 'Deletion request failed' });
  }
});

// Consent management
router.post('/consent', authenticateToken, async (req, res) => {
  try {
    const { marketing, analytics, thirdParty } = req.body;
    
    // Store consent preferences
    const consent = {
      userId: req.user.userId,
      marketing: !!marketing,
      analytics: !!analytics,
      thirdParty: !!thirdParty,
      timestamp: new Date().toISOString()
    };
    
    res.json({ success: true, consent });
  } catch (err) {
    res.status(500).json({ error: 'Consent update failed' });
  }
});

router.get('/consent', authenticateToken, async (req, res) => {
  try {
    // Mock consent retrieval
    const consent = {
      marketing: false,
      analytics: true,
      thirdParty: false
    };
    
    res.json({ success: true, consent });
  } catch (err) {
    res.status(500).json({ error: 'Consent retrieval failed' });
  }
});

module.exports = router;
