const express = require('express');
const router = express.Router();
const { generateAccessToken, verifyToken, revokeToken } = require('../middleware/jwt');

// Token refresh endpoint
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required' });
  }

  try {
    const decoded = verifyToken(refreshToken);
    
    const newAccessToken = generateAccessToken({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    });

    res.json({
      success: true,
      accessToken: newAccessToken
    });
  } catch (err) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
});

// Token revocation endpoint
router.post('/revoke', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(400).json({ error: 'Token required' });
  }

  try {
    revokeToken(token);
    res.json({ success: true, message: 'Token revoked successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Token revocation failed' });
  }
});

// Logout endpoint (revokes both access and refresh tokens)
router.post('/logout', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const { refreshToken } = req.body;

  try {
    if (token) revokeToken(token);
    if (refreshToken) revokeToken(refreshToken);
    
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

module.exports = router;
