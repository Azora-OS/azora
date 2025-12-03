const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4016;

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
  message: {
    error: 'Too many requests',
    ubuntu: 'We protect our collective resources with Ubuntu wisdom'
  }
});

app.use(ubuntuLimiter);

// Proof-of-Value Mining Engine - Ubuntu Knowledge Economics
class ProofOfValueMining {
  constructor() {
    this.baseReward = 10; // 10 AZR base reward
    this.difficultyAdjustment = 1.0;
    this.miningHistory = [];
    this.valueMultipliers = {
      education: 1.5,        // 50% bonus for educational content
      open_source: 1.3,     // 30% bonus for open source contributions
      mentorship: 1.4,      // 40% bonus for helping others
      innovation: 1.6,      // 60% bonus for innovative solutions
      collaboration: 1.2,   // 20% bonus for collaborative work
      research: 1.4,        // 40% bonus for research contributions
      community_service: 1.3 // 30% bonus for community service
    };
  }

  // Calculate value score for contribution
  calculateValueScore(contribution) {
    let score = 0;
    const multiplier = this.valueMultipliers[contribution.type] || 1.0;

    // Base score from contribution metrics
    switch (contribution.type) {
      case 'education':
        score = this.calculateEducationScore(contribution);
        break;
      case 'open_source':
        score = this.calculateOpenSourceScore(contribution);
        break;
      case 'mentorship':
        score = this.calculateMentorshipScore(contribution);
        break;
      case 'innovation':
        score = this.calculateInnovationScore(contribution);
        break;
      case 'collaboration':
        score = this.calculateCollaborationScore(contribution);
        break;
      case 'research':
        score = this.calculateResearchScore(contribution);
        break;
      case 'community_service':
        score = this.calculateCommunityServiceScore(contribution);
        break;
      default:
        score = this.calculateGenericScore(contribution);
    }

    return Math.round(score * multiplier * this.difficultyAdjustment);
  }

  calculateEducationScore(contribution) {
    const { complexity, learnersCount, completionRate, reviews } = contribution.metrics;
    return (complexity * 20) + (learnersCount * 2) + (completionRate * 10) + (reviews * 5);
  }

  calculateOpenSourceScore(contribution) {
    const { linesOfCode, contributors, issuesResolved, stars, forks } = contribution.metrics;
    return (linesOfCode / 100) + (contributors * 10) + (issuesResolved * 15) + (stars * 2) + (forks * 3);
  }

  calculateMentorshipScore(contribution) {
    const { menteesCount, successRate, sessionsCount, feedback } = contribution.metrics;
    return (menteesCount * 15) + (successRate * 20) + (sessionsCount * 3) + (feedback * 5);
  }

  calculateInnovationScore(contribution) {
    const { novelty, impact, adoption, citations } = contribution.metrics;
    return (novelty * 25) + (impact * 20) + (adoption * 15) + (citations * 10);
  }

  calculateCollaborationScore(contribution) {
    const { participants, duration, outcomes, synergy } = contribution.metrics;
    return (participants * 8) + (duration * 2) + (outcomes * 12) + (synergy * 15);
  }

  calculateResearchScore(contribution) {
    const { rigor, citations, impact, peerReviews } = contribution.metrics;
    return (rigor * 20) + (citations * 8) + (impact * 15) + (peerReviews * 10);
  }

  calculateCommunityServiceScore(contribution) {
    const { hoursServed, peopleHelped, impact, sustainability } = contribution.metrics;
    return (hoursServed * 5) + (peopleHelped * 10) + (impact * 15) + (sustainability * 12);
  }

  calculateGenericScore(contribution) {
    // Default scoring for unknown contribution types
    const { effort, impact, quality } = contribution.metrics;
    return (effort * 10) + (impact * 15) + (quality * 12);
  }

