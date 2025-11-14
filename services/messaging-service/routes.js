const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();


router.post('/api/messages', async (req, res) => {
  const message = await prisma.message.create({ data: req.body });
  res.json({ success: true, data: message });
});

router.get('/api/messages', async (req, res) => {
  const messages = await prisma.message.findMany({ where: { recipientId: req.query.userId } });
  res.json({ success: true, data: messages });
});

module.exports = router;
