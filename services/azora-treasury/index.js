const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');
const axios = require('axios');
const Redis = require('ioredis');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3028;

// Initialize Redis for caching
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'azora-treasury' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'treasury.log' })
  ]
});

// Enhanced Treasury Service with Blockchain Integration
class EnhancedTreasuryService {
  constructor() {
    this.assets = new Map();
    this.transactions = new Map();
    this.priceFeeds = new Map();
    this.vaultContracts = new Map();
    this.initializeTrackedAssets();
    this.loadPersistedData();
    this.startPriceFeedUpdates();
  }

  // ========== BLOCKCHAIN ASSET TRACKING ==========

  async getNativeBalance() {
    try {
      const response = await axios.post(`${process.env.BLOCKCHAIN_SERVICE_URL || 'http://localhost:3010'}/api/balance/native`, {
        address: process.env.TREASURY_WALLET_ADDRESS || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
      });
      return response.data.balance;
    } catch (error) {
      logger.error('Failed to get native balance', { error: error.message });
      throw new Error('Failed to get native balance');
    }
  }

  async getTokenBalance(tokenAddress) {
    try {
      const response = await axios.post(`${process.env.BLOCKCHAIN_SERVICE_URL || 'http://localhost:3010'}/api/balance/token`, {
        address: process.env.TREASURY_WALLET_ADDRESS || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        tokenAddress
      });
      return response.data.balance;
    } catch (error) {
      logger.error('Failed to get token balance', { tokenAddress, error: error.message });
      throw new Error('Failed to get token balance');
    }
  }

  async getNFTBalance(nftAddress) {
    try {
      const response = await axios.post(`${process.env.BLOCKCHAIN_SERVICE_URL || 'http://localhost:3010'}/api/nft/balance`, {
        address: process.env.TREASURY_WALLET_ADDRESS || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        nftAddress
      });
      return response.data.balance;
    } catch (error) {
      logger.error('Failed to get NFT balance', { nftAddress, error: error.message });
      throw new Error('Failed to get NFT balance');
    }
  }

  async getPortfolio() {
    const portfolio = [];

    // Get native ETH balance
    const ethBalance = await this.getNativeBalance();
    const ethPrice = await this.getPrice('ETH');
    portfolio.push({
      id: 'native_eth',
      symbol: 'ETH',
      name: 'Ethereum',
      type: 'native',
      balance: ethBalance,
      decimals: 18,
      valueUsd: parseFloat(ethBalance) * ethPrice,
      valueEth: parseFloat(ethBalance),
      priceSource: 'coingecko',
      lastUpdated: new Date().toISOString(),
      contractAddress: null
    });

    // Get tracked ERC20 tokens
    for (const [address, asset] of this.assets) {
      if (asset.type === 'erc20') {
        try {
          const balance = await this.getTokenBalance(address);
          const price = await this.getPrice(asset.symbol);
          
          portfolio.push({
            ...asset,
            balance,
            valueUsd: parseFloat(balance) * price,
            valueEth: (parseFloat(balance) * price) / ethPrice,
            lastUpdated: new Date().toISOString()
          });
        } catch (error) {
          logger.warn(`Failed to get balance for ${asset.symbol}`, { address });
        }
      }
    }

    // Get NFT balances
    for (const [address, asset] of this.assets) {
      if (asset.type === 'erc721') {
        try {
          const balance = await this.getNFTBalance(address);
          if (balance > 0) {
            portfolio.push({
              ...asset,
              balance: balance.toString(),
              valueUsd: 0, // NFTs need separate valuation
              valueEth: 0,
              lastUpdated: new Date().toISOString()
            });
          }
        } catch (error) {
          logger.warn(`Failed to get NFT balance for ${asset.symbol}`, { address });
        }
      }
    }

    return portfolio;
  }

  async getTotalValueUsd() {
    const portfolio = await this.getPortfolio();
    return portfolio.reduce((total, asset) => total + asset.valueUsd, 0);
  }

  async getTotalValueEth() {
    const portfolio = await this.getPortfolio();
    return portfolio.reduce((total, asset) => total + asset.valueEth, 0);
  }

  // ========== PRICE FEEDS ==========

