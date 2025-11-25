const express = require('express');
const router = express.Router();

// Payment UI API endpoints for frontend integration

// Get payment form configuration
router.get('/api/ui/payment-config', (req, res) => {
  const config = {
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'ZAR'],
    supportedPaymentMethods: [
      {
        type: 'card',
        name: 'Credit/Debit Card',
        icon: 'credit-card',
        enabled: true,
        fees: { percentage: 2.9, fixed: 0.30 }
      },
      {
        type: 'bank_transfer',
        name: 'Bank Transfer',
        icon: 'bank',
        enabled: true,
        fees: { percentage: 0.8, fixed: 0 }
      },
      {
        type: 'azr_tokens',
        name: 'AZR Tokens',
        icon: 'coins',
        enabled: true,
        fees: { percentage: 0, fixed: 0 }
      }
    ],
    minimumAmounts: {
      'USD': 1.00,
      'EUR': 1.00,
      'GBP': 1.00,
      'ZAR': 15.00
    },
    maximumAmounts: {
      'USD': 10000.00,
      'EUR': 9000.00,
      'GBP': 8000.00,
      'ZAR': 180000.00
    }
  };

  res.json({ success: true, config });
});

// Get pricing for course/service
router.get('/api/ui/pricing/:itemType/:itemId', (req, res) => {
  const { itemType, itemId } = req.params;
  const { currency = 'USD' } = req.query;

  // Mock pricing data (in production, fetch from database)
  const pricing = {
    course: {
      'basic-python': {
        USD: 49.99,
        EUR: 44.99,
        GBP: 39.99,
        ZAR: 899.99,
        AZR: 500
      },
      'advanced-ai': {
        USD: 199.99,
        EUR: 179.99,
        GBP: 159.99,
        ZAR: 3599.99,
        AZR: 2000
      }
    },
    subscription: {
      'premium-monthly': {
        USD: 29.99,
        EUR: 26.99,
        GBP: 23.99,
        ZAR: 539.99,
        AZR: 300
      },
      'premium-annual': {
        USD: 299.99,
        EUR: 269.99,
        GBP: 239.99,
        ZAR: 5399.99,
        AZR: 3000
      }
    }
  };

  const itemPricing = pricing[itemType]?.[itemId];
  if (!itemPricing) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const price = itemPricing[currency.toUpperCase()];
  if (!price) {
    return res.status(400).json({ error: 'Currency not supported' });
  }

  res.json({
    success: true,
    pricing: {
      itemType,
      itemId,
      currency: currency.toUpperCase(),
      price,
      formattedPrice: formatCurrency(price, currency),
      allCurrencies: itemPricing
    }
  });
});

// Calculate fees for transaction
router.post('/api/ui/calculate-fees', (req, res) => {
  const { amount, currency, paymentMethod } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  const feeStructures = {
    card: { percentage: 2.9, fixed: 0.30 },
    bank_transfer: { percentage: 0.8, fixed: 0 },
    azr_tokens: { percentage: 0, fixed: 0 }
  };

  const fees = feeStructures[paymentMethod] || feeStructures.card;
  const percentageFee = (amount * fees.percentage) / 100;
  const totalFees = percentageFee + fees.fixed;
  const totalAmount = amount + totalFees;

  res.json({
    success: true,
    calculation: {
      subtotal: amount,
      fees: {
        percentage: percentageFee,
        fixed: fees.fixed,
        total: totalFees
      },
      total: totalAmount,
      currency: currency.toUpperCase(),
      paymentMethod,
      breakdown: {
        subtotal: formatCurrency(amount, currency),
        fees: formatCurrency(totalFees, currency),
        total: formatCurrency(totalAmount, currency)
      }
    }
  });
});

// Get payment status for UI updates
router.get('/api/ui/payment-status/:transactionId', (req, res) => {
  const { transactionId } = req.params;
  
  // Mock status data (in production, fetch from database)
  const statuses = {
    'pending': {
      status: 'pending',
      message: 'Payment is being processed...',
      icon: 'clock',
      color: 'yellow',
      allowCancel: true
    },
    'processing': {
      status: 'processing',
      message: 'Confirming payment with bank...',
      icon: 'spinner',
      color: 'blue',
      allowCancel: false
    },
    'completed': {
      status: 'completed',
      message: 'Payment successful!',
      icon: 'check-circle',
      color: 'green',
      allowCancel: false
    },
    'failed': {
      status: 'failed',
      message: 'Payment failed. Please try again.',
      icon: 'x-circle',
      color: 'red',
      allowCancel: false,
      retryAllowed: true
    },
    'refunded': {
      status: 'refunded',
      message: 'Payment has been refunded.',
      icon: 'arrow-left-circle',
      color: 'gray',
      allowCancel: false
    }
  };

  // Simulate status lookup
  const randomStatus = ['pending', 'processing', 'completed', 'failed'][
    Math.floor(Math.random() * 4)
  ];
  
  const statusInfo = statuses[randomStatus];

  res.json({
    success: true,
    transactionId,
    ...statusInfo,
    timestamp: new Date(),
    estimatedCompletion: randomStatus === 'pending' ? 
      new Date(Date.now() + 5 * 60 * 1000) : null // 5 minutes from now
  });
});

