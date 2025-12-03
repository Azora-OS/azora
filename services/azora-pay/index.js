const express = require('express');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3005;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(compression());
app.use(express.json());

// Ubuntu Rate Limiting for financial operations
const ubuntuLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { 
    error: 'Ubuntu rate limit exceeded', 
    ubuntu: 'Please slow down for financial harmony' 
  }
});
app.use(ubuntuLimiter);

// Payment and wallet storage (in production, use database)
const payments = new Map();
const subscriptions = new Map();
const refunds = new Map();
const wallets = new Map();
const transactions = new Map();
const paymentMethods = new Map();
const stakingPools = new Map();

// Blockchain provider setup
const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545');

// Middleware to get user ID from header
const getUserId = (req) => {
  return req.headers['x-user-id'] || req.user?.id || 'user_123456789';
};

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'azora-pay',
    status: 'healthy',
    ubuntu: 'I transact because we prosper together',
    timestamp: new Date().toISOString(),
    port: PORT,
    stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'missing',
    blockchain: process.env.BLOCKCHAIN_RPC_URL ? 'connected' : 'local',
    features: {
      payments: '✅ Active',
      wallet: '✅ Active',
      staking: '✅ Active',
      transactions: '✅ Active',
      paymentMethods: '✅ Active'
    }
  });
});

// Ubuntu Philosophy Endpoint
app.get('/api/ubuntu/philosophy', (req, res) => {
  res.json({
    philosophy: 'Ngiyakwazi ngoba sikwazi - I can because we can',
    principles: [
      'My transactions build our prosperity',
      'My trust strengthens our economy',
      'My security protects our community',
      'My growth fuels our collective success'
    ],
    service: 'azora-pay',
    ubuntu: 'Ubuntu financial empowerment'
  });
});

// ========== WALLET ENDPOINTS ==========

// GET /api/wallet/:userId - Get user wallet
app.get('/api/wallet/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterId = getUserId(req);

    // Users can only view their own wallets
    if (userId !== requesterId) {
      return res.status(403).json({
        error: 'Access denied - can only view own wallet',
        ubuntu: 'Ubuntu respect: Honor financial privacy'
      });
    }

    let wallet = wallets.get(userId);
    
    if (!wallet) {
      // Create new wallet for user
      const walletId = uuidv4();
      wallet = {
        id: walletId,
        userId,
        balance: 0,
        currency: 'AZR',
        staked: 0,
        available: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active'
      };
      wallets.set(userId, wallet);

      // Log wallet creation to blockchain
      await logPaymentEvent('WALLET_CREATED', {
        walletId,
        userId,
        ubuntu: 'Ubuntu wallet creation'
      });
    }

    // Get wallet transactions
    const walletTransactions = Array.from(transactions.values())
      .filter(tx => tx.from === userId || tx.to === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 50);

    res.json({
      wallet,
      transactions: walletTransactions,
      ubuntu: 'Your wallet reflects Ubuntu prosperity'
    });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({
      error: 'Failed to fetch wallet',
      ubuntu: 'We handle financial errors with Ubuntu grace'
    });
  }
});

