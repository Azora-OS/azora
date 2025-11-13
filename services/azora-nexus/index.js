require('dotenv').config();
const express = require('express');
const nexusRouter = require('./api/nexus');
const serviceDiscovery = require('./engines/service-discovery');

const app = express();
app.use(express.json());

app.use('/api/nexus', nexusRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'azora-nexus' });
});

const PORT = process.env.PORT || 4050;
app.listen(PORT, () => {
  console.log(`🌐 Azora Nexus Service running on port ${PORT}`);
  console.log('🔗 Event bus, service discovery, and circuit breakers active');
  serviceDiscovery.startHealthChecks();
});

module.exports = app;
