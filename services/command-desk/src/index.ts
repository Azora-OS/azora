import express from 'express';
import bodyParser from 'body-parser';
import { logger } from './logger';

const app = express();
app.use(bodyParser.json());

interface TaskMessage {
  id: string;
  type: 'task' | 'status' | 'result';
  content: any;
  timestamp: string;
}

const messages: TaskMessage[] = [];

app.post('/messages', (req, res) => {
  const msg: TaskMessage = {
    id: req.body.id || Date.now().toString(),
    type: req.body.type || 'task',
    content: req.body.content,
    timestamp: new Date().toISOString()
  };
  messages.push(msg);
  logger.info({ msg }, 'Message received');
  res.json({ success: true, id: msg.id });
});

app.get('/messages', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  res.json({ messages: messages.slice(-limit) });
});

app.get('/messages/:id', (req, res) => {
  const msg = messages.find(m => m.id === req.params.id);
  if (!msg) return res.status(404).json({ error: 'Not found' });
  res.json(msg);
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'command-desk' });
});

const port = process.env.PORT ?? 4005;
app.listen(port, () => logger.info({ port }, 'Command Desk started'));
