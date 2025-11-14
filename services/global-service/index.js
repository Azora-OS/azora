const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3032;
const config = new Map();
const features = new Map();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'global-service', configs: config.size });
});

app.post('/api/config', (req, res) => {
  const { key, value, category } = req.body;
  config.set(key, { key, value, category, updatedAt: new Date() });
  res.json({ saved: true, config: config.get(key) });
});

app.get('/api/config/:key', (req, res) => {
  const cfg = config.get(req.params.key);
  if (!cfg) return res.status(404).json({ error: 'Config not found' });
  res.json({ config: cfg });
});

app.post('/api/features', (req, res) => {
  const { name, enabled, config: featureConfig } = req.body;
  features.set(name, { id: Date.now().toString(), name, enabled, config: featureConfig });
  res.json({ feature: features.get(name) });
});

app.get('/api/features/:name', (req, res) => {
  const feature = features.get(req.params.name);
  if (!feature) return res.status(404).json({ error: 'Feature not found' });
  res.json({ feature });
});

app.use(require('./routes'));

app.listen(port, () => console.log(`Global Service on port ${port}`));
module.exports = app;
