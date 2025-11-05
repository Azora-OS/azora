/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * FOUNDER ONBOARDING API
 * 
 * REST API for founder management
 */

import express, { Request, Response } from 'express'
import { founderOnboarding } from './founder-onboarding'

const app = express()
app.use(express.json())

/**
 * POST /api/founders/onboard
 * Onboard a new founder
 */
app.post('/api/founders/onboard', async (req: Request, res: Response) => {
  try {
    const { name, email, role, volunteerMonths, equity } = req.body

    if (!name || !email || !role || !volunteerMonths || !equity) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, email, role, volunteerMonths, equity'
      })
    }

    const founder = await founderOnboarding.onboardFounder(
      name,
      email,
      role,
      volunteerMonths,
      equity
    )

    const contract = founderOnboarding.getContract(founder.id)
    const loan = founderOnboarding.getLoan(founder.id)

    res.json({
      success: true,
      founder,
      contract,
      loan,
      message: `${name} successfully onboarded as ${role}`
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/founders
 * Get all founders
 */
app.get('/api/founders', (req: Request, res: Response) => {
  const stats = founderOnboarding.getStats()
  res.json({
    success: true,
    ...stats
  })
})

/**
 * GET /api/founders/:id
 * Get specific founder details
 */
app.get('/api/founders/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const founder = founderOnboarding.getFounder(id)

  if (!founder) {
    return res.status(404).json({
      success: false,
      error: 'Founder not found'
    })
  }

  const contract = founderOnboarding.getContract(id)
  const loan = founderOnboarding.getLoan(id)

  res.json({
    success: true,
    founder,
    contract,
    loan
  })
})

/**
 * GET /api/founders/:id/contract
 * Get founder contract
 */
app.get('/api/founders/:id/contract', (req: Request, res: Response) => {
  const { id } = req.params
  const contract = founderOnboarding.getContract(id)

  if (!contract) {
    return res.status(404).json({
      success: false,
      error: 'Contract not found'
    })
  }

  res.json({
    success: true,
    contract
  })
})

/**
 * GET /health
 * Health check
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'founder-onboarding-api',
    timestamp: new Date()
  })
})

const PORT = process.env.FOUNDER_PORT || 5003

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n👥 Founder Onboarding API running on port ${PORT}`)
    console.log(`   Health: http://localhost:${PORT}/health`)
    console.log(`   Onboard: POST http://localhost:${PORT}/api/founders/onboard`)
    console.log(`   List: GET http://localhost:${PORT}/api/founders\n`)
  })
}

export default app
