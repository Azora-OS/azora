const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();


router.get('/api/classroom', async (req, res) => {
  const items = await prisma.classroom.findMany({ take: 50 });
  res.json({ success: true, data: items });
});

router.get('/api/classroom/:id', async (req, res) => {
  const item = await prisma.classroom.findUnique({ where: { id: req.params.id } });
  res.json({ success: true, data: item });
});

router.post('/api/classroom', async (req, res) => {
  const item = await prisma.classroom.create({ data: req.body });
  res.json({ success: true, data: item });
});

router.put('/api/classroom/:id', async (req, res) => {
  const item = await prisma.classroom.update({ where: { id: req.params.id }, data: req.body });
  res.json({ success: true, data: item });
});

router.delete('/api/classroom/:id', async (req, res) => {
  await prisma.classroom.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

module.exports = router;
