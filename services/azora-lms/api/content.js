const express = require('express');
const router = express.Router();

// Content management endpoints
router.post('/', async (req, res) => {
  const { lessonId, type, data } = req.body;
  res.status(201).json({ 
    success: true, 
    data: { id: Date.now().toString(), lessonId, type, data, createdAt: new Date() } 
  });
});

router.get('/lesson/:lessonId', async (req, res) => {
  res.json({ success: true, data: [] });
});

module.exports = router;
