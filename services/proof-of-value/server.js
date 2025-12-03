const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4011;

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
    service: 'proof-of-value',
    status: 'healthy',
    ubuntu: 'I value because we create together',
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
    service: 'proof-of-value',
    ubuntu: 'Ubuntu value creation through knowledge sharing'
  });
});

// Proof of Value State
let valueProofs = [];
let rewards = [];
let valueScores = {};

// Value Submission Types
const ValueTypes = {
  KNOWLEDGE: 'knowledge',
  CODE: 'code',
  CONTENT: 'content',
  COMMUNITY: 'community',
  RESEARCH: 'research'
};

// Submit Value Proof
app.post('/api/pov/submit', async (req, res) => {
  try {
    const { userId, contentType, content, valueHash, metadata } = req.body;
    
    // Calculate value score based on content type and quality
    const valueScore = calculateValueScore(contentType, content, metadata);
    
    const proof = {
      id: 'proof-' + Date.now(),
      userId,
      contentType,
      content,
      valueHash,
      valueScore,
      status: 'submitted',
      timestamp: new Date().toISOString(),
      metadata: {
        ...metadata,
        verificationStatus: 'pending',
        communityVotes: 0,
        expertReviews: []
      }
    };
    
    valueProofs.push(proof);
    
    // Update user's total value score
    if (!valueScores[userId]) {
      valueScores[userId] = { total: 0, proofs: [] };
    }
    valueScores[userId].total += valueScore;
    valueScores[userId].proofs.push(proof.id);
    
    console.log(`💎 Proof of Value: ${userId} submitted ${contentType} with score ${valueScore}`);
    
    res.json({ 
      success: true, 
      proof: {
        id: proof.id,
        valueScore,
        status: 'submitted',
        timestamp: proof.timestamp
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify Value Proof
app.post('/api/pov/verify', async (req, res) => {
  try {
    const { proofId, verified, verifierId, feedback } = req.body;
    
    const proof = valueProofs.find(p => p.id === proofId);
    if (!proof) {
      return res.status(404).json({ error: 'Proof not found' });
    }
    
    proof.metadata.verificationStatus = verified ? 'verified' : 'rejected';
    proof.metadata.expertReviews.push({
      verifierId,
      verified,
      feedback,
      timestamp: new Date().toISOString()
    });
    
    if (verified) {
      proof.status = 'verified';
      // Auto-reward for verified proofs
      await rewardValueProof(proofId);
    }
    
    console.log(`✅ Proof of Value: ${proofId} ${verified ? 'verified' : 'rejected'} by ${verifierId}`);
    
    res.json({ 
      success: true, 
      proof: {
        id: proof.id,
        status: proof.status,
        verificationStatus: proof.metadata.verificationStatus
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reward Value Proof
async function rewardValueProof(proofId) {
  const proof = valueProofs.find(p => p.id === proofId);
  if (!proof || proof.status !== 'verified') {
    return;
  }
  
  // Calculate reward based on value score
  const baseReward = 10; // Base AZR reward
  const multiplier = proof.valueScore / 100; // Score-based multiplier
  const rewardAmount = Math.floor(baseReward * multiplier);
  
  const reward = {
    id: 'reward-' + Date.now(),
    proofId,
    userId: proof.userId,
    amount: rewardAmount,
    type: 'mining',
    status: 'distributed',
    timestamp: new Date().toISOString()
  };
  
  rewards.push(reward);
  
  console.log(`⛏️ Proof of Value Mining: ${proof.userId} rewarded ${rewardAmount} AZR`);
  
  return reward;
}

// Community Voting
app.post('/api/pov/vote', async (req, res) => {
  try {
    const { proofId, voterId, vote, weight = 1 } = req.body;
    
    const proof = valueProofs.find(p => p.id === proofId);
    if (!proof) {
      return res.status(404).json({ error: 'Proof not found' });
    }
    
    proof.metadata.communityVotes += vote ? weight : -weight;
    
    // Auto-verify if enough community support
    if (proof.metadata.communityVotes >= 10 && proof.status === 'submitted') {
      proof.status = 'verified';
      proof.metadata.verificationStatus = 'community_verified';
      await rewardValueProof(proofId);
    }
    
    console.log(`🗳️ Community Vote: ${voterId} voted ${vote ? 'for' : 'against'} proof ${proofId}`);
    
    res.json({ 
      success: true, 
      communityVotes: proof.metadata.communityVotes,
      status: proof.status
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get User Value Profile
app.get('/api/pov/profile/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const userProfile = valueScores[userId] || { total: 0, proofs: [] };
    
    const userProofs = valueProofs.filter(p => p.userId === userId);
    const userRewards = rewards.filter(r => r.userId === userId);
    
    res.json({
      userId,
      totalValueScore: userProfile.total,
      proofCount: userProofs.length,
      rewardCount: userRewards.length,
      totalRewards: userRewards.reduce((sum, r) => sum + r.amount, 0),
      proofs: userProofs.map(p => ({
        id: p.id,
        contentType: p.contentType,
        valueScore: p.valueScore,
        status: p.status,
        timestamp: p.timestamp
      })),
      ubuntu: 'Ubuntu value creation profile'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Value Leaderboard
app.get('/api/pov/leaderboard', async (req, res) => {
  try {
    const leaderboard = Object.entries(valueScores)
      .map(([userId, data]) => ({
        userId,
        totalScore: data.total,
        proofCount: data.proofs.length,
        avgScore: data.proofs.length > 0 ? data.total / data.proofs.length : 0
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 50);
    
    res.json({ leaderboard });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Recent Proofs
app.get('/api/pov/proofs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || 'all';
    
    let filteredProofs = status === 'all' 
      ? valueProofs 
      : valueProofs.filter(p => p.status === status);
    
    const proofs = filteredProofs
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit)
      .map(p => ({
        id: p.id,
        userId: p.userId,
        contentType: p.contentType,
        valueScore: p.valueScore,
        status: p.status,
        communityVotes: p.metadata.communityVotes,
        timestamp: p.timestamp
      }));
    
    res.json({ proofs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to calculate value score
function calculateValueScore(contentType, content, metadata) {
  let baseScore = 50; // Base score for any contribution
  
  // Content type multipliers
  const typeMultipliers = {
    [ValueTypes.KNOWLEDGE]: 1.2,
    [ValueTypes.CODE]: 1.5,
    [ValueTypes.CONTENT]: 1.0,
    [ValueTypes.COMMUNITY]: 0.8,
    [ValueTypes.RESEARCH]: 2.0
  };
  
  baseScore *= typeMultipliers[contentType] || 1.0;
  
  // Quality factors
  if (metadata?.complexity === 'high') baseScore *= 1.3;
  if (metadata?.originality === 'high') baseScore *= 1.4;
  if (metadata?.impact === 'high') baseScore *= 1.5;
  if (metadata?.collaboration === 'high') baseScore *= 1.2; // Ubuntu bonus
  
  // Length/depth factor
  if (content?.length > 1000) baseScore *= 1.1;
  if (content?.length > 5000) baseScore *= 1.2;
  
  return Math.min(Math.round(baseScore), 100); // Cap at 100
}

// Default Ubuntu Routes
app.get('/api/status', (req, res) => {
  res.json({
    service: 'proof-of-value',
    status: 'operational',
    ubuntu: 'Ubuntu value creation service ready'
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
  console.log(`💎 Proof of Value service running on port ${PORT}`);
  console.log('⚡ Ubuntu: "I value because we create together!"');
  console.log(`📊 Total Proofs: ${valueProofs.length}, Total Rewards: ${rewards.length}`);
});
