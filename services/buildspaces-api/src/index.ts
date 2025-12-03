import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

interface BuildJob {
  id: string;
  projectId: string;
  status: 'pending' | 'building' | 'success' | 'failed';
  artifacts: string[];
  createdAt: string;
}

const jobs = new Map<string, BuildJob>();

app.post('/build', async (req, res) => {
  const { projectId, config } = req.body;
  const id = Date.now().toString();
  
  const job: BuildJob = {
    id,
    projectId,
    status: 'pending',
    artifacts: [],
    createdAt: new Date().toISOString()
  };
  
  jobs.set(id, job);
  
  setTimeout(() => {
    job.status = 'building';
    setTimeout(() => {
      job.status = 'success';
      job.artifacts = [`/artifacts/${id}/bundle.js`];
    }, 5000);
  }, 1000);
  
  res.json({ jobId: id });
});

app.get('/build/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Not found' });
  res.json(job);
});

app.get('/artifacts/:jobId/:file', (req, res) => {
  res.json({ url: `/download/${req.params.jobId}/${req.params.file}` });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'buildspaces-api' });
});

const port = process.env.PORT ?? 4006;
app.listen(port, () => console.log(`BuildSpaces API on ${port}`));
