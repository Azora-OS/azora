const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const prisma = new PrismaClient();

router.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, name, role: 'STUDENT' }
  });
  res.json({ success: true, data: { id: user.id, email: user.email } });
});

router.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'secret');
  res.json({ success: true, data: { token, user: { id: user.id, email: user.email, role: user.role } } });
});

router.get('/api/auth/profile', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, email: true, name: true, role: true }
  });
  res.json({ success: true, data: user });
});

router.get('/api/settings', async (req, res) => {
  const { userId } = req.query;
  const settings = await prisma.userSettings.findUnique({
    where: { userId }
  }) || { emailNotifications: true, pushNotifications: false, language: 'english' };
  res.json({ success: true, data: settings });
});

router.put('/api/settings', async (req, res) => {
  const { userId, ...data } = req.body;
  await prisma.userSettings.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data }
  });
  res.json({ success: true });
});

module.exports = router;
