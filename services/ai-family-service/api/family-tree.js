const express = require('express');
const router = express.Router();
const personalityManager = require('../personality-manager');
const chatEngine = require('../chat-engine');

// Endpoint to get the list of all AI personalities
router.get('/', (req, res) => {
  res.json(personalityManager.listPersonalities());
});

// Endpoint to chat with a specific AI personality
router.post('/:personality/chat', async (req, res) => {
  const { personality } = req.params;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const reply = await chatEngine.handleMessage(personality, message);
  res.json({ reply });
});

module.exports = router;
