const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.error('Redis error:', err));
client.connect().catch(console.error);

const DEFAULT_TTL = 3600; // 1 hour

async function get(key) {
  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.error('Cache get error:', err);
    return null;
  }
}

async function set(key, value, ttl = DEFAULT_TTL) {
  try {
    await client.setEx(key, ttl, JSON.stringify(value));
  } catch (err) {
    console.error('Cache set error:', err);
  }
}

async function del(key) {
  try {
    await client.del(key);
  } catch (err) {
    console.error('Cache delete error:', err);
  }
}

function cacheMiddleware(ttl = DEFAULT_TTL) {
  return async (req, res, next) => {
    if (req.method !== 'GET') return next();
    
    const key = `cache:${req.path}:${JSON.stringify(req.query)}`;
    const cached = await get(key);
    
    if (cached) {
      return res.json(cached);
    }
    
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      set(key, data, ttl);
      return originalJson(data);
    };
    
    next();
  };
}

module.exports = { get, set, del, cacheMiddleware };
