import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { miningEngine } from './mining-engine';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3031;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Ubuntu Middleware - Rate Limiting
const rateLimit = require('express-rate-limit');
const ubuntuLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
    message: { 
        error: 'Ubuntu rate limit exceeded', 
        ubuntu: 'Please slow down for community harmony' 
    }
});
app.use(ubuntuLimiter);

// Health Check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'proof-of-value', 
        timestamp: new Date().toISOString(),
        ubuntu: 'I value because we create together'
    });
});

// Ubuntu Philosophy Endpoint
app.get('/api/ubuntu/philosophy', (req, res) => {
    res.json({
        philosophy: 'Ngiyakwazi ngoba sikwazi - I can because we can',
        principles: [
            'My success enables your success',
            'My knowledge becomes our knowledge',
            'My work strengthens our foundation',
            'My security ensures our freedom'
        ],
        service: 'proof-of-value',
        ubuntu: 'Ubuntu value creation through knowledge sharing'
    });
});

// Submit Value Proof
app.post('/api/proof/submit', async (req, res) => {
    try {
        const { userId, type, valueData } = req.body;
        const proof = await miningEngine.submitValueProof(userId, type, valueData);
        res.json({ success: true, proof });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Verify and Mint Rewards
app.post('/api/proof/verify', async (req, res) => {
    try {
        const { proofId } = req.body;
        const txHash = await miningEngine.verifyAndMint(proofId);
        res.json({ success: true, txHash, message: 'Proof verified and reward minted' });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Knowledge Mining (Legacy endpoint for compatibility)
app.post('/api/mine/knowledge', async (req, res) => {
    try {
        const { userId, content } = req.body;
        const proof = await miningEngine.submitValueProof(userId, 'knowledge', content);
        res.json({ success: true, proof });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Code Mining (Legacy endpoint for compatibility)
app.post('/api/mine/code', async (req, res) => {
    try {
        const { userId, commit } = req.body;
        const proof = await miningEngine.submitValueProof(userId, 'code', commit);
        res.json({ success: true, proof });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Community Mining (Legacy endpoint for compatibility)
app.post('/api/mine/community', async (req, res) => {
    try {
        const { userId, action } = req.body;
        const proof = await miningEngine.submitValueProof(userId, 'community', action);
        res.json({ success: true, proof });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Mining Statistics
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await miningEngine.getMiningStats();
        res.json({ success: true, stats });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get User Proofs
app.get('/api/user/:userId/proofs', async (req, res) => {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit as string) || 50;
        const proofs = await miningEngine.getUserProofs(userId, limit);
        res.json({ success: true, proofs });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get User Statistics
app.get('/api/user/:userId/stats', async (req, res) => {
    try {
        const { userId } = req.params;
        const stats = await miningEngine.getUserStats(userId);
        if (!stats) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.json({ success: true, stats });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Verification (Legacy endpoint)
app.post('/api/verify', async (req, res) => {
    try {
        const { proof } = req.body;
        const isValid = await miningEngine.verifyProofOfKnowledge(proof);
        res.json({ success: true, isValid });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Status endpoint
app.get('/api/status', (req, res) => {
    res.json({
        service: 'proof-of-value',
        status: 'operational',
        ubuntu: 'Ubuntu value mining active',
        features: {
            knowledgeMining: '✅ Active',
            codeMining: '✅ Active',
            communityMining: '✅ Active',
            proofVerification: '✅ Active',
            rewardMinting: '✅ Active',
            ubuntuPrinciples: '✅ Active'
        }
    });
});

// Ubuntu Error Handling
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Ubuntu Service Error:', error);
    res.status(500).json({
        error: 'Ubuntu service error',
        ubuntu: 'We handle errors with Ubuntu grace',
        timestamp: new Date().toISOString()
    });
});

// Start Ubuntu Service
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`⛏️ Proof-of-Value Service running on port ${PORT}`);
        console.log('⚡ Ubuntu: "I value because we create together!"');
    });
}
