import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { dbManager, cacheManager } from './db-manager';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3036;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'azora-database-layer', timestamp: new Date().toISOString() });
});

// Execute Query (Protected - Internal Use Only)
app.post('/api/db/query', async (req, res) => {
    try {
        const { text, params } = req.body;
        const result = await dbManager.query(text, params);
        res.json({ success: true, rows: result.rows, rowCount: result.rowCount });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Cache Operations
app.get('/api/cache/:key', async (req, res) => {
    try {
        const value = await cacheManager.get(req.params.key);
        res.json({ success: true, value });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/cache', async (req, res) => {
    try {
        const { key, value, ttl } = req.body;
        await cacheManager.set(key, value, ttl);
        res.json({ success: true, message: 'Cached successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`💾 Azora Database Layer running on port ${PORT}`);
});