// POST /api/wallet/:userId/fund - Fund wallet with AZR tokens
app.post('/api/wallet/:userId/fund', async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterId = getUserId(req);
    const { amount, source = 'external' } = req.body;

    if (userId !== requesterId) {
      return res.status(403).json({
        error: 'Access denied - can only fund own wallet',
        ubuntu: 'Ubuntu respect: Honor financial permissions'
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Valid amount required',
        ubuntu: 'Ubuntu clarity: Provide complete information'
      });
    }

    const wallet = wallets.get(userId);
    if (!wallet) {
      return res.status(404).json({
        error: 'Wallet not found',
        ubuntu: 'Ubuntu guidance: Create wallet first'
      });
    }

    // Process funding through blockchain
    const fundingResult = await processWalletFunding(userId, amount, source);
    
    if (fundingResult.success) {
      // Update wallet balance
      wallet.balance += amount;
      wallet.available += amount;
      wallet.updatedAt = new Date().toISOString();
      wallets.set(userId, wallet);

      // Record transaction
      const transaction = {
        id: uuidv4(),
        from: 'system',
        to: userId,
        amount,
        currency: 'AZR',
        type: 'wallet_funding',
        status: 'completed',
        source,
        blockchainTxHash: fundingResult.transactionHash,
        createdAt: new Date().toISOString()
      };
      transactions.set(transaction.id, transaction);

      // Log to blockchain
      await logPaymentEvent('WALLET_FUNDED', {
        transactionId: transaction.id,
        userId,
        amount,
        source,
        transactionHash: fundingResult.transactionHash
      });

      console.log(`💰 Wallet funded: ${userId} - Amount: ${amount} AZR`);

      res.json({
        success: true,
        wallet,
        transaction,
        ubuntu: 'Wallet funded with Ubuntu prosperity'
      });
    } else {
      res.status(500).json({
        error: 'Failed to fund wallet',
        ubuntu: 'We handle funding errors with Ubuntu grace'
      });
    }
  } catch (error) {
    console.error('Error funding wallet:', error);
    res.status(500).json({
      error: 'Failed to fund wallet',
      ubuntu: 'We handle financial errors with Ubuntu grace'
    });
  }
});

// POST /api/wallet/:userId/withdraw - Withdraw from wallet
app.post('/api/wallet/:userId/withdraw', async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterId = getUserId(req);
    const { amount, destination } = req.body;

    if (userId !== requesterId) {
      return res.status(403).json({
        error: 'Access denied - can only withdraw from own wallet',
        ubuntu: 'Ubuntu respect: Honor financial permissions'
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Valid amount required',
        ubuntu: 'Ubuntu clarity: Provide complete information'
      });
    }

    const wallet = wallets.get(userId);
    if (!wallet) {
      return res.status(404).json({
        error: 'Wallet not found',
        ubuntu: 'Ubuntu guidance: Create wallet first'
      });
    }

    if (wallet.available < amount) {
      return res.status(400).json({
        error: 'Insufficient balance',
        ubuntu: 'Ubuntu wisdom: Spend within your means'
      });
    }

    // Process withdrawal through blockchain
    const withdrawalResult = await processWalletWithdrawal(userId, amount, destination);
    
    if (withdrawalResult.success) {
      // Update wallet balance
      wallet.balance -= amount;
      wallet.available -= amount;
      wallet.updatedAt = new Date().toISOString();
      wallets.set(userId, wallet);

      // Record transaction
      const transaction = {
        id: uuidv4(),
        from: userId,
        to: destination,
        amount,
        currency: 'AZR',
        type: 'wallet_withdrawal',
        status: 'completed',
        blockchainTxHash: withdrawalResult.transactionHash,
        createdAt: new Date().toISOString()
      };
      transactions.set(transaction.id, transaction);

      // Log to blockchain
      await logPaymentEvent('WALLET_WITHDRAWAL', {
        transactionId: transaction.id,
        userId,
        amount,
        destination,
        transactionHash: withdrawalResult.transactionHash
      });

      console.log(`💸 Wallet withdrawal: ${userId} - Amount: ${amount} AZR to ${destination}`);

      res.json({
        success: true,
        wallet,
        transaction,
        ubuntu: 'Withdrawal completed with Ubuntu integrity'
      });
    } else {
      res.status(500).json({
        error: 'Failed to process withdrawal',
        ubuntu: 'We handle withdrawal errors with Ubuntu grace'
      });
    }
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    res.status(500).json({
      error: 'Failed to process withdrawal',
      ubuntu: 'We handle financial errors with Ubuntu grace'
    });
  }
});

// ========== STAKING ENDPOINTS ==========

// GET /api/staking/pools - Get available staking pools
app.get('/api/staking/pools', async (req, res) => {
  try {
    // Initialize default staking pools if not exists
    if (stakingPools.size === 0) {
      initializeStakingPools();
    }

    const pools = Array.from(stakingPools.values());
    
    res.json({
      pools,
      ubuntu: 'Staking pools for Ubuntu collective growth'
    });
  } catch (error) {
    console.error('Error fetching staking pools:', error);
    res.status(500).json({
      error: 'Failed to fetch staking pools',
      ubuntu: 'We handle staking errors with Ubuntu grace'
    });
  }
});

