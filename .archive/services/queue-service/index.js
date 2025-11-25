const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3047;
const jobs = [];

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'queue-service', jobs: jobs.length });
});

app.post('/api/jobs', (req, res) => {
  const { queue, data } = req.body;
  const job = { id: Date.now().toString(), queue, data: JSON.stringify(data), status: 'pending', attempts: 0, createdAt: new Date() };
  jobs.push(job);
  res.json({ success: true, job });
});

app.get('/api/jobs/:queue', (req, res) => {
  const queueJobs = jobs.filter(j => j.queue === req.params.queue);
  res.json({ success: true, jobs: queueJobs });
});

app.patch('/api/jobs/:id/process', (req, res) => {
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) return res.status(404).json({ error: 'Not found' });
  job.status = 'processing';
  job.attempts++;
  res.json({ success: true, job });
});

app.patch('/api/jobs/:id/complete', (req, res) => {
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) return res.status(404).json({ error: 'Not found' });
  job.status = 'completed';
  job.processedAt = new Date();
  res.json({ success: true, job });
});

app.listen(port, () => console.log(`Queue Service on port ${port}`));
module.exports = app;
