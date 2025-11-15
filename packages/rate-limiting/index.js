const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { error: message || 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});

const limiters = {
  standard: createLimiter(15 * 60 * 1000, 100, 'Too many requests'),
  strict: createLimiter(15 * 60 * 1000, 50, 'Rate limit exceeded'),
  auth: createLimiter(15 * 60 * 1000, 5, 'Too many login attempts'),
  financial: createLimiter(15 * 60 * 1000, 20, 'Too many financial transactions'),
  api: createLimiter(60 * 1000, 30, 'API rate limit exceeded')
};

module.exports = { limiters, createLimiter };
