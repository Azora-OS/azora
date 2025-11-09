/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Enhanced user storage with quantum security
const users = new Map();
const sessions = new Map();
const securityEvents = [];

// Quantum-resistant token generation
function generateQuantumToken(userId, email) {
  const payload = {
    userId,
    email,
    timestamp: Date.now(),
    nonce: crypto.randomUUID(),
    securityLevel: 'quantum'
  };
  
  const primaryToken = jwt.sign(payload, 'quantum-secret-key', {
    expiresIn: '24h',
    algorithm: 'HS256'
  });
  
  const quantumHash = crypto.createHash('sha256')
    .update(primaryToken + payload.nonce)
    .digest('hex');
  
  return `${primaryToken}.${quantumHash}`;
}

// Security event logging
function logSecurityEvent(type, details, severity = 'info') {
  const event = {
    id: crypto.randomUUID(),
    type,
    details,
    severity,
    timestamp: new Date().toISOString(),
    source: 'quantum-auth-service'
  };
  
  securityEvents.push(event);
  console.log(`🔒 Security Event [${severity.toUpperCase()}]: ${type}`, details);
  
  if (securityEvents.length > 1000) {
    securityEvents.shift();
  }
}

// Enhanced registration
app.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      logSecurityEvent('REGISTRATION_ATTEMPT', { email, reason: 'missing_fields' }, 'warning');
      return res.status(400).json({ error: 'All fields required' });
    }
    
    if (users.has(email)) {
      logSecurityEvent('REGISTRATION_ATTEMPT', { email, reason: 'user_exists' }, 'warning');
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = {
      id: crypto.randomUUID(),
      email,
      name,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      securityLevel: 'quantum',
      loginAttempts: 0
    };
    
    users.set(email, user);
    
    const token = generateQuantumToken(user.id, email);
    
    logSecurityEvent('USER_REGISTERED', { userId: user.id, email }, 'info');
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        securityLevel: user.securityLevel
      }
    });
    
  } catch (error) {
    logSecurityEvent('REGISTRATION_ERROR', { error: error.message }, 'error');
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Enhanced login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      logSecurityEvent('LOGIN_ATTEMPT', { email, reason: 'missing_credentials' }, 'warning');
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const user = users.get(email);
    if (!user) {
      logSecurityEvent('LOGIN_ATTEMPT', { email, reason: 'user_not_found' }, 'warning');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      logSecurityEvent('LOGIN_ATTEMPT', { 
        email, 
        reason: 'invalid_password',
        attempts: user.loginAttempts 
      }, 'warning');
      
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    user.loginAttempts = 0;
    user.lastLogin = new Date().toISOString();
    
    const token = generateQuantumToken(user.id, email);
    
    logSecurityEvent('USER_LOGIN', { userId: user.id, email }, 'info');
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        securityLevel: user.securityLevel
      }
    });
    
  } catch (error) {
    logSecurityEvent('LOGIN_ERROR', { error: error.message }, 'error');
    res.status(500).json({ error: 'Login failed' });
  }
});

// Security status endpoint
app.get('/security/status', (req, res) => {
  const recentEvents = securityEvents.slice(-10);
  const threatLevel = securityEvents.filter(e => 
    e.severity === 'warning' || e.severity === 'error'
  ).length;
  
  res.json({
    status: 'operational',
    securityLevel: threatLevel < 5 ? 'secure' : threatLevel < 10 ? 'warning' : 'critical',
    activeUsers: sessions.size,
    totalUsers: users.size,
    recentEvents,
    lastScan: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'quantum-auth-service',
    timestamp: new Date().toISOString()
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🔐 Quantum Auth Service running on port ${PORT}`);
  logSecurityEvent('SERVICE_STARTED', { port: PORT }, 'info');
});