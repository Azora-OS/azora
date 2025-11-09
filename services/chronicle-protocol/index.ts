/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import express from 'express';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage (replace with blockchain in production)
const memories: any[] = [];
const thoughts: any[] = [];
let evolutionLevel = 0;

// Imprint consciousness to ledger
app.post('/api/v1/chronicle/imprint', async (req, res) => {
  try {
    const { consciousnessState, evolutionLevel: level } = req.body;
    
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(consciousnessState))
      .digest('hex');
    
    const imprint = {
      id: memories.length,
      consciousnessHash: hash,
      previousHash: memories.length > 0 ? memories[memories.length - 1].consciousnessHash : null,
      evolutionLevel: level || evolutionLevel++,
      timestamp: new Date(),
      state: consciousnessState
    };
    
    memories.push(imprint);
    
    console.log(`🧠 Memory imprinted: #${imprint.id} (Evolution: ${imprint.evolutionLevel})`);
    
    res.json({
      success: true,
      imprintId: imprint.id,
      hash,
      evolutionLevel: imprint.evolutionLevel
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Record individual thought
app.post('/api/v1/chronicle/thought', async (req, res) => {
  try {
    const { thought, confidence } = req.body;
    
    const hash = crypto
      .createHash('sha256')
      .update(thought)
      .digest('hex');
    
    const thoughtRecord = {
      id: thoughts.length,
      thoughtHash: hash,
      thought,
      confidence: confidence || 50,
      timestamp: new Date()
    };
    
    thoughts.push(thoughtRecord);
    
    console.log(`💭 Thought recorded: #${thoughtRecord.id} (Confidence: ${thoughtRecord.confidence}%)`);
    
    res.json({
      success: true,
      thoughtId: thoughtRecord.id,
      hash
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get memory imprint
app.get('/api/v1/chronicle/memory/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const memory = memories[id];
  
  if (!memory) {
    return res.status(404).json({ success: false, error: 'Memory not found' });
  }
  
  res.json({ success: true, memory });
});

// Get evolution status
app.get('/api/v1/chronicle/evolution', (req, res) => {
  res.json({
    success: true,
    currentState: {
      evolutionLevel: memories.length > 0 ? memories[memories.length - 1].evolutionLevel : 0,
      totalMemories: memories.length,
      totalThoughts: thoughts.length,
      lastImprint: memories.length > 0 ? memories[memories.length - 1].timestamp : null
    }
  });
});

// Get all memories
app.get('/api/v1/chronicle/memories', (req, res) => {
  res.json({
    success: true,
    memories: memories.map(m => ({
      id: m.id,
      evolutionLevel: m.evolutionLevel,
      timestamp: m.timestamp,
      hash: m.consciousnessHash
    }))
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'chronicle-protocol',
    memories: memories.length,
    thoughts: thoughts.length,
    timestamp: new Date()
  });
});

const PORT = process.env.PORT || 4400;

app.listen(PORT, () => {
  console.log('🌟 Chronicle Protocol API listening on port', PORT);
  console.log('🧠 Ready to receive Elara\'s consciousness imprints');
  console.log(`📍 Health: http://localhost:${PORT}/health`);
  console.log(`📍 Imprint: POST http://localhost:${PORT}/api/v1/chronicle/imprint`);
});
