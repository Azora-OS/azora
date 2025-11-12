const Redis = require('ioredis');
const logger = require('./logger');

let redis;

function getRedisClient() {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError(err) {
        logger.error('Redis connection error:', err);
        return true;
      },
    });

    redis.on('connect', () => {
      logger.info('✅ Redis connected');
    });

    redis.on('error', (err) => {
      logger.error('Redis error:', err);
    });
  }
  return redis;
}

async function cacheGet(key) {
  try {
    const client = getRedisClient();
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error('Cache get error:', error);
    return null;
  }
}

async function cacheSet(key, value, ttlSeconds = 300) {
  try {
    const client = getRedisClient();
    await client.setex(key, ttlSeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    logger.error('Cache set error:', error);
    return false;
  }
}

async function cacheDel(key) {
  try {
    const client = getRedisClient();
    await client.del(key);
    return true;
  } catch (error) {
    logger.error('Cache delete error:', error);
    return false;
  }
}

async function cacheFlush(pattern = '*') {
  try {
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
    return true;
  } catch (error) {
    logger.error('Cache flush error:', error);
    return false;
  }
}

// Middleware for caching GET requests
function cacheMiddleware(ttl = 300) {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.path}:${JSON.stringify(req.query)}`;
    const cached = await cacheGet(key);

    if (cached) {
      logger.debug(`Cache hit: ${key}`);
      return res.json(cached);
    }

    // Store original json function
    const originalJson = res.json.bind(res);
    
    // Override json function to cache response
    res.json = function(data) {
      if (res.statusCode === 200) {
        cacheSet(key, data, ttl);
      }
      return originalJson(data);
    };

    next();
  };
}

async function disconnectRedis() {
  if (redis) {
    await redis.quit();
    logger.info('🔌 Redis disconnected');
  }
}

module.exports = {
  getRedisClient,
  cacheGet,
  cacheSet,
  cacheDel,
  cacheFlush,
  cacheMiddleware,
  disconnectRedis,
};
