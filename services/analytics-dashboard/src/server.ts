import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { logger } from './utils/logger';
import { constitutionalAggregator } from './constitutional-aggregator';

const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
}));
app.use(compression());
app.use(express.json());

// 📊 AZORA ANALYTICS & CONSTITUTIONAL DASHBOARD
console.log('🌟 Azora Analytics Dashboard - Initializing...');

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        service: 'analytics-dashboard',
        role: 'aggregator',
        timestamp: new Date().toISOString()
    });
});

// 🛡️ CONSTITUTIONAL METRICS ENDPOINT
app.get('/api/constitutional/metrics', async (req: Request, res: Response) => {
    try {
        const metrics = await constitutionalAggregator.getMetrics();
        res.json({
            success: true,
            data: metrics
        });
    } catch (error) {
        logger.error('Failed to fetch constitutional metrics', error);
        res.status(500).json({ error: 'Failed to fetch metrics' });
    }
});

// Legacy Analytics Endpoints (Mock Data for now, to be replaced later)
app.get('/api/metrics', (req: Request, res: Response) => {
    res.json({
        success: true,
        data: {
            users: { total: 12500, active: 8750 },
            revenue: { total: 2500000, monthly: 325000 }
        }
    });
});

const PORT = process.env.PORT || 3033;
app.listen(PORT, () => {
    console.log('🌟 Azora Analytics Dashboard running on port', PORT);
    console.log('🛡️ Constitutional Aggregator active');
});

export default app;
