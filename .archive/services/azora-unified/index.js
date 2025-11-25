const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Unified modules - consolidates 185 empty shells
const modules = {
  assessment: require('./modules/assessment'),
  classroom: require('./modules/classroom'),
  library: require('./modules/library'),
  billing: require('./modules/billing'),
  analytics: require('./modules/analytics'),
  cache: require('./modules/cache')
};

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'azora-unified', modules: Object.keys(modules).length });
});

app.use('/api/:module', (req, res, next) => {
  const handler = modules[req.params.module];
  if (!handler) return res.status(404).json({ error: 'Module not found' });
  handler(req, res, next);
});

app.get('/api', (req, res) => {
  res.json({
    service: 'azora-unified',
    modules: Object.keys(modules).map(name => ({ name, path: `/api/${name}` }))
  });
});

app.listen(PORT, () => console.log(`🔷 Azora Unified on port ${PORT} (${Object.keys(modules).length} modules)`));
module.exports = app;
