const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();


router.get('/api/analytics/users', async (req, res) => {
  const stats = await prisma.userAnalytics.aggregate({ _count: true, _avg: { engagement: true } });
  res.json({ success: true, data: stats });
});

router.get('/api/analytics/revenue', async (req, res) => {
  const revenue = await prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: 'PAYMENT' } });
  res.json({ success: true, data: revenue });
});

module.exports = router;
