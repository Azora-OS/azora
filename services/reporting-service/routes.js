const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();


router.get('/api/report', async (req, res) => {
  const items = await prisma.report.findMany({ take: 50 });
  res.json({ success: true, data: items });
});

router.get('/api/report/:id', async (req, res) => {
  const item = await prisma.report.findUnique({ where: { id: req.params.id } });
  res.json({ success: true, data: item });
});

router.post('/api/report', async (req, res) => {
  const item = await prisma.report.create({ data: req.body });
  res.json({ success: true, data: item });
});

router.put('/api/report/:id', async (req, res) => {
  const item = await prisma.report.update({ where: { id: req.params.id }, data: req.body });
  res.json({ success: true, data: item });
});

router.delete('/api/report/:id', async (req, res) => {
  await prisma.report.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

module.exports = router;