// POST /api/staking/:userId/stake - Stake AZR tokens
app.post('/api/staking/:userId/stake', async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterId = getUserId(req);
    const { amount, poolId, duration = 30 } = req.body; // duration in days

    if (userId !== requesterId) {
      return res.status(403).json({
        error: 'Access denied - can only stake own tokens',
        ubuntu: 'Ubuntu respect: Honor financial permissions'
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Valid amount required',
        ubuntu: 'Ubuntu clarity: Provide complete information'
      });
    }

    const wallet = wallets.get(userId);
    if (!wallet || wallet.available < amount) {
      return res.status(400).json({
        error: 'Insufficient balance',
        ubuntu: 'Ubuntu wisdom: Stake within your means'
      });
    }

    const pool = stakingPools.get(poolId);
    if (!pool) {
      return res.status(404).json({
        error: 'Staking pool not found',
        ubuntu: 'Ubuntu guidance: Choose available pool'
      });
    }

    // Process staking through blockchain
    const stakingResult = await processStaking(userId, amount, poolId, duration);
    
    if (stakingResult.success) {
      // Update wallet
      wallet.available -= amount;
      wallet.staked += amount;
      wallet.updatedAt = new Date().toISOString();
      wallets.set(userId, wallet);

      // Create staking record
      const stakingRecord = {
        id: uuidv4(),
        userId,
        poolId,
        amount,
        duration,
        apr: pool.apr,
        status: 'active',
        startedAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
        rewards: 0,
        blockchainTxHash: stakingResult.transactionHash
      };

      // Add to pool
      pool.totalStaked += amount;
      pool.participants += 1;
      stakingPools.set(poolId, pool);

      // Record transaction
      const transaction = {
        id: uuidv4(),
        from: userId,
        to: poolId,
        amount,
        currency: 'AZR',
        type: 'staking',
        status: 'completed',
        blockchainTxHash: stakingResult.transactionHash,
        createdAt: new Date().toISOString()
      };
      transactions.set(transaction.id, transaction);

      // Log to blockchain
      await logPaymentEvent('TOKENS_STAKED', {
        transactionId: transaction.id,
        userId,
        amount,
        poolId,
        duration,
        transactionHash: stakingResult.transactionHash
      });

      console.log(`🌱 Tokens staked: ${userId} - Amount: ${amount} AZR in pool ${poolId}`);

      res.json({
        success: true,
        staking: stakingRecord,
        wallet,
        transaction,
        ubuntu: 'Tokens staked for Ubuntu collective growth'
      });
    } else {
      res.status(500).json({
        error: 'Failed to stake tokens',
        ubuntu: 'We handle staking errors with Ubuntu grace'
      });
    }
  } catch (error) {
    console.error('Error staking tokens:', error);
    res.status(500).json({
      error: 'Failed to stake tokens',
      ubuntu: 'We handle financial errors with Ubuntu grace'
    });
  }
});

