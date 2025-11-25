import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    service: 'nexus',
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    mode: 'mock'
  });
});

// Basic nexus endpoints (mock)
app.get('/api/v1/nexus/status', (req, res) => {
  res.json({
    operational: true,
    features: ['event-bus', 'service-discovery', 'monitoring'],
    mode: 'mock'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Nexus Service running on port ${PORT} (Mock Mode)`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
});