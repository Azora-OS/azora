const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();


router.get('/api/career/recommendations', async (req, res) => {
  const recs = await prisma.careerRecommendation.findMany({ where: { userId: req.query.userId } });
  res.json({ success: true, data: recs });
});

router.post('/api/career/profile', async (req, res) => {
  const profile = await prisma.careerProfile.upsert({ where: { userId: req.body.userId }, update: req.body, create: req.body });
  res.json({ success: true, data: profile });
});

module.exports = router;
