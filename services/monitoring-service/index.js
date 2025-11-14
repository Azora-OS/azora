const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3048;
const alerts = [];

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'monitoring-service', alerts: alerts.length });
});

app.post('/api/alerts', (req, res) => {
  const { service, severity, message } = req.body;
  const alert = { id: Date.now().toString(), service, severity, message, resolved: false, createdAt: new Date() };
  alerts.push(alert);
  res.json({ success: true, alert });
});

app.get('/api/alerts', (req, res) => {
  const { service, severity, resolved } = req.query;
  let filtered = alerts;
  if (service) filtered = filtered.filter(a => a.service === service);
  if (severity) filtered = filtered.filter(a => a.severity === severity);
  if (resolved !== undefined) filtered = filtered.filter(a => a.resolved === (resolved === 'true'));
  res.json({ success: true, alerts: filtered });
});

app.patch('/api/alerts/:id/resolve', (req, res) => {
  const alert = alerts.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Not found' });
  alert.resolved = true;
  alert.resolvedAt = new Date();
  res.json({ success: true, alert });
});

app.use(require('./routes'));

app.listen(port, () => console.log(`Monitoring Service on port ${port}`));
module.exports = app;
