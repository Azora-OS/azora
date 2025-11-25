const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();


router.get('/api/searchIndex', async (req, res) => {
  const items = await prisma.searchIndex.findMany({ take: 50 });
  res.json({ success: true, data: items });
});

router.get('/api/searchIndex/:id', async (req, res) => {
  const item = await prisma.searchIndex.findUnique({ where: { id: req.params.id } });
  res.json({ success: true, data: item });
});

router.post('/api/searchIndex', async (req, res) => {
  const item = await prisma.searchIndex.create({ data: req.body });
  res.json({ success: true, data: item });
});

router.put('/api/searchIndex/:id', async (req, res) => {
  const item = await prisma.searchIndex.update({ where: { id: req.params.id }, data: req.body });
  res.json({ success: true, data: item });
});

router.delete('/api/searchIndex/:id', async (req, res) => {
  await prisma.searchIndex.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

module.exports = router;
