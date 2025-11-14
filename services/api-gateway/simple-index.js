const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Simple service registry
const services = {
  auth: process.env.AUTH_URL || 'http://localhost:3001',
  lms: process.env.LMS_URL || 'http://localhost:3002',
  mint: process.env.MINT_URL || 'http://localhost:3003'
};

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: Object.keys(services)
  });
});

// API routes
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const response = await fetch(`${services.auth}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// LMS routes
app.get('/api/lms/courses', async (req, res) => {
  try {
    const response = await fetch(`${services.lms}/api/courses`, {
      headers: { 'Authorization': req.headers.authorization || '' }
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/lms/courses/:id', async (req, res) => {
  try {
    const response = await fetch(`${services.lms}/api/courses/${req.params.id}`, {
      headers: { 'Authorization': req.headers.authorization || '' }
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/lms/courses/:id/enroll', async (req, res) => {
  try {
    const response = await fetch(`${services.lms}/api/courses/${req.params.id}/enroll`, {
      method: 'POST',
      headers: { 
        'Authorization': req.headers.authorization || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Progress tracking routes
app.get('/api/lms/courses/:id/progress', async (req, res) => {
  try {
    const response = await fetch(`${services.lms}/api/courses/${req.params.id}/progress`, {
      headers: { 'Authorization': req.headers.authorization || '' }
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/lms/lessons/:id/complete', async (req, res) => {
  try {
    const response = await fetch(`${services.lms}/api/lessons/${req.params.id}/complete`, {
      method: 'POST',
      headers: { 
        'Authorization': req.headers.authorization || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🌐 Simple API Gateway running on port ${PORT}`);
});