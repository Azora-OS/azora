const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

const app = express();
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

const index = new Map();

app.post('/api/index', (req, res) => {
  const { id, type, content } = req.body;
  index.set(id, { id, type, content: content.toLowerCase(), timestamp: Date.now() });
  res.json({ indexed: true, id });
});

app.get('/api/search', (req, res) => {
  const { q, type, limit = 20 } = req.query;
  const query = q.toLowerCase();
  const results = Array.from(index.values())
    .filter(doc => (!type || doc.type === type) && doc.content.includes(query))
    .slice(0, limit);
  res.json({ results, count: results.length });
});

app.delete('/api/index/:id', (req, res) => {
  const deleted = index.delete(req.params.id);
  res.json({ deleted });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'search-service', documents: index.size });
});

const PORT = process.env.PORT || 3051;
app.listen(PORT, () => console.log(`Search Service on ${PORT}`));
module.exports = app;
