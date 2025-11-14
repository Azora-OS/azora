const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

router.get('/api/wallet/:userId', async (req, res) => {
  const wallet = await prisma.wallet.findUnique({
    where: { userId: req.params.userId }
  }) || { balance: 0, currency: 'AZR' };
  res.json({ success: true, data: wallet });
});

router.post('/api/wallet/send', async (req, res) => {
  const { userId, amount, address } = req.body;
  const tx = await prisma.transaction.create({
    data: { userId, amount, type: 'TRANSFER', status: 'COMPLETED', metadata: { address } }
  });
  await prisma.wallet.update({
    where: { userId },
    data: { balance: { decrement: amount } }
  });
  res.json({ success: true, txHash: tx.id });
});

router.get('/api/transactions', async (req, res) => {
  const { userId } = req.query;
  const txs = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  res.json({ success: true, data: txs });
});

router.post('/api/mining/start', async (req, res) => {
  const { userId } = req.body;
  const reward = Math.random() * 10;
  await prisma.wallet.upsert({
    where: { userId },
    update: { balance: { increment: reward } },
    create: { userId, balance: reward, currency: 'AZR' }
  });
  res.json({ success: true, reward });
});

module.exports = router;
