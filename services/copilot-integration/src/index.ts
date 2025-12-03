import express from 'express';
import bodyParser from 'body-parser';
import { logger } from './logger';
import { AuthFlow } from './authFlow';

const app = express();
app.use(bodyParser.json());

const auth = new AuthFlow();

app.post('/auth/consent', async (req, res) => {
  const { userId, service, scopes } = req.body;
  if (!userId || !service || !scopes) {
    return res.status(400).json({ error: 'userId, service, and scopes required' });
  }
  auth.grantConsent(userId, service, scopes);
  res.json({ success: true });
});

app.post('/auth/token', async (req, res) => {
  const { userId, scopes } = req.body;
  if (!userId || !scopes) {
    return res.status(400).json({ error: 'userId and scopes required' });
  }
  const token = await auth.createToken(userId, scopes);
  res.json({ token });
});

app.post('/auth/validate', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'token required' });
  const authToken = await auth.validateToken(token);
  if (!authToken) return res.status(401).json({ error: 'Invalid token' });
  res.json(authToken);
});

app.post('/chat', async (req, res) => {
  const { prompt, token } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt required' });
  
  if (token) {
    const authToken = await auth.validateToken(token);
    if (!authToken) return res.status(401).json({ error: 'Invalid token' });
  }
  
  logger.info({ prompt }, 'Copilot chat requested');
  res.json({ reply: `Copilot reply for: ${prompt}` });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'copilot-integration' });
});

const port = process.env.PORT ?? 4004;
app.listen(port, () => logger.info({ port }, 'Copilot integration started'));

