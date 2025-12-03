import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { courtRepository } from './court-repository';

const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
}));
app.use(compression());
app.use(express.json());

// ⚖️ CONSTITUTIONAL COURT SERVICE
console.log('⚖️ Azora Constitutional Court - Initializing...');

// Health Check
app.get('/api/health', async (req: Request, res: Response) => {
    try {
        const stats = await courtRepository.getStats();
        res.json({
            status: 'healthy',
            service: 'constitutional-court-service',
            motto: 'Justice for All',
            stats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: 'Health check failed' });
    }
});

// Create a Case
app.post('/api/cases', async (req: Request, res: Response) => {
    try {
        const { title, description, plaintiffId, defendantId, type } = req.body;
        const newCase = await courtRepository.createCase({
            title,
            description,
            plaintiffId,
            defendantId,
            type
        });
        res.status(201).json({ success: true, data: newCase });
    } catch (error) {
        console.error('Error creating case:', error);
        res.status(500).json({ error: 'Failed to create case' });
    }
});

// Get all cases
app.get('/api/cases', async (req: Request, res: Response) => {
    try {
        const cases = await courtRepository.getAllCases();
        res.json({ success: true, data: cases });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cases' });
    }
});

// Get specific case
app.get('/api/cases/:id', async (req: Request, res: Response) => {
    try {
        const caseData = await courtRepository.getCase(req.params.id);
        if (!caseData) return res.status(404).json({ error: 'Case not found' });
        res.json({ success: true, data: caseData });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch case' });
    }
});

// Issue a Ruling
app.post('/api/rulings', async (req: Request, res: Response) => {
    try {
        const { caseId, justiceId, verdict, reasoning } = req.body;
        const ruling = await courtRepository.issueRuling({
            caseId,
            justiceId,
            verdict,
            reasoning
        });
        res.status(201).json({ success: true, data: ruling });
    } catch (error) {
        console.error('Error issuing ruling:', error);
        res.status(500).json({ error: 'Failed to issue ruling' });
    }
});

const PORT = process.env.PORT || 3034;
app.listen(PORT, () => {
    console.log('⚖️ Constitutional Court in session on port', PORT);
});

export default app;
