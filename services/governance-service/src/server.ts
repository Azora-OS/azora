import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { governanceRepository } from './governance-repository';

const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// 🏛️ AZORA GOVERNANCE - CONSTITUTIONAL AI
console.log('🌟 Azora Governance Service - Initializing...');

// 🎯 API ROUTES
app.get('/api/health', async (req: Request, res: Response) => {
    try {
        const proposalStats = await governanceRepository.getProposalStats();
        res.json({
            status: 'healthy',
            service: 'governance-service',
            ubuntu: 'I govern because we decide together',
            stats: proposalStats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: 'Health check failed' });
    }
});

// Create governance proposal
app.post('/api/proposals', async (req: Request, res: Response) => {
    try {
        const { title, description, proposerId, type, quorum, passThreshold, votingEndsAt } = req.body;

        if (!title || !proposerId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const proposal = await governanceRepository.createProposal({
            title,
            description,
            proposerId,
            type,
            quorum,
            passThreshold,
            votingEndsAt: votingEndsAt ? new Date(votingEndsAt) : undefined
        });

        // Log audit
        await governanceRepository.logGovernanceAudit({
            action: 'PROPOSAL_CREATED',
            entityType: 'PROPOSAL',
            entityId: proposal.id,
            userId: proposerId,
            details: { title, type }
        });

        res.status(201).json({
            success: true,
            message: 'Proposal created successfully',
            data: proposal
        });
    } catch (error) {
        console.error('Error creating proposal:', error);
        res.status(500).json({ error: 'Failed to create proposal' });
    }
});

// Get all proposals
app.get('/api/proposals', async (req: Request, res: Response) => {
    try {
        const { status, type } = req.query;
        const filters: any = {};
        if (status) filters.status = status as string;
        if (type) filters.type = type as string;

        const proposals = await governanceRepository.getAllProposals(filters);

        res.json({
            success: true,
            data: proposals
        });
    } catch (error) {
        console.error('Error getting proposals:', error);
        res.status(500).json({ error: 'Failed to get proposals' });
    }
});

// Get single proposal
app.get('/api/proposals/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const proposal = await governanceRepository.getProposal(id);

        if (!proposal) {
            return res.status(404).json({ error: 'Proposal not found' });
        }

        res.json({
            success: true,
            data: proposal
        });
    } catch (error) {
        console.error('Error getting proposal:', error);
        res.status(500).json({ error: 'Failed to get proposal' });
    }
});

// Vote on proposal
app.post('/api/proposals/:id/vote', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId, vote, reason } = req.body;

        if (!userId || !vote) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if proposal exists
        const proposal = await governanceRepository.getProposal(id);
        if (!proposal) {
            return res.status(404).json({ error: 'Proposal not found' });
        }

        if (proposal.status !== 'ACTIVE') {
            return res.status(400).json({ error: 'Proposal is not active' });
        }

        // Check if already voted
        const existingVote = await governanceRepository.getUserVoteOnProposal(id, userId);
        if (existingVote) {
            return res.status(400).json({ error: 'User already voted' });
        }

        // Cast vote
        const voteRecord = await governanceRepository.castVote({
            proposalId: id,
            userId,
            vote,
            reason
        });

        // Update proposal counts
        const newVotesFor = vote === 'FOR' ? proposal.votesFor + 1 : proposal.votesFor;
        const newVotesAgainst = vote === 'AGAINST' ? proposal.votesAgainst + 1 : proposal.votesAgainst;

        await governanceRepository.updateProposalVoteCounts(id, newVotesFor, newVotesAgainst);

        // Log audit
        await governanceRepository.logGovernanceAudit({
            action: 'VOTE_CAST',
            entityType: 'VOTE',
            entityId: voteRecord.id,
            userId,
            details: { proposalId: id, vote }
        });

        res.json({
            success: true,
            message: 'Vote recorded successfully',
            data: voteRecord
        });
    } catch (error) {
        console.error('Error recording vote:', error);
        res.status(500).json({ error: 'Failed to record vote' });
    }
});

// Create policy (admin/system)
app.post('/api/policies', async (req: Request, res: Response) => {
    try {
        const { title, description, category, content, createdBy } = req.body;

        const policy = await governanceRepository.createPolicy({
            title,
            description,
            category,
            content,
            createdBy
        });

        // Log audit
        await governanceRepository.logGovernanceAudit({
            action: 'POLICY_CREATED',
            entityType: 'POLICY',
            entityId: policy.id,
            userId: createdBy,
            details: { title, category }
        });

        res.status(201).json({
            success: true,
            data: policy
        });
    } catch (error) {
        console.error('Error creating policy:', error);
        res.status(500).json({ error: 'Failed to create policy' });
    }
});

const PORT = process.env.PORT || 3026;
app.listen(PORT, () => {
    console.log('🌟 Azora Governance Service running on port', PORT);
    console.log('🏛️ Database-backed constitutional governance enabled');
});

export default app;
