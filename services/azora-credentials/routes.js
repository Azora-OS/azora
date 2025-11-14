const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();


router.post('/api/credentials', async (req, res) => {
  const credential = await prisma.credential.create({ data: req.body });
  res.json({ success: true, data: credential });
});

router.get('/api/credentials/:id/verify', async (req, res) => {
  const credential = await prisma.credential.findUnique({ where: { id: req.params.id } });
  res.json({ success: true, verified: !!credential, data: credential });
});

module.exports = router;
