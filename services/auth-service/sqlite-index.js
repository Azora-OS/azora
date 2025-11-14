const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'azora-ubuntu-constitutional-ai-secret-2025';

// Initialize SQLite database
const dbPath = path.join(__dirname, 'azora.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  // Insert default users
  db.run(`INSERT OR IGNORE INTO users (email, password, name) VALUES 
    ('test@azora.world', 'ubuntu123', 'Test User'),
    ('admin@azora.world', 'admin123', 'Admin User'),
    ('elara@azora.world', 'elara123', 'Elara AI')`);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'auth', database: 'sqlite' });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    
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
  console.log(`🔐 SQLite Auth Service running on port ${PORT}`);
});