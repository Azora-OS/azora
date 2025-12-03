const express = require('express');
const AzoraAI = require('./ai-client');
const router = express.Router();

const ai = new AzoraAI();

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const response = await ai.chat(message, context);
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      ubuntu: 'I handle errors because we recover together'
    });
  }
});

// Embedding endpoint
router.post('/embed', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    const response = await ai.generateEmbedding(text);
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Content moderation endpoint
router.post('/moderate', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    const response = await ai.moderateContent(text);
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;