/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { DigitalLibrarySystem } from './digital-library-system';

const app = express();
const PORT = process.env.PORT || 3022;

const library = new DigitalLibrarySystem({
  elasticsearchUrl: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  cacheEnabled: true,
});

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'azora-library' }));

// Search
app.get('/api/search', async (req, res) => {
  try {
    const { query, type, page = 1, limit = 20 } = req.query;
    const results = await library.search(query as string, type as any, Number(page), Number(limit));
    res.json({ success: true, results });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Books
app.get('/api/books/:bookId', async (req, res) => {
  try {
    const book = await library.getBook(req.params.bookId);
    res.json({ success: true, book });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Reading progress
app.post('/api/reading/start', async (req, res) => {
  try {
    const { studentNumber, bookId } = req.body;
    await library.startReading(studentNumber, bookId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/reading/progress', async (req, res) => {
  try {
    const { studentNumber, bookId, page, percentage } = req.body;
    await library.updateProgress(studentNumber, bookId, page, percentage);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Citations
app.post('/api/citations/generate', async (req, res) => {
  try {
    const { bookId, style } = req.body;
    const citation = await library.generateCitation(bookId, style);
    res.json({ success: true, citation });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Recommendations
app.get('/api/recommendations/:studentNumber', async (req, res) => {
  try {
    const recommendations = await library.getRecommendations(req.params.studentNumber);
    res.json({ success: true, recommendations });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => console.log(`📚 Digital Library on port ${PORT}`));
export default app;
