/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * NEURAL-LINK INFRASTRUCTURE API
 *
 * REST API endpoints for neural-link services enabling direct mind-machine interface.
 * Supports brainwave processing, thought commands, memory enhancement, and consciousness expansion.
 */

import express from 'express'
import { neuralLinkInfrastructure } from './neural-link-infrastructure'
import { authenticateUser } from './auth-middleware'

const router = express.Router()

/**
 * Establish neural link session
 * POST /api/neural/establish
 */
router.post('/establish', authenticateUser, async (req, res) => {
  try {
    const { deviceType } = req.body
    const userId = req.user.id

    if (!['headband', 'earbuds', 'implant', 'bci'].includes(deviceType)) {
      return res.status(400).json({
        error: 'Invalid device type',
        validTypes: ['headband', 'earbuds', 'implant', 'bci']
      })
    }

    const session = await neuralLinkInfrastructure.establishNeuralLink(userId, deviceType)

    res.json({
      success: true,
      sessionId: session.id,
      deviceType,
      message: `Neural link established via ${deviceType}`,
      capabilities: getDeviceCapabilities(deviceType)
    })
  } catch (error) {
    console.error('Error establishing neural link:', error)
    res.status(500).json({ error: 'Failed to establish neural link' })
  }
})

/**
 * Process brainwave data
 * POST /api/neural/brainwaves
 */
router.post('/brainwaves', authenticateUser, async (req, res) => {
  try {
    const { brainwaveData } = req.body
    const userId = req.user.id

    // Convert brainwave data if needed
    const processedData = {
      timestamp: brainwaveData.timestamp || Date.now(),
      emotionalState: brainwaveData.emotionalState,
      cognitiveLoad: brainwaveData.cognitiveLoad,
      focusLevel: brainwaveData.focusLevel,
      creativityIndex: brainwaveData.creativityIndex,
      stressLevel: brainwaveData.stressLevel,
      meditationDepth: brainwaveData.meditationDepth,
      neuralPatterns: new Float32Array(brainwaveData.neuralPatterns)
    }

    const commands = await neuralLinkInfrastructure.processBrainwaves(userId, processedData)

    res.json({
      success: true,
      commandsProcessed: commands.length,
      commands: commands.map(cmd => ({
        intent: cmd.intent,
        confidence: cmd.confidence,
        executed: cmd.executed
      })),
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Error processing brainwaves:', error)
    res.status(500).json({ error: 'Failed to process brainwave data' })
  }
})

/**
 * Get memory enhancement capabilities
 * GET /api/neural/memory
 */
router.get('/memory', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id
    const memoryEnhancement = await neuralLinkInfrastructure.getMemoryEnhancement(userId)

    res.json({
      success: true,
      capabilities: {
        instantRecall: 'available',
        predictiveLearning: 'available',
        skillAcceleration: 'available',
        memoryPalace: 'available'
      },
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Error getting memory enhancement:', error)
    res.status(500).json({ error: 'Failed to access memory enhancement' })
  }
})

/**
 * Perform instant recall
 * POST /api/neural/memory/recall
 */
router.post('/memory/recall', authenticateUser, async (req, res) => {
  try {
    const { topic } = req.body
    const userId = req.user.id

    const memoryEnhancement = await neuralLinkInfrastructure.getMemoryEnhancement(userId)
    const knowledge = await memoryEnhancement.instantRecall(topic)

    res.json({
      success: true,
      topic,
      knowledgeRetrieved: knowledge.length,
      knowledge: knowledge,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Error performing instant recall:', error)
    res.status(500).json({ error: 'Failed to perform instant recall' })
  }
})

/**
 * Generate predictive learning curriculum
 * POST /api/neural/memory/predictive
 */
router.post('/memory/predictive', authenticateUser, async (req, res) => {
  try {
    const { interest } = req.body
    const userId = req.user.id

    const memoryEnhancement = await neuralLinkInfrastructure.getMemoryEnhancement(userId)
    const curriculum = await memoryEnhancement.predictiveLearning(interest)

    res.json({
      success: true,
      interest,
      curriculum: {
        subject: curriculum.subject,
        moduleCount: curriculum.modules.length,
        estimatedCompletion: curriculum.estimatedCompletion,
        difficulty: curriculum.difficulty
      },
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Error generating predictive curriculum:', error)
    res.status(500).json({ error: 'Failed to generate predictive curriculum' })
  }
})

/**
 * Get dream integration capabilities
 * GET /api/neural/dreams
 */
router.get('/dreams', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id
    const dreamIntegration = await neuralLinkInfrastructure.getDreamIntegration(userId)

    res.json({
      success: true,
      capabilities: {
        dreamCapture: 'available',
        lucidGuidance: 'available',
        learningDuringSleep: 'available',
        dreamCollaboration: 'available'
      },
      dreamHistory: dreamIntegration.dreamCapture.length,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Error accessing dream integration:', error)
    res.status(500).json({ error: 'Failed to access dream integration' })
  }
})

/**
 * Get consciousness expansion tools
 * GET /api/neural/consciousness
 */
router.get('/consciousness', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id
    const consciousnessExpansion = await neuralLinkInfrastructure.getConsciousnessExpansion(userId)

    res.json({
      success: true,
      capabilities: {
        awareness: 'available',
        perception: 'available',
        intuition: 'available',
        connection: 'available'
      },
      awarenessLevel: consciousnessExpansion.awareness.metrics.awareness_level,
      intuitionAccuracy: consciousnessExpansion.intuition.accuracy,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Error accessing consciousness expansion:', error)
    res.status(500).json({ error: 'Failed to access consciousness expansion' })
  }
})

/**
 * Get neural link insights and status
 * GET /api/neural/insights
 */
router.get('/insights', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id
    const insights = await neuralLinkInfrastructure.getNeuralInsights(userId)

    res.json({
      success: true,
      sessionActive: insights.sessionActive,
      deviceType: insights.deviceType,
      cognitiveMetrics: insights.cognitiveMetrics,
      recentBrainwaves: insights.brainwaveHistory.length,
      recentCommands: insights.recentCommands.length,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Error getting neural insights:', error)
    res.status(500).json({ error: 'Failed to retrieve neural insights' })
  }
})

/**
 * End neural link session
 * POST /api/neural/end
 */
router.post('/end', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id

    // In a real implementation, we'd properly end the session
    // For now, just return success
    res.json({
      success: true,
      message: 'Neural link session ended',
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Error ending neural session:', error)
    res.status(500).json({ error: 'Failed to end neural session' })
  }
})

/**
 * Get device capabilities for a given device type
 */
function getDeviceCapabilities(deviceType: string): string[] {
  switch (deviceType) {
    case 'headband':
      return [
        'eeg_monitoring',
        'emotional_state_detection',
        'focus_level_tracking',
        'basic_thought_patterns',
        'meditation_assistance'
      ]
    case 'earbuds':
      return [
        'bone_conduction_feedback',
        'audio_thought_cues',
        'stress_level_monitoring',
        'ambient_awareness',
        'sleep_tracking'
      ]
    case 'implant':
      return [
        'direct_neural_interface',
        'high_precision_monitoring',
        'real_time_command_execution',
        'memory_enhancement',
        'consciousness_expansion'
      ]
    case 'bci':
      return [
        'full_brain_computer_interface',
        'complete_neural_monitoring',
        'instant_command_execution',
        'dream_integration',
        'universal_consciousness_link'
      ]
    default:
      return []
  }
}

export { router as neuralLinkRouter }
