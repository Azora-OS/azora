import express from 'express';

const app = express();
app.use(express.json());

const sloMetrics = new Map();
const feedback = [];
const iterations = [];

// 27.1: SLO tracking
app.post('/api/slo/track', (req, res) => {
  const { service, metric, value, threshold } = req.body;
  const id = `slo-${Date.now()}`;
  const compliant = value <= threshold;
  sloMetrics.set(id, { service, metric, value, threshold, compliant, timestamp: new Date() });
  res.json({ id, compliant, errorBudget: threshold - value });
});

app.get('/api/slo/report', (req, res) => {
  const metrics = Array.from(sloMetrics.values());
  const compliance = metrics.filter(m => m.compliant).length / metrics.length * 100;
  res.json({ totalMetrics: metrics.length, compliance: `${compliance.toFixed(2)}%`, metrics });
});

// 27.2: Feedback loops
app.post('/api/feedback', (req, res) => {
  const { type, source, content, priority } = req.body;
  feedback.push({ type, source, content, priority, timestamp: new Date() });
  res.json({ status: 'recorded', feedbackCount: feedback.length });
});

app.get('/api/feedback/summary', (req, res) => {
  const summary = {
    total: feedback.length,
    byType: feedback.reduce((acc, f) => { acc[f.type] = (acc[f.type] || 0) + 1; return acc; }, {}),
    highPriority: feedback.filter(f => f.priority === 'high').length
  };
  res.json(summary);
});

// 27.3: Iteration planning
app.post('/api/iteration/plan', (req, res) => {
  const { improvements, features, maintenance } = req.body;
  const id = `iter-${Date.now()}`;
  iterations.push({ id, improvements, features, maintenance, status: 'planned', createdAt: new Date() });
  res.json({ id, status: 'planned' });
});

app.get('/api/iteration/current', (req, res) => {
  const current = iterations[iterations.length - 1];
  res.json(current || { message: 'No iterations planned' });
});

app.listen(3051, () => console.log('Continuous improvement service on :3051'));
