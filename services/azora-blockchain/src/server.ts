import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { blockchainService } from './blockchain-service';
import { startEventListeners, stopEventListeners } from './event-listeners';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3010; // azora-blockchain port

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'azora-blockchain', timestamp: new Date().toISOString() });
});

// Blockchain Info
app.get('/api/block-number', async (req, res) => {
    try {
        const blockNumber = await blockchainService.getBlockNumber();
        res.json({ success: true, blockNumber });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/balance/:address', async (req, res) => {
    try {
        const balance = await blockchainService.getBalance(req.params.address);
        res.json({ success: true, address: req.params.address, balance: balance + ' ETH' });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Transaction Endpoint (Protected in production)
app.post('/api/transaction', async (req, res) => {
    try {
        const { to, value, data } = req.body;
        if (!to) return res.status(400).json({ success: false, error: 'Target address (to) is required' });

        const receipt = await blockchainService.sendTransaction({ to, value, data });
        res.json({ success: true, receipt });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Gas Price
app.get('/api/gas-price', async (req, res) => {
    try {
        const gasPrice = await blockchainService.getGasPrice();
        res.json({ success: true, gasPrice: gasPrice + ' gwei' });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`⛓️ Azora Blockchain Service running on port ${PORT}`);
        // Start event listeners for AZR and NFT contract events
        startEventListeners().catch(err => console.error('Failed to start event listeners:', err));
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down Azora Blockchain Service...');
    await stopEventListeners();
    await prisma.$disconnect();
    process.exit(0);
});

// Events query endpoint
app.get('/api/events', async (req, res) => {
    try {
        const limit = parseInt((req.query.limit as string) || '50');
        const events = await prisma.event.findMany({ orderBy: { createdAt: 'desc' }, take: limit });
        res.json({ success: true, events });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});
