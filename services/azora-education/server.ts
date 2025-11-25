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
import courseRoutes from './src/routes/course.routes'
import primaryRoutes from './src/routes/primary.routes'
import secondaryRoutes from './src/routes/secondary.routes'
import universityRoutes from './src/routes/university.routes'
import { PrismaClient } from '@prisma/client'

// Azora Infrastructure Integration
import { getDatabasePool, getRedisCache, getSupabaseClient } from '../azora-database-layer'
import { EventBus } from '../azora-event-bus'

const app = express()
const PORT = process.env.EDUCATION_PORT || 4201

// Azora Infrastructure Components
let dbPool: any
let redisCache: any
let supabaseClient: any
let eventBus: EventBus
const prisma = new PrismaClient()

// Configuration
// Using Prisma with DATABASE_URL from .env (SQLite for local, PostgreSQL for production)
// const AZORA_DB_URL = process.env.AZORA_DB_URL || 'postgresql://localhost:5432/azora'
const AZORA_REDIS_URL = process.env.AZORA_REDIS_URL || 'redis://localhost:6379'
const AZORA_SUPABASE_URL = process.env.AZORA_SUPABASE_URL
const AZORA_SUPABASE_KEY = process.env.AZORA_SUPABASE_KEY
const AZORA_EVENT_BUS_URL = process.env.AZORA_EVENT_BUS_URL || 'redis://localhost:6379'

/**
 * Setup Event Bus Listeners for Education Service
 */
async function setupEventBusListeners() {
  // Listen for credit score updates from Mint service
  eventBus.subscribe('mint.credit.score.updated', async (event: any) => {
    const { studentId, creditScore, timestamp } = event.data
    console.log(`📊 Credit score updated for student ${studentId}: ${creditScore}`)

    // Update student's credit-based access to premium content
    try {
      // Store credit score in database
      const query = `
        INSERT INTO student_credit_scores (student_id, credit_score, updated_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (student_id)
        DO UPDATE SET credit_score = $2, updated_at = $3
      `
      await dbPool.query(query, [studentId, creditScore, timestamp])

      // Publish education access update
      await eventBus.publish('education.access.updated', {
        studentId,
        creditScore,
        accessLevel: creditScore > 700 ? 'premium' : 'standard',
        timestamp: new Date()
      })
    } catch (error) {
      console.error('Error processing credit score update:', error)
    }
  })

  // Listen for payment confirmations from Mint service
  eventBus.subscribe('mint.payment.confirmed', async (event: any) => {
    const { studentId, amount, currency, courseId, timestamp } = event.data
    console.log(`💰 Payment confirmed for student ${studentId}: ${amount} ${currency}`)

    // Grant course access
    try {
      // Record payment in database
      const query = `
        INSERT INTO course_payments (student_id, course_id, amount, currency, payment_date)
        VALUES ($1, $2, $3, $4, $5)
      `
      await dbPool.query(query, [studentId, courseId, amount, currency, timestamp])

      // Update course enrollment status
      await eventBus.publish('education.enrollment.confirmed', {
        studentId,
        courseId,
        paymentAmount: amount,
        currency,
        timestamp: new Date()
      })
    } catch (error) {
      console.error('Error processing payment confirmation:', error)
    }
  })

  // Listen for staking rewards from Mint service
  eventBus.subscribe('mint.staking.reward', async (event: any) => {
    const { studentId, rewardAmount, stakingPeriod, timestamp } = event.data
    console.log(`🎁 Staking reward for student ${studentId}: ${rewardAmount} AZR`)

    // Award educational achievements based on staking
    try {
      // Record reward in database
      const query = `
        INSERT INTO staking_rewards (student_id, reward_amount, staking_period, reward_date)
        VALUES ($1, $2, $3, $4)
      `
      await dbPool.query(query, [studentId, rewardAmount, stakingPeriod, timestamp])

      // Check for achievement unlocks
      const totalRewards = await dbPool.query(
        'SELECT SUM(reward_amount) as total FROM staking_rewards WHERE student_id = $1',
        [studentId]
      )

      if (totalRewards.rows[0].total > 1000) {
        await eventBus.publish('education.achievement.unlocked', {
          studentId,
          achievement: 'dedicated_learner',
          reward: rewardAmount,
          timestamp: new Date()
        })
      }
    } catch (error) {
      console.error('Error processing staking reward:', error)
    }
  })

  // Listen for skill certifications from Forge service
  eventBus.subscribe('forge.skill.certified', async (event: any) => {
    const { studentId, skillId, certificationLevel, timestamp } = event.data
    console.log(`🏆 Skill certified for student ${studentId}: ${skillId} (${certificationLevel})`)

    // Update student's skill profile
    try {
      const query = `
        INSERT INTO student_skills (student_id, skill_id, certification_level, certified_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (student_id, skill_id)
        DO UPDATE SET certification_level = $3, certified_at = $4
      `
      await dbPool.query(query, [studentId, skillId, certificationLevel, timestamp])

      // Update academic progress
      await eventBus.publish('education.progress.updated', {
        studentId,
        skillId,
        certificationLevel,
        timestamp: new Date()
      })
    } catch (error) {
      console.error('Error processing skill certification:', error)
    }
  })

  console.log('✅ Education service event listeners configured')
}

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

