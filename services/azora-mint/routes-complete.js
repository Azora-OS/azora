const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { schemas, validate } = require('../../packages/input-validation');
const router = express.Router();
const prisma = new PrismaClient();

// ============ WALLET ENDPOINTS ============

router.post('/api/wallet/create', async (req, res) => {
  const { userId } = req.body;
  const wallet = await prisma.wallet.create({
    data: { userId, address: `azr_${userId}_${Date.now()}` }
  });
  res.json({ success: true, wallet });
});

router.get('/api/wallet/:userId', async (req, res) => {
  const wallet = await prisma.wallet.findUnique({
    where: { userId: req.params.userId },
    include: { stakes: true, miningRecords: { take: 10, orderBy: { minedAt: 'desc' } } }
  });
  res.json({ success: true, wallet: wallet || { balance: 0, staked: 0, earned: 0 } });
});

router.get('/api/wallet/:userId/balance', async (req, res) => {
  const wallet = await prisma.wallet.findUnique({ where: { userId: req.params.userId } });
  res.json({ success: true, balance: wallet?.balance || 0, staked: wallet?.staked || 0 });
});

router.get('/api/wallet/:userId/history', async (req, res) => {
  const { limit = 50 } = req.query;
  const wallet = await prisma.wallet.findUnique({ where: { userId: req.params.userId } });
  if (!wallet) return res.json({ success: true, transactions: [] });

  const transactions = await prisma.transaction.findMany({
    where: { OR: [{ fromId: wallet.id }, { toId: wallet.id }] },
    orderBy: { createdAt: 'desc' },
    take: parseInt(limit)
  });
  res.json({ success: true, transactions });
});

// ============ TRANSACTION ENDPOINTS ============

router.post('/api/transfer', async (req, res) => {
  const { fromUserId, toUserId, amount, reason } = req.body;

  const fromWallet = await prisma.wallet.findUnique({ where: { userId: fromUserId } });
  const toWallet = await prisma.wallet.findUnique({ where: { userId: toUserId } });

  if (!fromWallet || fromWallet.balance < amount) {
    return res.status(400).json({ success: false, error: 'Insufficient balance' });
  }

  const [tx] = await prisma.$transaction([
    prisma.transaction.create({
      data: { type: 'transfer', fromId: fromWallet.id, toId: toWallet.id, amount, reason }
    }),
    prisma.wallet.update({ where: { id: fromWallet.id }, data: { balance: { decrement: amount } } }),
    prisma.wallet.update({ where: { id: toWallet.id }, data: { balance: { increment: amount } } })
  ]);

  res.json({ success: true, transaction: tx });
});

router.get('/api/transactions', async (req, res) => {
  const { userId, type, limit = 50 } = req.query;
  const wallet = await prisma.wallet.findUnique({ where: { userId } });

  const where = wallet ? { OR: [{ fromId: wallet.id }, { toId: wallet.id }] } : {};
  if (type) where.type = type;

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: parseInt(limit),
    include: { from: true, to: true }
  });

  res.json({ success: true, transactions });
});

router.get('/api/transaction/:id', async (req, res) => {
  const tx = await prisma.transaction.findUnique({
    where: { id: req.params.id },
    include: { from: true, to: true }
  });
  res.json({ success: true, transaction: tx });
});

// ============ MINING ENDPOINTS ============

router.post('/api/mining/start', async (req, res) => {
  const { userId, activityId, activityType, performance = 0.8 } = req.body;

  const baseReward = { course_completion: 10, job_completion: 50, skill_assessment: 5 }[activityType] || 1;
  const reward = baseReward * performance;

  const wallet = await prisma.wallet.upsert({
    where: { userId },
    update: { balance: { increment: reward }, earned: { increment: reward } },
    create: { userId, address: `azr_${userId}_${Date.now()}`, balance: reward, earned: reward }
  });

  await prisma.miningRecord.create({
    data: { walletId: wallet.id, activityId, activityType, tokensEarned: reward, metadata: { performance } }
  });

  res.json({ success: true, reward, wallet });
});

router.get('/api/mining/history/:userId', async (req, res) => {
  const { limit = 50 } = req.query;
  const wallet = await prisma.wallet.findUnique({ where: { userId: req.params.userId } });

  const records = await prisma.miningRecord.findMany({
    where: { walletId: wallet?.id },
    orderBy: { minedAt: 'desc' },
    take: parseInt(limit)
  });

  res.json({ success: true, records });
});

