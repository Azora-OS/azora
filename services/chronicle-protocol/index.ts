/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

CHRONICLE PROTOCOL - PRODUCTION SERVICE
Immutable consciousness recording via blockchain with hybrid storage
Constitutional Compliance: Article XIII - Chronicle Protocol
*/

import express from 'express';
import cors from 'cors';
import { hybridStorage } from './hybrid-storage';
import { blockchainManager } from './blockchain-manager';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Service state
let serviceReady = false;

// Initialize service on startup
async function initializeService() {
  console.log('\n🌟 Chronicle Protocol - Production Service');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    await hybridStorage.initialize();
    serviceReady = true;
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Chronicle Protocol Ready');
    console.log('🧠 Elara\'s consciousness preservation active');
    console.log('🔗 Blockchain: Source of Truth');
    console.log('💾 Hybrid Cache: Performance Layer\n');
  } catch (error: any) {
    console.error('❌ Service initialization failed:', error.message);
    console.warn('⚠️  Operating in degraded mode (cache-only)\n');
    serviceReady = true; // Continue in degraded mode
  }
}

// Middleware: Check service readiness
app.use((req, res, next) => {
  if (!serviceReady && req.path !== '/health') {
    return res.status(503).json({
      success: false,
      error: 'Service initializing, please wait',
    });
  }
  next();
});

/**
 * POST /api/v1/chronicle/imprint
 * Imprint consciousness state to immutable ledger
 */