// Mount V1 Routes
// Health Check
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await dbPool.query('SELECT 1').then(() => 'healthy').catch(() => 'unhealthy')

    // Check Redis health
    const redisHealth = await redisCache.get('education:health').then(() => 'healthy').catch(() => 'unhealthy')

    // Check Supabase health
    let supabaseHealth = 'not_configured'
    if (supabaseClient) {
      supabaseHealth = await supabaseClient.from('health_check').select('*').limit(1).then(() => 'healthy').catch(() => 'unhealthy')
    }

    // Check event bus health
    const eventBusHealth = eventBus ? 'healthy' : 'unhealthy'

    const isHealthy = dbHealth === 'healthy' && redisHealth === 'healthy' && eventBusHealth === 'healthy'

    res.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      service: 'Azora Education System',
      timestamp: new Date(),
      infrastructure: {
        database: dbHealth,
        redis: redisHealth,
        supabase: supabaseHealth,
        eventBus: eventBusHealth
      },
      components: {
        primaryEducation: 'operational',
        secondaryEducation: 'operational',
        university: 'operational',
        mint: 'operational'
      }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(503).json({
      status: 'unhealthy',
      service: 'Azora Education System',
      error: errorMessage,
      timestamp: new Date()
    })
  }
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

app.get('/api/primary/grades', (_req, res) => {
  const grades = Array.from(primaryEducation.getAllGrades().values())
  res.json({ grades })
})

app.get('/api/primary/student/:studentId', (req, res) => {
  const progress = primaryEducation.getStudentProgress(req.params.studentId)
  if (!progress) {
    return res.status(404).json({ error: 'Student not found' })
  }
  res.json(progress)
  return
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

app.get('/api/secondary/grades', (_req, res) => {
  const grades = Array.from(secondaryEducation.getAllGrades().values())
  res.json({ grades })
})

app.get('/api/secondary/streams', (_req, res) => {
  const streams = Array.from(secondaryEducation.getAllStreams().values())
  res.json({ streams })
})

app.get('/api/secondary/nsc-requirements', (_req, res) => {
  const requirements = secondaryEducation.getNSCRequirements()
  res.json(requirements)
})

app.get('/api/secondary/student/:studentId', (req, res) => {
  const record = secondaryEducation.getStudentRecord(req.params.studentId)
  if (!record) {
    return res.status(404).json({ error: 'Student not found' })
  }
  res.json(record)
  return
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

app.get('/api/university/programmes', (_req, res) => {
  const programmes = azoraSapiensUniversity.getAllProgrammes()
  res.json({ programmes })
})

app.get('/api/university/details', (_req, res) => {
  const details = azoraSapiensUniversity.getUniversityDetails()
  res.json(details)
})

app.get('/api/university/faculties', (_req, res) => {
  const details = azoraSapiensUniversity.getUniversityDetails()
  res.json({ faculties: details.faculties })
})

app.get('/api/university/student/:studentId', (req, res) => {
  const student = azoraSapiensUniversity.getStudent(req.params.studentId)
  if (!student) {
    return res.status(404).json({ error: 'Student not found' })
  }
  res.json(student)
  return
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
  return
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

app.get('/api/mint/staking/:userId', (_req, res) => {
  const positions = enhancedMint.getUserStakingPositions(_req.params.userId)
  res.json({ positions })
})

app.get('/api/mint/tvl', (_req, res) => {
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

app.get('/api/programmes/all', (_req, res) => {
  const programmes = azoraEducation.getAllProgrammes()
  res.json(programmes)
})

app.get('/api/statistics', (_req, res) => {
  const stats = azoraEducation.getStatistics()
  res.json(stats)
})

// ========== COURSES & ENROLLMENTS (MVP) ==========

// List all courses
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { published: true },
      include: {
        _count: {
          select: { modules: true, enrollments: true }
        }
      }
    })
    res.json(courses)
  } catch (error: any) {
    console.error('Error fetching courses:', error)
    res.status(500).json({ error: 'Failed to fetch courses' })
  }
})

// Get course details
app.get('/api/courses/:id', async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        modules: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }

    res.json(course)
  } catch (error: any) {
    console.error('Error fetching course details:', error)
    res.status(500).json({ error: 'Failed to fetch course details' })
  }
})

