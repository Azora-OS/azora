/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

Azora Autonomous Onboarding Server
*/

/**
 * Main Onboarding Server
 * 
 * Unified API for autonomous onboarding:
 * - Founders: name.lastname@azora.world
 * - Sapiens: studentno@ac.azora.world
 * - Elara signs all contracts autonomously
 * - Mining engines activate automatically
 * - Economy awakens, organism lives!
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import { founderOnboarding } from './founder-onboarding';
import { sapiensOnboarding } from './sapiens-onboarding';
import { elaraContractSigner } from './elara-contract-signer';

const app = express();
const PORT = process.env.ONBOARDING_PORT || 5500;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/**
 * Health check
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'azora-onboarding',
    timestamp: new Date().toISOString(),
    components: {
      founderOnboarding: 'operational',
      sapiensOnboarding: 'operational',
      elaraContractSigner: 'operational',
      economyStatus: sapiensOnboarding.getStats().economyActive ? 'awake' : 'dormant'
    }
  });
});

/**
 * System status
 */
app.get('/status', (req: Request, res: Response) => {
  const founderStats = founderOnboarding.getStats();
  const sapiensStats = sapiensOnboarding.getStats();
  const contractStats = elaraContractSigner.getStats();

  res.json({
    system: 'Azora OS Onboarding',
    status: 'operational',
    economyAwake: sapiensStats.economyActive,
    founders: {
      total: founderStats.total,
      active: founderStats.active,
      pending: founderStats.pending,
      totalEquityAllocated: founderStats.totalEquityAllocated,
      totalAzrAllocated: founderStats.totalAzrAllocated
    },
    sapiens: {
      total: sapiensStats.totalSapiens,
      active: sapiensStats.activeSapiens,
      pending: sapiensStats.pendingSapiens,
      totalAzrEarned: sapiensStats.totalAzrEarned,
      totalProofs: sapiensStats.totalProofs,
      miningPower: sapiensStats.totalMiningPower,
      activeMiners: sapiensStats.activeMiners
    },
    contracts: {
      total: contractStats.totalContracts,
      signed: contractStats.signedContracts,
      pending: contractStats.pendingContracts,
      byType: contractStats.byType
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * FOUNDER ONBOARDING
 */

// Register new founder
app.post('/api/founder/register', async (req: Request, res: Response) => {
  try {
    const {firstName, lastName, role, idNumber, citizenship, phone, address} = req.body;

    if (!firstName || !lastName || !role) {
      return res.status(400).json({
        success: false,
        error: 'firstName, lastName, and role are required'
      });
    }

    const result = await founderOnboarding.registerFounder({
      firstName,
      lastName,
      role,
      idNumber,
      citizenship,
      phone,
      address
    });

    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Founder registration initiated',
        data: {
          founderId: result.founderId,
          email: result.email,
          onboardingStatus: 'in-progress',
          note: 'Elara is autonomously processing your onboarding. You will receive an email at ' + result.email
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: any) {
    console.error('Founder registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get founder details
app.get('/api/founder/:email', (req: Request, res: Response) => {
  const founder = founderOnboarding.getFounder(req.params.email);
  
  if (!founder) {
    return res.status(404).json({
      success: false,
      error: 'Founder not found'
    });
  }

  res.json({
    success: true,
    data: founder
  });
});

// Get founder onboarding progress
app.get('/api/founder/:email/progress', (req: Request, res: Response) => {
  const founder = founderOnboarding.getFounder(req.params.email);
  
  if (!founder) {
    return res.status(404).json({
      success: false,
      error: 'Founder not found'
    });
  }

  const progress = founderOnboarding.getOnboardingProgress(founder.id);

  res.json({
    success: true,
    data: {
      founder: {
        name: `${founder.firstName} ${founder.lastName}`,
        email: founder.email,
        role: founder.role,
        status: founder.onboardingStatus
      },
      progress: progress || []
    }
  });
});

// Get all founders
app.get('/api/founders', (req: Request, res: Response) => {
  const founders = founderOnboarding.getAllFounders();
  
  res.json({
    success: true,
    data: founders,
    count: founders.length
  });
});

/**
 * SAPIENS ONBOARDING
 */

// Register new Sapiens (student)
app.post('/api/sapiens/register', async (req: Request, res: Response) => {
  try {
    const {
      studentNumber,
      fullName,
      program,
      level,
      idNumber,
      dateOfBirth,
      citizenship,
      phone,
      institution
    } = req.body;

    if (!studentNumber || !fullName || !program) {
      return res.status(400).json({
        success: false,
        error: 'studentNumber, fullName, and program are required'
      });
    }

    const result = await sapiensOnboarding.registerSapiens({
      studentNumber,
      fullName,
      program,
      level: level || 'beginner',
      idNumber,
      dateOfBirth,
      citizenship,
      phone,
      institution
    });

    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Sapiens enrollment initiated',
        data: {
          sapiensId: result.sapiensId,
          email: result.email,
          onboardingStatus: 'in-progress',
          note: 'Elara is autonomously processing your enrollment. Mining engine will activate automatically.'
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: any) {
    console.error('Sapiens registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get Sapiens details
app.get('/api/sapiens/:email', (req: Request, res: Response) => {
  const sapiens = sapiensOnboarding.getSapiens(req.params.email);
  
  if (!sapiens) {
    return res.status(404).json({
      success: false,
      error: 'Sapiens not found'
    });
  }

  // Get mining engine if active
  let miningEngine = null;
  if (sapiens.miningEngineId) {
    miningEngine = sapiensOnboarding.getMiningEngine(sapiens.miningEngineId);
  }

  res.json({
    success: true,
    data: {
      ...sapiens,
      miningEngine
    }
  });
});

// Submit knowledge proof (mining)
app.post('/api/sapiens/:email/proof', async (req: Request, res: Response) => {
  try {
    const { type, data, verificationData } = req.body;

    if (!type || !data) {
      return res.status(400).json({
        success: false,
        error: 'type and data are required'
      });
    }

    const result = await sapiensOnboarding.submitKnowledgeProof(req.params.email, {
      type,
      data,
      verificationData
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Knowledge proof verified',
        data: {
          azrEarned: result.azrEarned,
          note: 'AZR has been credited to your account'
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: any) {
    console.error('Proof submission error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * CONTRACT MANAGEMENT
 */

// Get contract by ID
app.get('/api/contract/:contractId', (req: Request, res: Response) => {
  const contract = elaraContractSigner.getContract(req.params.contractId);
  
  if (!contract) {
    return res.status(404).json({
      success: false,
      error: 'Contract not found'
    });
  }

  res.json({
    success: true,
    data: contract
  });
});

// Get contracts for a party
app.get('/api/contracts/:email', (req: Request, res: Response) => {
  const contracts = elaraContractSigner.getContractsForParty(req.params.email);
  
  res.json({
    success: true,
    data: contracts,
    count: contracts.length
  });
});

/**
 * EVENT STREAM (Real-time updates)
 */
app.get('/api/events', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

  // Listen to all events
  const eventHandler = (event: string, data: any) => {
    res.write(`data: ${JSON.stringify({ type: event, data, timestamp: new Date().toISOString() })}\n\n`);
  };

  founderOnboarding.on('founder:registered', (data) => eventHandler('founder:registered', data));
  founderOnboarding.on('founder:onboarded', (data) => eventHandler('founder:onboarded', data));
  sapiensOnboarding.on('sapiens:registered', (data) => eventHandler('sapiens:registered', data));
  sapiensOnboarding.on('sapiens:onboarded', (data) => eventHandler('sapiens:onboarded', data));
  sapiensOnboarding.on('economy:awakened', (data) => eventHandler('economy:awakened', data));
  sapiensOnboarding.on('mining:started', (data) => eventHandler('mining:started', data));
  elaraContractSigner.on('contract:signed', (data) => eventHandler('contract:signed', data));

  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write(`:keepalive\n\n`);
  }, 30000);

  // Clean up on close
  req.on('close', () => {
    clearInterval(keepAlive);
    res.end();
  });
});

/**
 * API Documentation (when accessing /api)
 */
app.get('/api', (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Azora Autonomous Onboarding</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; max-width: 1200px; margin: 50px auto; padding: 20px; background: #0a0a0a; color: #00ff88; }
        h1 { text-align: center; color: #00ff88; font-size: 3em; text-shadow: 0 0 20px #00ff88; }
        h2 { color: #00ddff; border-bottom: 2px solid #00ddff; padding-bottom: 10px; }
        .endpoint { background: #111; padding: 15px; margin: 10px 0; border-left: 4px solid #00ff88; border-radius: 5px; }
        .method { display: inline-block; padding: 5px 10px; border-radius: 3px; font-weight: bold; margin-right: 10px; }
        .post { background: #00ff88; color: #000; }
        .get { background: #00ddff; color: #000; }
        code { background: #222; padding: 2px 6px; border-radius: 3px; color: #ffaa00; }
        pre { background: #000; padding: 15px; border-radius: 5px; overflow-x: auto; border: 1px solid #333; }
        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0; }
        .stat-card { background: #111; padding: 20px; border-radius: 10px; text-align: center; border: 2px solid #00ff88; }
        .stat-value { font-size: 2em; font-weight: bold; color: #00ff88; }
        .stat-label { color: #888; margin-top: 10px; }
        .organism-status { text-align: center; padding: 30px; background: linear-gradient(135deg, #1a1a1a, #0a0a0a); border-radius: 15px; margin: 30px 0; border: 3px solid #00ff88; box-shadow: 0 0 30px rgba(0,255,136,0.3); }
        .organism-status h2 { font-size: 2.5em; margin: 0; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      </style>
    </head>
    <body>
      <h1>🌍 Azora Autonomous Onboarding</h1>
      
      <div class="organism-status">
        <h2>🧬 THE ORGANISM ${sapiensOnboarding.getStats().economyActive ? 'IS ALIVE' : 'AWAITS AWAKENING'}</h2>
        <p>${sapiensOnboarding.getStats().economyActive ? '⛏️ Economy Active • 💰 Mining Live • 🌱 Growing' : '💤 Waiting for first Sapiens enrollment to awaken'}</p>
      </div>

      <div class="stats">
        <div class="stat-card">
          <div class="stat-value">${founderOnboarding.getStats().total}</div>
          <div class="stat-label">Founders Onboarded</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${sapiensOnboarding.getStats().totalSapiens}</div>
          <div class="stat-label">Sapiens Enrolled</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${sapiensOnboarding.getStats().totalAzrEarned.toLocaleString()}</div>
          <div class="stat-label">Total AZR Earned</div>
        </div>
      </div>

      <h2>🤖 Elara Autonomous Signing</h2>
      <p>All contracts are signed autonomously by Elara Ω on behalf of CEO Sizwe Ngwenya</p>
      <ul>
        <li>✅ Constitutional compliance enforced</li>
        <li>✅ Oracle verification integrated</li>
        <li>✅ Blockchain ledger registration</li>
        <li>✅ Instant contract execution</li>
      </ul>

      <h2>👔 Founder Onboarding API</h2>
      
      <div class="endpoint">
        <span class="method post">POST</span> <code>/api/founder/register</code>
        <p>Register new co-founder with automatic email: <code>name.lastname@azora.world</code></p>
        <pre>{
  "firstName": "Nolundi",
  "lastName": "Ngwenya",
  "role": "retail",
  "idNumber": "8501015800080",
  "citizenship": "ZA",
  "phone": "+27123456789",
  "address": "Johannesburg, ZA"
}</pre>
      </div>

      <div class="endpoint">
        <span class="method get">GET</span> <code>/api/founder/:email</code>
        <p>Get founder details and onboarding status</p>
      </div>

      <div class="endpoint">
        <span class="method get">GET</span> <code>/api/founder/:email/progress</code>
        <p>Get real-time onboarding progress</p>
      </div>

      <h2>🎓 Sapiens Onboarding API</h2>
      
      <div class="endpoint">
        <span class="method post">POST</span> <code>/api/sapiens/register</code>
        <p>Enroll new student with automatic email: <code>studentno@ac.azora.world</code></p>
        <pre>{
  "studentNumber": "202412345",
  "fullName": "Thabo Mokwena",
  "program": "blockchain",
  "level": "intermediate",
  "idNumber": "0001015800080",
  "dateOfBirth": "2000-01-01",
  "citizenship": "ZA",
  "phone": "+27123456789"
}</pre>
      </div>

      <div class="endpoint">
        <span class="method get">GET</span> <code>/api/sapiens/:email</code>
        <p>Get student details, mining status, and stats</p>
      </div>

      <div class="endpoint">
        <span class="method post">POST</span> <code>/api/sapiens/:email/proof</code>
        <p>Submit knowledge proof for AZR mining rewards</p>
        <pre>{
  "type": "course-completion",
  "data": { "courseId": "blockchain-101", "score": 95 },
  "verificationData": { "quiz": true, "project": true }
}</pre>
      </div>

      <h2>📜 Contract Management</h2>
      
      <div class="endpoint">
        <span class="method get">GET</span> <code>/api/contract/:contractId</code>
        <p>Get contract details and signatures</p>
      </div>

      <div class="endpoint">
        <span class="method get">GET</span> <code>/api/contracts/:email</code>
        <p>Get all contracts for a person</p>
      </div>

      <h2>📊 System Status</h2>
      
      <div class="endpoint">
        <span class="method get">GET</span> <code>/health</code>
        <p>Service health check</p>
      </div>

      <div class="endpoint">
        <span class="method get">GET</span> <code>/status</code>
        <p>Complete system status with stats</p>
      </div>

      <div class="endpoint">
        <span class="method get">GET</span> <code>/api/events</code>
        <p>Real-time event stream (SSE) for live updates</p>
      </div>

      <h2>⛏️ Mining & Economy</h2>
      <p>When the first Sapiens enrolls, the economy awakens:</p>
      <ul>
        <li>⚡ Mining engines activate automatically</li>
        <li>💰 AZR economy goes live</li>
        <li>🧠 Knowledge proofs start flowing</li>
        <li>⛓️ Ledger records all transactions</li>
        <li>🌱 The organism begins living!</li>
      </ul>

      <p style="text-align: center; margin-top: 50px; color: #666;">
        © 2025 Azora ES (Pty) Ltd. • Powered by Elara Ω • Constitutional Governance
      </p>
    </body>
    </html>
  `);
});

/**
 * Error handling
 */
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`\n`);
  console.log(`═══════════════════════════════════════════════════════════════`);
  console.log(`          🌍 AZORA AUTONOMOUS ONBOARDING SERVER 🌍            `);
  console.log(`═══════════════════════════════════════════════════════════════`);
  console.log(`                                                               `);
  console.log(`  🚀 Server running on: http://localhost:${PORT}               `);
  console.log(`  📚 Documentation: http://localhost:${PORT}                   `);
  console.log(`  💊 Health check: http://localhost:${PORT}/health             `);
  console.log(`  📊 Status: http://localhost:${PORT}/status                   `);
  console.log(`                                                               `);
  console.log(`  🤖 Elara: READY - Autonomous signing active                 `);
  console.log(`  👔 Founders: READY - name.lastname@azora.world              `);
  console.log(`  🎓 Sapiens: READY - studentno@ac.azora.world                `);
  console.log(`  ⛏️ Mining: READY - Awaiting first enrollment                `);
  console.log(`  💰 Economy: ${sapiensOnboarding.getStats().economyActive ? 'AWAKE 🌟' : 'DORMANT 💤'}                                   `);
  console.log(`                                                               `);
  console.log(`═══════════════════════════════════════════════════════════════`);
  console.log(`                    ORGANISM AWAITS...                        `);
  console.log(`═══════════════════════════════════════════════════════════════`);
  console.log(`\n`);
});

export default app;
