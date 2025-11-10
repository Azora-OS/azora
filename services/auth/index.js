const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';
const PORT = process.env.AUTH_PORT || 4001;

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role = 'STUDENT' } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role
      }
    });
    
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      success: true,
      data: {
        accessToken: token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role }
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      success: true,
      data: {
        accessToken: token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
  }
};

// Profile
app.get('/api/auth/profile', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, email: true, name: true, role: true }
    });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/health', (req, res) => res.json({ healthy: true }));

app.listen(PORT, () => console.log(`✅ Auth service on port ${PORT}`));
