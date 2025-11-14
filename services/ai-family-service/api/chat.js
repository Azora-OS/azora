const express = require('express');
const router = express.Router();
const aiFamilyService = require('../index');

router.post('/chat', async (req, res) => {
  try {
    const { userId, personality, message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const response = await aiFamilyService.routeMessage(
      userId || 'anonymous', 
      message, 
      { 
        ...context, 
        preferredMember: personality 
      }
    );
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/auto-chat', async (req, res) => {
  try {
    const { userId, message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const response = await aiFamilyService.routeMessage(
      userId || 'anonymous', 
      message, 
      context || {}
    );
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/greeting', async (req, res) => {
  try {
    const { userId, personality } = req.query;
    const greeting = await aiFamilyService.getPersonalizedGreeting(
      userId || 'anonymous', 
      personality
    );
    
    res.json({ greeting });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/consult-family', async (req, res) => {
  try {
    const { userId, topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
    
    const consultation = await aiFamilyService.consultFamily(
      userId || 'anonymous', 
      topic
    );
    
    res.json(consultation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/family-config', (req, res) => {
  try {
    const config = aiFamilyService.getFamilyConfig();
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/interaction-stats', (req, res) => {
  try {
    const stats = aiFamilyService.getInteractionStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;