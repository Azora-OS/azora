/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import express from 'express';
import axios from 'axios';
import NodeCache from 'node-cache';

class ExchangeRateService {
  constructor() {
    this.app = express();
    this.port = process.env.EXCHANGE_RATE_PORT || 3008;
    this.cache = new NodeCache({ stdTTL: 300 }); // 5 min cache
    this.baseCurrency = 'USD';
    this.rates = new Map();
    this.setupMiddleware();
    this.setupRoutes();
    this.initializeRates();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      next();
    });
  }

  setupRoutes() {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', service: 'Exchange Rate Service', currencies: this.rates.size });
    });

    this.app.get('/api/rates', this.getAllRates.bind(this));
    this.app.get('/api/rates/:currency', this.getRate.bind(this));
    this.app.post('/api/convert', this.convertCurrency.bind(this));
    this.app.get('/api/historical/:currency', this.getHistoricalRates.bind(this));
  }

  async initializeRates() {
    // Initialize with base rates (production would use external API)
    this.rates.set('USD', 1.0);
    this.rates.set('ZAR', 18.5);
    this.rates.set('EUR', 0.92);
    this.rates.set('GBP', 0.79);
    this.rates.set('AZR', 1.0); // Azora Coin pegged to USD initially
    this.rates.set('BTC', 0.000023);
    this.rates.set('ETH', 0.00031);
    this.rates.set('KES', 129.5);
    this.rates.set('NGN', 1450.0);
    this.rates.set('GHS', 12.8);

    // Update rates periodically
    setInterval(() => this.updateRates(), 60000); // Every minute
  }

  async updateRates() {
    try {
      // Simulate rate fluctuations (production would fetch from API)
      for (const [currency, rate] of this.rates.entries()) {
        if (currency !== 'USD' && currency !== 'AZR') {
          const fluctuation = (Math.random() - 0.5) * 0.02; // ±1% fluctuation
          this.rates.set(currency, rate * (1 + fluctuation));
        }
      }
      console.log('Exchange rates updated');
    } catch (error) {
      console.error('Rate update failed:', error.message);
    }
  }

  getAllRates(req, res) {
    const { base = 'USD' } = req.query;
    const rates = {};
    const baseRate = this.rates.get(base) || 1;

    for (const [currency, rate] of this.rates.entries()) {
      rates[currency] = rate / baseRate;
    }

    res.json({
      base,
      timestamp: new Date().toISOString(),
      rates
    });
  }

  getRate(req, res) {
    const { currency } = req.params;
    const { base = 'USD' } = req.query;
    
    const baseRate = this.rates.get(base);
    const targetRate = this.rates.get(currency.toUpperCase());

    if (!baseRate || !targetRate) {
      return res.status(404).json({ error: 'Currency not found' });
    }

    res.json({
      base,
      currency: currency.toUpperCase(),
      rate: targetRate / baseRate,
      timestamp: new Date().toISOString()
    });
  }

  async convertCurrency(req, res) {
    try {
      const { amount, from, to } = req.body;

      if (!amount || !from || !to) {
        return res.status(400).json({ error: 'amount, from, and to are required' });
      }

      const fromRate = this.rates.get(from.toUpperCase());
      const toRate = this.rates.get(to.toUpperCase());

      if (!fromRate || !toRate) {
        return res.status(404).json({ error: 'Currency not supported' });
      }

      const convertedAmount = (amount / fromRate) * toRate;
      const rate = toRate / fromRate;

      res.json({
        amount,
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        convertedAmount: parseFloat(convertedAmount.toFixed(8)),
        rate: parseFloat(rate.toFixed(8)),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getHistoricalRates(req, res) {
    const { currency } = req.params;
    const { days = 30 } = req.query;
    
    // Generate mock historical data
    const historical = [];
    const currentRate = this.rates.get(currency.toUpperCase()) || 1;
    
    for (let i = parseInt(days); i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const fluctuation = (Math.random() - 0.5) * 0.1;
      historical.push({
        date: date.toISOString().split('T')[0],
        rate: currentRate * (1 + fluctuation)
      });
    }

    res.json({
      currency: currency.toUpperCase(),
      base: 'USD',
      historical
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`💱 Exchange Rate Service running on port ${this.port}`);
    });
  }
}

const service = new ExchangeRateService();
if (import.meta.url === `file://${process.argv[1]}`) {
  service.start();
}

export default service;
