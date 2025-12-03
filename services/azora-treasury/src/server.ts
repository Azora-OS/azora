import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { treasuryService } from './treasury-service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3028;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'azora-treasury', timestamp: new Date().toISOString() });
});

// Portfolio
app.get('/api/portfolio', async (req, res) => {
    try {
        const portfolio = await treasuryService.getPortfolio();
        const totalValue = await treasuryService.getTotalValueUsd();
        res.json({ success: true, portfolio, totalValueUsd: totalValue });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Asset Details
app.get('/api/assets/:symbol', async (req, res) => {
    try {
        const portfolio = await treasuryService.getPortfolio();
        const asset = portfolio.find(a => a.symbol === req.params.symbol.toUpperCase());
        if (!asset) return res.status(404).json({ success: false, error: 'Asset not found' });
        res.json({ success: true, asset });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🏦 Azora Treasury Service running on port ${PORT}`);
});
