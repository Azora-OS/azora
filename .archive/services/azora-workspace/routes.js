const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();


router.get('/api/workspace', async (req, res) => {
  const items = await prisma.workspace.findMany({ take: 50 });
  res.json({ success: true, data: items });
});

router.get('/api/workspace/:id', async (req, res) => {
  const item = await prisma.workspace.findUnique({ where: { id: req.params.id } });
  res.json({ success: true, data: item });
});

router.post('/api/workspace', async (req, res) => {
  const item = await prisma.workspace.create({ data: req.body });
  res.json({ success: true, data: item });
});

router.put('/api/workspace/:id', async (req, res) => {
  const item = await prisma.workspace.update({ where: { id: req.params.id }, data: req.body });
  res.json({ success: true, data: item });
});

router.delete('/api/workspace/:id', async (req, res) => {
  await prisma.workspace.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

module.exports = router;
