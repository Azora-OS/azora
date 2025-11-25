const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const Database = require('better-sqlite3');

const db = new Database('azora.db');
const app = express();
app.use(cors());
app.use(express.json());

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'STUDENT',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price REAL DEFAULT 0,
    status TEXT DEFAULT 'PUBLISHED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS enrollments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    progress REAL DEFAULT 0,
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE(user_id, course_id)
  );
  
  CREATE TABLE IF NOT EXISTS wallets (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    balance REAL DEFAULT 100.0,
    currency TEXT DEFAULT 'AZR',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'COMPLETED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Seed data
const hash = bcrypt.hashSync('password123', 10);
const adminExists = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@azora.world');
if (!adminExists) {
  db.prepare('INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)').run(
    'admin1', 'admin@azora.world', hash, 'Admin User', 'ADMIN'
  );
  db.prepare('INSERT INTO courses (id, title, description, price) VALUES (?, ?, ?, ?)').run(
    'course1', 'Python Basics', 'Learn Python programming', 99
  );
  db.prepare('INSERT INTO wallets (id, user_id, balance) VALUES (?, ?, ?)').run(
    'wallet1', 'admin1', 1000.0
  );
  db.prepare('INSERT INTO transactions (id, user_id, amount, type, description) VALUES (?, ?, ?, ?, ?)').run(
    'tx1', 'admin1', 1000.0, 'CREDIT', 'Welcome bonus'
  );
  console.log('✅ Seeded database');
}

const JWT_SECRET = 'azora-jwt-secret-2024';

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const id = 'user_' + Date.now();
    db.prepare('INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)').run(id, email, hashed, name);
    const token = jwt.sign({ userId: id, email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, data: { accessToken: token, user: { id, email, name } } });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, data: { accessToken: token, user: { id: user.id, email: user.email, name: user.name } } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Education endpoints
app.get('/api/courses', (req, res) => {
  const courses = db.prepare('SELECT * FROM courses WHERE status = ?').all('PUBLISHED');
  res.json({ success: true, data: courses });
});

app.post('/api/courses/:id/enroll', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    const enrollId = 'enroll_' + Date.now();
    db.prepare('INSERT INTO enrollments (id, user_id, course_id) VALUES (?, ?, ?)').run(
      enrollId, decoded.userId, req.params.id
    );
    res.json({ success: true, enrollmentId: enrollId });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/enrollments', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    const enrollments = db.prepare(`
      SELECT e.*, c.title, c.description FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.user_id = ?
    `).all(decoded.userId);
    res.json({ success: true, data: enrollments });
  } catch (e) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// Payment endpoints
app.get('/api/wallet', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    let wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(decoded.userId);
    if (!wallet) {
      const id = 'wallet_' + Date.now();
      db.prepare('INSERT INTO wallets (id, user_id, balance) VALUES (?, ?, ?)').run(id, decoded.userId, 100.0);
      wallet = { id, user_id: decoded.userId, balance: 100.0, currency: 'AZR' };
    }
    res.json({ success: true, data: wallet });
  } catch (e) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.get('/api/transactions', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    const transactions = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC').all(decoded.userId);
    res.json({ success: true, data: transactions });
  } catch (e) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.post('/api/earn', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    const { amount, description } = req.body;
    
    db.transaction(() => {
      db.prepare('UPDATE wallets SET balance = balance + ? WHERE user_id = ?').run(amount, decoded.userId);
      const txId = 'tx_' + Date.now();
      db.prepare('INSERT INTO transactions (id, user_id, amount, type, description) VALUES (?, ?, ?, ?, ?)').run(
        txId, decoded.userId, amount, 'EARN', description
      );
    })();
    
    const wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(decoded.userId);
    res.json({ success: true, data: { transactionId: 'tx_' + Date.now(), balance: wallet.balance } });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/health', (req, res) => res.json({ ok: true, database: 'connected', version: '1.0' }));

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`\n✅ Azora API running on http://localhost:${PORT}`);
  console.log(`📧 Test login: admin@azora.world / password123\n`);
});
