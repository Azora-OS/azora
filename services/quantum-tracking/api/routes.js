const express = require('express');
const router = express.Router();
const quantumTrackingService = require('../index');

// Track quantum event
router.post('/track', (req, res) => {
  try {
    const { userId, eventType, data } = req.body;

    if (!userId || !eventType) {
      return res.status(400).json({
        error: 'User ID and event type are required'
      });
    }

    const quantumEvent = quantumTrackingService.trackQuantumEvent(userId, eventType, data);

    res.status(201).json({
      success: true,
      data: quantumEvent
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Get user tracking data
router.get('/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const filters = {
      eventType: req.query.eventType,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50
    };

    const trackingData = quantumTrackingService.getUserTrackingData(userId, filters);

    res.json({
      success: true,
      data: trackingData
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Get quantum analytics
router.get('/analytics/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const analytics = quantumTrackingService.getQuantumAnalytics(userId);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Train predictive model
router.post('/model/train', (req, res) => {
  try {
    const { modelId, trainingData } = req.body;

    if (!modelId) {
      return res.status(400).json({
        error: 'Model ID is required'
      });
    }

    const model = quantumTrackingService.trainPredictiveModel(modelId, trainingData);

    res.json({
      success: true,
      data: model
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Make prediction
router.post('/predict', (req, res) => {
  try {
    const { modelId, inputData } = req.body;

    if (!modelId) {
      return res.status(400).json({
        error: 'Model ID is required'
      });
    }

    const prediction = quantumTrackingService.makePrediction(modelId, inputData);

    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: error.message
      });
    }
    res.status(500).json({
      error: error.message
    });
  }
});

// Clear old data
router.delete('/data/old', (req, res) => {
  try {
    const retentionDays = parseInt(req.query.days) || 90;
    const removedCount = quantumTrackingService.clearOldData(retentionDays);

    res.json({
      success: true,
      message: `Removed ${removedCount} old quantum tracking events`,
      removedCount
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;