  async getPrice(symbol) {
    // Check cache first
    const cached = this.priceFeeds.get(symbol);
    if (cached && Date.now() - new Date(cached.timestamp).getTime() < 60000) { // 1 minute cache
      return cached.price;
    }

    // Fetch from CoinGecko
    try {
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd`);
      const price = response.data[symbol.toLowerCase()]?.usd;
      
      if (price) {
        this.priceFeeds.set(symbol, {
          symbol,
          price,
          timestamp: new Date().toISOString(),
          source: 'coingecko',
          confidence: 0.95
        });
        return price;
      }
    } catch (error) {
      logger.warn(`Failed to fetch price from CoinGecko for ${symbol}`);
    }

    // Fallback to manual price
    const fallbackPrice = this.getFallbackPrice(symbol);
    this.priceFeeds.set(symbol, {
      symbol,
      price: fallbackPrice,
      timestamp: new Date().toISOString(),
      source: 'manual',
      confidence: 0.5
    });

    return fallbackPrice;
  }

  getFallbackPrice(symbol) {
    const fallbackPrices = {
      'ETH': 2000,
      'AZR': 1.5,
      'USDC': 1.0,
      'USDT': 1.0,
      'WBTC': 45000
    };
    return fallbackPrices[symbol] || 0;
  }

  // ========== TRANSACTION MONITORING ==========

  async getTransactionHistory(limit = 100) {
    const transactions = Array.from(this.transactions.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
    
    return transactions;
  }

  async getTransactionsByType(type) {
    return Array.from(this.transactions.values())
      .filter(tx => tx.type === type)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // ========== TREASURY OPERATIONS ==========

  async transferAsset(assetAddress, to, amount) {
    try {
      const response = await axios.post(`${process.env.BLOCKCHAIN_SERVICE_URL || 'http://localhost:3010'}/api/transfer`, {
        from: process.env.TREASURY_WALLET_ADDRESS || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        to,
        assetAddress,
        amount
      });

      const transaction = {
        id: uuidv4(),
        hash: response.data.txHash,
        type: 'transfer',
        asset: assetAddress === 'ETH' ? 'ETH' : this.assets.get(assetAddress)?.symbol || 'UNKNOWN',
        amount,
        from: process.env.TREASURY_WALLET_ADDRESS || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        to,
        timestamp: new Date().toISOString(),
        blockNumber: response.data.blockNumber || 0,
        gasUsed: response.data.gasUsed || '0',
        gasPrice: response.data.gasPrice || '0',
        status: 'confirmed'
      };

      this.transactions.set(transaction.id, transaction);
      await this.persistTransaction(transaction);

      logger.info(`Asset transferred`, {
        asset: assetAddress,
        to,
        amount,
        txHash: transaction.hash
      });

      return transaction;
    } catch (error) {
      logger.error('Failed to transfer asset', { assetAddress, to, amount, error: error.message });
      throw new Error(`Failed to transfer asset: ${error.message}`);
    }
  }

  // ========== METRICS AND ANALYTICS ==========

  async getTreasuryMetrics() {
    const portfolio = await this.getPortfolio();
    const transactions = Array.from(this.transactions.values());
    
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const dailyTransactions = transactions.filter(tx => new Date(tx.timestamp) > oneDayAgo);
    const weeklyTransactions = transactions.filter(tx => new Date(tx.timestamp) > oneWeekAgo);
    const monthlyTransactions = transactions.filter(tx => new Date(tx.timestamp) > oneMonthAgo);

    const dailyVolume = dailyTransactions.reduce((sum, tx) => sum + (parseFloat(tx.amount) * await this.getPrice(tx.asset)), 0);
    const weeklyVolume = weeklyTransactions.reduce((sum, tx) => sum + (parseFloat(tx.amount) * await this.getPrice(tx.asset)), 0);
    const monthlyVolume = monthlyTransactions.reduce((sum, tx) => sum + (parseFloat(tx.amount) * await this.getPrice(tx.asset)), 0);

    const totalValueUsd = await this.getTotalValueUsd();
    const totalValueEth = await this.getTotalValueEth();

    return {
      totalValueUsd,
      totalValueEth,
      assetCount: portfolio.length,
      transactionCount: transactions.length,
      dailyVolume,
      weeklyVolume,
      monthlyVolume,
      yieldRate: this.calculateYieldRate(portfolio, transactions),
      riskScore: this.calculateRiskScore(portfolio),
      diversificationScore: this.calculateDiversificationScore(portfolio),
      ubuntu: 'Treasury metrics reflect Ubuntu prosperity'
    };
  }

  calculateYieldRate(portfolio, transactions) {
    // Simplified yield calculation
    const monthlyTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.timestamp);
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return txDate > oneMonthAgo && tx.type === 'deposit';
    });

    if (monthlyTransactions.length === 0) return 0;

    const monthlyDeposits = monthlyTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    const currentValue = portfolio.reduce((sum, asset) => sum + asset.valueUsd, 0);
    
    return ((currentValue - monthlyDeposits) / monthlyDeposits) * 100;
  }

  calculateRiskScore(portfolio) {
    // Simplified risk calculation based on asset concentration
    const ethWeight = portfolio.find(a => a.symbol === 'ETH')?.valueUsd || 0;
    const totalValue = portfolio.reduce((sum, asset) => sum + asset.valueUsd, 0);
    
    if (totalValue === 0) return 0;
    
    const concentration = ethWeight / totalValue;
    const volatility = 0.3; // Simplified volatility score
    
    return Math.min(100, concentration * 50 + volatility * 50);
  }

  calculateDiversificationScore(portfolio) {
    if (portfolio.length === 0) return 0;
    
    const uniqueTypes = new Set(portfolio.map(a => a.type)).size;
    const maxTypes = 4; // native, erc20, erc721, vault
    
    return (uniqueTypes / maxTypes) * 100;
  }

  // ========== UTILITY METHODS ==========

  initializeTrackedAssets() {
    // Initialize with known assets
    const knownAssets = [
      {
        id: 'azr_token',
        symbol: 'AZR',
        name: 'Azora Token',
        type: 'erc20',
        decimals: 18,
        balance: '0',
        valueUsd: 0,
        valueEth: 0,
        priceSource: 'coingecko',
        lastUpdated: new Date().toISOString(),
        contractAddress: process.env.AZR_TOKEN_ADDRESS
      },
      {
        id: 'usdc_token',
        symbol: 'USDC',
        name: 'USD Coin',
        type: 'erc20',
        decimals: 6,
        balance: '0',
        valueUsd: 0,
        valueEth: 0,
        priceSource: 'coingecko',
        lastUpdated: new Date().toISOString(),
        contractAddress: process.env.USDC_TOKEN_ADDRESS
      }
    ];

    knownAssets.forEach(asset => {
      this.assets.set(asset.id, asset);
    });

    logger.info(`Initialized ${this.assets.size} tracked assets`);
  }

  startPriceFeedUpdates() {
    // Update prices every 5 minutes
    setInterval(async () => {
      try {
        for (const [id, asset] of this.assets) {
          await this.getPrice(asset.symbol);
        }
        await this.getPrice('ETH');
      } catch (error) {
        logger.error('Error updating price feeds', { error });
      }
    }, 5 * 60 * 1000);
  }

  // ========== DATA PERSISTENCE ==========

  async persistTransaction(transaction) {
    try {
      await redis.setex(`tx:${transaction.id}`, 86400 * 30, JSON.stringify(transaction)); // 30 days
    } catch (error) {
      logger.error('Failed to persist transaction', { txId: transaction.id, error });
    }
  }

  async loadPersistedData() {
    try {
      // Load transactions
      const txKeys = await redis.keys('tx:*');
      for (const key of txKeys) {
        const txData = await redis.get(key);
        if (txData) {
          const transaction = JSON.parse(txData);
          this.transactions.set(transaction.id, transaction);
        }
      }

      logger.info(`Loaded ${this.transactions.size} transactions from Redis`);
    } catch (error) {
      logger.error('Failed to load persisted data', { error });
    }
  }

  async healthCheck() {
    try {
      // Check blockchain service
      await axios.get(`${process.env.BLOCKCHAIN_SERVICE_URL || 'http://localhost:3010'}/health`);
      await redis.ping();
      
      return {
        healthy: true,
        details: {
          blockchain: 'connected',
          redis: 'connected',
          trackedAssets: this.assets.size,
          transactions: this.transactions.size,
          ubuntu: 'Treasury operational with blockchain integration'
        }
      };
    } catch (error) {
      return {
        healthy: false,
        details: {
          error: error.message,
          ubuntu: 'Treasury needs attention'
        }
      };
    }
  }
}

const treasuryService = new EnhancedTreasuryService();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(compression());
app.use(express.json());

// Ubuntu Rate Limiting
const ubuntuLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: { 
    error: 'Ubuntu rate limit exceeded', 
    ubuntu: 'Please slow down for treasury harmony' 
  }
});
app.use(ubuntuLimiter);

// Middleware to get user ID from header
const getUserId = (req) => {
  return req.headers['x-user-id'] || req.user?.id || 'user_123456789';
};

// Health Check
app.get('/health', async (req, res) => {
  try {
    const health = await treasuryService.healthCheck();
    const metrics = await treasuryService.getTreasuryMetrics();
    
    res.json({
      service: 'azora-treasury',
      status: health.healthy ? 'healthy' : 'unhealthy',
      ubuntu: 'I manage our collective wealth with Ubuntu stewardship',
      timestamp: new Date().toISOString(),
      port: PORT,
      health,
      metrics,
      features: {
        blockchainIntegration: '✅ Active',
        assetTracking: '✅ Active',
        priceFeeds: '✅ Active',
        transactionMonitoring: '✅ Active',
        treasuryOperations: '✅ Active',
        riskAssessment: '✅ Active',
        ubuntuStewardship: '✅ Active'
      }
    });
  } catch (error) {
    res.status(500).json({
      service: 'azora-treasury',
      status: 'unhealthy',
      error: error.message,
      ubuntu: 'We handle health check errors with Ubuntu grace'
    });
  }
});

// Ubuntu Philosophy Endpoint
app.get('/api/ubuntu/philosophy', (req, res) => {
  res.json({
    philosophy: 'I am because we are - Ubuntu treasury stewardship for collective prosperity',
    principles: [
      'My management grows our shared wealth',
      'My transparency builds community trust',
      'My wisdom sustains our prosperity',
      'My stewardship honors our collective future'
    ],
    service: 'azora-treasury',
    ubuntu: 'Ubuntu treasury stewardship'
  });
});

// ========== TREASURY ENDPOINTS ==========

// GET /api/portfolio - Get complete treasury portfolio
app.get('/api/portfolio', async (req, res) => {
  try {
    const portfolio = await treasuryService.getPortfolio();
    const totalValueUsd = await treasuryService.getTotalValueUsd();
    const totalValueEth = await treasuryService.getTotalValueEth();

    res.json({
      portfolio,
      summary: {
        totalValueUsd,
        totalValueEth,
        assetCount: portfolio.length
      },
      ubuntu: 'Portfolio reflects Ubuntu prosperity'
    });
  } catch (error) {
    logger.error('Error fetching portfolio:', error);
    res.status(500).json({
      error: 'Failed to fetch portfolio',
      ubuntu: 'We handle portfolio errors with Ubuntu grace'
    });
  }
});

// GET /api/metrics - Get treasury metrics and analytics
app.get('/api/metrics', async (req, res) => {
  try {
    const metrics = await treasuryService.getTreasuryMetrics();
    
    res.json({
      metrics,
      ubuntu: 'Metrics reflect Ubuntu treasury health'
    });
  } catch (error) {
    logger.error('Error fetching metrics:', error);
    res.status(500).json({
      error: 'Failed to fetch metrics',
      ubuntu: 'We handle metric errors with Ubuntu grace'
    });
  }
});

// GET /api/transactions - Get transaction history
app.get('/api/transactions', async (req, res) => {
  try {
    const { limit, type } = req.query;
    let transactions;

    if (type) {
      transactions = await treasuryService.getTransactionsByType(type);
    } else {
      transactions = await treasuryService.getTransactionHistory(parseInt(limit) || 100);
    }

    res.json({
      transactions,
      total: transactions.length,
      ubuntu: 'Transactions show Ubuntu flow of resources'
    });
  } catch (error) {
    logger.error('Error fetching transactions:', error);
    res.status(500).json({
      error: 'Failed to fetch transactions',
      ubuntu: 'We handle transaction errors with Ubuntu grace'
    });
  }
});

// POST /api/transfer - Transfer assets from treasury
app.post('/api/transfer', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { assetAddress, to, amount } = req.body;

    if (!assetAddress || !to || !amount) {
      return res.status(400).json({
        error: 'Asset address, recipient, and amount are required',
        ubuntu: 'Ubuntu clarity: Complete transfer details enable proper stewardship'
      });
    }

    const transaction = await treasuryService.transferAsset(assetAddress, to, amount);

    console.log(`💰 Asset transferred by user ${userId}`, {
      asset: assetAddress,
      to,
      amount,
      txHash: transaction.hash
    });

    res.status(201).json({
      success: true,
      transaction,
      ubuntu: 'Asset transferred with Ubuntu stewardship'
    });
  } catch (error) {
    logger.error('Error transferring asset:', error);
    res.status(500).json({
      error: 'Failed to transfer asset',
      message: error.message,
      ubuntu: 'We handle transfer errors with Ubuntu grace'
    });
  }
});

// GET /api/balances/:asset - Get specific asset balance
app.get('/api/balances/:asset', async (req, res) => {
  try {
    const { asset } = req.params;
    let balance;

    if (asset === 'ETH') {
      balance = await treasuryService.getNativeBalance();
    } else {
      const assetData = Array.from(treasuryService.assets.values()).find(a => a.symbol === asset);
      if (assetData && assetData.contractAddress) {
        balance = await treasuryService.getTokenBalance(assetData.contractAddress);
      } else {
        return res.status(404).json({
          error: 'Asset not found',
          ubuntu: 'Ubuntu guidance: Check asset symbol'
        });
      }
    }

    const price = await treasuryService.getPrice(asset);
    const valueUsd = parseFloat(balance) * price;

    res.json({
      asset,
      balance,
      valueUsd,
      price,
      ubuntu: 'Balance reflects Ubuntu prosperity'
    });
  } catch (error) {
    logger.error('Error fetching balance:', error);
    res.status(500).json({
      error: 'Failed to fetch balance',
      ubuntu: 'We handle balance errors with Ubuntu grace'
    });
  }
});

// GET /api/price/:symbol - Get asset price
app.get('/api/price/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const price = await treasuryService.getPrice(symbol);
    const priceFeed = treasuryService.priceFeeds.get(symbol);

    res.json({
      symbol,
      price,
      source: priceFeed?.source || 'manual',
      confidence: priceFeed?.confidence || 0.5,
      timestamp: priceFeed?.timestamp || new Date().toISOString(),
      ubuntu: 'Price reflects Ubuntu market harmony'
    });
  } catch (error) {
    logger.error('Error fetching price:', error);
    res.status(500).json({
      error: 'Failed to fetch price',
      ubuntu: 'We handle price errors with Ubuntu grace'
    });
  }
});

// GET /api/dashboard - Get treasury dashboard
app.get('/api/dashboard', async (req, res) => {
  try {
    const portfolio = await treasuryService.getPortfolio();
    const metrics = await treasuryService.getTreasuryMetrics();
    const recentTransactions = await treasuryService.getTransactionHistory(10);

    res.json({
      portfolio,
      metrics,
      recentTransactions,
      ubuntu: 'Dashboard shows Ubuntu treasury ecosystem'
    });
  } catch (error) {
    logger.error('Error fetching dashboard:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard',
      ubuntu: 'We handle dashboard errors with Ubuntu grace'
    });
  }
});

// Ubuntu Error Handling
app.use((error, req, res, next) => {
  logger.error('Ubuntu Treasury Error:', error);
  res.status(500).json({
    error: 'Ubuntu treasury error',
    ubuntu: 'We handle treasury errors with Ubuntu grace',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Treasury endpoint not found',
    ubuntu: 'Ubuntu guidance: Check available treasury endpoints',
    availableEndpoints: [
      '/api/portfolio',
      '/api/metrics',
      '/api/transactions',
      '/api/transfer',
      '/api/balances/:asset',
      '/api/price/:symbol',
      '/api/dashboard',
      '/health'
    ]
  });
});

// Start the service
app.listen(PORT, () => {
  console.log(`💰 Azora Treasury Service running on port ${PORT}`);
  console.log('⚡ Ubuntu: "I manage our collective wealth with Ubuntu stewardship!"');
  console.log(`🔗 Blockchain Integration: Active`);
  console.log(`📊 Asset Tracking: Active`);
  console.log(`💱 Price Feeds: Active`);
  console.log(`📈 Transaction Monitoring: Active`);
  console.log(`🏦 Treasury Operations: Active`);
  console.log(`⚖️ Risk Assessment: Active`);
  console.log(`🌍 Ubuntu: Treasury stewardship through collective prosperity`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  if (redis) {
    await redis.quit();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  if (redis) {
    await redis.quit();
  }
  process.exit(0);
});

module.exports = app;
