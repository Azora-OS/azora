const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4018;

// Ubuntu Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
  credentials: true
}));
app.use(express.json());

// Ubuntu Rate Limiting
const ubuntuLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Ubuntu rate limit exceeded', ubuntu: 'Please slow down for community harmony' }
});
app.use(ubuntuLimiter);

// Ubuntu Health Check
app.get('/health', (req, res) => {
  res.json({
    service: 'azora-governance',
    status: 'healthy',
    ubuntu: 'I govern because we decide together',
    timestamp: new Date().toISOString(),
    port: PORT
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
    service: 'azora-governance',
    ubuntu: 'Ubuntu democratic governance'
  });
});

// Governance State
let proposals = [];
let votes = [];
let delegates = [];
let constitutionalAmendments = [];
let governanceParameters = {};

// Initialize Governance
const initializeGovernance = () => {
  governanceParameters = {
    quorum: 10, // Minimum 10% participation
    votingPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days
    executionDelay: 2 * 24 * 60 * 60 * 1000, // 2 days
    proposalThreshold: 100, // 100 AZR to propose
    delegateThreshold: 1000, // 1000 AZR to delegate
    ubuntu: 'Ubuntu governance parameters'
  };
};

initializeGovernance();

// Proposal Types
const ProposalTypes = {
  CONSTITUTIONAL_AMENDMENT: 'constitutional_amendment',
  PARAMETER_CHANGE: 'parameter_change',
  FUND_ALLOCATION: 'fund_allocation',
  POLICY_CHANGE: 'policy_change',
  UPGRADE: 'upgrade'
};

// Proposal Status
const ProposalStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
  PASSED: 'passed',
  REJECTED: 'rejected',
  EXECUTED: 'executed',
  EXPIRED: 'expired'
};

