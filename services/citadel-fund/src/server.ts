import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { citadelService } from './citadel-service';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3030;

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
        service: 'citadel-fund', 
        timestamp: new Date().toISOString(),
        ubuntu: 'I serve because we prosper together'
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
        service: 'citadel-fund',
        ubuntu: '10% of all revenue fuels community prosperity'
    });
});

// Revenue Collection
app.post('/api/revenue/collect', async (req, res) => {
    try {
        const { amount, source, category, txHash } = req.body;
        await citadelService.collectRevenue(amount, source, category, txHash);
        res.json({ success: true, message: 'Revenue collected and allocated' });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Scholarship Management
app.post('/api/scholarships/grant', async (req, res) => {
    try {
        const { studentId, amount, reason } = req.body;
        const txHash = await citadelService.grantScholarship(studentId, amount, reason);
        res.json({ success: true, txHash, message: 'Scholarship granted' });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Public Goods Funding
app.post('/api/public-goods/fund', async (req, res) => {
    try {
        const { projectId, amount, description } = req.body;
        const txHash = await citadelService.fundPublicGoods(projectId, amount, description);
        res.json({ success: true, txHash, message: 'Public goods funded' });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Community Grants
app.post('/api/grants/award', async (req, res) => {
    try {
        const { recipientId, amount, purpose } = req.body;
        const txHash = await citadelService.grantCommunityGrant(recipientId, amount, purpose);
        res.json({ success: true, txHash, message: 'Community grant awarded' });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Transparency Report
app.get('/api/transparency', async (req, res) => {
    try {
        const report = await citadelService.getTransparencyReport();
        res.json({ success: true, report });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Fund Balances
app.get('/api/balances', async (req, res) => {
    try {
        const balances = await citadelService.getFundBalances();
        res.json({ success: true, balances });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// AZR Balance
app.get('/api/balance', async (req, res) => {
    try {
        const balance = await citadelService.getAZRBalance();
        res.json({ success: true, balance });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Revenue History
app.get('/api/revenue/history', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 50;
        const history = await citadelService.getRevenueHistory(limit);
        res.json({ success: true, history });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Allocation History
app.get('/api/allocations/history', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 50;
        const history = await citadelService.getAllocationHistory(limit);
        res.json({ success: true, history });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Governance - Proposals
app.post('/api/governance/propose', async (req, res) => {
    try {
        const proposal = await citadelService.proposeAllocation(req.body);
        res.json({ success: true, proposal });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/governance/proposals', async (req, res) => {
    try {
        const proposals = await citadelService.getProposals();
        res.json({ success: true, proposals });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/governance/proposals/:id', async (req, res) => {
    try {
        const proposal = await citadelService.getProposal(req.params.id);
        if (!proposal) {
            return res.status(404).json({ success: false, error: 'Proposal not found' });
        }
        res.json({ success: true, proposal });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/governance/vote', async (req, res) => {
    try {
        const { proposalId, vote, voterAddress } = req.body;
        const proposal = await citadelService.voteOnProposal(proposalId, vote, voterAddress);
        res.json({ success: true, proposal });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/governance/execute', async (req, res) => {
    try {
        const { proposalId } = req.body;
        const txHash = await citadelService.executeProposal(proposalId);
        res.json({ success: true, txHash, message: 'Proposal executed' });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Status endpoint
app.get('/api/status', (req, res) => {
    res.json({
        service: 'citadel-fund',
        status: 'operational',
        ubuntu: 'Ubuntu fund management active',
        features: {
            revenueCollection: '✅ Active',
            scholarshipGrants: '✅ Active',
            publicGoodsFunding: '✅ Active',
            communityGrants: '✅ Active',
            governance: '✅ Active',
            transparency: '✅ Active'
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
        console.log(`🏰 CitadelFund Service running on port ${PORT}`);
        console.log('⚡ Ubuntu: "I serve because we prosper together!"');
    });
}
