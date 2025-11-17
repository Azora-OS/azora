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
const PORT = process.env.PORT || 3028;

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
    })
  ]
});

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// In-memory storage for treasury assets and transactions (in production, use a database)
const treasuryAssets = new Map();
const treasuryTransactions = new Map();
const financialReports = new Map();

// Initialize with sample data
treasuryAssets.set('asset_1', {
  id: 'asset_1',
  type: 'cryptocurrency',
  name: 'Bitcoin',
  symbol: 'BTC',
  amount: 10.5,
  value: 350000,
  lastUpdated: new Date().toISOString()
});

treasuryAssets.set('asset_2', {
  id: 'asset_2',
  type: 'fiat',
  name: 'USD',
  symbol: 'USD',
  amount: 100000,
  value: 100000,
  lastUpdated: new Date().toISOString()
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'azora-treasury', 
    timestamp: new Date().toISOString() 
  });
});

// Get all treasury assets
app.get('/api/assets', (req, res) => {
  try {
    const assetList = Array.from(treasuryAssets.values());
    const totalValue = assetList.reduce((sum, asset) => sum + asset.value, 0);
    
    res.json({
      success: true,
      data: {
        assets: assetList,
        totalValue: totalValue,
        count: assetList.length
      }
    });
  } catch (error) {
    logger.error('Error fetching assets:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific treasury asset
app.get('/api/assets/:assetId', (req, res) => {
  try {
    const { assetId } = req.params;
    const asset = treasuryAssets.get(assetId);
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    res.json({
      success: true,
      data: asset
    });
  } catch (error) {
    logger.error('Error fetching asset:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add or update treasury asset
app.post('/api/assets', (req, res) => {
  try {
    const { type, name, symbol, amount, value } = req.body;
    
    // Validate input
    if (!type || !name || !symbol || amount === undefined || value === undefined) {
      return res.status(400).json({ error: 'Type, name, symbol, amount, and value are required' });
    }
    
    const assetId = uuidv4();
    const asset = {
      id: assetId,
      type,
      name,
      symbol,
      amount,
      value,
      lastUpdated: new Date().toISOString()
    };
    
    treasuryAssets.set(assetId, asset);
    
    logger.info(`Treasury asset ${assetId} added`);
    
    res.status(201).json({
      success: true,
      data: asset
    });
  } catch (error) {
    logger.error('Error adding asset:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update treasury asset
app.put('/api/assets/:assetId', (req, res) => {
  try {
    const { assetId } = req.params;
    const { amount, value } = req.body;
    
    const asset = treasuryAssets.get(assetId);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    // Update asset
    asset.amount = amount !== undefined ? amount : asset.amount;
    asset.value = value !== undefined ? value : asset.value;
    asset.lastUpdated = new Date().toISOString();
    
    treasuryAssets.set(assetId, asset);
    
    logger.info(`Treasury asset ${assetId} updated`);
    
    res.json({
      success: true,
      data: asset
    });
  } catch (error) {
    logger.error('Error updating asset:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reserve management endpoint
app.post('/api/reserves', (req, res) => {
  try {
    const { assetId, amount, action, description } = req.body;
    
    // Validate input
    if (!assetId || !amount || !action) {
      return res.status(400).json({ error: 'Asset ID, amount, and action are required' });
    }
    
    // Check if asset exists
    const asset = treasuryAssets.get(assetId);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    const transactionId = uuidv4();
    const transaction = {
      id: transactionId,
      assetId,
      assetName: asset.name,
      amount,
      action,
      description: description || '',
      timestamp: new Date().toISOString()
    };
    
    treasuryTransactions.set(transactionId, transaction);
    
    // Update asset based on action
    if (action === 'add') {
      asset.amount += amount;
      asset.value = asset.amount * (asset.value / (asset.amount - amount)); // Simplified value update
    } else if (action === 'remove') {
      asset.amount -= amount;
      asset.value = asset.amount * (asset.value / (asset.amount + amount)); // Simplified value update
    }
    
    asset.lastUpdated = new Date().toISOString();
    treasuryAssets.set(assetId, asset);
    
    logger.info(`Reserve transaction ${transactionId} completed`);
    
    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    logger.error('Error processing reserve transaction:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all reserve transactions
app.get('/api/reserves', (req, res) => {
  try {
    const transactionList = Array.from(treasuryTransactions.values());
    
    res.json({
      success: true,
      data: transactionList,
      count: transactionList.length
    });
  } catch (error) {
    logger.error('Error fetching reserve transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific reserve transaction
app.get('/api/reserves/:transactionId', (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = treasuryTransactions.get(transactionId);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    logger.error('Error fetching transaction:', error);
    res.status(500).json({ error: error.message });
  }
});

// Financial reporting endpoint
app.get('/api/reports', (req, res) => {
  try {
    const assetList = Array.from(treasuryAssets.values());
    const totalAssets = assetList.reduce((sum, asset) => sum + asset.value, 0);
    
    const report = {
      id: uuidv4(),
      totalAssets: totalAssets,
      totalLiabilities: 1250000,
      netWorth: totalAssets - 1250000,
      assetBreakdown: assetList.map(asset => ({
        name: asset.name,
        type: asset.type,
        value: asset.value,
        percentage: ((asset.value / totalAssets) * 100).toFixed(2) + '%'
      })),
      lastUpdated: new Date().toISOString()
    };
    
    financialReports.set(report.id, report);
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('Error generating financial report:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific financial report
app.get('/api/reports/:reportId', (req, res) => {
  try {
    const { reportId } = req.params;
    const report = financialReports.get(reportId);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('Error fetching financial report:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all financial reports
app.get('/api/reports/history', (req, res) => {
  try {
    const reportList = Array.from(financialReports.values());
    
    res.json({
      success: true,
      data: reportList,
      count: reportList.length
    });
  } catch (error) {
    logger.error('Error fetching financial reports:', error);
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
  logger.info(`Azora Treasury Service running on port ${PORT}`);
});

module.exports = app;