/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * PROOF-OF-KNOWLEDGE API
 * 
 * REST API for PoK Engine
 */

import express, { Request, Response } from 'express'
import { pokEngine, LearningModule } from './proof-of-knowledge-engine'

const app = express()
app.use(express.json())

/**
 * POST /api/pok/submit
 * Submit proof of knowledge completion
 */
app.post('/api/pok/submit', async (req: Request, res: Response) => {
  try {
    const { userId, module, score } = req.body

    if (!userId || !module || score === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, module, score'
      })
    }

    const proof = await pokEngine.submitProof(userId, module, score)

    res.json({
      success: true,
      proof,
      message: `Congratulations! You earned ${proof.rewardAmount} AZR`
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/pok/rewards/:userId
 * Get user's total rewards
 */
app.get('/api/pok/rewards/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params
  const rewards = pokEngine.getUserRewards(userId)
  const proofs = await pokEngine.getUserProofs(userId)
      
  res.json({
    success: true,
    userId,
    totalRewards: rewards,
    currency: 'AZR',
    proofCount: proofs.length,
    proofs
  })
})

/**
 * GET /api/pok/stats
 * Get system statistics
 */
app.get('/api/pok/stats', (req: Request, res: Response) => {
  const stats = pokEngine.getStats()

  res.json({
    success: true,
    stats
  })
})

/**
 * GET /api/pok/verify/:proofId
 * Verify a proof
 */
app.get('/api/pok/verify/:proofId', (req: Request, res: Response) => {
  const { proofId } = req.params
  const verified = pokEngine.verifyProof(proofId)

  res.json({
    success: true,
    proofId,
    verified
  })
})

/**
 * POST /api/pok/batch
 * Process batch rewards
 */
app.post('/api/pok/batch', async (req: Request, res: Response) => {
  try {
    const { proofs } = req.body

    if (!Array.isArray(proofs)) {
      return res.status(400).json({
        success: false,
        error: 'proofs must be an array'
      })
    }

    const totalDistributed = await pokEngine.processBatchRewards(proofs)

    res.json({
      success: true,
      processed: proofs.length,
      totalDistributed,
      currency: 'AZR'
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /health
 * Health check
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'proof-of-knowledge-api',
    timestamp: new Date()
  })
})

const PORT = process.env.POK_PORT || 5001

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🎓 Proof-of-Knowledge API running on port ${PORT}`)
    console.log(`   Health: http://localhost:${PORT}/health`)
    console.log(`   Submit: POST http://localhost:${PORT}/api/pok/submit`)
    console.log(`   Stats:  GET  http://localhost:${PORT}/api/pok/stats\n`)
  })
}

export default app
