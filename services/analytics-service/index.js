const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

const app = express();
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

const events = [];
const metrics = new Map();

app.post('/api/track', (req, res) => {
  const event = { ...req.body, timestamp: Date.now() };
  events.push(event);
  if (events.length > 10000) events.shift();
  res.json({ tracked: true });
});

app.get('/api/metrics/:key', (req, res) => {
  const data = metrics.get(req.params.key) || { count: 0, sum: 0, avg: 0 };
  res.json(data);
});

app.post('/api/metrics/:key', (req, res) => {
  const { value } = req.body;
  const current = metrics.get(req.params.key) || { count: 0, sum: 0, avg: 0 };
  current.count++;
  current.sum += value;
  current.avg = current.sum / current.count;
  metrics.set(req.params.key, current);
  res.json(current);
});

app.get('/api/events', (req, res) => {
  const { type, limit = 100 } = req.query;
  let filtered = type ? events.filter(e => e.type === type) : events;
  res.json({ events: filtered.slice(-limit) });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'analytics-service', events: events.length, metrics: metrics.size });
});

const PORT = process.env.PORT || 3050;
app.listen(PORT, () => console.log(`Analytics Service on ${PORT}`));
module.exports = app;
