import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(helmet());
app.use(cors());
app.use(express.json());

// 🪙 UBUNTU TOKENOMICS
console.log('🪙 Ubuntu Tokenomics System - Initializing...');

// Health Check
app.get('/health', async (req, res) => {
    try {
        const tokenCount = await prisma.token.count();
        res.json({
            status: 'healthy',
            service: 'ubuntu-tokenomics',
            tokens: tokenCount,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ status: 'unhealthy', error: 'Database connection failed' });
    }
});

// Get Wallet Balance
app.get('/api/wallet/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const wallets = await prisma.wallet.findMany({
            where: { userId },
            include: { token: true }
        });
        res.json({ success: true, data: wallets });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch wallet' });
    }
});

const PORT = process.env.PORT || 3035;
app.listen(PORT, () => {
    console.log(`🪙 Tokenomics Service running on port ${PORT}`);
});
