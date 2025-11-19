const express = require('express');
const { register, login, verifyToken } = require('../controllers/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify', verifyToken);

router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'auth-service',
    timestamp: new Date().toISOString() 
  });
});

module.exports = router;