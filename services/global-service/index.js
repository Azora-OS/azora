#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

class GlobalService {
  constructor() {
    this.regions = new Map();
    this.translations = new Map();
    this.currencies = new Map();
    this.compliance = new Map();
    this.initGlobal();
  }

  initGlobal() {
    this.regions.set('us-east', {
      id: 'us-east',
      name: 'US East',
      country: 'United States',
      currency: 'USD',
      timezone: 'America/New_York',
      status: 'active'
    });

    this.regions.set('eu-west', {
      id: 'eu-west',
      name: 'EU West',
      country: 'Ireland',
      currency: 'EUR',
      timezone: 'Europe/Dublin',
      status: 'active'
    });

    this.currencies.set('USD', { code: 'USD', rate: 1.0, symbol: '$' });
    this.currencies.set('EUR', { code: 'EUR', rate: 0.85, symbol: '€' });
    this.currencies.set('ZAR', { code: 'ZAR', rate: 18.5, symbol: 'R' });
  }

  addRegion(regionData) {
    const region = {
      id: `region_${Date.now()}`,
      ...regionData,
      addedAt: new Date(),
      status: 'active'
    };
    this.regions.set(region.id, region);
    return region;
  }

  translateContent(text, targetLanguage) {
    const translations = {
      'Hello': { es: 'Hola', fr: 'Bonjour', de: 'Hallo', zu: 'Sawubona' },
      'Welcome': { es: 'Bienvenido', fr: 'Bienvenue', de: 'Willkommen', zu: 'Siyakwamukela' },
      'Learn': { es: 'Aprender', fr: 'Apprendre', de: 'Lernen', zu: 'Funda' }
    };

    const translation = {
      id: `trans_${Date.now()}`,
      originalText: text,
      targetLanguage,
      translatedText: translations[text]?.[targetLanguage] || text,
      confidence: 0.95,
      translatedAt: new Date()
    };

    this.translations.set(translation.id, translation);
    return translation;
  }

  convertCurrency(amount, fromCurrency, toCurrency) {
    const from = this.currencies.get(fromCurrency);
    const to = this.currencies.get(toCurrency);
    
    if (!from || !to) throw new Error('Currency not supported');

    const usdAmount = amount / from.rate;
    const convertedAmount = usdAmount * to.rate;

    return {
      id: `conversion_${Date.now()}`,
      originalAmount: amount,
      fromCurrency,
      toCurrency,
      convertedAmount: Math.round(convertedAmount * 100) / 100,
      rate: to.rate / from.rate,
      convertedAt: new Date()
    };
  }

  checkCompliance(region, dataType) {
    const regulations = {
      'eu-west': ['GDPR', 'CCPA'],
      'us-east': ['CCPA', 'SOX'],
      'africa': ['POPIA', 'GDPR']
    };

    const compliance = {
      id: `compliance_${Date.now()}`,
      region,
      dataType,
      regulations: regulations[region] || [],
      status: 'compliant',
      checkedAt: new Date()
    };

    this.compliance.set(compliance.id, compliance);
    return compliance;
  }

  getLocalizedPricing(basePrice, region) {
    const adjustments = {
      'us-east': 1.0,
      'eu-west': 0.9,
      'africa': 0.3,
      'asia': 0.6
    };

    const adjustment = adjustments[region] || 1.0;
    return {
      region,
      basePrice,
      adjustedPrice: Math.round(basePrice * adjustment * 100) / 100,
      adjustment,
      currency: this.regions.get(region)?.currency || 'USD'
    };
  }

  deployToRegion(serviceId, regionId) {
    const deployment = {
      id: `deploy_${Date.now()}`,
      serviceId,
      regionId,
      status: 'deploying',
      startedAt: new Date()
    };

    setTimeout(() => {
      deployment.status = 'deployed';
      deployment.completedAt = new Date();
    }, 5000);

    return deployment;
  }
}

const global = new GlobalService();

app.get('/api/regions', (req, res) => {
  res.json({ success: true, data: Array.from(global.regions.values()) });
});

app.post('/api/regions', (req, res) => {
  try {
    const region = global.addRegion(req.body);
    res.json({ success: true, data: region });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/translate', (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    const translation = global.translateContent(text, targetLanguage);
    res.json({ success: true, data: translation });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/currency/convert', (req, res) => {
  try {
    const { amount, fromCurrency, toCurrency } = req.body;
    const conversion = global.convertCurrency(amount, fromCurrency, toCurrency);
    res.json({ success: true, data: conversion });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/currencies', (req, res) => {
  res.json({ success: true, data: Array.from(global.currencies.values()) });
});

app.post('/api/compliance/check', (req, res) => {
  try {
    const { region, dataType } = req.body;
    const compliance = global.checkCompliance(region, dataType);
    res.json({ success: true, data: compliance });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/pricing/:region', (req, res) => {
  try {
    const { basePrice } = req.query;
    const pricing = global.getLocalizedPricing(parseFloat(basePrice), req.params.region);
    res.json({ success: true, data: pricing });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/deploy', (req, res) => {
  try {
    const { serviceId, regionId } = req.body;
    const deployment = global.deployToRegion(serviceId, regionId);
    res.json({ success: true, data: deployment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({
    service: 'Global Service',
    status: 'healthy',
    timestamp: new Date(),
    stats: { regions: global.regions.size, currencies: global.currencies.size },
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 4030;
app.listen(PORT, () => {
  console.log(`🌍 Global Service running on port ${PORT}`);
});

module.exports = app;