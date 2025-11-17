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
const PORT = process.env.PORT || 3032;

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'exchange-rate-service' },
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

// In-memory storage for exchange rates and historical data (in production, use a database)
const exchangeRates = new Map();
const historicalRates = new Map();

// Initialize with sample data
const initialRates = {
  USD: 1,
  EUR: 0.93,
  GBP: 0.82,
  JPY: 148.50,
  CAD: 1.36,
  AUD: 1.52,
  CHF: 0.91,
  ZAR: 18.35
};

// Populate exchange rates
Object.keys(initialRates).forEach(currency => {
  exchangeRates.set(currency, initialRates[currency]);
});

// Generate some historical data
Object.keys(initialRates).forEach(currency => {
  if (currency !== 'USD') {
    const history = [];
    for (let i = 0; i < 30; i++) {
      const rate = initialRates[currency] + (Math.random() - 0.5) * 0.1;
      history.push({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        rate: parseFloat(rate.toFixed(6))
      });
    }
    historicalRates.set(currency, history);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'exchange-rate-service', 
    timestamp: new Date().toISOString() 
  });
});

// Get all exchange rates
app.get('/api/rates', (req, res) => {
  try {
    const rates = {};
    for (const [currency, rate] of exchangeRates) {
      rates[currency] = rate;
    }
    
    res.json({
      success: true,
      data: {
        rates,
        base: 'USD',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching exchange rates:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific currency rate
app.get('/api/rates/:currency', (req, res) => {
  try {
    const { currency } = req.params;
    const rate = exchangeRates.get(currency.toUpperCase());
    
    if (rate === undefined) {
      return res.status(404).json({ error: 'Currency not found' });
    }
    
    res.json({
      success: true,
      data: {
        currency: currency.toUpperCase(),
        rate,
        base: 'USD',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching currency rate:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update exchange rates (admin only)
app.post('/api/rates', (req, res) => {
  try {
    const { rates } = req.body;
    
    // Validate input
    if (!rates || typeof rates !== 'object') {
      return res.status(400).json({ error: 'Valid rates object is required' });
    }
    
    // Update rates
    Object.keys(rates).forEach(currency => {
      exchangeRates.set(currency.toUpperCase(), parseFloat(rates[currency]));
    });
    
    logger.info('Exchange rates updated');
    
    res.json({
      success: true,
      data: {
        message: 'Exchange rates updated successfully',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error updating exchange rates:', error);
    res.status(500).json({ error: error.message });
  }
});

// Currency conversion endpoint
app.post('/api/convert', (req, res) => {
  try {
    const { from, to, amount } = req.body;
    
    // Validate input
    if (!from || !to || amount === undefined) {
      return res.status(400).json({ error: 'From currency, to currency, and amount are required' });
    }
    
    const fromRate = exchangeRates.get(from.toUpperCase());
    const toRate = exchangeRates.get(to.toUpperCase());
    
    if (fromRate === undefined) {
      return res.status(404).json({ error: `Currency ${from} not found` });
    }
    
    if (toRate === undefined) {
      return res.status(404).json({ error: `Currency ${to} not found` });
    }
    
    const convertedAmount = (amount * toRate) / fromRate;
    
    res.json({
      success: true,
      data: {
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        amount: parseFloat(amount),
        convertedAmount: parseFloat(convertedAmount.toFixed(2)),
        rate: parseFloat((toRate / fromRate).toFixed(6)),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error converting currency:', error);
    res.status(500).json({ error: error.message });
  }
});

// Batch currency conversion endpoint
app.post('/api/convert/batch', (req, res) => {
  try {
    const { conversions } = req.body;
    
    // Validate input
    if (!conversions || !Array.isArray(conversions)) {
      return res.status(400).json({ error: 'Conversions array is required' });
    }
    
    const results = [];
    
    for (const conversion of conversions) {
      const { from, to, amount, id } = conversion;
      
      if (!from || !to || amount === undefined) {
        results.push({
          id: id || null,
          error: 'From currency, to currency, and amount are required'
        });
        continue;
      }
      
      const fromRate = exchangeRates.get(from.toUpperCase());
      const toRate = exchangeRates.get(to.toUpperCase());
      
      if (fromRate === undefined) {
        results.push({
          id: id || null,
          error: `Currency ${from} not found`
        });
        continue;
      }
      
      if (toRate === undefined) {
        results.push({
          id: id || null,
          error: `Currency ${to} not found`
        });
        continue;
      }
      
      const convertedAmount = (amount * toRate) / fromRate;
      
      results.push({
        id: id || null,
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        amount: parseFloat(amount),
        convertedAmount: parseFloat(convertedAmount.toFixed(2)),
        rate: parseFloat((toRate / fromRate).toFixed(6)),
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    logger.error('Error converting currencies in batch:', error);
    res.status(500).json({ error: error.message });
  }
});

// Historical rates endpoint
app.get('/api/history/:currency', (req, res) => {
  try {
    const { currency } = req.params;
    const { days = 30 } = req.query;
    
    const history = historicalRates.get(currency.toUpperCase());
    
    if (!history) {
      return res.status(404).json({ error: 'Historical data not found for this currency' });
    }
    
    // Limit history to requested number of days
    const limitedHistory = history.slice(0, parseInt(days));
    
    res.json({
      success: true,
      data: {
        currency: currency.toUpperCase(),
        history: limitedHistory,
        count: limitedHistory.length
      }
    });
  } catch (error) {
    logger.error('Error fetching historical rates:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get historical rate for specific date
app.get('/api/history/:currency/:date', (req, res) => {
  try {
    const { currency, date } = req.params;
    
    const history = historicalRates.get(currency.toUpperCase());
    
    if (!history) {
      return res.status(404).json({ error: 'Historical data not found for this currency' });
    }
    
    const rateEntry = history.find(entry => entry.date === date);
    
    if (!rateEntry) {
      return res.status(404).json({ error: 'Historical rate not found for this date' });
    }
    
    res.json({
      success: true,
      data: {
        currency: currency.toUpperCase(),
        date: rateEntry.date,
        rate: rateEntry.rate
      }
    });
  } catch (error) {
    logger.error('Error fetching historical rate:', error);
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
  logger.info(`Exchange Rate Service running on port ${PORT}`);
});

module.exports = app;