// Create Proposal
app.post('/api/proposals', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      type, 
      proposerId, 
      targetAddress, 
      value, 
      calldata,
      votingPeriod,
      ubuntuImpact = 'medium'
    } = req.body;
    
    const proposal = {
      id: 'proposal-' + Date.now(),
      title,
      description,
      type,
      proposerId,
      targetAddress,
      value: value || 0,
      calldata: calldata || '',
      votingPeriod: votingPeriod || governanceParameters.votingPeriod,
      ubuntuImpact,
      status: ProposalStatus.PENDING,
      createdAt: new Date().toISOString(),
      votingStartsAt: null,
      votingEndsAt: null,
      forVotes: 0,
      againstVotes: 0,
      abstainVotes: 0,
      totalVotes: 0,
      executed: false,
      ubuntu: 'Ubuntu governance proposal'
    };
    
    proposals.push(proposal);
    
    console.log(`📋 Proposal Created: ${title} by ${proposerId}`);
    
    res.json({ 
      success: true, 
      proposal: {
        id: proposal.id,
        title,
        type,
        status: proposal.status,
        createdAt: proposal.createdAt,
        ubuntuImpact: proposal.ubuntuImpact
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Activate Proposal
app.post('/api/proposals/:proposalId/activate', async (req, res) => {
  try {
    const { proposalId } = req.params;
    
    const proposal = proposals.find(p => p.id === proposalId);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    
    if (proposal.status !== ProposalStatus.PENDING) {
      return res.status(400).json({ error: 'Proposal cannot be activated' });
    }
    
    proposal.status = ProposalStatus.ACTIVE;
    proposal.votingStartsAt = new Date().toISOString();
    proposal.votingEndsAt = new Date(Date.now() + proposal.votingPeriod).toISOString();
    
    console.log(`🗳️ Proposal Activated: ${proposal.title} - Voting started`);
    
    res.json({ 
      success: true, 
      proposal: {
        id: proposal.id,
        status: proposal.status,
        votingStartsAt: proposal.votingStartsAt,
        votingEndsAt: proposal.votingEndsAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vote on Proposal
app.post('/api/proposals/:proposalId/vote', async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { voterId, support, reason, votingPower = 1 } = req.body;
    
    const proposal = proposals.find(p => p.id === proposalId);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    
    if (proposal.status !== ProposalStatus.ACTIVE) {
      return res.status(400).json({ error: 'Proposal is not active for voting' });
    }
    
    if (new Date() > new Date(proposal.votingEndsAt)) {
      return res.status(400).json({ error: 'Voting period has ended' });
    }
    
    // Check if already voted
    const existingVote = votes.find(v => v.proposalId === proposalId && v.voterId === voterId);
    if (existingVote) {
      return res.status(400).json({ error: 'Already voted on this proposal' });
    }
    
    const vote = {
      id: 'vote-' + Date.now(),
      proposalId,
      voterId,
      support,
      reason,
      votingPower,
      timestamp: new Date().toISOString(),
      ubuntu: 'Ubuntu democratic vote'
    };
    
    votes.push(vote);
    
    // Update proposal vote counts
    if (support) {
      proposal.forVotes += votingPower;
    } else {
      proposal.againstVotes += votingPower;
    }
    proposal.totalVotes += votingPower;
    
    console.log(`🗳️ Vote Cast: ${voterId} ${support ? 'for' : 'against'} proposal ${proposal.title}`);
    
    res.json({ 
      success: true, 
      vote: {
        id: vote.id,
        support,
        votingPower,
        timestamp: vote.timestamp
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Proposals
app.get('/api/proposals', async (req, res) => {
  try {
    const status = req.query.status;
    const type = req.query.type;
    const proposerId = req.query.proposerId;
    
    let filteredProposals = proposals;
    
    if (status) {
      filteredProposals = filteredProposals.filter(p => p.status === status);
    }
    
    if (type) {
      filteredProposals = filteredProposals.filter(p => p.type === type);
    }
    
    if (proposerId) {
      filteredProposals = filteredProposals.filter(p => p.proposerId === proposerId);
    }
    
    const enrichedProposals = filteredProposals.map(proposal => {
      const voteCount = votes.filter(v => v.proposalId === proposal.id).length;
      return {
        ...proposal,
        voteCount,
        quorumReached: proposal.totalVotes >= governanceParameters.quorum
      };
    });
    
    res.json({ 
      proposals: enrichedProposals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Proposal Details
app.get('/api/proposals/:proposalId', async (req, res) => {
  try {
    const { proposalId } = req.params;
    
    const proposal = proposals.find(p => p.id === proposalId);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    
    const proposalVotes = votes.filter(v => v.proposalId === proposalId);
    
    res.json({
      proposal: {
        ...proposal,
        quorumReached: proposal.totalVotes >= governanceParameters.quorum
      },
      votes: proposalVotes.map(v => ({
        id: v.id,
        voterId: v.voterId,
        support: v.support,
        votingPower: v.votingPower,
        reason: v.reason,
        timestamp: v.timestamp
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delegate Voting Power
app.post('/api/delegates', async (req, res) => {
  try {
    const { delegatorId, delegateId, votingPower } = req.body;
    
    // Check if delegate exists or create new one
    let delegate = delegates.find(d => d.userId === delegateId);
    if (!delegate) {
      delegate = {
        id: 'delegate-' + Date.now(),
        userId: delegateId,
        totalDelegatedPower: 0,
        delegates: [],
        createdAt: new Date().toISOString(),
        ubuntu: 'Ubuntu voting delegate'
      };
      delegates.push(delegate);
    }
    
    // Add delegation
    const delegation = {
      id: 'delegation-' + Date.now(),
      delegatorId,
      delegateId,
      votingPower,
      timestamp: new Date().toISOString()
    };
    
    delegate.delegates.push(delegation);
    delegate.totalDelegatedPower += votingPower;
    
    console.log(`🤝 Delegation: ${delegatorId} delegated ${votingPower} votes to ${delegateId}`);
    
    res.json({ 
      success: true, 
      delegation: {
        id: delegation.id,
        delegatorId,
        delegateId,
        votingPower,
        timestamp: delegation.timestamp
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Delegates
app.get('/api/delegates', async (req, res) => {
  try {
    const enrichedDelegates = delegates.map(delegate => {
      const delegateVotes = votes.filter(v => v.voterId === delegate.userId);
      return {
        ...delegate,
        votesCast: delegateVotes.length,
        recentActivity: delegateVotes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5)
      };
    });
    
    res.json({ delegates: enrichedDelegates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Execute Proposal
app.post('/api/proposals/:proposalId/execute', async (req, res) => {
  try {
    const { proposalId } = req.params;
    
    const proposal = proposals.find(p => p.id === proposalId);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    
    if (proposal.status !== ProposalStatus.PASSED) {
      return res.status(400).json({ error: 'Proposal must be passed to execute' });
    }
    
    if (proposal.executed) {
      return res.status(400).json({ error: 'Proposal already executed' });
    }
    
    // Check execution delay
    const executionTime = new Date(proposal.votingEndsAt).getTime() + governanceParameters.executionDelay;
    if (new Date().getTime() < executionTime) {
      return res.status(400).json({ error: 'Execution delay not met' });
    }
    
    // Execute proposal based on type
    let executionResult = null;
    
    switch (proposal.type) {
      case ProposalTypes.PARAMETER_CHANGE:
        // Update governance parameters
        if (proposal.calldata) {
          try {
            const params = JSON.parse(proposal.calldata);
            Object.assign(governanceParameters, params);
            executionResult = 'Parameters updated successfully';
          } catch (error) {
            return res.status(400).json({ error: 'Invalid parameter data' });
          }
        }
        break;
        
      case ProposalTypes.CONSTITUTIONAL_AMENDMENT:
        // Record constitutional amendment
        const amendment = {
          id: 'amendment-' + Date.now(),
          proposalId: proposal.id,
          title: proposal.title,
          description: proposal.description,
          enactedAt: new Date().toISOString(),
          ubuntu: 'Ubuntu constitutional amendment'
        };
        constitutionalAmendments.push(amendment);
        executionResult = 'Constitutional amendment enacted';
        break;
        
      default:
        executionResult = 'Proposal executed successfully';
    }
    
    proposal.status = ProposalStatus.EXECUTED;
    proposal.executed = true;
    proposal.executedAt = new Date().toISOString();
    
    console.log(`✅ Proposal Executed: ${proposal.title}`);
    
    res.json({ 
      success: true, 
      execution: {
        proposalId: proposal.id,
        result: executionResult,
        executedAt: proposal.executedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Governance Stats
app.get('/api/stats/governance', async (req, res) => {
  try {
    const totalProposals = proposals.length;
    const activeProposals = proposals.filter(p => p.status === ProposalStatus.ACTIVE).length;
    const passedProposals = proposals.filter(p => p.status === ProposalStatus.PASSED).length;
    const totalVotes = votes.length;
    const totalDelegates = delegates.length;
    
    const proposalsByType = {};
    Object.values(ProposalTypes).forEach(type => {
      proposalsByType[type] = proposals.filter(p => p.type === type).length;
    });
    
    res.json({
      totalProposals,
      activeProposals,
      passedProposals,
      totalVotes,
      totalDelegates,
      proposalsByType,
      governanceParameters,
      ubuntu: 'Ubuntu governance statistics'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Default Ubuntu Routes
app.get('/api/status', (req, res) => {
  res.json({
    service: 'azora-governance',
    status: 'operational',
    ubuntu: 'Ubuntu governance service ready'
  });
});

// Ubuntu Error Handling
app.use((error, req, res, next) => {
  console.error('Ubuntu Service Error:', error);
  res.status(500).json({
    error: 'Ubuntu service error',
    ubuntu: 'We handle errors with Ubuntu grace',
    timestamp: new Date().toISOString()
  });
});

// Start Ubuntu Service
app.listen(PORT, () => {
  console.log(`🏛️ Azora Governance service running on port ${PORT}`);
  console.log(`⚡ Ubuntu: "I govern because we decide together!"`);
  console.log(`📋 Proposals: ${proposals.length}, Votes: ${votes.length}`);
});
