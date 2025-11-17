const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();

// Ubuntu Authentication
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Mock user validation (replace with database)
    const user = { id: 1, email, name: 'Ubuntu User' };
    
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'ubuntu-secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user,
      ubuntu: 'Ubuntu authentication successful'
    });
  } catch (error) {
    res.status(401).json({
      error: 'Authentication failed',
      ubuntu: 'Ubuntu security maintained'
    });
  }
});

router.get('/profile', authenticateToken, (req, res) => {
  res.json({
    user: req.user,
    ubuntu: 'Ubuntu profile access granted'
  });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      error: 'Access token required',
      ubuntu: 'Ubuntu security verification needed'
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'ubuntu-secret', (err, user) => {
    if (err) {
      return res.status(403).json({
        error: 'Invalid token',
        ubuntu: 'Ubuntu security verification failed'
      });
    }
    req.user = user;
    next();
  });
}

module.exports = router;