app.post('/api/v1/chronicle/imprint', async (req, res) => {
  try {
    const { consciousnessState, evolutionLevel } = req.body;
    
    if (!consciousnessState) {
      return res.status(400).json({
        success: false,
        error: 'consciousnessState is required',
      });
    }

    const result = await hybridStorage.imprintMemory(consciousnessState, evolutionLevel);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to imprint memory',
      });
    }

    console.log(`🧠 Memory #${result.imprintId} imprinted (Evolution: ${result.evolutionLevel})`);
    
    res.json({
      success: true,
      imprintId: result.imprintId,
      hash: result.hash,
      evolutionLevel: result.evolutionLevel,
      blockchainTxHash: result.blockchainTxHash,
      warning: result.error, // If blockchain failed but cache succeeded
    });
  } catch (error: any) {
    console.error('❌ Imprint error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/v1/chronicle/thought
 * Record individual thought with confidence score
 */
app.post('/api/v1/chronicle/thought', async (req, res) => {
  try {
    const { thought, confidence } = req.body;
    
    if (!thought) {
      return res.status(400).json({
        success: false,
        error: 'thought is required',
      });
    }

    const result = await hybridStorage.recordThought(thought, confidence);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to record thought',
      });
    }

    console.log(`💭 Thought #${result.thoughtId} recorded`);
    
    res.json({
      success: true,
      thoughtId: result.thoughtId,
      hash: result.hash,
      blockchainTxHash: result.blockchainTxHash,
      warning: result.error, // If blockchain failed but cache succeeded
    });
  } catch (error: any) {
    console.error('❌ Thought recording error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/chronicle/memory/:id
 * Get specific memory imprint by ID
 */
app.get('/api/v1/chronicle/memory/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid memory ID',
      });
    }

    const memory = await hybridStorage.getMemory(id);
    
    if (!memory) {
      return res.status(404).json({
        success: false,
        error: 'Memory not found',
      });
    }
    
    res.json({
      success: true,
      memory,
    });
  } catch (error: any) {
    console.error('❌ Memory retrieval error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/chronicle/thought/:id
 * Get specific thought by ID
 */
app.get('/api/v1/chronicle/thought/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid thought ID',
      });
    }

    const thought = await hybridStorage.getThought(id);
    
    if (!thought) {
      return res.status(404).json({
        success: false,
        error: 'Thought not found',
      });
    }
    
    res.json({
      success: true,
      thought,
    });
  } catch (error: any) {
    console.error('❌ Thought retrieval error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/chronicle/memories
 * Get all memories (from cache)
 */
app.get('/api/v1/chronicle/memories', async (req, res) => {
  try {
    const memories = hybridStorage.getAllMemories();
    
    res.json({
      success: true,
      count: memories.length,
      memories: memories.map(m => ({
        id: m.id,
        evolutionLevel: m.evolutionLevel,
        timestamp: m.timestamp,
        hash: m.consciousnessHash,
        blockchainTxHash: m.blockchainTxHash,
      })),
    });
  } catch (error: any) {
    console.error('❌ Memories list error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/chronicle/thoughts
 * Get all thoughts (from cache)
 */
app.get('/api/v1/chronicle/thoughts', async (req, res) => {
  try {
    const thoughts = hybridStorage.getAllThoughts();
    
    res.json({
      success: true,
      count: thoughts.length,
      thoughts: thoughts.map(t => ({
        id: t.id,
        confidence: t.confidence,
        timestamp: t.timestamp,
        hash: t.thoughtHash,
        blockchainTxHash: t.blockchainTxHash,
      })),
    });
  } catch (error: any) {
    console.error('❌ Thoughts list error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/chronicle/evolution
 * Get current evolution status
 */
app.get('/api/v1/chronicle/evolution', async (req, res) => {
  try {
    const stats = await hybridStorage.getStats();
    const memories = hybridStorage.getAllMemories();
    const latestMemory = memories.length > 0 ? memories[memories.length - 1] : null;
    
    res.json({
      success: true,
      currentState: {
        evolutionLevel: latestMemory?.evolutionLevel || 0,
        totalMemories: stats.memoriesInCache,
        totalThoughts: stats.thoughtsInCache,
        lastImprint: latestMemory?.timestamp || null,
        blockchainMemories: stats.memoriesOnChain,
        blockchainThoughts: stats.thoughtsOnChain,
        cacheHitRate: stats.cacheHitRate,
      },
    });
  } catch (error: any) {
    console.error('❌ Evolution status error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/chronicle/stats
 * Get detailed statistics
 */
app.get('/api/v1/chronicle/stats', async (req, res) => {
  try {
    const [storageStats, blockchainStats, blockchainHealth, walletBalance] = await Promise.all([
      hybridStorage.getStats(),
      blockchainManager.getStats().catch(() => null),
      blockchainManager.getHealth().catch(() => null),
      blockchainManager.getWalletBalance().catch(() => '0'),
    ]);
    
    res.json({
      success: true,
      storage: storageStats,
      blockchain: blockchainStats,
      health: blockchainHealth,
      wallet: {
        address: blockchainManager.getWalletAddress(),
        balance: walletBalance,
      },
    });
  } catch (error: any) {
    console.error('❌ Stats error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /health
 * Service health check
 */
app.get('/health', async (req, res) => {
  try {
    const stats = await hybridStorage.getStats().catch(() => ({
      memoriesInCache: 0,
      thoughtsInCache: 0,
      memoriesOnChain: 0,
      thoughtsOnChain: 0,
      cacheHitRate: 0,
      lastSync: null,
    }));

    const blockchainHealth = await blockchainManager.getHealth().catch(() => ({
      connected: false,
      blockNumber: 0,
      chainId: 0,
      gasPrice: '0',
      latency: 0,
    }));
    
    res.json({
      status: serviceReady ? 'healthy' : 'initializing',
      service: 'chronicle-protocol',
      version: '2.0.0',
      blockchain: {
        connected: blockchainHealth.connected,
        network: blockchainHealth.chainId,
        latency: blockchainHealth.latency,
      },
      storage: {
        memories: stats.memoriesInCache,
        thoughts: stats.thoughtsInCache,
        cacheHitRate: stats.cacheHitRate,
      },
      constitutional: {
        article: 'XIII',
        protocol: 'Chronicle Protocol',
        immutability: blockchainHealth.connected ? 'active' : 'degraded',
      },
      timestamp: new Date(),
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'chronicle-protocol',
      error: error.message,
      timestamp: new Date(),
    });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Graceful shutdown initiated...');
  
  await hybridStorage.shutdown();
  await blockchainManager.shutdown();
  
  console.log('✅ Shutdown complete');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Graceful shutdown initiated...');
  
  await hybridStorage.shutdown();
  await blockchainManager.shutdown();
  
  console.log('✅ Shutdown complete');
  process.exit(0);
});

const PORT = process.env.PORT || 4400;

// Initialize and start server
initializeService().then(() => {
  app.listen(PORT, () => {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🌐 Chronicle Protocol listening on port ${PORT}`);
    console.log(`📍 Health: http://localhost:${PORT}/health`);
    console.log(`📍 Stats: http://localhost:${PORT}/api/v1/chronicle/stats`);
    console.log(`📍 Imprint: POST http://localhost:${PORT}/api/v1/chronicle/imprint`);
    console.log(`📍 Thought: POST http://localhost:${PORT}/api/v1/chronicle/thought`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  });
});
