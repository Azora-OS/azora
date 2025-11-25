const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();


router.get('/api/book', async (req, res) => {
  const items = await prisma.book.findMany({ take: 50 });
  res.json({ success: true, data: items });
});

router.get('/api/book/:id', async (req, res) => {
  const item = await prisma.book.findUnique({ where: { id: req.params.id } });
  res.json({ success: true, data: item });
});

router.post('/api/book', async (req, res) => {
  const item = await prisma.book.create({ data: req.body });
  res.json({ success: true, data: item });
});

router.put('/api/book/:id', async (req, res) => {
  const item = await prisma.book.update({ where: { id: req.params.id }, data: req.body });
  res.json({ success: true, data: item });
});

router.delete('/api/book/:id', async (req, res) => {
  await prisma.book.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

module.exports = router;