// POST /api/staking/:userId/unstake - Unstake AZR tokens
app.post('/api/staking/:userId/unstake', async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterId = getUserId(req);
    const { stakingId } = req.body;

    if (userId !== requesterId) {
      return res.status(403).json({
        error: 'Access denied - can only unstake own tokens',
        ubuntu: 'Ubuntu respect: Honor financial permissions'
      });
    }

    // This would typically fetch from database
    // For now, simulate unstaking
    const wallet = wallets.get(userId);
    if (!wallet) {
      return res.status(404).json({
        error: 'Wallet not found',
        ubuntu: 'Ubuntu guidance: Create wallet first'
      });
    }

    // Process unstaking through blockchain
    const unstakingResult = await processUnstaking(userId, stakingId);
    
    if (unstakingResult.success) {
      // Update wallet (simplified - in reality would calculate rewards)
      const unstakedAmount = unstakingResult.amount || 100;
      const rewards = unstakingResult.rewards || 5;
      
      wallet.staked -= unstakedAmount;
      wallet.available += unstakedAmount + rewards;
      wallet.balance += rewards;
      wallet.updatedAt = new Date().toISOString();
      wallets.set(userId, wallet);

      // Record transaction
      const transaction = {
        id: uuidv4(),
        from: 'staking_pool',
        to: userId,
        amount: unstakedAmount + rewards,
        currency: 'AZR',
        type: 'unstaking',
        status: 'completed',
        rewards,
        blockchainTxHash: unstakingResult.transactionHash,
        createdAt: new Date().toISOString()
      };
      transactions.set(transaction.id, transaction);

      // Log to blockchain
      await logPaymentEvent('TOKENS_UNSTAKED', {
        transactionId: transaction.id,
        userId,
        amount: unstakedAmount,
        rewards,
        transactionHash: unstakingResult.transactionHash
      });

      console.log(`🌿 Tokens unstaked: ${userId} - Amount: ${unstakedAmount} AZR + ${rewards} rewards`);

      res.json({
        success: true,
        wallet,
        transaction,
        unstakedAmount,
        rewards,
        ubuntu: 'Tokens unstaked with Ubuntu rewards'
      });
    } else {
      res.status(500).json({
        error: 'Failed to unstake tokens',
        ubuntu: 'We handle unstaking errors with Ubuntu grace'
      });
    }
  } catch (error) {
    console.error('Error unstaking tokens:', error);
    res.status(500).json({
      error: 'Failed to unstake tokens',
      ubuntu: 'We handle financial errors with Ubuntu grace'
    });
  }
});

// ========== PAYMENT METHODS ENDPOINTS ==========

// GET /api/payment-methods/:userId - Get user payment methods
app.get('/api/payment-methods/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterId = getUserId(req);

    if (userId !== requesterId) {
      return res.status(403).json({
        error: 'Access denied - can only view own payment methods',
        ubuntu: 'Ubuntu respect: Honor financial privacy'
      });
    }

    const userPaymentMethods = Array.from(paymentMethods.values())
      .filter(pm => pm.userId === userId);

    res.json({
      paymentMethods: userPaymentMethods,
      ubuntu: 'Payment methods managed with Ubuntu care'
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({
      error: 'Failed to fetch payment methods',
      ubuntu: 'We handle financial errors with Ubuntu grace'
    });
  }
});

// POST /api/payment-methods/:userId - Add payment method
app.post('/api/payment-methods/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterId = getUserId(req);
    const { type, details, isDefault = false } = req.body;

    if (userId !== requesterId) {
      return res.status(403).json({
        error: 'Access denied - can only add own payment methods',
        ubuntu: 'Ubuntu respect: Honor financial permissions'
      });
    }

    if (!type || !details) {
      return res.status(400).json({
        error: 'Payment method type and details required',
        ubuntu: 'Ubuntu clarity: Provide complete information'
      });
    }

    // Create payment method
    const paymentMethodId = uuidv4();
    const paymentMethod = {
      id: paymentMethodId,
      userId,
      type, // 'card', 'bank_account', 'crypto_wallet'
      details,
      isDefault,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    paymentMethods.set(paymentMethodId, paymentMethod);

    // If default, unset other defaults
    if (isDefault) {
      Array.from(paymentMethods.values())
        .filter(pm => pm.userId === userId && pm.id !== paymentMethodId)
        .forEach(pm => {
          pm.isDefault = false;
          paymentMethods.set(pm.id, pm);
        });
    }

    // Log to blockchain
    await logPaymentEvent('PAYMENT_METHOD_ADDED', {
      paymentMethodId,
      userId,
      type,
      ubuntu: 'Ubuntu payment method creation'
    });

    console.log(`💳 Payment method added: ${paymentMethodId} for user ${userId}`);

    res.status(201).json({
      success: true,
      paymentMethod,
      ubuntu: 'Payment method added with Ubuntu security'
    });
  } catch (error) {
    console.error('Error adding payment method:', error);
    res.status(500).json({
      error: 'Failed to add payment method',
      ubuntu: 'We handle financial errors with Ubuntu grace'
    });
  }
});

