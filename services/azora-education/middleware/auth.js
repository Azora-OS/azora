// 🔐 Authentication & Authorization Middleware

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'azora-education-secret';

const generateToken = (learner) => {
  return jwt.sign(
    { 
      id: learner.id, 
      email: learner.email,
      level: learner.level,
      ubuntu: true 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.learner = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

const requirePremium = (req, res, next) => {
  if (!req.learner.premium) {
    return res.status(403).json({ 
      error: 'Premium access required',
      upgrade: 'Visit /premium to upgrade your account'
    });
  }
  next();
};

const rateLimiter = new Map();

const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimiter.has(key)) {
      rateLimiter.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const limit = rateLimiter.get(key);
    
    if (now > limit.resetTime) {
      limit.count = 1;
      limit.resetTime = now + windowMs;
      return next();
    }
    
    if (limit.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((limit.resetTime - now) / 1000)
      });
    }
    
    limit.count++;
    next();
  };
};

module.exports = {
  generateToken,
  verifyToken,
  requirePremium,
  rateLimit
};