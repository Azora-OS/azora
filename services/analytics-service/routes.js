const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Track event
router.post('/analytics/track', async (req, res) => {
  const { userId, eventType, properties } = req.body;
  
  const event = await prisma.event.create({
    data: {
      userId,
      eventType,
      properties: JSON.stringify(properties || {}),
      timestamp: new Date()
    }
  });
  
  res.json({ success: true, data: event });
});

// Get metrics
router.get('/analytics/metrics', async (req, res) => {
  const { name, from, to } = req.query;
  
  const where = { name };
  if (from || to) {
    where.timestamp = {};
    if (from) where.timestamp.gte = new Date(from);
    if (to) where.timestamp.lte = new Date(to);
  }
  
  const metrics = await prisma.metric.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: 100
  });
  
  res.json({ success: true, data: metrics });
});

// Dashboard data
router.get('/analytics/dashboard', async (req, res) => {
  const [totalEvents, recentEvents, topEvents] = await Promise.all([
    prisma.event.count(),
    prisma.event.findMany({ orderBy: { timestamp: 'desc' }, take: 10 }),
    prisma.event.groupBy({
      by: ['eventType'],
      _count: { eventType: true },
      orderBy: { _count: { eventType: 'desc' } },
      take: 5
    })
  ]);
  
  res.json({ 
    success: true, 
    data: { totalEvents, recentEvents, topEvents } 
  });
});

// Reports
router.get('/analytics/reports', async (req, res) => {
  const { type, period } = req.query;
  
  const startDate = new Date();
  if (period === 'day') startDate.setDate(startDate.getDate() - 1);
  else if (period === 'week') startDate.setDate(startDate.getDate() - 7);
  else if (period === 'month') startDate.setMonth(startDate.getMonth() - 1);
  
  const events = await prisma.event.findMany({
    where: {
      eventType: type,
      timestamp: { gte: startDate }
    },
    orderBy: { timestamp: 'asc' }
  });
  
  res.json({ success: true, data: events });
});

// Real-time analytics
router.get('/analytics/realtime', async (req, res) => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  const [activeUsers, recentEvents] = await Promise.all([
    prisma.event.groupBy({
      by: ['userId'],
      where: { timestamp: { gte: fiveMinutesAgo } },
      _count: true
    }),
    prisma.event.findMany({
      where: { timestamp: { gte: fiveMinutesAgo } },
      orderBy: { timestamp: 'desc' },
      take: 20
    })
  ]);
  
  res.json({ 
    success: true, 
    data: { 
      activeUsers: activeUsers.length,
      recentEvents 
    } 
  });
});

module.exports = router;
