#!/usr/bin/env node

/**
 * Azora Mint - Mining Engine (Agent 3 Implementation)
 * Proof-of-Knowledge mining and token minting system
 */

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { EventEmitter } = require('events');

const app = express();
app.use(cors());
app.use(express.json());

// Mining Configuration
const MINING_CONFIG = {
  baseReward: 10, // Base AZR tokens per successful mining
  difficultyAdjustment: 1000, // Adjust difficulty every 1000 blocks
  targetBlockTime: 60, // Target 1 minute per block
  maxSupply: 21000000, // Maximum AZR tokens
  halvingInterval: 210000, // Halve rewards every 210k blocks
  proofOfKnowledgeWeight: 0.7, // 70% weight for knowledge proof
  proofOfWorkWeight: 0.3 // 30% weight for computational work
};

// Token Economics
const TOKEN_ECONOMICS = {
  learningRewards: {
    lesson_completion: 1,
    quiz_perfect: 2,
    course_completion: 10,
    skill_certification: 25,
    teaching_others: 5,
    peer_review: 3
  },
  stakingRewards: {
    daily_rate: 0.001, // 0.1% daily
    minimum_stake: 100,
    lock_periods: {
      '30_days': 1.2, // 20% bonus
      '90_days': 1.5, // 50% bonus
      '365_days': 2.0 // 100% bonus
    }
  },
  governanceRewards: {
    proposal_creation: 50,
    voting_participation: 1,
    proposal_acceptance: 100
  }
};

// Blockchain State
class BlockchainState {
  constructor() {
    this.blocks = [];
    this.pendingTransactions = [];
    this.difficulty = 4;
    this.miningReward = MINING_CONFIG.baseReward;
    this.totalSupply = 0;
    this.accounts = new Map();
    this.knowledgeProofs = new Map();
    
    // Create genesis block
    this.createGenesisBlock();
  }

  createGenesisBlock() {
    const genesisBlock = {
      index: 0,
      timestamp: Date.now(),
      transactions: [],
      previousHash: '0',
      hash: this.calculateHash(0, Date.now(), [], '0', 0),
      nonce: 0,
      knowledgeProofs: [],
      difficulty: this.difficulty
    };
    
    this.blocks.push(genesisBlock);
  }

  calculateHash(index, timestamp, transactions, previousHash, nonce) {
    return crypto
      .createHash('sha256')
      .update(index + timestamp + JSON.stringify(transactions) + previousHash + nonce)
      .digest('hex');
  }

  getLatestBlock() {
    return this.blocks[this.blocks.length - 1];
  }

  addTransaction(transaction) {
    this.pendingTransactions.push(transaction);
  }

  getBalance(address) {
    let balance = 0;

    for (const block of this.blocks) {
      for (const transaction of block.transactions) {
        if (transaction.from === address) {
          balance -= transaction.amount;
        }
        if (transaction.to === address) {
          balance += transaction.amount;
        }
      }
    }

    return balance;
  }

  minePendingTransactions(miningRewardAddress, knowledgeProofs = []) {
    const rewardTransaction = {
      from: null,
      to: miningRewardAddress,
      amount: this.calculateMiningReward(knowledgeProofs),
      type: 'mining_reward',
      timestamp: Date.now()
    };

    this.pendingTransactions.push(rewardTransaction);

    const block = {
      index: this.blocks.length,
      timestamp: Date.now(),
      transactions: this.pendingTransactions,
      previousHash: this.getLatestBlock().hash,
      knowledgeProofs: knowledgeProofs,
      difficulty: this.difficulty,
      nonce: 0
    };

    block.hash = this.mineBlock(block);
    
    this.blocks.push(block);
    this.pendingTransactions = [];
    this.totalSupply += rewardTransaction.amount;

    // Adjust difficulty if needed
    this.adjustDifficulty();

    return block;
  }

  mineBlock(block) {
    const target = Array(this.difficulty + 1).join('0');

    while (block.hash.substring(0, this.difficulty) !== target) {
      block.nonce++;
      block.hash = this.calculateHash(
        block.index,
        block.timestamp,
        block.transactions,
        block.previousHash,
        block.nonce
      );
    }

    return block.hash;
  }

  calculateMiningReward(knowledgeProofs) {
    let baseReward = this.miningReward;
    
    // Apply halving
    const halvingCount = Math.floor(this.blocks.length / MINING_CONFIG.halvingInterval);
    baseReward = baseReward / Math.pow(2, halvingCount);

    // Calculate knowledge bonus
    let knowledgeBonus = 0;
    for (const proof of knowledgeProofs) {
      knowledgeBonus += this.calculateKnowledgeValue(proof);
    }

    // Combine proof-of-work and proof-of-knowledge
    const pokReward = knowledgeBonus * MINING_CONFIG.proofOfKnowledgeWeight;
    const powReward = baseReward * MINING_CONFIG.proofOfWorkWeight;

    return Math.round((pokReward + powReward) * 100) / 100;
  }

