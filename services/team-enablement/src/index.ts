import express from 'express';

const app = express();
app.use(express.json());

const trainingSessions = new Map();

// 26.1: Operations team training
app.post('/api/training/operations', (req, res) => {
  const { teamMember, topic, completed } = req.body;
  const id = `ops-${Date.now()}`;
  trainingSessions.set(id, { teamMember, topic, completed, type: 'operations', timestamp: new Date() });
  res.json({ id, status: 'recorded' });
});

// 26.2: Support team training
app.post('/api/training/support', (req, res) => {
  const { teamMember, topic, completed } = req.body;
  const id = `sup-${Date.now()}`;
  trainingSessions.set(id, { teamMember, topic, completed, type: 'support', timestamp: new Date() });
  res.json({ id, status: 'recorded' });
});

// 26.3: Knowledge base
app.get('/api/kb/:category', (req, res) => {
  const kb = {
    deployment: ['Helm deployment steps', 'Rollback procedures', 'Health checks'],
    monitoring: ['Dashboard access', 'Alert interpretation', 'Log analysis'],
    troubleshooting: ['Common errors', 'Debug procedures', 'Escalation paths']
  };
  res.json(kb[req.params.category] || []);
});

app.listen(3050, () => console.log('Team enablement service on :3050'));
