require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { authenticateToken, rateLimiter } = require('@azora/shared-auth');
const chatEngine = require('./chat-engine');

const app = express();
const PORT = process.env.PORT || 3100;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimiter({ windowMs: 60000, max: 20 }));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'ai-family-service',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/chat', authenticateToken, async (req, res) => {
  try {
    const { personality, message, context } = req.body;
    const userId = req.user.userId;
    const response = await chatEngine.chat(personality, message, userId, context);
    res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/chat/multi', authenticateToken, async (req, res) => {
  try {
    const { personalities, message } = req.body;
    const userId = req.user.userId;
    const responses = await chatEngine.multiPersonalityChat(personalities, message, userId);
    res.json({ success: true, data: responses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/chat/history', authenticateToken, (req, res) => {
  const { personality } = req.query;
  const userId = req.user.userId;
  chatEngine.clearHistory(userId, personality);
  res.json({ success: true, message: 'History cleared' });
});

app.listen(PORT, () => {
  console.log(`👨‍👩‍👧‍👦 AI Family Service running on port ${PORT}`);
  console.log(`🌍 Health: http://localhost:${PORT}/health`);
});

module.exports = app;
