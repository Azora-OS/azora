import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4003;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    service: 'azora-forge',
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    mode: 'mock'
  });
});

// Basic forge endpoints (mock)
app.get('/api/v1/forge/status', (req, res) => {
  res.json({
    operational: true,
    features: ['code-generation', 'ai-assistance', 'deployment'],
    mode: 'mock'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Azora Forge Service running on port ${PORT} (Mock Mode)`);
  console.log(`🔨 Health: http://localhost:${PORT}/health`);
});