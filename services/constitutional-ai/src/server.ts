import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { constitutionalEngine } from './constitutional-engine';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3032;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'constitutional-ai', timestamp: new Date().toISOString() });
});

// Validate Action
app.post('/api/validate', async (req, res) => {
    try {
        const { action, context } = req.body;
        const validation = await constitutionalEngine.validateAction(action, context || '');
        res.json({ success: true, validation });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Check Bias
app.post('/api/bias-check', async (req, res) => {
    try {
        const { content } = req.body;
        const report = await constitutionalEngine.checkBias(content);
        res.json({ success: true, report });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Self critique endpoint
app.post('/api/critique', async (req, res) => {
    try {
        const { response } = req.body;
        const result = await constitutionalEngine.selfCritique(response);
        res.json({ success: true, result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`⚖️ Constitutional AI Service running on port ${PORT}`);
});
