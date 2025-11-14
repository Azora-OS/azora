const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Mock user database
const users = [
  { id: 1, email: 'test@azora.world', password: 'ubuntu123', name: 'Test User' },
  { id: 2, email: 'admin@azora.world', password: 'admin123', name: 'Admin User' }
];

const JWT_SECRET = process.env.JWT_SECRET || 'azora-ubuntu-constitutional-ai-secret-2025';

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'auth' });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
  
  const token = jwt.sign(
    { userId: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.json({
    success: true,
    token,
    user: { id: user.id, email: user.email, name: user.name }
  });
});

// Verify token endpoint
app.get('/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ valid: false, error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🔐 Simple Auth Service running on port ${PORT}`);
});