import express from 'express';
import bodyParser from 'body-parser';
import { AgentRuntime } from './runtime';
import { HealthService } from '../../packages/shared/health/src/index';
import { getTask } from './persistence';
import { logger } from './logger';

const app = express();
app.use(bodyParser.json());
app.use('/ui', express.static(path.resolve(process.cwd(), 'static')));

const runtime = new AgentRuntime();
const health = new HealthService();

health.registerHealthCheck('agent-execution', async () => ({
  serviceId: 'agent-execution',
  status: 'healthy',
  lastCheckedAt: new Date().toISOString()
}));

app.post('/execute', async (req, res) => {
  try {
    const payload = req.body;
    const result = await runtime.executeTask(payload);
    res.json(result);
  } catch (err: any) {
    logger.error({ err }, 'Execute error');
    res.status(500).json({ error: err.message });
  }
});

app.get('/task/:id', async (req, res) => {
  const id = req.params.id;
  const task = await getTask(id);
  res.json(task);
});

app.get('/tasks', async (req, res) => {
  try {
    // For demo: expose in-memory tasks
    const tasks = [] as any[];
    const store = (require('./persistence') as any).inMemoryTaskStore;
    for (const t of store.values()) tasks.push(t);
    res.json({ tasks });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/task/:id/cancel', async (req, res) => {
  const id = req.params.id;
  try {
    await runtime.cancelTask(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/task/:id/pause', async (req, res) => {
  const id = req.params.id;
  try {
    await runtime.pauseTask(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/task/:id/resume', async (req, res) => {
  const id = req.params.id;
  try {
    await runtime.resumeTask(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT ?? 4002;
app.listen(port, () => {
  logger.info({ port }, 'Agent Execution service started');
});

app.get('/health', async (req, res) => {
  const checks = await health.runChecks();
  const unhealthy = checks.filter(c => c.status !== 'healthy');
  res.status(unhealthy.length ? 503 : 200).json({ checks });
});

app.get('/executions', async (req, res) => {
  try {
    const ids = runtime.getActiveExecutions();
    res.json({ active: ids });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/agents/:id/status', async (req, res) => {
  const id = req.params.id;
  try {
    const status = await runtime.getAgentStatus(id);
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
