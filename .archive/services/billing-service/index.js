const express = require('express');
const crypto = require('crypto');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class BillingService {
  constructor() {
    this.app = express();
    this.port = process.env.BILLING_PORT || 3009;
    this.subscriptions = new Map();
    this.invoices = new Map();
    this.plans = this.initializePlans();
    this.setupMiddleware();
    this.setupRoutes();
  }

  initializePlans() {
    return new Map([
      ['free_citizen', { name: 'Free Citizen', price: 0, currency: 'ZAR', features: ['Basic Learning', '1GB Storage'] }],
      ['student', { name: 'Student', price: 99, currency: 'ZAR', features: ['Full Learning Access', '10GB Storage', 'AI Tutor'] }],
      ['educator', { name: 'Educator', price: 299, currency: 'ZAR', features: ['Course Creation', '50GB Storage', 'Analytics'] }],
      ['enterprise', { name: 'Enterprise', price: 2999, currency: 'ZAR', features: ['Unlimited Users', '1TB Storage', 'Custom Integration'] }]
    ]);
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(compression());
    this.app.use(express.json());
  }

  setupRoutes() {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', service: 'Billing Service', subscriptions: this.subscriptions.size });
    });

    this.app.get('/api/plans', this.getPlans.bind(this));
    this.app.post('/api/subscriptions', this.createSubscription.bind(this));
    this.app.get('/api/subscriptions/:userId', this.getSubscription.bind(this));
    this.app.put('/api/subscriptions/:userId', this.updateSubscription.bind(this));
    this.app.delete('/api/subscriptions/:userId', this.cancelSubscription.bind(this));
    this.app.post('/api/invoices', this.createInvoice.bind(this));
    this.app.get('/api/invoices/:userId', this.getInvoices.bind(this));
    this.app.post('/api/invoices/:invoiceId/pay', this.payInvoice.bind(this));
  }

  getPlans(req, res) {
    const plans = Array.from(this.plans.entries()).map(([id, plan]) => ({
      id,
      ...plan
    }));
    res.json({ plans });
  }

  async createSubscription(req, res) {
    try {
      const { userId, planId, paymentMethod } = req.body;

      if (!userId || !planId) {
        return res.status(400).json({ error: 'userId and planId required' });
      }

      const plan = this.plans.get(planId);
      if (!plan) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      const subscriptionId = `SUB-${crypto.randomUUID()}`;
      const subscription = {
        subscriptionId,
        userId,
        planId,
        plan,
        status: 'active',
        paymentMethod,
        startDate: new Date(),
        nextBillingDate: this.calculateNextBillingDate(),
        createdAt: new Date()
      };

      this.subscriptions.set(userId, subscription);

      // Create first invoice if not free plan
      if (plan.price > 0) {
        await this.createInvoiceForSubscription(subscription);
      }

      res.json({ subscription });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getSubscription(req, res) {
    const subscription = this.subscriptions.get(req.params.userId);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.json({ subscription });
  }

  async updateSubscription(req, res) {
    try {
      const { planId } = req.body;
      const subscription = this.subscriptions.get(req.params.userId);

      if (!subscription) {
        return res.status(404).json({ error: 'Subscription not found' });
      }

      const newPlan = this.plans.get(planId);
      if (!newPlan) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      subscription.planId = planId;
      subscription.plan = newPlan;
      subscription.updatedAt = new Date();

      res.json({ subscription });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  cancelSubscription(req, res) {
    const subscription = this.subscriptions.get(req.params.userId);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();

    res.json({ message: 'Subscription cancelled', subscription });
  }

  async createInvoice(req, res) {
    try {
      const { userId, amount, currency, description, items } = req.body;

      if (!userId || !amount) {
        return res.status(400).json({ error: 'userId and amount required' });
      }

      const invoiceId = `INV-${crypto.randomUUID()}`;
      const invoice = {
        invoiceId,
        userId,
        amount,
        currency: currency || 'ZAR',
        description,
        items: items || [],
        status: 'pending',
        dueDate: this.calculateDueDate(),
        createdAt: new Date()
      };

      this.invoices.set(invoiceId, invoice);

      res.json({ invoice });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getInvoices(req, res) {
    const userInvoices = Array.from(this.invoices.values())
      .filter(inv => inv.userId === req.params.userId);
    res.json({ invoices: userInvoices });
  }

  async payInvoice(req, res) {
    try {
      const { paymentMethod, transactionId } = req.body;
      const invoice = this.invoices.get(req.params.invoiceId);

      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      if (invoice.status === 'paid') {
        return res.status(400).json({ error: 'Invoice already paid' });
      }

      invoice.status = 'paid';
      invoice.paidAt = new Date();
      invoice.paymentMethod = paymentMethod;
      invoice.transactionId = transactionId;

      res.json({ message: 'Invoice paid successfully', invoice });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createInvoiceForSubscription(subscription) {
    const invoiceId = `INV-${crypto.randomUUID()}`;
    const invoice = {
      invoiceId,
      userId: subscription.userId,
      subscriptionId: subscription.subscriptionId,
      amount: subscription.plan.price,
      currency: subscription.plan.currency,
      description: `${subscription.plan.name} - Monthly Subscription`,
      status: 'pending',
      dueDate: subscription.nextBillingDate,
      createdAt: new Date()
    };

    this.invoices.set(invoiceId, invoice);
    return invoice;
  }

  calculateNextBillingDate() {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  }

  calculateDueDate() {
    const date = new Date();
    date.setDate(date.getDate() + 7); // 7 days from now
    return date;
  }

  start() {
    this.app.use(require('./routes'));

app.listen(this.port, () => {
      console.log(`📊 Billing Service running on port ${this.port}`);
    });
  }
}

const service = new BillingService();
if (require.main === module) {
  service.start();
}

module.exports = service;
