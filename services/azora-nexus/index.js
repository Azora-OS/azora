const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const { secureCors, errorHandler } = require('../../packages/security-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SERVICE_NAME = process.env.SERVICE_NAME || 'service';

app.use(helmet());
app.use(secureCors);
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

app.use(require('./routes'));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ ${SERVICE_NAME} running on port ${PORT}`);
});

module.exports = app;
