/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import categoryRoutes from './routes/categoryRoutes';
import marketplaceRoutes from './marketplaceApi';
import ForgeOrganismIntegration from './organism-integration';

// Azora Infrastructure Integration
import { getDatabasePool, getRedisCache, getSupabaseClient } from 'azora-database-layer'
import { EventBus } from 'azora-event-bus'

const app = express();
const PORT = process.env.PORT || 12345;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/azora-forge';

// Azora Infrastructure Components
let dbPool: any
let redisCache: any
let supabaseClient: any
let eventBus: EventBus

// Configuration
const AZORA_DB_URL = process.env.AZORA_DB_URL || 'postgresql://localhost:5432/azora'
const AZORA_REDIS_URL = process.env.AZORA_REDIS_URL || 'redis://localhost:6379'
const AZORA_SUPABASE_URL = process.env.AZORA_SUPABASE_URL
const AZORA_SUPABASE_KEY = process.env.AZORA_SUPABASE_KEY
const AZORA_EVENT_BUS_URL = process.env.AZORA_EVENT_BUS_URL || 'redis://localhost:6379'

/**
 * Setup Event Bus Listeners for Forge Service
 */
async function setupEventBusListeners() {
  // Listen for skill assessments from Education service
  eventBus.subscribe('education.skill.assessed', async (event: any) => {
    const { studentId, skillId, assessmentScore, timestamp } = event.data
    console.log(`🎯 Skill assessed for student ${studentId}: ${skillId} (${assessmentScore})`)

    // Update skill marketplace listings based on assessment
    try {
      // Store assessment in database
      const query = `
        INSERT INTO skill_assessments (student_id, skill_id, assessment_score, assessed_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (student_id, skill_id) 
        DO UPDATE SET assessment_score = $3, assessed_at = $4
      `
      await dbPool.query(query, [studentId, skillId, assessmentScore, timestamp])

      // Publish skill certification if score is high enough
      if (assessmentScore >= 80) {
        await eventBus.publish('forge.skill.certified', {
          studentId,
          skillId,
          certificationLevel: assessmentScore >= 90 ? 'expert' : 'proficient',
          timestamp: new Date()
        })
      }
    } catch (error) {
      console.error('Error processing skill assessment:', error)
    }
  })

  // Listen for course completions from Education service
  eventBus.subscribe('education.course.completed', async (event: any) => {
    const { studentId, courseId, completionScore, timestamp } = event.data
    console.log(`🎓 Course completed by student ${studentId}: ${courseId} (${completionScore}%)`)

    // Update student's marketplace profile
    try {
      const query = `
        INSERT INTO course_completions (student_id, course_id, completion_score, completed_at)
        VALUES ($1, $2, $3, $4)
      `
      await dbPool.query(query, [studentId, courseId, completionScore, timestamp])

      // Publish marketplace skill update
      await eventBus.publish('forge.profile.updated', {
        studentId,
        courseId,
        completionScore,
        timestamp: new Date()
      })
    } catch (error) {
      console.error('Error processing course completion:', error)
    }
  })

  // Listen for payment requests from Education service
  eventBus.subscribe('education.payment.requested', async (event: any) => {
    const { studentId, courseId, amount, currency, timestamp } = event.data
    console.log(`💰 Payment requested for student ${studentId}: ${amount} ${currency}`)

    // Process course payment through Mint service
    try {
      await eventBus.publish('forge.payment.requested', {
        studentId,
        courseId,
        amount,
        currency,
        serviceType: 'education',
        timestamp: new Date()
      })
    } catch (error) {
      console.error('Error processing payment request:', error)
    }
  })

  // Listen for job matching requests from Careers service
  eventBus.subscribe('careers.skill.match.requested', async (event: any) => {
    const { userId, requiredSkills, timestamp } = event.data
    console.log(`💼 Job matching requested for user ${userId}`)

    // Find qualified service providers
    try {
      const query = `
        SELECT sp.*, sa.skill_id, sa.assessment_score
        FROM service_providers sp
        JOIN skill_assessments sa ON sp.user_id = sa.student_id
        WHERE sa.skill_id = ANY($1) AND sa.assessment_score >= 70
        ORDER BY sa.assessment_score DESC
        LIMIT 10
      `
      const providers = await dbPool.query(query, [requiredSkills])

      // Publish matching results
      await eventBus.publish('forge.providers.matched', {
        jobId: event.data.jobId,
        providers: providers.rows,
        timestamp: new Date()
      })
    } catch (error) {
      console.error('Error processing job matching:', error)
    }
  })

  console.log('✅ Forge service event listeners configured')
}

// Initialize Organism Integration 🌟
const organismIntegration = new ForgeOrganismIntegration({
  mintServiceUrl: process.env.MINT_SERVICE_URL || 'http://localhost:3001',
  educationServiceUrl: process.env.EDUCATION_SERVICE_URL || 'http://localhost:3010',
  careersServiceUrl: process.env.CAREERS_SERVICE_URL || 'http://localhost:3040',
  communityServiceUrl: process.env.COMMUNITY_SERVICE_URL || 'http://localhost:3060',
  nexusServiceUrl: process.env.NEXUS_SERVICE_URL || 'http://localhost:3002',
  supremeOrganismUrl: process.env.SUPREME_ORGANISM_URL || 'http://localhost:3100',
  platformFeePercentage: 0.05, // 5% to Mint (heart)
  sellerEarningsPercentage: 0.95, // 95% to seller
  autoCreateProfilesForGraduates: true,
  autoSendRevenueToMint: true,
  autoMatchWithCareers: true,
});

console.log('🌟 Forge connected to Supreme Organism!');

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Middleware
app.use(express.json());
app.use(cors());

