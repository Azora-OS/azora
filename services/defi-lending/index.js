const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3031;

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'defi-lending' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// In-memory storage for lending pools, lending positions, and borrowing positions (in production, use a database)
const lendingPools = new Map();
const lendingPositions = new Map();
const borrowingPositions = new Map();

// Initialize with sample data
lendingPools.set('pool_1', {
  id: 'pool_1',
  asset: 'ETH',
  totalLiquidity: 1500,
  availableLiquidity: 1200,
  utilizationRate: 0.2,
  apy: 8.5,
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

lendingPools.set('pool_2', {
  id: 'pool_2',
  asset: 'BTC',
  totalLiquidity: 2500,
  availableLiquidity: 2000,
  utilizationRate: 0.2,
  apy: 6.2,
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'defi-lending', 
    timestamp: new Date().toISOString() 
  });
});

// Get all lending pools
app.get('/api/pools', (req, res) => {
  try {
    const poolList = Array.from(lendingPools.values());
    
    res.json({
      success: true,
      data: poolList,
      count: poolList.length
    });
  } catch (error) {
    logger.error('Error fetching pools:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific lending pool
app.get('/api/pools/:poolId', (req, res) => {
  try {
    const { poolId } = req.params;
    const pool = lendingPools.get(poolId);
    
    if (!pool) {
      return res.status(404).json({ error: 'Pool not found' });
    }
    
    res.json({
      success: true,
      data: pool
    });
  } catch (error) {
    logger.error('Error fetching pool:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new lending pool
app.post('/api/pools', (req, res) => {
  try {
    const { asset, initialLiquidity, apy } = req.body;
    
    // Validate input
    if (!asset || initialLiquidity === undefined) {
      return res.status(400).json({ error: 'Asset and initial liquidity are required' });
    }
    
    const poolId = uuidv4();
    const pool = {
      id: poolId,
      asset,
      totalLiquidity: initialLiquidity,
      availableLiquidity: initialLiquidity,
      utilizationRate: 0,
      apy: apy || 5.0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    lendingPools.set(poolId, pool);
    
    logger.info(`Lending pool ${poolId} created for asset ${asset}`);
    
    res.status(201).json({
      success: true,
      data: pool
    });
  } catch (error) {
    logger.error('Error creating pool:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all lending positions
app.get('/api/lend', (req, res) => {
  try {
    const positionList = Array.from(lendingPositions.values());
    
    res.json({
      success: true,
      data: positionList,
      count: positionList.length
    });
  } catch (error) {
    logger.error('Error fetching lending positions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific lending position
app.get('/api/lend/:positionId', (req, res) => {
  try {
    const { positionId } = req.params;
    const position = lendingPositions.get(positionId);
    
    if (!position) {
      return res.status(404).json({ error: 'Lending position not found' });
    }
    
    res.json({
      success: true,
      data: position
    });
  } catch (error) {
    logger.error('Error fetching lending position:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new lending position
app.post('/api/lend', (req, res) => {
  try {
    const { asset, amount, wallet, duration } = req.body;
    
    // Validate input
    if (!asset || !amount || !wallet) {
      return res.status(400).json({ error: 'Asset, amount, and wallet are required' });
    }
    
    // Check if pool exists
    let pool = null;
    for (const p of lendingPools.values()) {
      if (p.asset === asset && p.status === 'active') {
        pool = p;
        break;
      }
    }
    
    if (!pool) {
      return res.status(404).json({ error: 'Active lending pool not found for this asset' });
    }
    
    // Check if enough liquidity is available
    if (pool.availableLiquidity < amount) {
      return res.status(400).json({ error: 'Insufficient liquidity in the pool' });
    }
    
    const positionId = uuidv4();
    const position = {
      id: positionId,
      asset,
      amount,
      wallet,
      duration: duration || '30d',
      apy: pool.apy,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    lendingPositions.set(positionId, position);
    
    // Update pool liquidity
    pool.availableLiquidity -= amount;
    pool.utilizationRate = 1 - (pool.availableLiquidity / pool.totalLiquidity);
    pool.updatedAt = new Date().toISOString();
    
    logger.info(`Lending position ${positionId} created for wallet ${wallet}`);
    
    res.status(201).json({
      success: true,
      data: position
    });
  } catch (error) {
    logger.error('Error creating lending position:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update lending position
app.put('/api/lend/:positionId', (req, res) => {
  try {
    const { positionId } = req.params;
    const { status } = req.body;
    
    const position = lendingPositions.get(positionId);
    if (!position) {
      return res.status(404).json({ error: 'Lending position not found' });
    }
    
    // Update position
    position.status = status || position.status;
    position.updatedAt = new Date().toISOString();
    
    lendingPositions.set(positionId, position);
    
    logger.info(`Lending position ${positionId} updated`);
    
    res.json({
      success: true,
      data: position
    });
  } catch (error) {
    logger.error('Error updating lending position:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all borrowing positions
app.get('/api/borrow', (req, res) => {
  try {
    const positionList = Array.from(borrowingPositions.values());
    
    res.json({
      success: true,
      data: positionList,
      count: positionList.length
    });
  } catch (error) {
    logger.error('Error fetching borrowing positions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific borrowing position
app.get('/api/borrow/:positionId', (req, res) => {
  try {
    const { positionId } = req.params;
    const position = borrowingPositions.get(positionId);
    
    if (!position) {
      return res.status(404).json({ error: 'Borrowing position not found' });
    }
    
    res.json({
      success: true,
      data: position
    });
  } catch (error) {
    logger.error('Error fetching borrowing position:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new borrowing position
app.post('/api/borrow', (req, res) => {
  try {
    const { asset, amount, collateral, wallet, duration } = req.body;
    
    // Validate input
    if (!asset || !amount || !collateral || !wallet) {
      return res.status(400).json({ error: 'Asset, amount, collateral, and wallet are required' });
    }
    
    // Check if pool exists
    let pool = null;
    for (const p of lendingPools.values()) {
      if (p.asset === asset && p.status === 'active') {
        pool = p;
        break;
      }
    }
    
    if (!pool) {
      return res.status(404).json({ error: 'Active lending pool not found for this asset' });
    }
    
    // Check if enough liquidity is available
    if (pool.availableLiquidity < amount) {
      return res.status(400).json({ error: 'Insufficient liquidity in the pool' });
    }
    
    const positionId = uuidv4();
    const position = {
      id: positionId,
      asset,
      amount,
      collateral,
      wallet,
      duration: duration || '30d',
      interestRate: pool.apy + 2.0, // Borrowing rate is typically higher than lending rate
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    borrowingPositions.set(positionId, position);
    
    // Update pool liquidity
    pool.availableLiquidity -= amount;
    pool.utilizationRate = 1 - (pool.availableLiquidity / pool.totalLiquidity);
    pool.updatedAt = new Date().toISOString();
    
    logger.info(`Borrowing position ${positionId} created for wallet ${wallet}`);
    
    res.status(201).json({
      success: true,
      data: position
    });
  } catch (error) {
    logger.error('Error creating borrowing position:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update borrowing position
app.put('/api/borrow/:positionId', (req, res) => {
  try {
    const { positionId } = req.params;
    const { status } = req.body;
    
    const position = borrowingPositions.get(positionId);
    if (!position) {
      return res.status(404).json({ error: 'Borrowing position not found' });
    }
    
    // Update position
    position.status = status || position.status;
    position.updatedAt = new Date().toISOString();
    
    borrowingPositions.set(positionId, position);
    
    logger.info(`Borrowing position ${positionId} updated`);
    
    res.json({
      success: true,
      data: position
    });
  } catch (error) {
    logger.error('Error updating borrowing position:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  logger.info(`DeFi Lending Service running on port ${PORT}`);
});

module.exports = app;