/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * AMBIENT INTELLIGENCE API
 *
 * REST API endpoints for ambient intelligence services.
 * Enables integration with mobile apps, wearables, smart devices.
 */

import express from 'express'
import { ambientIntelligence, AmbientContext } from './ambient-intelligence'
import { authenticateUser } from './auth-middleware'
import { validateAmbientData } from './validation-middleware'

const router = express.Router()

/**
 * Start ambient monitoring session
 * POST /api/ambient/start
 */
router.post('/start', authenticateUser, async (req, res) => {
  try {
    const { deviceType } = req.body
    const userId = req.user.id

    if (!['earphones', 'car_audio', 'wearable', 'smart_home'].includes(deviceType)) {
      return res.status(400).json({
        error: 'Invalid device type',
        validTypes: ['earphones', 'car_audio', 'wearable', 'smart_home']
      })
    }

    const session = await ambientIntelligence.startAmbientSession(userId, deviceType)

    res.json({
      success: true,
      sessionId: session.id,
      deviceType,
      message: `Ambient monitoring started for ${deviceType}`,
      capabilities: getDeviceCapabilities(deviceType)
    })
  } catch (error) {
    console.error('Error starting ambient session:', error)
    res.status(500).json({ error: 'Failed to start ambient monitoring' })
  }
})

/**
 * Process audio/biometric data
 * POST /api/ambient/process
 */
router.post('/process', authenticateUser, validateAmbientData, async (req, res) => {
  try {
    const { audioData, context } = req.body
    const userId = req.user.id

    // Convert base64 audio data to Float32Array if needed
    let audioBuffer: Float32Array
    if (typeof audioData === 'string') {
      // Decode base64 audio data
      const audioBytes = Buffer.from(audioData, 'base64')
      audioBuffer = new Float32Array(audioBytes.buffer)
    } else {
      audioBuffer = new Float32Array(audioData)
    }

    const indicators = await ambientIntelligence.processAudioData(userId, audioBuffer, context)

    res.json({
      success: true,
      indicators,
      timestamp: Date.now(),
      message: 'Health indicators analyzed successfully'
    })
  } catch (error) {
    console.error('Error processing ambient data:', error)
    res.status(500).json({ error: 'Failed to process ambient data' })
  }
})

/**
 * Get ambient intelligence insights
 * GET /api/ambient/insights
 */
router.get('/insights', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id
    const insights = await ambientIntelligence.getAmbientInsights(userId)

    res.json({
      success: true,
      insights,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Error getting ambient insights:', error)
    res.status(500).json({ error: 'Failed to retrieve ambient insights' })
  }
})

/**
 * Get session status
 * GET /api/ambient/status
 */
router.get('/status', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id

    // Check if user has active session
    try {
      const insights = await ambientIntelligence.getAmbientInsights(userId)
      res.json({
        success: true,
        active: true,
        currentState: insights.currentState,
        deviceType: 'active' // Would need to track this in real implementation
      })
    } catch (error) {
      res.json({
        success: true,
        active: false,
        message: 'No active ambient monitoring session'
      })
    }
  } catch (error) {
    console.error('Error checking ambient status:', error)
    res.status(500).json({ error: 'Failed to check ambient status' })
  }
})

/**
 * End ambient monitoring session
 * POST /api/ambient/end
 */
router.post('/end', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id

    // In a real implementation, we'd properly end the session
    // For now, just return success
    res.json({
      success: true,
      message: 'Ambient monitoring session ended',
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Error ending ambient session:', error)
    res.status(500).json({ error: 'Failed to end ambient session' })
  }
})

/**
 * Get device capabilities for a given device type
 */
function getDeviceCapabilities(deviceType: string): string[] {
  switch (deviceType) {
    case 'earphones':
      return [
        'voice_stress_analysis',
        'audio_emotion_detection',
        'ambient_noise_monitoring',
        'bone_conduction_heartrate', // if supported
        'audio_interventions'
      ]
    case 'car_audio':
      return [
        'driver_fatigue_detection',
        'passenger_stress_monitoring',
        'road_safety_alerts',
        'vehicle_system_integration',
        'emergency_response_coordination'
      ]
    case 'wearable':
      return [
        'heart_rate_monitoring',
        'breathing_rate_analysis',
        'skin_temperature_tracking',
        'movement_pattern_analysis',
        'haptic_feedback_interventions',
        'continuous_health_monitoring'
      ]
    case 'smart_home':
      return [
        'air_quality_monitoring',
        'noise_level_analysis',
        'occupancy_pattern_tracking',
        'environmental_adjustments',
        'multi_user_coordination'
      ]
    default:
      return []
  }
}

export { router as ambientIntelligenceRouter }
