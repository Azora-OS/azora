const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { notificationQueue } = require('./queue');
const templates = require('./templates');
const router = express.Router();
const prisma = new PrismaClient();

// Get user notifications
router.get('/notifications', async (req, res) => {
  const { userId } = req.query;
  const notifications = await prisma.notification.findMany({
    where: { userId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  res.json({ success: true, data: notifications });
});

// Mark notification as read
router.put('/notifications/:id/read', async (req, res) => {
  await prisma.notification.update({
    where: { id: req.params.id },
    data: { isRead: true, readAt: new Date() }
  });
  res.json({ success: true });
});

// Mark all as read
router.post('/notifications/mark-all-read', async (req, res) => {
  const { userId } = req.body;
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() }
  });
  res.json({ success: true });
});

// Send notification (queue)
router.post('/notifications/send', async (req, res) => {
  const { userId, type, channel, template, data } = req.body;
  
  // Store in database
  const notification = await prisma.notification.create({
    data: { 
      userId, 
      title: data.title || 'Notification',
      message: data.message || '',
      type: type || 'info',
      isRead: false 
    }
  });
  
  // Queue for delivery
  if (channel === 'email' && data.email) {
    const tmpl = templates[template] || templates.generic;
    await notificationQueue.add({
      type: 'email',
      data: {
        to: data.email,
        subject: tmpl.subject,
        html: tmpl.html(data),
        text: tmpl.text(data)
      }
    });
  }
  
  res.json({ success: true, data: notification });
});

// Get notification preferences
router.get('/notifications/preferences/:userId', async (req, res) => {
  res.json({ 
    success: true, 
    data: { email: true, sms: false, push: true } 
  });
});

// Get templates
router.get('/notifications/templates', async (req, res) => {
  res.json({ 
    success: true, 
    data: Object.keys(templates) 
  });
});

module.exports = router;
