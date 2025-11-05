/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * AZORA EDUCATION API SERVER
 * 
 * Comprehensive API for the complete education ecosystem
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { azoraEducation, primaryEducation, secondaryEducation, azoraSapiensUniversity, enhancedMint } from './index'

const app = express()
const PORT = process.env.EDUCATION_PORT || 4201

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

// Initialize education system on startup
azoraEducation.initialize().then(() => {
  console.log('✅ Azora Education System initialized')
})

// ========== HEALTH CHECK ==========
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Azora Education System',
    timestamp: new Date(),
    components: {
      primaryEducation: 'operational',
      secondaryEducation: 'operational',
      university: 'operational',
      mint: 'operational'
    }
  })
})

// ========== PRIMARY EDUCATION ==========
app.post('/api/primary/enroll', async (req, res) => {
  try {
    const { studentId, grade, preferences } = req.body
    const enrollment = await primaryEducation.enrollStudent(studentId, grade, preferences)
    res.json(enrollment)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

app.get('/api/primary/grades', (req, res) => {
  const grades = Array.from(primaryEducation.getAllGrades().values())
  res.json({ grades })
})

app.get('/api/primary/student/:studentId', (req, res) => {
  const progress = primaryEducation.getStudentProgress(req.params.studentId)
  if (!progress) {
    return res.status(404).json({ error: 'Student not found' })
  }
  res.json(progress)
})

app.post('/api/primary/assessment', async (req, res) => {
  try {
    const { studentId, subjectId, assessment } = req.body
    const feedback = await primaryEducation.recordAssessment(studentId, subjectId, assessment)
    res.json(feedback)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// ========== SECONDARY EDUCATION ==========
app.post('/api/secondary/enroll', async (req, res) => {
  try {
    const { studentId, gradeLevel, streamId } = req.body
    const enrollment = await secondaryEducation.enrollStudent(studentId, gradeLevel, streamId)
    res.json(enrollment)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

app.get('/api/secondary/grades', (req, res) => {
  const grades = Array.from(secondaryEducation.getAllGrades().values())
  res.json({ grades })
})

app.get('/api/secondary/streams', (req, res) => {
  const streams = Array.from(secondaryEducation.getAllStreams().values())
  res.json({ streams })
})

app.get('/api/secondary/nsc-requirements', (req, res) => {
  const requirements = secondaryEducation.getNSCRequirements()
  res.json(requirements)
})

app.get('/api/secondary/student/:studentId', (req, res) => {
  const record = secondaryEducation.getStudentRecord(req.params.studentId)
  if (!record) {
    return res.status(404).json({ error: 'Student not found' })
  }
  res.json(record)
})

// ========== UNIVERSITY ==========
app.post('/api/university/enroll', async (req, res) => {
  try {
    const { studentId, programmeId } = req.body
    const enrollment = await azoraSapiensUniversity.enrollStudent(studentId, programmeId)
    res.json(enrollment)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

app.get('/api/university/programmes', (req, res) => {
  const programmes = azoraSapiensUniversity.getAllProgrammes()
  res.json({ programmes })
})

app.get('/api/university/details', (req, res) => {
  const details = azoraSapiensUniversity.getUniversityDetails()
  res.json(details)
})

app.get('/api/university/faculties', (req, res) => {
  const details = azoraSapiensUniversity.getUniversityDetails()
  res.json({ faculties: details.faculties })
})

app.get('/api/university/student/:studentId', (req, res) => {
  const student = azoraSapiensUniversity.getStudent(req.params.studentId)
  if (!student) {
    return res.status(404).json({ error: 'Student not found' })
  }
  res.json(student)
})

// ========== ENHANCED MINT ==========
app.post('/api/mint/wallet/create', async (req, res) => {
  try {
    const { userId, config } = req.body
    const wallet = await enhancedMint.createSecureWallet(userId, config)
    res.json(wallet)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

app.get('/api/mint/wallet/:walletId', (req, res) => {
  const wallet = enhancedMint.getWallet(req.params.walletId)
  if (!wallet) {
    return res.status(404).json({ error: 'Wallet not found' })
  }
  res.json(wallet)
})

app.post('/api/mint/transaction', async (req, res) => {
  try {
    const transaction = await enhancedMint.executeTransaction(req.body)
    res.json(transaction)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

app.post('/api/mint/stake', async (req, res) => {
  try {
    const { userId, amount, lockPeriod } = req.body
    const position = await enhancedMint.stakeTokens(userId, amount, lockPeriod)
    res.json(position)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

app.get('/api/mint/staking/:userId', (req, res) => {
  const positions = enhancedMint.getUserStakingPositions(req.params.userId)
  res.json({ positions })
})

app.get('/api/mint/tvl', (req, res) => {
  const tvl = enhancedMint.getTotalValueLocked()
  res.json({ tvl })
})

app.post('/api/mint/liquidity/add', async (req, res) => {
  try {
    const { userId, poolId, amounts } = req.body
    const position = await enhancedMint.addLiquidity(userId, poolId, amounts)
    res.json(position)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// ========== INTEGRATED SERVICES ==========
app.post('/api/student/enroll', async (req, res) => {
  try {
    const { studentId, level, details } = req.body
    const enrollment = await azoraEducation.enrollStudent(studentId, level, details)
    res.json(enrollment)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

app.post('/api/student/reward', async (req, res) => {
  try {
    const { studentId, amount, reason } = req.body
    const reward = await azoraEducation.awardStudent(studentId, amount, reason)
    res.json(reward)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

app.get('/api/student/:studentId/record', async (req, res) => {
  try {
    const record = await azoraEducation.getStudentRecord(req.params.studentId)
    res.json(record)
  } catch (error: any) {
    res.status(404).json({ error: error.message })
  }
})

app.get('/api/programmes/all', (req, res) => {
  const programmes = azoraEducation.getAllProgrammes()
  res.json(programmes)
})

app.get('/api/statistics', (req, res) => {
  const stats = azoraEducation.getStatistics()
  res.json(stats)
})

// ========== START SERVER ==========
app.listen(PORT, () => {
  console.log(`\n🎓 AZORA EDUCATION SYSTEM running on port ${PORT}\n`)
  console.log(`   📚 Primary Education: http://localhost:${PORT}/api/primary`)
  console.log(`   🎯 Secondary Education: http://localhost:${PORT}/api/secondary`)
  console.log(`   🏛️ University: http://localhost:${PORT}/api/university`)
  console.log(`   💰 Enhanced Mint: http://localhost:${PORT}/api/mint`)
  console.log(`   ❤️ Health: http://localhost:${PORT}/health`)
  console.log(`\n   🌟 Comprehensive education from Grade R to PhD`)
  console.log(`   🤖 Powered by Elara AI & Academic Agents`)
  console.log(`   🔒 Enterprise-grade security with multi-sig & biometric auth`)
  console.log(`   💎 Value generation through staking & liquidity mining\n`)
})