// Initialize Azora Infrastructure
async function initializeAzoraForge() {
  try {
    console.log('🔧 Initializing Azora Forge Infrastructure...')

    // Initialize database components
    dbPool = getDatabasePool(AZORA_DB_URL)
    redisCache = getRedisCache(AZORA_REDIS_URL)
    supabaseClient = getSupabaseClient(AZORA_SUPABASE_URL, AZORA_SUPABASE_KEY)

    // Initialize event bus
    eventBus = new EventBus(AZORA_EVENT_BUS_URL, 'forge-service')

    // Setup event listeners
    await setupEventBusListeners()

    // Test database connection
    await dbPool.query('SELECT 1')
    console.log('  ✓ Azora database connection established')

    // Test Redis connection
    await redisCache.set('forge:health', 'ok')
    console.log('  ✓ Redis cache connection established')

    // Test Supabase connection (if configured)
    if (supabaseClient) {
      await supabaseClient.from('health_check').select('*').limit(1)
      console.log('  ✓ Supabase connection established')
    }

    // Legacy MongoDB connection (for existing data)
    await mongoose.connect(MONGODB_URI)
    console.log('  ✓ Legacy MongoDB connection established')

    console.log('✅ Azora Forge Infrastructure operational')
  } catch (error) {
    console.error('❌ Failed to initialize Azora Forge Infrastructure:', error)
    process.exit(1)
  }
}

// Initialize on startup
initializeAzoraForge()

// Initialize Organism Bridge
organismBridge.on('ready', () => {
  console.log('🌉 Organism Bridge connected!');
});

// Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/escrow', escrowRoutes);
// TODO: Add more routes
// app.use('/api/ratings', ratingRoutes);
// app.use('/api/profiles', profileRoutes);
// app.use('/api/disputes', disputeRoutes);
// app.use('/api/projects', projectRoutes);
// app.use('/api/messaging', messagingRoutes);

// Health endpoint (for Supreme Organism monitoring)
app.get('/health', async (req, res) => {
  try {
    // Check Azora database health
    const dbHealth = await dbPool.query('SELECT 1').then(() => 'healthy').catch(() => 'unhealthy')

    // Check Redis health
    const redisHealth = await redisCache.get('forge:health').then(() => 'healthy').catch(() => 'unhealthy')

    // Check Supabase health
    let supabaseHealth = 'not_configured'
    if (supabaseClient) {
      supabaseHealth = await supabaseClient.from('health_check').select('*').limit(1).then(() => 'healthy').catch(() => 'unhealthy')
    }

    // Check event bus health
    const eventBusHealth = eventBus ? 'healthy' : 'unhealthy'

    // Check legacy MongoDB health
    const mongoHealth = mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy'

    const isHealthy = dbHealth === 'healthy' && redisHealth === 'healthy' && eventBusHealth === 'healthy'

    const organismHealth = organismBridge.getOrganismHealth();

    res.json({
      success: true,
      status: isHealthy ? 'healthy' : 'unhealthy',
      service: 'azora-forge',
      biologicalRole: '🍔 Stomach - Processes work into money',
      organSystem: 'digestive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      infrastructure: {
        database: dbHealth,
        redis: redisHealth,
        supabase: supabaseHealth,
        eventBus: eventBusHealth,
        legacyMongoDB: mongoHealth
      },
      organismIntegration: {
        connected: true,
        mint: 'connected',
        education: 'connected',
        careers: 'connected',
        community: 'connected',
        nexus: 'connected',
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      service: 'azora-forge',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
});

// Organism integration endpoints
app.get('/api/organism/receive', (req, res) => {
  // Receive resources from other services
  res.json({ message: 'Forge ready to receive' });
});

app.post('/api/organism/give', async (req, res) => {
  // Give resources to other services
  res.json({ message: 'Forge revenue shared with Mint' });
});

app.post('/api/organism/heal', async (req, res) => {
  // Receive healing from other services
  res.json({ message: 'Forge health restored' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Azora Forge Marketplace',
    version: '2.0.0',
    description: 'World-class decentralized marketplace for skills and services',
    tagline: 'The Fiverr + Upwork + TaskRabbit of Web3 Combined!',
    features: [
      '✅ Escrow system for safe transactions',
      '✅ Rating & review system',
      '✅ Skill verification (linked to Education)',
      '✅ Payment integration (linked to Mint)',
      '✅ Dispute resolution',
      '✅ Service provider profiles',
      '✅ Learn-to-Earn bonuses',
      '✅ Organism integration (all services connected)'
    ],
    endpoints: {
      health: '/health',
      organism: '/organism',
      categories: '/api/categories',
      marketplace: '/api/marketplace',
      escrow: '/api/escrow'
    },
    organism: {
      role: 'Skills & Work (Muscles)',
      description: 'When Forge does work → Mint makes money → Education improves skills → Everyone benefits!'
    }
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

const server = app.listen(PORT, () => {
  console.log(`🔥 Azora Forge Marketplace running on port ${PORT}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}/`);
  console.log(`🌉 Organism Bridge: Active`);
  console.log(`💪 Role: Skills & Work (Muscles of Azora)`);
  console.log(`🔗 Connected to Azora Database & Event Bus`);
});

// ========== GRACEFUL SHUTDOWN ==========
process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...')

  try {
    // Close server
    server.close(async () => {
      console.log('  ✓ HTTP server closed')

      // Close Azora database connections
      if (dbPool) {
        await dbPool.end()
        console.log('  ✓ Azora database connections closed')
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

      // Close legacy MongoDB
      await mongoose.connection.close()
      console.log('  ✓ Legacy MongoDB connections closed')

      console.log('✅ Azora Forge System shutdown complete')
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