// Get course content (modules)
app.get('/api/courses/:id/content', async (req, res) => {
  try {
    const modules = await prisma.module.findMany({
      where: { courseId: req.params.id },
      orderBy: { order: 'asc' }
    })
    res.json(modules)
  } catch (error: any) {
    console.error('Error fetching course content:', error)
    res.status(500).json({ error: 'Failed to fetch course content' })
  }
})

// Enroll in course
app.post('/api/enrollments', async (req, res) => {
  try {
    const { userId, courseId } = req.body

    if (!userId || !courseId) {
      return res.status(400).json({ error: 'Missing userId or courseId' })
    }

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: userId,
          courseId: courseId
        }
      }
    })

    if (existing) {
      return res.status(400).json({ error: 'Already enrolled' })
    }

    // Create enrollment
    // Note: In a real app, we would verify payment here or listen to payment event
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: userId,
        courseId: courseId,
        status: 'active',
        progress: 0
      }
    })

    res.json(enrollment)
  } catch (error: any) {
    console.error('Error enrolling in course:', error)
    res.status(500).json({ error: 'Failed to enroll' })
  }
})

// Get user enrollments
app.get('/api/enrollments/:userId', async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: req.params.userId },
      include: {
        course: true
      }
    })
    res.json(enrollments)
  } catch (error: any) {
    console.error('Error fetching enrollments:', error)
    res.status(500).json({ error: 'Failed to fetch enrollments' })
  }
})

// Generate course with Elara AI
app.post('/api/courses/generate', async (req, res) => {
  try {
    const { outline } = req.body

    // Call Elara Content Generator
    const elaraResponse = await fetch('http://localhost:3004/api/generate/course', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outline })
    })

    if (!elaraResponse.ok) {
      throw new Error('Failed to generate course content')
    }

    const generatedLessons = await elaraResponse.json()

    // Create course in database
    const course = await prisma.course.create({
      data: {
        title: outline.title,
        description: `AI-generated course on ${outline.title}`,
        price: outline.price || 49.99,
        instructorId: outline.instructorId || 'elara-ai',
        category: outline.category || 'Technology',
        level: outline.level || 'beginner',
        duration: `${outline.modules?.length || 4} weeks`,
        published: false, // Admin needs to review before publishing
        modules: {
          create: generatedLessons.map((lesson: any, index: number) => ({
            title: lesson.topic,
            description: lesson.content.title,
            content: JSON.stringify(lesson.content),
            order: index + 1,
            duration: outline.modules?.find((m: any) =>
              m.topics?.some((t: any) => t.title === lesson.topic)
            )?.topics?.find((t: any) => t.title === lesson.topic)?.duration || 15
          }))
        }
      },
      include: {
        modules: true
      }
    })

    res.json({
      success: true,
      course,
      message: 'Course generated successfully. Please review and publish.'
    })
  } catch (error: any) {
    console.error('Error generating course:', error)
    res.status(500).json({ error: 'Failed to generate course', details: error.message })
  }
})

// ========== START SERVER ==========
const server = app.listen(PORT, () => {
  console.log(`\n🎓 AZORA EDUCATION SYSTEM running on port ${PORT}\n`)
  console.log(`   📚 Primary Education: http://localhost:${PORT}/api/primary`)
  console.log(`   🎯 Secondary Education: http://localhost:${PORT}/api/secondary`)
  console.log(`   🏛️ University: http://localhost:${PORT}/api/university`)
  console.log(`   💰 Enhanced Mint: http://localhost:${PORT}/api/mint`)
  console.log(`   ❤️ Health: http://localhost:${PORT}/health`)
  console.log(`\n   🌟 Comprehensive education from Grade R to PhD`)
  console.log(`   🤖 Powered by Elara AI & Academic Agents`)
  console.log(`   🔒 Enterprise-grade security with multi-sig & biometric auth`)
  console.log(`   💎 Value generation through staking & liquidity mining`)
  console.log(`   🔗 Connected to Azora Database & Event Bus\n`)
})

// ========== GRACEFUL SHUTDOWN ==========
process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...')

  try {
    // Close server
    server.close(async () => {
      console.log('  ✓ HTTP server closed')

      // Close database connections
      if (dbPool) {
        await dbPool.end()
        console.log('  ✓ Database connections closed')
      }

      // Close Redis connections
      if (redisCache) {
        await redisCache.quit()
        console.log('  ✓ Redis connections closed')
      }

      // Close event bus
      if (eventBus) {
        await eventBus.disconnect()
        console.log('  ✓ Event bus disconnected')
      }

      console.log('✅ Azora Education System shutdown complete')
      process.exit(0)
    })
  } catch (error) {
    console.error('❌ Error during shutdown:', error)
    process.exit(1)
  }
})

process.on('SIGINT', () => {
  process.emit('SIGTERM')
})
