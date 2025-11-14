const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

const app = express();
const port = process.env.PORT || 3031;
const records = [];

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'enterprise-service', records: records.length });
});

app.post('/api/records', (req, res) => {
  const record = { id: Date.now().toString(), ...req.body, createdAt: new Date() };
  records.push(record);
  res.json({ success: true, record });
});

app.get('/api/records', (req, res) => {
  res.json({ success: true, records });
});

app.get('/api/records/:id', (req, res) => {
  const record = records.find(r => r.id === req.params.id);
  if (!record) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true, record });
});

app.delete('/api/records/:id', (req, res) => {
  const index = records.findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  records.splice(index, 1);
  res.json({ success: true });
});

app.use(require('./routes'));

app.listen(port, () => console.log(`enterprise-service on port ${port}`));
module.exports = app;
