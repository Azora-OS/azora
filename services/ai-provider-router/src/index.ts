import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import { logger } from './logger';

const app = express();
app.use(bodyParser.json());

// Simple OpenAI compatible route - expects OPENAI_API_KEY env
app.post('/v1/chat/completions', async (req, res) => {
  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY not set' });
  try {
    const resp = await axios.post('https://api.openai.com/v1/chat/completions', req.body, {
      headers: { Authorization: `Bearer ${OPENAI_KEY}` }
    });
    res.json(resp.data);
  } catch (err: any) {
    logger.error({ err }, 'openai error');
    res.status(500).json({ error: err.message });
  }
});

// Support legacy endpoint /embed and /v1/embeddings to match OpenAI
app.post('/embed', async (req, res) => {
  const text = req.body.text as string;
  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY) {
    // fallback: pseudo-embedding for dev/CI
    const embedding = pseudoEmbedding(text);
    return res.json({ embedding });
  }
  try {
    const resp = await axios.post('https://api.openai.com/v1/embeddings', { input: text, model: 'text-embedding-3-small' }, {
      headers: { Authorization: `Bearer ${OPENAI_KEY}` }
    });
    res.json({ embedding: resp.data.data[0].embedding });
  } catch (err: any) {
    logger.error({ err }, 'embed error');
    res.status(500).json({ error: err.message });
  }
});

app.post('/v1/embeddings', async (req, res) => {
  const text = req.body.input || req.body.text || req.body[0] || req.body;
  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY) {
    const textInput = Array.isArray(text) ? text : [text];
    const result = textInput.map(t => ({embedding: pseudoEmbedding(t)}));
    return res.json({ data: result });
  }
  try {
    const body = Array.isArray(text) ? { input: text, model: 'text-embedding-3-small' } : { input: text, model: 'text-embedding-3-small' };
    const resp = await axios.post('https://api.openai.com/v1/embeddings', body, {
      headers: { Authorization: `Bearer ${OPENAI_KEY}` }
    });
    res.json(resp.data);
  } catch (err: any) {
    logger.error({ err }, 'embed error');
    res.status(500).json({ error: err.message });
  }
});

function pseudoEmbedding(text: string) {
  const vec = new Array(1536).fill(0).map((_, i) => (text.charCodeAt(i % text.length) % 100) / 100);
  return vec;
}

const port = process.env.PORT ?? 4010;
app.listen(port, () => logger.info({ port }, 'AI Provider Router started'));
