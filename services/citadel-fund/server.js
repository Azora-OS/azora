const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4015;

// Ubuntu Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
  credentials: true
}));
app.use(express.json());

// Ubuntu Rate Limiting
const ubuntuLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    error: 'Too many requests',
    ubuntu: 'We protect our collective resources with Ubuntu wisdom'
  }
});

app.use(ubuntuLimiter);

// Citadel Fund - Ubuntu Economics Engine
class CitadelFund {
  constructor() {
    this.balance = 0;
    this.contributions = [];
    this.distributions = [];
    this.allocationRules = {
      education: 0.40,      // 40% to education
      openSource: 0.30,     // 30% to open source
      infrastructure: 0.20, // 20% to infrastructure
      emergency: 0.10       // 10% to emergency fund
    };
  }

  // Process 10% revenue contribution
  async processRevenue(source, amount, metadata = {}) {
    const contribution = {
      id: `citadel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      source,
      amount: amount * 0.10, // 10% revenue sharing
      timestamp: new Date().toISOString(),
      metadata
    };

    this.balance += contribution.amount;
    this.contributions.push(contribution);

    // Auto-distribute according to Ubuntu principles
    await this.autoDistribute(contribution);

    return contribution;
  }

  // Automatic distribution based on allocation rules
  async autoDistribute(contribution) {
    const distribution = {};
    
    for (const [category, percentage] of Object.entries(this.allocationRules)) {
      const amount = contribution.amount * percentage;
      
      distribution[category] = {
        id: `dist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        recipient: this.getRecipientForCategory(category),
        amount,
        category,
        purpose: this.getPurposeForCategory(category),
        timestamp: new Date().toISOString(),
        sourceContribution: contribution.id
      };

      this.distributions.push(distribution[category]);
    }

    return distribution;
  }

  getRecipientForCategory(category) {
    const recipients = {
      education: 'azora-education-fund',
      openSource: 'azora-open-source-fund',
      infrastructure: 'azora-infrastructure-fund',
      emergency: 'azora-emergency-fund'
    };
    return recipients[category] || 'azora-general-fund';
  }

  getPurposeForCategory(category) {
    const purposes = {
      education: 'Ubuntu knowledge sharing and learning programs',
      openSource: 'Collective software development and tools',
      infrastructure: 'Platform maintenance and scaling',
      emergency: 'Community crisis support and resilience'
    };
    return purposes[category] || 'General Ubuntu community support';
  }

  getFundStatus() {
    return {
      totalBalance: this.balance,
      totalContributions: this.contributions.length,
      totalDistributions: this.distributions.length,
      allocationRules: this.allocationRules,
      ubuntu: 'Citadel Fund - Because I am because we are'
    };
  }

  getContributionHistory(limit = 50) {
    return this.contributions.slice(-limit);
  }

  getDistributionHistory(limit = 50) {
    return this.distributions.slice(-limit);
  }
}

// Initialize Citadel Fund
const citadelFund = new CitadelFund();

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Citadel Fund',
    ubuntu: 'Ubuntu economics engine running',
    timestamp: new Date().toISOString()
  });
});

// Ubuntu Philosophy
app.get('/ubuntu/philosophy', (req, res) => {
  res.json({
    philosophy: 'Ngiyakwazi ngoba sikwazi - I am because we are',
    citadelPrinciples: [
      '10% of all revenue fuels collective growth',
      'Education receives 40% - knowledge is our foundation',
      'Open source receives 30% - our tools empower all',
      'Infrastructure receives 20% - we maintain our foundation',
      'Emergency receives 10% - we protect our community'
    ],
    fund: citadelFund.getFundStatus()
  });
});

// Process revenue contribution
app.post('/contribute', async (req, res) => {
  try {
    const { source, amount, metadata } = req.body;
    
    if (!source || !amount || amount <= 0) {
      return res.status(400).json({
        error: 'Invalid contribution data',
        ubuntu: 'Ubuntu requires honest participation'
      });
    }

    const contribution = await citadelFund.processRevenue(source, amount, metadata);
    
    res.json({
      success: true,
      contribution,
      distributions: citadelFund.getDistributionHistory(4), // Latest 4 distributions
      ubuntu: 'Your contribution strengthens our collective'
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      ubuntu: 'Ubuntu handles challenges with collective wisdom'
    });
  }
});

// Get fund status
app.get('/status', (req, res) => {
  res.json(citadelFund.getFundStatus());
});

// Get contribution history
app.get('/contributions', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  res.json({
    contributions: citadelFund.getContributionHistory(limit),
    ubuntu: 'Every contribution builds our collective strength'
  });
});

// Get distribution history
app.get('/distributions', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  res.json({
    distributions: citadelFund.getDistributionHistory(limit),
    ubuntu: 'Ubuntu economics in action - sharing our abundance'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong',
    ubuntu: 'Ubuntu communities face challenges together'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    ubuntu: 'Ubuntu guides us to the right path',
    availableEndpoints: [
      'GET /health',
      'GET /ubuntu/philosophy',
      'POST /contribute',
      'GET /status',
      'GET /contributions',
      'GET /distributions'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🏛️ Citadel Fund running on port ${PORT}`);
  console.log(`💰 Ubuntu Economics Engine: 10% revenue sharing active`);
  console.log(`🌍 Ubuntu Philosophy: Ngiyakwazi ngoba sikwazi`);
});
