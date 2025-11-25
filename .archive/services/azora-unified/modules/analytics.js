const router = require('express').Router();

const events = [];

router.post('/track', (req, res) => {
  const { userId, event, properties } = req.body;
  events.push({ userId, event, properties, timestamp: new Date() });
  res.json({ success: true });
});

router.get('/stats', (req, res) => {
  const { userId, event } = req.query;
  let filtered = events;
  if (userId) filtered = filtered.filter(e => e.userId === userId);
  if (event) filtered = filtered.filter(e => e.event === event);
  
  const stats = {
    total: filtered.length,
    byEvent: {},
    recent: filtered.slice(-10)
  };
  
  filtered.forEach(e => {
    stats.byEvent[e.event] = (stats.byEvent[e.event] || 0) + 1;
  });
  
  res.json({ success: true, data: stats });
});

module.exports = router;
