const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8500;

app.use(cors());
app.use(express.json());

const services = new Map();

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'service-registry' });
});

app.post('/api/register', (req, res) => {
  const { name, url, port, version, status = 'healthy' } = req.body;
  
  if (!name || !url) {
    return res.status(400).json({ error: 'name and url required' });
  }
  
  services.set(name, { name, url, port, version, status, lastSeen: new Date().toISOString() });
  res.json({ success: true, service: services.get(name) });
});

app.delete('/api/register/:name', (req, res) => {
  services.delete(req.params.name);
  res.json({ success: true });
});

app.get('/api/services/:name', (req, res) => {
  const service = services.get(req.params.name);
  if (!service) return res.status(404).json({ error: 'Service not found' });
  res.json({ success: true, data: service });
});

app.get('/api/services', (req, res) => {
  const { status } = req.query;
  let list = Array.from(services.values());
  if (status) list = list.filter(s => s.status === status);
  res.json({ success: true, data: list, total: list.length });
});

app.post('/api/heartbeat/:name', (req, res) => {
  const service = services.get(req.params.name);
  if (!service) return res.status(404).json({ error: 'Service not found' });
  service.lastSeen = new Date().toISOString();
  service.status = req.body.status || 'healthy';
  services.set(req.params.name, service);
  res.json({ success: true });
});

setInterval(() => {
  const now = Date.now();
  for (const [name, service] of services.entries()) {
    if (now - new Date(service.lastSeen).getTime() > 300000) {
      service.status = 'stale';
      services.set(name, service);
    }
  }
}, 60000);

app.listen(PORT, () => console.log(`📋 Service Registry on port ${PORT}`));
module.exports = app;
