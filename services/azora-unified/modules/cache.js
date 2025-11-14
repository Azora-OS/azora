const router = require('express').Router();

const cache = new Map();

router.get('/:key', (req, res) => {
  const item = cache.get(req.params.key);
  if (!item || item.expiresAt < Date.now()) {
    cache.delete(req.params.key);
    return res.status(404).json({ error: 'Key not found or expired' });
  }
  res.json({ success: true, data: item.value });
});

router.post('/:key', (req, res) => {
  const { value, ttl = 3600 } = req.body;
  cache.set(req.params.key, {
    value,
    expiresAt: Date.now() + (ttl * 1000)
  });
  res.json({ success: true });
});

router.delete('/:key', (req, res) => {
  cache.delete(req.params.key);
  res.json({ success: true });
});

module.exports = router;
