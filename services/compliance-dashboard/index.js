const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SERVICE_NAME = process.env.SERVICE_NAME || 'service';

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: SERVICE_NAME,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/status', (req, res) => {
  res.json({ 
    service: SERVICE_NAME,
    version: '1.0.0',
    status: 'operational'
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

app.use(require('./routes'));

app.listen(PORT, () => {
  console.log(`✅ ${SERVICE_NAME} running on port ${PORT}`);
});

module.exports = app;
