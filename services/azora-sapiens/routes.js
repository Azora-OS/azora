const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();


router.post('/api/tutor/chat', async (req, res) => {
  const { userId, message } = req.body;
  const response = await prisma.chatMessage.create({ data: { userId, message, role: 'assistant' } });
  res.json({ success: true, data: response });
});

router.get('/api/tutor/history/:userId', async (req, res) => {
  const history = await prisma.chatMessage.findMany({ where: { userId: req.params.userId } });
  res.json({ success: true, data: history });
});

module.exports = router;
