const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

const createLimiter = (options = {}) => {
  const config = {
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: options.message || 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    ...options
  };

  if (redis) {
    config.store = new RedisStore({
      client: redis,
      prefix: 'rl:',
      sendCommand: (...args) => redis.call(...args)
    });
  }

  return rateLimit(config);
};

const limiters = {
  strict: createLimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
  auth: createLimiter({ windowMs: 15 * 60 * 1000, max: 5, message: 'Too many login attempts' }),
  api: createLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  financial: createLimiter({ windowMs: 60 * 1000, max: 10, message: 'Too many financial transactions' }),
  public: createLimiter({ windowMs: 15 * 60 * 1000, max: 300 })
};

module.exports = { createLimiter, limiters };