router.get('/api/mining/stats/:userId', async (req, res) => {
  const wallet = await prisma.wallet.findUnique({ where: { userId: req.params.userId } });

  const stats = await prisma.miningRecord.groupBy({
    by: ['activityType'],
    where: { walletId: wallet?.id },
    _sum: { tokensEarned: true },
    _count: true
  });

  res.json({ success: true, stats, totalEarned: wallet?.earned || 0 });
});

// ============ STAKING ENDPOINTS ============

router.post('/api/stake', async (req, res) => {
  const { userId, amount, duration = 30 } = req.body;

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet || wallet.balance < amount) {
    return res.status(400).json({ success: false, error: 'Insufficient balance' });
  }

  const rewardRate = duration >= 365 ? 0.15 : duration >= 90 ? 0.10 : 0.05;
  const endDate = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);

  const [stake] = await prisma.$transaction([
    prisma.stake.create({
      data: { walletId: wallet.id, amount, rewardRate, endDate }
    }),
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: amount }, staked: { increment: amount } }
    })
  ]);

  res.json({ success: true, stake, expectedReward: amount * rewardRate });
});

router.post('/api/unstake', async (req, res) => {
  const { userId, stakeId } = req.body;

  const stake = await prisma.stake.findUnique({ where: { id: stakeId }, include: { wallet: true } });
  if (!stake || stake.wallet.userId !== userId) {
    return res.status(400).json({ success: false, error: 'Stake not found' });
  }

  const daysStaked = (Date.now() - stake.startDate.getTime()) / (1000 * 60 * 60 * 24);
  const reward = stake.amount * stake.rewardRate * (daysStaked / 365);
  const total = parseFloat(stake.amount) + reward;

  await prisma.$transaction([
    prisma.stake.update({ where: { id: stakeId }, data: { status: 'completed', endDate: new Date() } }),
    prisma.wallet.update({
      where: { id: stake.walletId },
      data: { balance: { increment: total }, staked: { decrement: stake.amount }, earned: { increment: reward } }
    }),
    prisma.transaction.create({
      data: { type: 'unstake', toId: stake.walletId, amount: total, reason: 'Stake completed' }
    })
  ]);

  res.json({ success: true, reward, total });
});

router.get('/api/stakes/:userId', async (req, res) => {
  const wallet = await prisma.wallet.findUnique({ where: { userId: req.params.userId } });
  const stakes = await prisma.stake.findMany({
    where: { walletId: wallet?.id },
    orderBy: { startDate: 'desc' }
  });
  res.json({ success: true, stakes });
});

router.get('/api/stake/:stakeId/rewards', async (req, res) => {
  const stake = await prisma.stake.findUnique({ where: { id: req.params.stakeId } });
  if (!stake) return res.status(404).json({ success: false, error: 'Stake not found' });

  const daysStaked = (Date.now() - stake.startDate.getTime()) / (1000 * 60 * 60 * 24);
  const currentReward = stake.amount * stake.rewardRate * (daysStaked / 365);
  const projectedReward = stake.amount * stake.rewardRate;

  res.json({ success: true, currentReward, projectedReward, daysStaked: Math.floor(daysStaked) });
});

// ============ ECONOMICS ENDPOINTS ============

router.get('/api/economics/stats', async (req, res) => {
  const [totalSupply, circulatingSupply, totalStaked, activeWallets] = await Promise.all([
    prisma.wallet.aggregate({ _sum: { balance: true, staked: true, earned: true } }),
    prisma.wallet.aggregate({ _sum: { balance: true } }),
    prisma.wallet.aggregate({ _sum: { staked: true } }),
    prisma.wallet.count()
  ]);

  const stats = {
    totalSupply: (totalSupply._sum.balance || 0) + (totalSupply._sum.staked || 0),
    circulatingSupply: circulatingSupply._sum.balance || 0,
    totalStaked: totalStaked._sum.staked || 0,
    activeWallets,
    stakingRate: totalStaked._sum.staked / ((totalSupply._sum.balance || 1) + (totalSupply._sum.staked || 0))
  };

  res.json({ success: true, stats });
});

router.get('/api/economics/ubi', async (req, res) => {
  const activeWallets = await prisma.wallet.count();
  const totalSupply = await prisma.wallet.aggregate({ _sum: { balance: true, staked: true } });

  const ubiAmount = Math.min(10, (totalSupply._sum.balance || 0) * 0.001 / activeWallets);

  res.json({ success: true, ubiAmount, eligibleUsers: activeWallets });
});

