const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();


router.get('/api/recommendation', async (req, res) => {
  const items = await prisma.recommendation.findMany({ take: 50 });
  res.json({ success: true, data: items });
});

router.get('/api/recommendation/:id', async (req, res) => {
  const item = await prisma.recommendation.findUnique({ where: { id: req.params.id } });
  res.json({ success: true, data: item });
});

router.post('/api/recommendation', async (req, res) => {
  const item = await prisma.recommendation.create({ data: req.body });
  res.json({ success: true, data: item });
});

router.put('/api/recommendation/:id', async (req, res) => {
  const item = await prisma.recommendation.update({ where: { id: req.params.id }, data: req.body });
  res.json({ success: true, data: item });
});

router.delete('/api/recommendation/:id', async (req, res) => {
  await prisma.recommendation.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

module.exports = router;
