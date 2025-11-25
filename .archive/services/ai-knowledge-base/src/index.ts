import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { KnowledgeBaseEngine } from './knowledge-engine';
import { WebSearchService } from './web-search';
import { logger } from './logger';

const app = express();
const PORT = process.env.KB_PORT || 4010;

app.use(helmet());
app.use(cors());
app.use(express.json());

const knowledgeBase = new KnowledgeBaseEngine();
const webSearch = new WebSearchService();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'ai-knowledge-base', ubuntu: 'active' });
});

// Query knowledge base
app.post('/api/kb/query', async (req, res) => {
  try {
    const { query, includeWeb = false } = req.body;
    const results = await knowledgeBase.query(query, includeWeb);
    res.json({ success: true, results });
  } catch (error: any) {
    logger.error('Query error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add knowledge
app.post('/api/kb/add', async (req, res) => {
  try {
    const { content, metadata } = req.body;
    await knowledgeBase.addKnowledge(content, metadata);
    res.json({ success: true, message: 'Knowledge added to Ubuntu collective' });
  } catch (error: any) {
    logger.error('Add knowledge error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Web search
app.post('/api/kb/search-web', async (req, res) => {
  try {
    const { query } = req.body;
    const results = await webSearch.search(query);
    res.json({ success: true, results });
  } catch (error: any) {
    logger.error('Web search error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  logger.info(`🧠 AI Knowledge Base running on port ${PORT}`);
  logger.info('🌍 Ubuntu: My knowledge becomes our knowledge');
});
