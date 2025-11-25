const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();


router.get('/api/content', async (req, res) => {
  const items = await prisma.content.findMany({ take: 50 });
  res.json({ success: true, data: items });
});

router.get('/api/content/:id', async (req, res) => {
  const item = await prisma.content.findUnique({ where: { id: req.params.id } });
  res.json({ success: true, data: item });
});

router.post('/api/content', async (req, res) => {
  const item = await prisma.content.create({ data: req.body });
  res.json({ success: true, data: item });
});

router.put('/api/content/:id', async (req, res) => {
  const item = await prisma.content.update({ where: { id: req.params.id }, data: req.body });
  res.json({ success: true, data: item });
});

router.delete('/api/content/:id', async (req, res) => {
  await prisma.content.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

module.exports = router;