  // Mine AZR tokens based on Proof-of-Value
  async mine(contribution) {
    const valueScore = this.calculateValueScore(contribution);
    const rewardAmount = this.baseReward + (valueScore / 10); // Scale score to reward
    
    const miningReward = {
      id: `pov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: contribution.userId,
      contributionType: contribution.type,
      contributionId: contribution.id,
      valueScore,
      baseReward: this.baseReward,
      actualReward: rewardAmount,
      difficulty: this.difficultyAdjustment,
      timestamp: new Date().toISOString(),
      transactionHash: this.generateTransactionHash(),
      ubuntu: 'Ubuntu value recognized - I contribute because we grow'
    };

    this.miningHistory.push(miningReward);

    // Adjust difficulty based on network activity
    this.adjustDifficulty();

    return miningReward;
  }

  // Generate unique transaction hash
  generateTransactionHash() {
    return '0x' + Math.random().toString(36).substr(2, 64);
  }

  // Adjust mining difficulty based on network activity
  adjustDifficulty() {
    const recentActivity = this.miningHistory.slice(-100);
    const avgScore = recentActivity.reduce((sum, mining) => sum + mining.valueScore, 0) / recentActivity.length;

    if (avgScore > 100) {
      this.difficultyAdjustment = Math.max(0.5, this.difficultyAdjustment - 0.01);
    } else if (avgScore < 50) {
      this.difficultyAdjustment = Math.min(2.0, this.difficultyAdjustment + 0.01);
    }
  }

  // Get mining statistics
  getMiningStats() {
    const totalMined = this.miningHistory.length;
    const totalRewards = this.miningHistory.reduce((sum, mining) => sum + mining.actualReward, 0);
    const avgScore = totalMined > 0 ? 
      this.miningHistory.reduce((sum, mining) => sum + mining.valueScore, 0) / totalMined : 0;

    return {
      totalMined,
      totalRewards,
      averageScore: Math.round(avgScore),
      currentDifficulty: this.difficultyAdjustment,
      baseReward: this.baseReward,
      ubuntu: 'Proof-of-Value mining - Ubuntu knowledge economics in action'
    };
  }

  // Get user mining history
  getUserMiningHistory(userId, limit = 50) {
    return this.miningHistory
      .filter(mining => mining.userId === userId)
      .slice(-limit);
  }

  // Get contribution type statistics
  getContributionStats() {
    const stats = {};
    
    Object.keys(this.valueMultipliers).forEach(type => {
      const typeMining = this.miningHistory.filter(mining => mining.contributionType === type);
      stats[type] = {
        count: typeMining.length,
        totalRewards: typeMining.reduce((sum, mining) => sum + mining.actualReward, 0),
        averageScore: typeMining.length > 0 ? 
          typeMining.reduce((sum, mining) => sum + mining.valueScore, 0) / typeMining.length : 0,
        multiplier: this.valueMultipliers[type]
      };
    });

    return stats;
  }
}

// Initialize Proof-of-Value Mining
const proofOfValue = new ProofOfValueMining();

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Proof-of-Value Mining',
    ubuntu: 'Ubuntu knowledge economics engine running',
    timestamp: new Date().toISOString()
  });
});

// Ubuntu Philosophy
app.get('/ubuntu/philosophy', (req, res) => {
  res.json({
    philosophy: 'Ngiyakwazi ngoba sikwazi - I am because we are',
    miningPrinciples: [
      'Knowledge has measurable value',
      'Every contribution strengthens our collective',
      'Value is recognized through Ubuntu wisdom',
      'Mining rewards reflect real impact',
      'Together we create abundant knowledge'
    ],
    valueMultipliers: proofOfValue.valueMultipliers,
    mining: proofOfValue.getMiningStats()
  });
});

// Mine AZR tokens through Proof-of-Value
app.post('/mine', async (req, res) => {
  try {
    const { userId, type, id, metrics, metadata } = req.body;
    
    if (!userId || !type || !id || !metrics) {
      return res.status(400).json({
        error: 'Missing required fields: userId, type, id, metrics',
        ubuntu: 'Ubuntu mining requires complete contribution data'
      });
    }

    const contribution = {
      userId,
      type,
      id,
      metrics,
      metadata: metadata || {},
      timestamp: new Date().toISOString()
    };

    const reward = await proofOfValue.mine(contribution);

    res.json({
      success: true,
      reward,
      ubuntu: 'Your contribution creates collective value'
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      ubuntu: 'Ubuntu mining handles challenges with collective wisdom'
    });
  }
});

// Get mining statistics
app.get('/stats', (req, res) => {
  res.json(proofOfValue.getMiningStats());
});

// Get user mining history
app.get('/history/:userId', (req, res) => {
  const { userId } = req.params;
  const limit = parseInt(req.query.limit) || 50;
  
  res.json({
    userId,
    history: proofOfValue.getUserMiningHistory(userId, limit),
    ubuntu: 'Your contributions build our collective strength'
  });
});

// Get contribution type statistics
app.get('/contributions', (req, res) => {
  res.json({
    stats: proofOfValue.getContributionStats(),
    ubuntu: 'Ubuntu recognizes all forms of valuable contribution'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong',
    ubuntu: 'Ubuntu communities face challenges together'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    ubuntu: 'Ubuntu guides us to the right path',
    availableEndpoints: [
      'GET /health',
      'GET /ubuntu/philosophy',
      'POST /mine',
      'GET /stats',
      'GET /history/:userId',
      'GET /contributions'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`⛏️ Proof-of-Value Mining running on port ${PORT}`);
  console.log(`🌍 Ubuntu Knowledge Economics: Value-based mining active`);
  console.log(`💎 Base reward: ${proofOfValue.baseReward} AZR`);
  console.log(`🎯 Ubuntu Philosophy: Ngiyakwazi ngoba sikwazi`);
});
