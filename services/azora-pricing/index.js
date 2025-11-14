const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class AzoraPricingEngine {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3054;
    this.pricingTiers = new Map();
    this.subscriptions = new Map();
    this.initializePricing();
    this.setupMiddleware();
    this.setupRoutes();
  }

  initializePricing() {
    this.pricingTiers.set('student', { monthly: 0, yearly: 0, features: ['basic'] });
    this.pricingTiers.set('professional', { monthly: 29, yearly: 290, features: ['basic', 'advanced'] });
    this.pricingTiers.set('enterprise', { monthly: 99, yearly: 990, features: ['basic', 'advanced', 'premium'] });
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(compression());
    this.app.use(express.json());
  }

  setupRoutes() {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', service: 'azora-pricing', tiers: this.pricingTiers.size });
    });

    this.app.get('/api/pricing/tiers', this.getTiers.bind(this));
    this.app.post('/api/pricing/calculate', this.calculatePrice.bind(this));
    this.app.post('/api/subscriptions', this.createSubscription.bind(this));
    this.app.get('/api/subscriptions/:userId', this.getSubscription.bind(this));
  }

  getTiers(req, res) {
    const tiers = Array.from(this.pricingTiers.entries()).map(([name, data]) => ({ name, ...data }));
    res.json({ tiers });
  }

  calculatePrice(req, res) {
    const { tier, billing, users = 1, addons = [] } = req.body;
    const tierData = this.pricingTiers.get(tier);
    
    if (!tierData) return res.status(404).json({ error: 'Tier not found' });

    const basePrice = billing === 'yearly' ? tierData.yearly : tierData.monthly;
    const addonPrice = addons.reduce((sum, addon) => sum + (addon.price || 0), 0);
    const total = (basePrice * users) + addonPrice;
    const discount = billing === 'yearly' ? 0.17 : 0;

    res.json({ tier, billing, users, basePrice, addonPrice, discount, total: total * (1 - discount) });
  }

  createSubscription(req, res) {
    const { userId, tier, billing } = req.body;
    const subId = `sub_${Date.now()}`;
    
    const subscription = {
      id: subId,
      userId,
      tier,
      billing,
      status: 'active',
      startDate: new Date(),
      nextBilling: new Date(Date.now() + (billing === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000)
    };

    this.subscriptions.set(userId, subscription);
    res.status(201).json({ success: true, subscription });
  }

  getSubscription(req, res) {
    const sub = this.subscriptions.get(req.params.userId);
    if (!sub) return res.status(404).json({ error: 'Subscription not found' });
    res.json(sub);
  }

  listen() {
    this.app.listen(this.port, () => console.log(`Azora Pricing on port ${this.port}`));
  }
}

const service = new AzoraPricingEngine();
if (require.main === module) service.listen();
module.exports = service.app;
