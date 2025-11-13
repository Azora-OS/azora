const express = require('express');
const router = express.Router();
const personalityManager = require('../personality-manager');

router.get('/tree', (req, res) => {
  res.json(personalityManager.getFamilyTree());
});

router.get('/members', (req, res) => {
  res.json(personalityManager.getAllPersonalities());
});

router.get('/members/:name', (req, res) => {
  const personality = personalityManager.getPersonality(req.params.name);
  if (!personality) {
    return res.status(404).json({ error: 'Personality not found' });
  }
  res.json(personality);
});

module.exports = router;