// Get receipt data
router.get('/api/ui/receipt/:transactionId', (req, res) => {
  const { transactionId } = req.params;

  // Mock receipt data
  const receipt = {
    transactionId,
    receiptNumber: `RCP-${Date.now()}`,
    date: new Date(),
    status: 'completed',
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
      userId: 'user_123'
    },
    items: [
      {
        description: 'Python Programming Course',
        quantity: 1,
        unitPrice: 49.99,
        total: 49.99
      }
    ],
    payment: {
      subtotal: 49.99,
      fees: 1.75,
      total: 51.74,
      currency: 'USD',
      method: 'Credit Card ending in 4242',
      processor: 'Stripe'
    },
    business: {
      name: 'Azora OS',
      address: 'Cape Town, South Africa',
      email: 'support@azora.world',
      website: 'https://azora.world'
    }
  };

  res.json({ success: true, receipt });
});

// Get wallet UI data
router.get('/api/ui/wallet/:userId', (req, res) => {
  const { userId } = req.params;

  // Mock wallet data
  const wallet = {
    userId,
    balances: {
      azr: {
        available: 1250.50,
        staked: 500.00,
        pending: 25.00,
        total: 1775.50
      },
      fiat: {
        USD: 125.05,
        EUR: 112.55,
        GBP: 100.04,
        ZAR: 2251.00
      }
    },
    recentTransactions: [
      {
        id: 'txn_1',
        type: 'earned',
        amount: 25.00,
        currency: 'AZR',
        description: 'Course completion reward',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'completed'
      },
      {
        id: 'txn_2',
        type: 'spent',
        amount: 49.99,
        currency: 'USD',
        description: 'Python course enrollment',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: 'completed'
      }
    ],
    stats: {
      totalEarned: 2500.00,
      totalSpent: 724.50,
      coursesCompleted: 12,
      currentStreak: 7
    }
  };

  res.json({ success: true, wallet });
});

// Get payment methods for user
router.get('/api/ui/payment-methods/:userId', (req, res) => {
  const { userId } = req.params;

  // Mock payment methods
  const paymentMethods = [
    {
      id: 'pm_1',
      type: 'card',
      brand: 'visa',
      last4: '4242',
      expMonth: 12,
      expYear: 2025,
      isDefault: true,
      nickname: 'Personal Visa'
    },
    {
      id: 'pm_2',
      type: 'card',
      brand: 'mastercard',
      last4: '5555',
      expMonth: 8,
      expYear: 2024,
      isDefault: false,
      nickname: 'Business Card'
    },
    {
      id: 'pm_3',
      type: 'bank_account',
      bankName: 'First National Bank',
      accountType: 'checking',
      last4: '1234',
      isDefault: false,
      nickname: 'Main Account'
    }
  ];

  res.json({ success: true, paymentMethods });
});

// Get transaction history with pagination
router.get('/api/ui/transactions/:userId', (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20, type, status } = req.query;

  // Mock transaction history
  const allTransactions = Array.from({ length: 100 }, (_, i) => ({
    id: `txn_${i + 1}`,
    type: ['earned', 'spent', 'transferred', 'refunded'][i % 4],
    amount: Math.random() * 100 + 10,
    currency: ['AZR', 'USD', 'EUR'][i % 3],
    description: [
      'Course completion reward',
      'Python course enrollment',
      'Peer transfer',
      'Refund processed'
    ][i % 4],
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
    status: ['completed', 'pending', 'failed'][i % 3],
    recipient: i % 4 === 2 ? 'user_456' : null
  }));

  // Filter transactions
  let filteredTransactions = allTransactions;
  if (type) {
    filteredTransactions = filteredTransactions.filter(t => t.type === type);
  }
  if (status) {
    filteredTransactions = filteredTransactions.filter(t => t.status === status);
  }

  // Paginate
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  res.json({
    success: true,
    transactions: paginatedTransactions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredTransactions.length,
      pages: Math.ceil(filteredTransactions.length / limit),
      hasNext: endIndex < filteredTransactions.length,
      hasPrev: page > 1
    }
  });
});

// Helper function to format currency
function formatCurrency(amount, currency) {
  const formatters = {
    USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
    EUR: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
    GBP: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }),
    ZAR: new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }),
    AZR: new Intl.NumberFormat('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  };

  const formatter = formatters[currency.toUpperCase()];
  if (!formatter) {
    return `${amount} ${currency}`;
  }

  if (currency.toUpperCase() === 'AZR') {
    return `${formatter.format(amount)} AZR`;
  }

  return formatter.format(amount);
}

module.exports = router;