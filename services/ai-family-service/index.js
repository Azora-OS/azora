require('dotenv').config();
const express = require('express');
const chatEngine = require('./chat-engine');

const app = express();
const PORT = process.env.PORT || 3100;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'ai-family-service',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { personality, message, userId, context } = req.body;
    const response = await chatEngine.chat(personality, message, userId, context);
    res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/chat/multi', async (req, res) => {
  try {
    const { personalities, message, userId } = req.body;
    const responses = await chatEngine.multiPersonalityChat(personalities, message, userId);
    res.json({ success: true, data: responses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/chat/history/:userId', (req, res) => {
  const { personality } = req.query;
  chatEngine.clearHistory(req.params.userId, personality);
  res.json({ success: true, message: 'History cleared' });
});

app.listen(PORT, () => {
  console.log(`👨‍👩‍👧‍👦 AI Family Service running on port ${PORT}`);
  console.log(`🌍 Health: http://localhost:${PORT}/health`);
});

module.exports = app;
