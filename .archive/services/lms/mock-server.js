import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    service: 'lms',
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    mode: 'mock'
  });
});

// Basic LMS endpoints (mock)
app.get('/api/v1/courses', (req, res) => {
  res.json({
    courses: [
      { id: 1, title: 'Azora OS Fundamentals', enrolled: 150 },
      { id: 2, title: 'Advanced Blockchain', enrolled: 89 }
    ],
    mode: 'mock'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 LMS Service running on port ${PORT} (Mock Mode)`);
  console.log(`📚 Health: http://localhost:${PORT}/health`);
});