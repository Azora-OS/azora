const router = require('express').Router();

const resources = new Map();

router.get('/', (req, res) => {
  const { type, search } = req.query;
  let results = Array.from(resources.values());
  if (type) results = results.filter(r => r.type === type);
  if (search) results = results.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));
  res.json({ success: true, data: results });
});

router.post('/', (req, res) => {
  const { title, type, url, author } = req.body;
  const id = Date.now().toString();
  const resource = { id, title, type, url, author, views: 0, createdAt: new Date() };
  resources.set(id, resource);
  res.json({ success: true, data: resource });
});

router.post('/:id/view', (req, res) => {
  const resource = resources.get(req.params.id);
  if (!resource) return res.status(404).json({ error: 'Resource not found' });
  resource.views++;
  resources.set(req.params.id, resource);
  res.json({ success: true, data: resource });
});

module.exports = router;
