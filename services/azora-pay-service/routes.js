const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();


router.post('/api/payments', async (req, res) => {
  const payment = await prisma.payment.create({ data: req.body });
  res.json({ success: true, data: payment });
});

router.get('/api/payments/:id', async (req, res) => {
  const payment = await prisma.payment.findUnique({ where: { id: req.params.id } });
  res.json({ success: true, data: payment });
});

router.get('/api/payments', async (req, res) => {
  const payments = await prisma.payment.findMany({ where: { userId: req.query.userId } });
  res.json({ success: true, data: payments });
});

module.exports = router;
