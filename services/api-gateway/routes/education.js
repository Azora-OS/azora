const express = require('express');
const router = express.Router();

const EDUCATION_URL = process.env.EDUCATION_URL || 'http://localhost:3074';

// Proxy all education requests
router.all('*', async (req, res) => {
  try {
    const url = `${EDUCATION_URL}${req.path}`;
    const response = await fetch(url, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      ...(req.method !== 'GET' && { body: JSON.stringify(req.body) })
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(503).json({ error: 'Education service unavailable' });
  }
});

module.exports = router;
