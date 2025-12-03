import express from 'express';
import bodyParser from 'body-parser';
import { logger } from './logger';

const app = express();
app.use(bodyParser.json());

app.post('/chat', async (req, res) => {
  // Placeholder for Copilot chat integration
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt required' });
  // In the real extension, the call would be invoked via vscode.commands.executeCommand
  logger.info({ prompt }, 'Copilot chat requested (local stub)');
  res.json({ reply: `Simulated copilot reply for prompt: ${prompt}` });
});

const port = process.env.PORT ?? 4004;
app.listen(port, () => logger.info({ port }, 'Copilot integration (stub) started'));