// ========== UTILITY FUNCTIONS ==========

function initializeStakingPools() {
  const pools = [
    {
      id: 'ubuntu-growth',
      name: 'Ubuntu Growth Pool',
      description: 'Support community development projects',
      apr: 8.5,
      totalStaked: 0,
      participants: 0,
      minAmount: 100,
      maxAmount: 10000,
      duration: [30, 90, 365],
      status: 'active'
    },
    {
      id: 'education-fund',
      name: 'Education Fund Pool',
      description: 'Fund educational initiatives and scholarships',
      apr: 12.0,
      totalStaked: 0,
      participants: 0,
      minAmount: 50,
      maxAmount: 5000,
      duration: [30, 90, 180],
      status: 'active'
    },
    {
      id: 'innovation-lab',
      name: 'Innovation Lab Pool',
      description: 'Support technological innovation and research',
      apr: 15.5,
      totalStaked: 0,
      participants: 0,
      minAmount: 200,
      maxAmount: 20000,
      duration: [90, 180, 365],
      status: 'active'
    }
  ];

  pools.forEach(pool => {
    stakingPools.set(pool.id, pool);
  });
}

async function processWalletFunding(userId, amount, source) {
  try {
    // Process funding through blockchain service
    const response = await axios.post('http://localhost:3029/api/token/mint', {
      to: userId,
      amount,
      currency: 'AZR',
      type: 'WalletFunding',
      source
    }, { timeout: 10000 });

    return {
      success: true,
      transactionHash: response.data.txHash
    };
  } catch (error) {
    console.error('Wallet funding failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function processWalletWithdrawal(userId, amount, destination) {
  try {
    // Process withdrawal through blockchain service
    const response = await axios.post('http://localhost:3029/api/token/transfer', {
      from: userId,
      to: destination,
      amount,
      currency: 'AZR',
      type: 'WalletWithdrawal'
    }, { timeout: 10000 });

    return {
      success: true,
      transactionHash: response.data.txHash
    };
  } catch (error) {
    console.error('Wallet withdrawal failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function processStaking(userId, amount, poolId, duration) {
  try {
    // Process staking through blockchain service
    const response = await axios.post('http://localhost:3029/api/token/stake', {
      from: userId,
      to: poolId,
      amount,
      currency: 'AZR',
      duration,
      type: 'Staking'
    }, { timeout: 10000 });

    return {
      success: true,
      transactionHash: response.data.txHash
    };
  } catch (error) {
    console.error('Staking failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function processUnstaking(userId, stakingId) {
  try {
    // Process unstaking through blockchain service
    const response = await axios.post('http://localhost:3029/api/token/unstake', {
      from: 'staking_pool',
      to: userId,
      stakingId,
      type: 'Unstaking'
    }, { timeout: 10000 });

    return {
      success: true,
      transactionHash: response.data.txHash,
      amount: 100, // Mock amount
      rewards: 5    // Mock rewards
    };
  } catch (error) {
    console.error('Unstaking failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function logPaymentEvent(eventType, data) {
  try {
    // Log to blockchain service for immutable audit trail
    await axios.post('http://localhost:3029/api/blockchain/transaction', {
      from: 'azora-pay',
      to: 'payment-audit',
      amount: 0,
      currency: 'AZR',
      type: 'PaymentEvent',
      data: { eventType, ...data, ubuntu: 'Ubuntu payment logging' }
    }, { timeout: 5000 });
  } catch (error) {
    console.warn('Blockchain logging failed:', error.message);
  }
}

// Ubuntu Error Handling
app.use((error, req, res, next) => {
  console.error('Ubuntu Pay Service Error:', error);
  res.status(500).json({
    error: 'Ubuntu payment service error',
    ubuntu: 'We handle financial errors with Ubuntu grace',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Payment endpoint not found',
    ubuntu: 'Ubuntu guidance: Check available payment endpoints',
    availableEndpoints: [
      '/api/payments/intent',
      '/api/payments/confirm',
      '/api/subscriptions/create',
      '/api/refunds/create',
      '/api/wallet/:userId',
      '/api/wallet/:userId/fund',
      '/api/wallet/:userId/withdraw',
      '/api/staking/pools',
      '/api/staking/:userId/stake',
      '/api/staking/:userId/unstake',
      '/api/payment-methods/:userId',
      '/api/customers/:userId/payment-methods',
      '/api/users/:userId/transactions'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`💰 Azora Pay Service running on port ${PORT}`);
  console.log('⚡ Ubuntu: "I transact because we prosper together!"');
  console.log(`🔗 Stripe: ${process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Missing'}`);
  console.log(`🗃️ Wallet: Active`);
  console.log(`🌱 Staking: Active`);
  console.log(`💳 Payment Methods: Active`);
  console.log(`🛡️ Ubuntu: Financial security through community trust`);
});

module.exports = app;

// Ubuntu Philosophy Endpoint
app.get('/api/ubuntu/philosophy', (req, res) => {
  res.json({
    philosophy: 'Ngiyakwazi ngoba sikwazi - I can because we can',
    principles: [
      'My transactions enable your prosperity',
      'My financial security strengthens our foundation',
      'My fair exchange builds trust',
      'My transparent payments create harmony'
    ],
    service: 'azora-pay',
    ubuntu: 'Ubuntu financial services'
  });
});

// Create payment intent with comprehensive features
app.post('/api/payments/intent', async (req, res) => {
  try {
    const { 
      amount, 
      currency = 'usd', 
      userId, 
      metadata = {},
      payment_method_types = ['card'],
      automatic_payment_methods = { enabled: true }
    } = req.body;

    if (!amount || !userId) {
      return res.status(400).json({ 
        error: 'Amount and userId are required',
        ubuntu: 'Complete information enables fair transactions'
      });
    }

    // 1. Create blockchain record
    const blockchainRecord = await createBlockchainRecord(userId, amount, currency, 'PAYMENT_INTENT', metadata);
    
    // 2. Contribute to CitadelFund (10% of payment)
    await contributeToCitadelFund(userId, amount, blockchainRecord.id);

    // 3. Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      payment_method_types,
      automatic_payment_methods,
      metadata: {
        userId,
        blockchainRecordId: blockchainRecord.id,
        citadelContribution: (amount * 0.10).toString(),
        ubuntu: 'Ubuntu transaction',
        ...metadata
      },
      confirmation_method: 'manual',
      confirm: false
    });

    // Store payment record
    payments.set(paymentIntent.id, {
      id: paymentIntent.id,
      userId,
      amount,
      currency,
      status: paymentIntent.status,
      blockchainRecordId: blockchainRecord.id,
      citadelContribution: amount * 0.10,
      createdAt: new Date().toISOString(),
      metadata
    });

    console.log(`💰 Payment intent created: ${paymentIntent.id} for user ${userId} - Amount: ${amount} ${currency}`);

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntent: {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      },
      blockchainRecordId: blockchainRecord.id,
      citadelContribution: amount * 0.10,
      ubuntu: 'Transaction prepared with Ubuntu care'
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      ubuntu: 'We handle payment errors with Ubuntu grace'
    });
  }
});

// Confirm payment intent
app.post('/api/payments/confirm', async (req, res) => {
  try {
    const { paymentIntentId, payment_method_id } = req.body;

    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: payment_method_id
    });

    // Update payment record
    const paymentRecord = payments.get(paymentIntentId);
    if (paymentRecord) {
      paymentRecord.status = paymentIntent.status;
      paymentRecord.updatedAt = new Date().toISOString();
    }

    // If payment succeeded, mint AZR rewards
    if (paymentIntent.status === 'succeeded') {
      await mintAZRRewards(paymentRecord.userId, paymentRecord.amount);
      console.log(`✅ Payment succeeded: ${paymentIntentId} - Minting AZR rewards`);
    }

    res.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency
      },
      ubuntu: 'Payment processed with Ubuntu integrity'
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Create subscription
app.post('/api/subscriptions/create', async (req, res) => {
  try {
    const { 
      userId, 
      priceId, 
      payment_method_id, 
      metadata = {},
      customer_email 
    } = req.body;

    // Create or retrieve customer
    let customer;
    if (customer_email) {
      const customers = await stripe.customers.list({ email: customer_email, limit: 1 });
      customer = customers.data[0] || await stripe.customers.create({
        email: customer_email,
        metadata: { userId, ubuntu: 'Ubuntu customer' }
      });
    } else {
      customer = await stripe.customers.create({
        metadata: { userId, ubuntu: 'Ubuntu customer' }
      });
    }

    // Attach payment method if provided
    if (payment_method_id) {
      await stripe.paymentMethods.attach(payment_method_id, { customer: customer.id });
      await stripe.customers.update(customer.id, {
        invoice_settings: { default_payment_method: payment_method_id }
      });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      metadata: {
        userId,
        ubuntu: 'Ubuntu subscription',
        ...metadata
      },
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent']
    });

    // Store subscription record
    subscriptions.set(subscription.id, {
      id: subscription.id,
      userId,
      customerId: customer.id,
      priceId,
      status: subscription.status,
      createdAt: new Date().toISOString(),
      metadata
    });

    console.log(`🔄 Subscription created: ${subscription.id} for user ${userId}`);

    res.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret
      },
      ubuntu: 'Subscription established with Ubuntu commitment'
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Process refund
app.post('/api/refunds/create', async (req, res) => {
  try {
    const { paymentIntentId, reason, amount } = req.body;

    const paymentRecord = payments.get(paymentIntentId);
    if (!paymentRecord) {
      return res.status(404).json({ 
        success: false, 
        error: 'Payment not found' 
      });
    }

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: reason || 'requested_by_customer',
      amount: amount ? Math.round(amount * 100) : undefined,
      metadata: {
        userId: paymentRecord.userId,
        ubuntu: 'Ubuntu refund',
        originalAmount: paymentRecord.amount.toString()
      }
    });

    // Store refund record
    refunds.set(refund.id, {
      id: refund.id,
      paymentIntentId,
      userId: paymentRecord.userId,
      amount: refund.amount / 100,
      currency: refund.currency,
      status: refund.status,
      reason: refund.reason,
      createdAt: new Date().toISOString()
    });

    console.log(`💸 Refund created: ${refund.id} for payment ${paymentIntentId}`);

    res.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason
      },
      ubuntu: 'Refund processed with Ubuntu fairness'
    });
  } catch (error) {
    console.error('Refund creation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get payment methods for customer
app.get('/api/customers/:userId/payment-methods', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find customer by userId metadata
    const customers = await stripe.customers.list({ 
      limit: 100,
      expand: ['data.invoice_settings.default_payment_method']
    });
    
    const customer = customers.data.find(c => c.metadata?.userId === userId);
    
    if (!customer) {
      return res.json({ success: true, paymentMethods: [] });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer.id,
      type: 'card'
    });

    res.json({
      success: true,
      paymentMethods: paymentMethods.data.map(pm => ({
        id: pm.id,
        type: pm.type,
        card: {
          brand: pm.card.brand,
          last4: pm.card.last4,
          exp_month: pm.card.exp_month,
          exp_year: pm.card.exp_year
        },
        created: pm.created
      })),
      ubuntu: 'Payment methods retrieved with Ubuntu security'
    });
  } catch (error) {
    console.error('Payment methods retrieval error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get transaction history for user
app.get('/api/users/:userId/transactions', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    const userPayments = Array.from(payments.values())
      .filter(p => p.userId === userId)
      .slice(0, limit);

    const userSubscriptions = Array.from(subscriptions.values())
      .filter(s => s.userId === userId)
      .slice(0, limit);

    const userRefunds = Array.from(refunds.values())
      .filter(r => r.userId === userId)
      .slice(0, limit);

    res.json({
      success: true,
      transactions: {
        payments: userPayments,
        subscriptions: userSubscriptions,
        refunds: userRefunds
      },
      ubuntu: 'Transaction history shared with Ubuntu transparency'
    });
  } catch (error) {
    console.error('Transaction history retrieval error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Enhanced webhook handler
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('⚠️ Stripe webhook secret not configured');
    return res.status(400).json({ error: 'Webhook not configured' });
  }

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    console.log(`🔔 Webhook received: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Unhandled webhook event: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Helper functions
async function createBlockchainRecord(userId, amount, currency, actionType, metadata) {
  const record = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    actorId: userId,
    actionType,
    payloadHash: crypto.createHash('sha256').update(JSON.stringify({ amount, currency, userId, metadata })).digest('hex'),
    previousHash: '0',
    signature: 'MOCK_SIGNATURE',
    metadata: { amount, currency, ...metadata }
  };

  try {
    // Record to blockchain service
    await axios.post('http://localhost:3029/api/blockchain/transaction', {
      from: userId,
      to: 'stripe-gateway',
      amount: amount,
      currency: 'AZR',
      type: 'Transfer',
      data: { paymentAction: actionType, fiatCurrency: currency, ...metadata }
    }, { timeout: 5000 });
  } catch (error) {
    console.warn('Blockchain recording failed:', error.message);
  }

  return record;
}

async function contributeToCitadelFund(userId, amount, paymentId) {
  try {
    await axios.post('http://localhost:3030/api/citadel-fund/collect', {
      source: 'stripe-payment',
      amount: amount * 0.10,
      metadata: { paymentId, userId, ubuntu: 'Ubuntu contribution' }
    }, { timeout: 5000 });
  } catch (error) {
    console.warn('CitadelFund contribution failed:', error.message);
  }
}

async function mintAZRRewards(userId, amount) {
  try {
    await axios.post('http://localhost:3031/api/proof/submit', {
      userId,
      type: 'payment',
      valueData: { amount, currency: 'usd', action: 'successful_payment' }
    }, { timeout: 5000 });
  } catch (error) {
    console.warn('AZR reward minting failed:', error.message);
  }
}

// Webhook event handlers
async function handlePaymentSucceeded(paymentIntent) {
  console.log(`✅ Payment succeeded: ${paymentIntent.id}`);
  // Additional logic for successful payments
}

async function handlePaymentFailed(paymentIntent) {
  console.log(`❌ Payment failed: ${paymentIntent.id}`);
  // Additional logic for failed payments
}

async function handleInvoicePaymentSucceeded(invoice) {
  console.log(`✅ Invoice payment succeeded: ${invoice.id}`);
  // Handle subscription renewals
}

async function handleInvoicePaymentFailed(invoice) {
  console.log(`❌ Invoice payment failed: ${invoice.id}`);
  // Handle failed subscription payments
}

async function handleSubscriptionCreated(subscription) {
  console.log(`🔄 Subscription created: ${subscription.id}`);
  // Handle new subscriptions
}

async function handleSubscriptionDeleted(subscription) {
  console.log(`🗑️ Subscription deleted: ${subscription.id}`);
  // Handle subscription cancellations
}

// Ubuntu Error Handling
app.use((error, req, res, next) => {
  console.error('Ubuntu Pay Service Error:', error);
  res.status(500).json({
    error: 'Ubuntu payment service error',
    ubuntu: 'We handle financial errors with Ubuntu grace',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Payment endpoint not found',
    ubuntu: 'Ubuntu guidance: Check available payment endpoints',
    availableEndpoints: [
      '/api/payments/intent',
      '/api/payments/confirm',
      '/api/subscriptions/create',
      '/api/refunds/create',
      '/api/customers/:userId/payment-methods',
      '/api/users/:userId/transactions'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`💰 Azora Pay Service running on port ${PORT}`);
  console.log('⚡ Ubuntu: "I transact because we prosper together!"');
  console.log(`🔗 Stripe: ${process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Missing'}`);
  console.log(`🛡️ Ubuntu: Financial security through community trust`);
});

module.exports = app;
