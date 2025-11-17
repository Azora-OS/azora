const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'auth-service',
    timestamp: new Date().toISOString()
  });
});

// Basic login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Email and password are required' 
    });
  }
  
  // Simulate authentication
  res.status(200).json({
    success: true,
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // Mock JWT token
    user: {
      id: 'user_123',
      email,
      name: 'Test User'
    }
  });
});

// Basic registration endpoint
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password || !name) {
    return res.status(400).json({ 
      error: 'Email, password, and name are required' 
    });
  }
  
  // Simulate registration
  res.status(201).json({
    success: true,
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // Mock JWT token
    user: {
      id: `user_${Date.now()}`,
      email,
      name
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});

module.exports = app;