  calculateKnowledgeValue(proof) {
    const { type, difficulty, accuracy, impact } = proof;
    
    let baseValue = TOKEN_ECONOMICS.learningRewards[type] || 1;
    
    // Difficulty multiplier
    const difficultyMultiplier = {
      'beginner': 1.0,
      'intermediate': 1.5,
      'advanced': 2.0,
      'expert': 3.0
    }[difficulty] || 1.0;

    // Accuracy multiplier
    const accuracyMultiplier = accuracy ? Math.pow(accuracy, 2) : 1.0;

    // Impact multiplier (how many people benefited)
    const impactMultiplier = impact ? Math.log10(impact + 1) : 1.0;

    return baseValue * difficultyMultiplier * accuracyMultiplier * impactMultiplier;
  }

  adjustDifficulty() {
    if (this.blocks.length % MINING_CONFIG.difficultyAdjustment === 0 && this.blocks.length > 1) {
      const lastAdjustmentBlock = this.blocks[this.blocks.length - MINING_CONFIG.difficultyAdjustment];
      const timeExpected = MINING_CONFIG.difficultyAdjustment * MINING_CONFIG.targetBlockTime * 1000;
      const timeActual = this.getLatestBlock().timestamp - lastAdjustmentBlock.timestamp;

      if (timeActual < timeExpected / 2) {
        this.difficulty++;
      } else if (timeActual > timeExpected * 2) {
        this.difficulty = Math.max(1, this.difficulty - 1);
      }
    }
  }

  isChainValid() {
    for (let i = 1; i < this.blocks.length; i++) {
      const currentBlock = this.blocks[i];
      const previousBlock = this.blocks[i - 1];

      if (currentBlock.hash !== this.calculateHash(
        currentBlock.index,
        currentBlock.timestamp,
        currentBlock.transactions,
        currentBlock.previousHash,
        currentBlock.nonce
      )) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }

    return true;
  }
}

// Mining Pool
class MiningPool extends EventEmitter {
  constructor() {
    super();
    this.miners = new Map();
    this.activeJobs = new Map();
    this.hashRate = 0;
    this.totalShares = 0;
  }

  addMiner(minerId, minerInfo) {
    this.miners.set(minerId, {
      ...minerInfo,
      shares: 0,
      hashRate: 0,
      joinedAt: Date.now(),
      lastActivity: Date.now()
    });

    this.emit('minerJoined', { minerId, minerInfo });
  }

  removeMiner(minerId) {
    this.miners.delete(minerId);
    this.emit('minerLeft', { minerId });
  }

  submitShare(minerId, share) {
    const miner = this.miners.get(minerId);
    if (!miner) {
      throw new Error('Miner not found');
    }

    miner.shares++;
    miner.lastActivity = Date.now();
    this.totalShares++;

    this.emit('shareSubmitted', { minerId, share, totalShares: this.totalShares });

    return {
      accepted: true,
      shares: miner.shares,
      totalShares: this.totalShares
    };
  }

  distributeRewards(totalReward) {
    const rewards = new Map();
    
    for (const [minerId, miner] of this.miners) {
      if (miner.shares > 0) {
        const minerReward = (miner.shares / this.totalShares) * totalReward;
        rewards.set(minerId, minerReward);
        miner.shares = 0; // Reset shares for next round
      }
    }

    this.totalShares = 0;
    this.emit('rewardsDistributed', { rewards });

    return rewards;
  }

  getPoolStats() {
    return {
      totalMiners: this.miners.size,
      totalShares: this.totalShares,
      hashRate: this.hashRate,
      activeJobs: this.activeJobs.size
    };
  }
}

// Proof of Knowledge Engine
class ProofOfKnowledgeEngine {
  constructor() {
    this.knowledgeDatabase = new Map();
    this.verificationQueue = [];
  }

  submitKnowledgeProof(proof) {
    const proofId = crypto.randomUUID();
    const timestamp = Date.now();

    const knowledgeProof = {
      id: proofId,
      ...proof,
      timestamp,
      status: 'pending',
      verifications: []
    };

    this.knowledgeDatabase.set(proofId, knowledgeProof);
    this.verificationQueue.push(proofId);

    return proofId;
  }

  verifyKnowledgeProof(proofId, verifierId, verification) {
    const proof = this.knowledgeDatabase.get(proofId);
    if (!proof) {
      throw new Error('Proof not found');
    }

    proof.verifications.push({
      verifierId,
      ...verification,
      timestamp: Date.now()
    });

    // Auto-approve if enough verifications
    if (proof.verifications.length >= 3) {
      const approvals = proof.verifications.filter(v => v.approved).length;
      if (approvals >= 2) {
        proof.status = 'verified';
      } else {
        proof.status = 'rejected';
      }
    }

    this.knowledgeDatabase.set(proofId, proof);
    return proof;
  }

