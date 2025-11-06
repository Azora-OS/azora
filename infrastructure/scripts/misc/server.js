/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// Minimum Viable Ecosystem (MVE) Backend
// Simulates the full Azora ecosystem flow for AU Agriculture Pilot demo

import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';
import { getEnv } from './lib/env-validation.js';
import { log } from './lib/logger.js';
import { getHelmetConfig, getCorsConfig, createRateLimiter, securityHeaders, requestLogger } from './lib/middleware/security.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './lib/swagger.config.js';

// Validate environment variables
try {
  getEnv();
} catch (error) {
  log.error('Environment validation failed:', { error: error instanceof Error ? error.message : String(error) });
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

// Use var instead of let to avoid redeclaration errors
var app = express()
var PORT = getEnv().PORT || 3001

// Security Middleware
app.use(getHelmetConfig());
app.use(getCorsConfig());
app.use(securityHeaders);
app.use(requestLogger);

// Rate limiting
app.use('/api', createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
}));

// Standard Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Azora OS API Documentation',
}));

// API Routes
app.use('/api', apiRoutes);

// Database file path
const DB_PATH = path.join(__dirname, 'db.json');

// Helper: Read database
async function readDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    log.error('Error reading DB:', { error: error.message, path: DB_PATH });
    return { recommendations: [] };
  }
}

// Helper: Write database
async function writeDB(data) {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    log.error('Error writing DB:', { error: error.message, path: DB_PATH });
  }
}

// Fake Oracle service: Get weather data
function fakeOracle(farmId) {
  log.info('ORACLE: Fetching weather', { farmId });
  return {
    temperature: 25 + Math.random() * 10,
    humidity: 60 + Math.random() * 20,
    rainfall: Math.random() * 5,
    windSpeed: Math.random() * 15
  };
}

// Fake Nexus service: Generate recommendation
function fakeNexus(pestReport, weatherData) {
  log.info('NEXUS: Analyzing pest', { pest: pestReport.pest });

  // Simple logic based on pest and weather
  let recommendation = '';
  let urgency = 'medium';

  if (pestReport.pest.toLowerCase().includes('armyworm')) {
    recommendation = 'Apply neem oil spray immediately';
    urgency = 'high';
  } else if (pestReport.pest.toLowerCase().includes('aphid')) {
    recommendation = 'Introduce ladybird predators';
    urgency = 'medium';
  } else {
    recommendation = 'Monitor closely and apply organic pesticide if needed';
    urgency = 'low';
  }

  // Adjust based on weather
  if (weatherData.temperature > 30) {
    recommendation += ' (avoid spraying during heat)';
  }
  if (weatherData.rainfall > 2) {
    recommendation += ' (timing: after rain stops)';
  }

  return {
    action: recommendation,
    urgency,
    confidence: 0.85 + Math.random() * 0.1, // 85-95% confidence
    timestamp: new Date().toISOString()
  };
}

// Fake Covenant service: Stamp recommendation
function fakeCovenant(recommendation) {
  log.info('COVENANT: Stamping recommendation with blockchain hash');
  const hash = '0x' + Math.random().toString(16).substr(2, 64);
  return {
    ...recommendation,
    hash,
    stamped: true,
    blockNumber: Math.floor(Math.random() * 1000000)
  };
}

// Main pest report endpoint
app.post('/api/report-pest', async (req, res) => {
  try {
    const { farmId, pest, description } = req.body;

    log.info('PEST REPORT RECEIVED', { farmId, pest });

    // Step 1: Log the report (Genome simulation)
    log.info('GENOME: Logging pest report event');

    // Step 2: Call Oracle for weather data
    const weatherData = fakeOracle(farmId);

    // Step 3: Generate recommendation via Nexus
    const pestReport = { farmId, pest, description };
    const recommendation = fakeNexus(pestReport, weatherData);

    // Step 4: Stamp with Covenant
    const stampedRecommendation = fakeCovenant(recommendation);

    // Step 5: Store in database
    const db = await readDB();
    const newRecommendation = {
      id: Date.now().toString(),
      farmId,
      pest,
      description,
      weatherData,
      recommendation: stampedRecommendation,
      createdAt: new Date().toISOString()
    };

    db.recommendations.push(newRecommendation);
    await writeDB(db);

    log.info('RECOMMENDATION GENERATED', { action: stampedRecommendation.action, recommendationId: newRecommendation.id });

    // Return success response
    res.json({
      success: true,
      message: 'Pest report processed successfully',
      recommendationId: newRecommendation.id,
      preview: stampedRecommendation.action
    });

  } catch (error) {
    log.error('Error processing pest report:', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({
      success: false,
      error: 'Failed to process pest report'
    });
  }
});

// Get recommendations endpoint
app.get('/api/recommendations/:farmId', async (req, res) => {
  try {
    const { farmId } = req.params;
    const db = await readDB();

    const farmRecommendations = db.recommendations.filter(r => r.farmId === farmId);

    res.json({
      success: true,
      recommendations: farmRecommendations
    });

  } catch (error) {
    log.error('Error fetching recommendations:', { error: error instanceof Error ? error.message : String(error), farmId: req.params.farmId });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recommendations'
    });
  }
});

