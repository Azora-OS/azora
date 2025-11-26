const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { generateAccessToken, generateRefreshToken, authenticateToken } = require('../middleware/jwt');
const { ROLES } = require('../middleware/rbac');
const { logAuthAttempt } = require('../middleware/audit');

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    await logAuthAttempt(email, true, req.ip);
    
    // Mock user validation (replace with database)
    const user = { 
      userId: 1, 
      email, 
      name: 'Ubuntu User',
      role: ROLES.STUDENT
    };
    
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken({ userId: user.userId });
    
    res.json({
      success: true,
      accessToken,
      refreshToken,
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

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    // Mock user creation (replace with database)
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { 
      userId: Date.now(), 
      email, 
      name,
      role: role || ROLES.STUDENT
    };
    
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken({ userId: user.userId });
    
    res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
      user,
      ubuntu: 'Ubuntu registration successful'
    });
  } catch (error) {
    res.status(400).json({
      error: 'Registration failed',
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

module.exports = router;