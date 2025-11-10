const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { getPrismaClient } = require('../shared/database');
const logger = require('../shared/logger');
const { AppError, errorHandler, asyncHandler } = require('../shared/errorHandler');
const { authMiddleware } = require('../auth-service');

const app = express();
const prisma = getPrismaClient();

app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api/', limiter);

// Get wallet balance
app.get('/api/wallet', authMiddleware, asyncHandler(async (req, res) => {
  const payments = await prisma.payment.findMany({
    where: {
      userId: req.user.userId,
      status: 'COMPLETED',
    },
  });

  // Calculate balance from transactions
  const balance = payments.reduce((sum, payment) => {
    if (payment.type === 'ENROLLMENT' || payment.type === 'SUBSCRIPTION') {
      return sum - payment.amount;
    } else {
      return sum + payment.amount; // DONATION, REFUND add to balance
    }
  }, 0);

  res.json({
    success: true,
    data: {
      balance,
      currency: 'AZR',
      transactionCount: payments.length,
    },
  });
}));

// Get transaction history
app.get('/api/transactions', authMiddleware, asyncHandler(async (req, res) => {
  const { limit = 50, type } = req.query;

  const transactions = await prisma.payment.findMany({
    where: {
      userId: req.user.userId,
      ...(type && { type }),
    },
    take: parseInt(limit),
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      amount: true,
      currency: true,
      type: true,
      status: true,
      description: true,
      transactionId: true,
      createdAt: true,
      processedAt: true,
    },
  });

  res.json({ success: true, data: transactions });
}));

// Earn tokens (learn-to-earn)
app.post('/api/earn', authMiddleware, asyncHandler(async (req, res) => {
  const { amount, description } = req.body;

  if (!amount || amount <= 0) {
    throw new AppError('Amount must be positive', 400);
  }

  if (amount > 1000) {
    throw new AppError('Maximum earn amount is 1000 AZR per transaction', 400);
  }

  const payment = await prisma.payment.create({
    data: {
      userId: req.user.userId,
      amount: parseFloat(amount),
      currency: 'AZR',
      type: 'DONATION', // Using DONATION type for earned tokens
      status: 'COMPLETED',
      description: description || 'Tokens earned',
      processedAt: new Date(),
      transactionId: `earn_${Date.now()}_${req.user.userId}`,
    },
  });

  logger.info(`User ${req.user.userId} earned ${amount} AZR: ${description}`);

  res.status(201).json({
    success: true,
    data: payment,
  });
}));

// Process payment (for enrollments, subscriptions)
app.post('/api/payments', authMiddleware, asyncHandler(async (req, res) => {
  const { amount, type, description, courseId } = req.body;

  if (!amount || amount <= 0) {
    throw new AppError('Amount must be positive', 400);
  }

  if (!['ENROLLMENT', 'SUBSCRIPTION', 'DONATION'].includes(type)) {
    throw new AppError('Invalid payment type', 400);
  }

  // Check balance for enrollments/subscriptions
  if (type === 'ENROLLMENT' || type === 'SUBSCRIPTION') {
    const payments = await prisma.payment.findMany({
      where: {
        userId: req.user.userId,
        status: 'COMPLETED',
      },
    });

    const balance = payments.reduce((sum, p) => {
      if (p.type === 'ENROLLMENT' || p.type === 'SUBSCRIPTION') {
        return sum - p.amount;
      }
      return sum + p.amount;
    }, 0);

    if (balance < amount) {
      throw new AppError('Insufficient balance', 400);
    }
  }

  const payment = await prisma.payment.create({
    data: {
      userId: req.user.userId,
      amount: parseFloat(amount),
      currency: 'AZR',
      type,
      status: 'COMPLETED',
      description,
      processedAt: new Date(),
      transactionId: `pay_${Date.now()}_${req.user.userId}`,
    },
  });

  logger.info(`Payment processed: ${payment.id} - ${amount} AZR for ${type}`);

  res.status(201).json({
    success: true,
    data: payment,
  });
}));

// Refund
app.post('/api/refunds', authMiddleware, asyncHandler(async (req, res) => {
  const { paymentId, reason } = req.body;

  const original = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!original) {
    throw new AppError('Payment not found', 404);
  }

  if (original.userId !== req.user.userId && req.user.role !== 'ADMIN') {
    throw new AppError('Not authorized', 403);
  }

  if (original.status === 'REFUNDED') {
    throw new AppError('Payment already refunded', 400);
  }

  // Update original payment
  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: 'REFUNDED' },
  });

  // Create refund transaction
  const refund = await prisma.payment.create({
    data: {
      userId: original.userId,
      amount: original.amount,
      currency: original.currency,
      type: 'REFUND',
      status: 'COMPLETED',
      description: reason || 'Refund processed',
      transactionId: `refund_${Date.now()}_${original.id}`,
      processedAt: new Date(),
    },
  });

  logger.info(`Refund processed: ${refund.id} for payment ${paymentId}`);

  res.status(201).json({
    success: true,
    data: refund,
  });
}));

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'payment-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PAYMENT_PORT || 4003;
  app.listen(PORT, () => {
    logger.info(`✅ Payment service running on port ${PORT}`);
  });
}
