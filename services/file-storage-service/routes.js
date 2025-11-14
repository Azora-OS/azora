const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();


router.get('/api/file', async (req, res) => {
  const items = await prisma.file.findMany({ take: 50 });
  res.json({ success: true, data: items });
});

router.get('/api/file/:id', async (req, res) => {
  const item = await prisma.file.findUnique({ where: { id: req.params.id } });
  res.json({ success: true, data: item });
});

router.post('/api/file', async (req, res) => {
  const item = await prisma.file.create({ data: req.body });
  res.json({ success: true, data: item });
});

router.put('/api/file/:id', async (req, res) => {
  const item = await prisma.file.update({ where: { id: req.params.id }, data: req.body });
  res.json({ success: true, data: item });
});

router.delete('/api/file/:id', async (req, res) => {
  await prisma.file.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

module.exports = router;
