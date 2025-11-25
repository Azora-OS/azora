import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3007;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    service: 'education',
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    mode: 'mock'
  });
});

// Basic education endpoints (mock)
app.get('/api/v1/education/courses', (req, res) => {
  res.json({
    courses: [
      { id: 1, title: 'AI Ethics', students: 200 },
      { id: 2, title: 'Blockchain Fundamentals', students: 150 }
    ],
    mode: 'mock'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Education Service running on port ${PORT} (Mock Mode)`);
  console.log(`📚 Health: http://localhost:${PORT}/health`);
});