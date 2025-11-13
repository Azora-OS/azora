const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const crypto = require('crypto');

const app = express();
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));

const files = new Map();

app.post('/api/upload', (req, res) => {
  const { name, data, type } = req.body;
  if (!name || !data) return res.status(400).json({ error: 'Name and data required' });
  const id = crypto.randomBytes(16).toString('hex');
  files.set(id, { id, name, data, type, size: data.length, uploaded: Date.now() });
  res.json({ id, name, size: data.length });
});

app.get('/api/files/:id', (req, res) => {
  const file = files.get(req.params.id);
  if (!file) return res.status(404).json({ error: 'File not found' });
  res.json(file);
});

app.delete('/api/files/:id', (req, res) => {
  res.json({ deleted: files.delete(req.params.id) });
});

app.get('/api/files', (req, res) => {
  const list = Array.from(files.values()).map(({ id, name, size, type, uploaded }) => 
    ({ id, name, size, type, uploaded }));
  res.json({ files: list });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'file-storage-service', files: files.size });
});

const PORT = process.env.PORT || 3052;
app.listen(PORT, () => console.log(`File Storage Service on ${PORT}`));
module.exports = app;
