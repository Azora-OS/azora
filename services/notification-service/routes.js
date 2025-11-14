const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

router.get('/api/notifications', async (req, res) => {
  const { userId } = req.query;
  const notifications = await prisma.notification.findMany({
    where: { userId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  res.json({ success: true, data: notifications });
});

router.patch('/api/notifications/:id/read', async (req, res) => {
  await prisma.notification.update({
    where: { id: req.params.id },
    data: { isRead: true, readAt: new Date() }
  });
  res.json({ success: true });
});

router.post('/api/notifications/mark-all-read', async (req, res) => {
  const { userId } = req.body;
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() }
  });
  res.json({ success: true });
});

router.post('/api/notifications', async (req, res) => {
  const { userId, title, message, type } = req.body;
  const notification = await prisma.notification.create({
    data: { userId, title, message, type, isRead: false }
  });
  res.json({ success: true, data: notification });
});

module.exports = router;
