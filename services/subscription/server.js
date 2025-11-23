const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(compression());

// Input validation middleware
const validateInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].replace(/<script[^>]*>.*?<\/script>/gi, '');
        req.body[key] = req.body[key].replace(/javascript:/gi, '');
      }
    });
  }
  next();
};
app.use(validateInput);

app.use(express.json({ limit: '10mb' }));

// 💳 AZORA SUBSCRIPTION - BILLING & PLANS
console.log('🌟 Azora Subscription Service - Initializing...');

// Subscription data storage
const subscriptions = new Map();
const plans = new Map();
const billing = new Map();

// Initialize subscription plans
const initializePlans = () => {
  const defaultPlans = [
    {
      id: 'free',
      name: 'Ubuntu Free',
      price: 0,
      features: ['basic-learning', 'community-access', '5-courses'],
      limits: { courses: 5, storage: '1GB', support: 'community' }
    },
    {
      id: 'pro',
      name: 'Ubuntu Pro',
      price: 29,
      features: ['unlimited-learning', 'ai-tutor', 'certificates', 'priority-support'],
      limits: { courses: 'unlimited', storage: '10GB', support: 'email' }
    },
    {
      id: 'enterprise',
      name: 'Ubuntu Enterprise',
      price: 99,
      features: ['white-label', 'custom-branding', 'analytics', 'dedicated-support'],
      limits: { courses: 'unlimited', storage: '100GB', support: 'phone' }
    }
  ];
  
  defaultPlans.forEach(plan => plans.set(plan.id, plan));
};

// 🎯 API ROUTES
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'azora-subscription',
    ubuntu: 'I subscribe because we grow together',
    subscriptions: subscriptions.size,
    plans: plans.size,
    timestamp: new Date().toISOString()
  });
});

// Get all subscription plans
app.get('/api/plans', (req, res) => {
  try {
    const planList = Array.from(plans.values());
    
    res.json({
      success: true,
      data: planList,
      total: planList.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// Create subscription
app.post('/api/subscriptions', (req, res) => {
  try {
    const { userId, planId, paymentMethodId } = req.body;
    
    if (!userId || !planId) {
      return res.status(400).json({ error: 'User ID and plan ID are required' });
    }
    
    const plan = plans.get(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    const subscription = {
      id: `sub_${Date.now()}`,
      userId,
      planId,
      status: 'ACTIVE',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    };
    
    subscriptions.set(subscription.id, subscription);
    
    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: subscription
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Get user subscription
app.get('/api/users/:userId/subscription', (req, res) => {
  try {
    const { userId } = req.params;
    
    const userSubscription = Array.from(subscriptions.values())
      .find(sub => sub.userId === userId && sub.status === 'ACTIVE');
    
    if (!userSubscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }
    
    const plan = plans.get(userSubscription.planId);
    
    res.json({
      success: true,
      data: {
        ...userSubscription,
        plan
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// Update subscription
app.put('/api/subscriptions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { planId, status } = req.body;
    
    const subscription = subscriptions.get(id);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    if (planId) {subscription.planId = planId;}
    if (status) {subscription.status = status;}
    subscription.updatedAt = new Date().toISOString();
    
    subscriptions.set(id, subscription);
    
    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: subscription
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// Cancel subscription
app.delete('/api/subscriptions/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const subscription = subscriptions.get(id);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    subscription.status = 'CANCELLED';
    subscription.cancelledAt = new Date().toISOString();
    
    subscriptions.set(id, subscription);
    
    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Initialize and start server
initializePlans();

const PORT = process.env.PORT || 3024;
app.listen(PORT, () => {
  console.log('🌟 Azora Subscription Service running on port', PORT);
  console.log('💳 Features: Plan Management, Billing, Subscription Lifecycle');
});

module.exports = app;