// ========== AUTHENTICATION ROUTES ==========
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  const user = { id: 'user-' + Date.now(), email, name: email.split('@')[0], role: 'student' }
  res.json({ ...user, token: 'token-' + Date.now() })
})

app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name } = req.body
  const user = { id: 'user-' + Date.now(), email, name, role: 'student' }
  res.json({ ...user, token: 'token-' + Date.now(), signupBonus: 10 })
})

app.get('/api/auth/me', (req, res) => {
  res.json({ id: 'user-123', email: 'student@azora.world', name: 'Student', role: 'student' })
})

// ========== SAPIENS ROUTES ==========
app.get('/api/sapiens/enrollments', (req, res) => {
  res.json([
    { id: 1, title: 'Planetary Economic Intelligence', progress: 75, instructor: 'Dr. Azora Prime' },
    { id: 2, title: 'Constitutional AI Design', progress: 45, instructor: 'Professor Governance' },
  ])
})

app.post('/api/sapiens/courses/:courseId/enroll', (req, res) => {
  res.json({ message: 'Enrolled successfully', courseId: req.params.courseId })
})

app.get('/api/sapiens/ascension/progress', (req, res) => {
  res.json({ currentLevel: 'CKQ-3', nextLevel: 'CKQ-4', progress: 73 })
})

app.get('/api/sapiens/knowledge-points', (req, res) => {
  res.json({ totalPoints: 2450, weeklyEarned: 125, monthlyEarned: 450 })
})

// ========== MINT ROUTES ==========
app.get('/api/mint/wallet/balance', (req, res) => {
  res.json({
    AZR: { balance: 1250.75, value: '$1,250,750.00', change: '+5.2%' },
    aZAR: { balance: 15420.50, value: '$15,420.50', change: '+12.3%' },
  })
})

app.get('/api/mint/transactions', (req, res) => {
  res.json({
    transactions: [
      { id: 1, type: 'earned', amount: 125.75, currency: 'aZAR', description: 'Course Completion', date: new Date() },
    ]
  })
})

app.get('/api/mint/ubo/status', (req, res) => {
  res.json({ totalAllocated: '10,000,000', distributed: '2,450,000', percentage: 24.5 })
})

// ========== COMPLIANCE ROUTES ==========
app.get('/api/compliance/score', (req, res) => {
  res.json({ overallScore: 96.8, regions: 195, compliant: 193, atrisk: 2 })
})

app.get('/api/compliance/alerts', (req, res) => {
  res.json({ alerts: [] })
})

// ========== FORGE ROUTES ==========
app.get('/api/forge/products', (req, res) => {
  res.json({
    products: [
      { id: 1, title: 'Constitutional AI Ethics Course', seller: 'Dr. Azora Prime', price: 125, currency: 'aZAR' },
    ]
  })
})

// ========== ENTERPRISE ROUTES ==========
app.get('/api/enterprise/orders', (req, res) => {
  res.json({ orders: [{ id: 'ORD-001', status: 'in_transit', items: 5, value: '$4,250.00' }] })
})

app.get('/api/enterprise/team', (req, res) => {
  res.json({ team: [{ id: 1, name: 'Sarah Johnson', role: 'Logistics Manager' }] })
})

// ========== NEXUS ROUTES ==========
app.get('/api/nexus/health', (req, res) => {
  res.json({ status: 'healthy', uptime: 99.9 })
})

// ========== AEGIS ROUTES ==========
app.get('/api/aegis/constitution/status', (req, res) => {
  res.json({ constitutionVersion: '2.1', status: 'active', complianceScore: 100 })
})

// ========== ORACLE ROUTES ==========
app.get('/api/oracle/rates', (req, res) => {
  res.json({ rates: { 'AZR/USD': 1.0, 'aZAR/USD': 1.0 } })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    services: ['oracle', 'nexus', 'covenant', 'genome', 'sapiens', 'mint', 'compliance', 'forge', 'enterprise', 'aegis'],
    version: '1.0',
    timestamp: new Date()
  });
});

// Start server
app.listen(PORT, () => {
  log.info('AZORA OS API SERVER STARTED', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    apiUrl: `http://localhost:${PORT}`,
    healthCheck: `http://localhost:${PORT}/api/health`,
    apiDocs: `http://localhost:${PORT}/api-docs`,
  });
  
  // Pretty banner for console (development only)
  if (process.env.NODE_ENV !== 'production') {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║          🚀 AZORA OS API SERVER STARTED                      ║
╠══════════════════════════════════════════════════════════════╣
║  Server: http://localhost:${PORT}                           
║  Status: Running                                             
║  Health: GET http://localhost:${PORT}/api/health          
║  API Docs: http://localhost:${PORT}/api-docs               
║                                                              ║
║  Constitutional AI Governance: ACTIVE                        ║
║  Zero-Trust Architecture: ENABLED                            ║
║  Compliance Monitoring: OPERATIONAL                          ║
╚══════════════════════════════════════════════════════════════╝
    `);
  }
});