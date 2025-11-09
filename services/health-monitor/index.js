/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const SERVICES = {
  'api-gateway': process.env.GATEWAY_URL || 'http://localhost:4000',
  'auth': process.env.AUTH_URL || 'http://localhost:3001',
  'mint': process.env.MINT_URL || 'http://localhost:3002',
  'lms': process.env.LMS_URL || 'http://localhost:3003',
  'forge': process.env.FORGE_URL || 'http://localhost:3004',
  'education': process.env.EDUCATION_URL || 'http://localhost:3007',
  'payments': process.env.PAYMENTS_URL || 'http://localhost:3008',
};

async function checkService(name, url) {
  try {
    const response = await axios.get(`${url}/health`, { timeout: 5000 });
    return { name, status: 'healthy', url, response: response.data };
  } catch (error) {
    return { name, status: 'unhealthy', url, error: error.message };
  }
}

app.get('/health', async (req, res) => {
  const checks = await Promise.all(
    Object.entries(SERVICES).map(([name, url]) => checkService(name, url))
  );

  const allHealthy = checks.every(c => c.status === 'healthy');
  const status = allHealthy ? 'healthy' : 'degraded';

  res.status(allHealthy ? 200 : 503).json({
    status,
    timestamp: new Date().toISOString(),
    services: checks,
    summary: {
      total: checks.length,
      healthy: checks.filter(c => c.status === 'healthy').length,
      unhealthy: checks.filter(c => c.status === 'unhealthy').length
    }
  });
});

app.get('/metrics', async (req, res) => {
  const checks = await Promise.all(
    Object.entries(SERVICES).map(([name, url]) => checkService(name, url))
  );

  const metrics = checks.map(c => 
    `azora_service_health{service="${c.name}"} ${c.status === 'healthy' ? 1 : 0}`
  ).join('\n');

  res.set('Content-Type', 'text/plain');
  res.send(metrics);
});

const PORT = process.env.PORT || 9090;
app.listen(PORT, () => console.log(`🏥 Health Monitor on ${PORT}`));
