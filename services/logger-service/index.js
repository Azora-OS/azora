const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3034;
const logs = [];

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'logger-service', logs: logs.length });
});

app.post('/api/logs', (req, res) => {
  const { level, service, message, metadata } = req.body;
  const log = { id: Date.now().toString(), level, service, message, metadata, timestamp: new Date() };
  logs.push(log);
  console.log(`[${level.toUpperCase()}] ${service}: ${message}`);
  res.json({ logged: true, log });
});

app.get('/api/logs', (req, res) => {
  const { level, service, limit = 100 } = req.query;
  let filtered = logs;
  if (level) filtered = filtered.filter(l => l.level === level);
  if (service) filtered = filtered.filter(l => l.service === service);
  res.json({ logs: filtered.slice(-limit) });
});

app.use(require('./routes'));

app.listen(port, () => console.log(`Logger Service on port ${port}`));
module.exports = app;
