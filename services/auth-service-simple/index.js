const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory store (will replace with DB)
const users = new Map();
const sessions = new Map();

const JWT_SECRET = process.env.JWT_SECRET || 'azora-secret-key-change-in-production';
const PORT = process.env.PORT || 4001;

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role = 'STUDENT' } = req.body;
    
    if (users.has(email)) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id: Date.now().toString(),
      email,
      passwordHash,
      name,
      role,
      createdAt: new Date()
    };
    
    users.set(email, user);
    
    const token = jwt.sign({ userId: user.id, email, role }, JWT_SECRET, { expiresIn: '24h' });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    sessions.set(token, { userId: user.id, createdAt: new Date() });
    
    res.json({
      success: true,
      data: {
        accessToken: token,
        refreshToken,
        user: { id: user.id, email, name, role }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = users.get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    sessions.set(token, { userId: user.id, createdAt: new Date() });
    
    res.json({
      success: true,
      data: {
        accessToken: token,
        refreshToken,
        user: { id: user.id, email: user.email, name: user.name, role: user.role }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Middleware to verify token
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get Profile
app.get('/api/auth/profile', authMiddleware, (req, res) => {
  const user = Array.from(users.values()).find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    success: true,
    data: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});

// Logout
app.post('/api/auth/logout', authMiddleware, (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  sessions.delete(token);
  res.json({ success: true });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ healthy: true, service: 'auth', users: users.size });
});

app.listen(PORT, () => {
  console.log(`✅ Auth service running on port ${PORT}`);
  console.log(`📧 Test: POST http://localhost:${PORT}/api/auth/register`);
});
