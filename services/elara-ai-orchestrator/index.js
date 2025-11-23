const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    service: 'elara-ai-orchestrator',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Basic routes
app.get('/', (req, res) => {
  res.json({
    message: 'elara-ai-orchestrator is running',
    version: '1.0.0',
    endpoints: ['/health', '/api']
  });
});

app.get('/api', (req, res) => {
  res.json({
    service: 'elara-ai-orchestrator',
    message: 'API endpoint active'
  });
});

app.post('/api/explain', (req, res) => {
  const { code, complexity } = req.body;

  // In a real app, this would call OpenAI. For now, we simulate "Magic".
  const complexityText = complexity < 30 ? "simple terms" : complexity > 70 ? "technical depth" : "balanced detail";

  const explanation = `[Elara AI Real-Time Response]
  
Here is an explanation of your code in **${complexityText}**:

This code defines a function that calculates a value.
- **Complexity Level:** ${complexity}%
- **Analysis:** The code appears to be valid JavaScript.
- **Suggestion:** Try adding error handling!

(Connected to Elara Service on Port ${PORT})`;

  setTimeout(() => {
    res.json({ explanation });
  }, 1000);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 elara-ai-orchestrator running on port ${PORT}`);
});

module.exports = app;
