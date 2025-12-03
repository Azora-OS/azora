import express from 'express';
import bodyParser from 'body-parser';
import { FileWatcher } from './fileWatcher';
import { DatabaseIndexer } from './indexer';
import { AIProviderRouter } from './aiRouter';
import { logger } from './logger';
import { apiKeyOrJwtAuth } from './middleware/auth';
import path from 'path';

const app = express();
app.use(bodyParser.json());

const indexer = new DatabaseIndexer();
const ai = new AIProviderRouter();
const workspacePath = process.env.WORKSPACE_PATH ?? path.resolve(process.cwd());
const watcher = new FileWatcher(workspacePath, async (nodes) => {
  for (const n of nodes) {
    (n as any).embedding = await ai.embedText(n.content);
  }
  await indexer.indexNodes(nodes);
});
watcher.start();

app.get('/search', async (req, res) => {
  const q = req.query.q as string | undefined;
  if (!q) return res.status(400).json({ error: 'q required' });
  const results = await indexer.search(q, 10);
  res.json(results);
});

// Accept content nodes for indexing (from VSCode extension or other sources)
app.post('/index', apiKeyOrJwtAuth(true), async (req, res) => {
  const apiKeyHeader = req.headers['x-api-key'] || req.headers['authorization'];
  const indexApiKey = process.env.INDEX_API_KEY;
  if (indexApiKey && (!apiKeyHeader || (apiKeyHeader !== `Bearer ${indexApiKey}` && apiKeyHeader !== indexApiKey))) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const nodes = req.body as any[];
  if (!Array.isArray(nodes) || nodes.length === 0) return res.status(400).json({ error: 'nodes array required' });
  // Validate nodes - each should have id & content at least
  for (const n of nodes) {
    if (!n.id) return res.status(400).json({ error: 'node id required' });
    if (!n.content) return res.status(400).json({ error: 'node content required' });
  }
  try {
    for (const n of nodes) {
      if (!n.embedding) n.embedding = await ai.embedText(n.content);
    }
    await indexer.indexNodes(nodes);
    res.status(200).json({ success: true, count: nodes.length });
  } catch (err) {
    logger.error({ err }, 'Indexing failed');
    res.status(500).json({ error: 'indexing failed' });
  }
});

const port = process.env.PORT ?? 4003;
app.listen(port, () => {
  logger.info({ port }, 'Knowledge Ocean service started');
});
