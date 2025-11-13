const express = require('express');
const router = express.Router();
const chatEngine = require('../chat-engine');

router.post('/chat', async (req, res) => {
  try {
    const { personality, message, context } = req.body;
    const response = await chatEngine.chat(personality || 'elara', message, context);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/auto-chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    const personality = await chatEngine.detectPersonality(message);
    const response = await chatEngine.chat(personality, message, context);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
