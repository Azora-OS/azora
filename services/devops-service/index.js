const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3027;
const deployments = [];
const healthChecks = [];

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'devops-service', deployments: deployments.length });
});

app.post('/api/deployments', (req, res) => {
  const { service, version, environment } = req.body;
  const deployment = { id: Date.now().toString(), service, version, environment, status: 'deploying', deployedAt: new Date() };
  deployments.push(deployment);
  setTimeout(() => { deployment.status = 'deployed'; }, 2000);
  res.json({ deployment });
});

app.get('/api/deployments', (req, res) => {
  res.json({ deployments });
});

app.post('/api/health-checks', (req, res) => {
  const { service, status, uptime } = req.body;
  const check = { id: Date.now().toString(), service, status, uptime, timestamp: new Date() };
  healthChecks.push(check);
  res.json({ check });
});

app.get('/api/health-checks/:service', (req, res) => {
  const checks = healthChecks.filter(c => c.service === req.params.service);
  res.json({ checks });
});

app.listen(port, () => console.log(`DevOps Service on port ${port}`));
module.exports = app;