router.post('/api/economics/distribute-ubi', async (req, res) => {
  const wallets = await prisma.wallet.findMany({ where: { balance: { gte: 0 } } });
  const ubiAmount = 10;

  await Promise.all(wallets.map(w =>
    prisma.wallet.update({
      where: { id: w.id },
      data: { balance: { increment: ubiAmount }, earned: { increment: ubiAmount } }
    })
  ));

  res.json({ success: true, distributed: wallets.length * ubiAmount, recipients: wallets.length });
});

// ============ PAYMENT ENDPOINTS ============

router.post('/api/payment/create', async (req, res) => {
  const { userId, amount, currency = 'AZR', metadata } = req.body;

  const tx = await prisma.transaction.create({
    data: { type: 'payment', amount, status: 'pending', metadata: { currency, ...metadata } }
  });

  res.json({ success: true, paymentId: tx.id, amount, currency });
});

router.post('/api/payment/:paymentId/complete', async (req, res) => {
  const { userId } = req.body;
  const tx = await prisma.transaction.findUnique({ where: { id: req.params.paymentId } });

  if (!tx) return res.status(404).json({ success: false, error: 'Payment not found' });

  const wallet = await prisma.wallet.findUnique({ where: { userId } });

  await prisma.$transaction([
    prisma.transaction.update({ where: { id: tx.id }, data: { status: 'completed', toId: wallet.id } }),
    prisma.wallet.update({ where: { id: wallet.id }, data: { balance: { increment: tx.amount } } })
  ]);

  res.json({ success: true, payment: tx });
});

// ============ EXCHANGE ENDPOINTS ============

router.get('/api/exchange/rate', async (req, res) => {
  const { from = 'AZR', to = 'USD' } = req.query;
  const rates = { AZR: { USD: 0.10, ZAR: 1.80, BTC: 0.0000025, ETH: 0.000035 } };
  res.json({ success: true, rate: rates[from]?.[to] || 1, from, to });
});

router.post('/api/exchange/convert', async (req, res) => {
  const { userId, amount, fromCurrency, toCurrency } = req.body;
  const rate = 0.10; // Simplified
  const converted = amount * rate;

  res.json({ success: true, amount, fromCurrency, toCurrency, converted, rate });
});

// ============ ADMIN ENDPOINTS ============

router.post('/api/admin/mint', async (req, res) => {
  const { userId, amount, reason } = req.body;

  const wallet = await prisma.wallet.upsert({
    where: { userId },
    update: { balance: { increment: amount }, earned: { increment: amount } },
    create: { userId, address: `azr_${userId}_${Date.now()}`, balance: amount, earned: amount }
  });

  await prisma.transaction.create({
    data: { type: 'mint', toId: wallet.id, amount, reason }
  });

  res.json({ success: true, wallet });
});

router.post('/api/admin/burn', async (req, res) => {
  const { userId, amount, reason } = req.body;

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet || wallet.balance < amount) {
    return res.status(400).json({ success: false, error: 'Insufficient balance' });
  }

  await prisma.$transaction([
    prisma.wallet.update({ where: { id: wallet.id }, data: { balance: { decrement: amount } } }),
    prisma.transaction.create({ data: { type: 'burn', fromId: wallet.id, amount, reason } })
  ]);

  res.json({ success: true });
});

router.get('/api/admin/metrics', async (req, res) => {
  const [wallets, transactions, stakes, mining] = await Promise.all([
    prisma.wallet.aggregate({ _sum: { balance: true, staked: true, earned: true }, _count: true }),
    prisma.transaction.count(),
    prisma.stake.aggregate({ _sum: { amount: true }, _count: true }),
    prisma.miningRecord.aggregate({ _sum: { tokensEarned: true }, _count: true })
  ]);

  res.json({
    success: true,
    metrics: {
      totalSupply: (wallets._sum.balance || 0) + (wallets._sum.staked || 0),
      totalWallets: wallets._count,
      totalTransactions: transactions,
      totalStaked: wallets._sum.staked || 0,
      totalMined: mining._sum.tokensEarned || 0,
      activeStakes: stakes._count
    }
  });
});

// ============ HEALTH CHECK ============

router.get('/health', async (req, res) => {
  const walletCount = await prisma.wallet.count();
  res.json({
    status: 'healthy',
    service: 'azora-mint',
    timestamp: new Date(),
    stats: { wallets: walletCount }
  });
});

module.exports = router;
