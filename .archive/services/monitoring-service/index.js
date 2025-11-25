const express = require('express');
const promClient = require('prom-client');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3013;

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const serviceHealth = new promClient.Gauge({
  name: 'service_health_status',
  help: 'Health status of services (1 = healthy, 0 = unhealthy)',
  labelNames: ['service'],
  registers: [register]
});

const services = [
  { name: 'api-gateway', url: 'http://localhost:4000/health' },
  { name: 'azora-nexus', url: 'http://localhost:3000/health' },
  { name: 'azora-education', url: 'http://localhost:3001/health' },
  { name: 'azora-mint', url: 'http://localhost:3002/health' },
  { name: 'azora-forge', url: 'http://localhost:3003/health' },
  { name: 'ai-family-service', url: 'http://localhost:3004/health' },
  { name: 'azora-pay', url: 'http://localhost:3010/health' },
  { name: 'notification-service', url: 'http://localhost:3011/health' },
  { name: 'analytics-service', url: 'http://localhost:3012/health' }
];

async function checkServiceHealth() {
  for (const service of services) {
    try {
      await axios.get(service.url, { timeout: 5000 });
      serviceHealth.set({ service: service.name }, 1);
    } catch (error) {
      serviceHealth.set({ service: service.name }, 0);
    }
  }
}

setInterval(checkServiceHealth, 30000);
checkServiceHealth();

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'monitoring-service' });
});

app.get('/api/services/status', async (req, res) => {
  const status = await Promise.all(
    services.map(async (service) => {
      try {
        const response = await axios.get(service.url, { timeout: 5000 });
        return { name: service.name, status: 'healthy', data: response.data };
      } catch (error) {
        return { name: service.name, status: 'unhealthy', error: error.message };
      }
    })
  );
  
  res.json(status);
});

app.listen(PORT, () => {
  console.log(`📈 Monitoring service running on port ${PORT}`);
  console.log(`📊 Metrics available at http://localhost:${PORT}/metrics`);
});