  getVerifiedProofs(limit = 10) {
    const verified = [];
    for (const [id, proof] of this.knowledgeDatabase) {
      if (proof.status === 'verified') {
        verified.push(proof);
      }
    }
    return verified.slice(-limit);
  }
}

// Initialize systems
const blockchain = new BlockchainState();
const miningPool = new MiningPool();
const pokEngine = new ProofOfKnowledgeEngine();

// API Routes
app.get('/api/blockchain/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalBlocks: blockchain.blocks.length,
      totalSupply: blockchain.totalSupply,
      difficulty: blockchain.difficulty,
      miningReward: blockchain.miningReward,
      isValid: blockchain.isChainValid()
    }
  });
});

app.get('/api/blockchain/blocks', (req, res) => {
  const { limit = 10, offset = 0 } = req.query;
  const blocks = blockchain.blocks
    .slice(-limit - offset, -offset || undefined)
    .reverse();

  res.json({
    success: true,
    data: {
      blocks,
      total: blockchain.blocks.length
    }
  });
});

app.get('/api/balance/:address', (req, res) => {
  const { address } = req.params;
  const balance = blockchain.getBalance(address);

  res.json({
    success: true,
    data: {
      address,
      balance
    }
  });
});

app.post('/api/transaction', (req, res) => {
  try {
    const { from, to, amount, type = 'transfer' } = req.body;

    if (!from || !to || !amount) {
      return res.status(400).json({
        success: false,
        error: 'From, to, and amount are required'
      });
    }

    const transaction = {
      from,
      to,
      amount: parseFloat(amount),
      type,
      timestamp: Date.now()
    };

    blockchain.addTransaction(transaction);

    res.json({
      success: true,
      data: {
        transaction,
        message: 'Transaction added to pending pool'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/mine', async (req, res) => {
  try {
    const { minerAddress, knowledgeProofs = [] } = req.body;

    if (!minerAddress) {
      return res.status(400).json({
        success: false,
        error: 'Miner address is required'
      });
    }

    // Verify knowledge proofs
    const verifiedProofs = [];
    for (const proofId of knowledgeProofs) {
      const proof = pokEngine.knowledgeDatabase.get(proofId);
      if (proof && proof.status === 'verified') {
        verifiedProofs.push(proof);
      }
    }

    const block = blockchain.minePendingTransactions(minerAddress, verifiedProofs);

    res.json({
      success: true,
      data: {
        block,
        reward: block.transactions.find(t => t.type === 'mining_reward')?.amount || 0,
        knowledgeBonus: verifiedProofs.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/knowledge-proof', (req, res) => {
  try {
    const proof = req.body;

    if (!proof.type || !proof.content) {
      return res.status(400).json({
        success: false,
        error: 'Proof type and content are required'
      });
    }

    const proofId = pokEngine.submitKnowledgeProof(proof);

    res.json({
      success: true,
      data: {
        proofId,
        message: 'Knowledge proof submitted for verification'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/knowledge-proof/:proofId/verify', (req, res) => {
  try {
    const { proofId } = req.params;
    const { verifierId, approved, comments } = req.body;

    if (!verifierId || approved === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Verifier ID and approval status are required'
      });
    }

    const proof = pokEngine.verifyKnowledgeProof(proofId, verifierId, {
      approved,
      comments
    });

    res.json({
      success: true,
      data: proof
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/mining-pool/stats', (req, res) => {
  res.json({
    success: true,
    data: miningPool.getPoolStats()
  });
});

app.post('/api/mining-pool/join', (req, res) => {
  try {
    const { minerId, minerInfo } = req.body;

    if (!minerId) {
      return res.status(400).json({
        success: false,
        error: 'Miner ID is required'
      });
    }

    miningPool.addMiner(minerId, minerInfo);

    res.json({
      success: true,
      data: {
        message: 'Successfully joined mining pool',
        minerId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/mining-pool/submit-share', (req, res) => {
  try {
    const { minerId, share } = req.body;

    if (!minerId || !share) {
      return res.status(400).json({
        success: false,
        error: 'Miner ID and share are required'
      });
    }

    const result = miningPool.submitShare(minerId, share);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'Azora Mint - Mining Engine',
    status: 'healthy',
    timestamp: new Date(),
    blockchain: {
      blocks: blockchain.blocks.length,
      supply: blockchain.totalSupply,
      difficulty: blockchain.difficulty
    },
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 4012;

app.listen(PORT, () => {
  console.log(`⛏️ Azora Mint Mining Engine running on port ${PORT}`);
  console.log(`💰 Total supply: ${blockchain.totalSupply} AZR`);
  console.log(`🔗 Blocks mined: ${blockchain.blocks.length}`);
  console.log('🌟 Proof-of-Knowledge mining active');
});

module.exports = { app, blockchain, miningPool, pokEngine };