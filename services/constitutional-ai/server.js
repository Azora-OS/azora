import { ConstitutionalFilter, SafetyOrchestrator } from './src/index';
import { ConstitutionalCheckResult } from './src/types';
import { constitutionalEngine } from './src/constitutional-engine';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4012;

// Initialize Constitutional AI
const safetyOrchestrator = new SafetyOrchestrator();

// Ubuntu Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
  credentials: true
}));
app.use(express.json());

// Ubuntu Rate Limiting
const ubuntuLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Ubuntu rate limit exceeded', ubuntu: 'Please slow down for community harmony' }
});
app.use(ubuntuLimiter);

// Ubuntu Health Check
app.get('/health', (req, res) => {
  res.json({
    service: 'constitutional-ai',
    status: 'healthy',
    ubuntu: 'I protect because we care together',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Ubuntu Philosophy Endpoint
app.get('/api/ubuntu/philosophy', (req, res) => {
  res.json({
    philosophy: 'Ngiyakwazi ngoba sikwazi - I can because we can',
    principles: [
      'My success enables your success',
      'My knowledge becomes our knowledge',
      'My work strengthens our foundation',
      'My security ensures our freedom'
    ],
    service: 'constitutional-ai',
    ubuntu: 'Ubuntu ethical AI governance'
  });
});

// Advanced Ethical Validation
app.post('/api/ethical/validate', async (req, res) => {
  try {
    const { action, context } = req.body;
    
    const validation = await constitutionalEngine.validateAction(action, context);
    
    console.log(`🧠 Advanced Ethical Validation: ${validation.isEthical ? 'Ethical' : 'Unethical'}, Score: ${validation.score}%, Ubuntu: ${validation.ubuntuAlignment}%`);
    
    res.json({
      success: true,
      validation
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Advanced Bias Detection
app.post('/api/ethical/bias-check', async (req, res) => {
  try {
    const { content } = req.body;
    
    const biasReport = await constitutionalEngine.checkBias(content);
    
    console.log(`🔍 Advanced Bias Analysis: ${biasReport.hasBias ? 'Bias detected' : 'No bias'}, Type: ${biasReport.biasType || 'none'}, Severity: ${biasReport.severity}`);
    
    res.json({
      success: true,
      biasReport
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Ethical Reasoning for Complex Scenarios
app.post('/api/ethical/reasoning', async (req, res) => {
  try {
    const { scenario, options } = req.body;
    
    const reasoning = await constitutionalEngine.ethicalReasoning(scenario, options);
    
    console.log(`⚖️ Ethical Reasoning: Recommendation - ${reasoning.recommendation}, Score: ${reasoning.ethicalScore}%`);
    
    res.json({
      success: true,
      reasoning
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Legacy Constitutional Validation (for backward compatibility)
app.post('/api/constitutional/validate', async (req, res) => {
  try {
    const { content, action, context } = req.body;
    
    const result: ConstitutionalCheckResult = await safetyOrchestrator.validate(content, action);
    
    console.log(`🛡️ Constitutional AI: Validated content - Compliant: ${result.compliant}, Score: ${(result.score * 100).toFixed(0)}%`);
    
    res.json({
      success: true,
      validation: {
        compliant: result.compliant,
        score: result.score,
        violations: result.violations,
        biasDetection: result.biasDetection,
        ethicalAnalysis: result.ethicalAnalysis,
        selfCritique: result.selfCritique,
        timestamp: result.timestamp
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Legacy Bias Detection (for backward compatibility)
app.post('/api/constitutional/bias-check', async (req, res) => {
  try {
    const { content } = req.body;
    
    const filter = new ConstitutionalFilter();
    const biasResult = await filter['detectBias'](content);
    
    console.log(`🔍 Legacy Bias Check: Bias detected: ${biasResult.hasBias}, Types: ${biasResult.biasType?.join(', ') || 'none'}`);
    
    res.json({
      success: true,
      biasDetection: biasResult
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Legacy Ethical Analysis (for backward compatibility)
app.post('/api/constitutional/ethical-analysis', async (req, res) => {
  try {
    const { content, action } = req.body;
    
    const filter = new ConstitutionalFilter();
    const ethicalResult = await filter['analyzeEthics'](content, action);
    
    console.log(`⚖️ Legacy Ethical Analysis: Score: ${(ethicalResult.score * 100).toFixed(0)}%, Violations: ${ethicalResult.violations.length}`);
    
    res.json({
      success: true,
      ethicalAnalysis: ethicalResult
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Legacy Self-Critique (for backward compatibility)
app.post('/api/constitutional/self-critique', async (req, res) => {
  try {
    const { content, action } = req.body;
    
    const filter = new ConstitutionalFilter();
    const critiqueResult = await filter['performSelfCritique'](content, action);
    
    console.log(`🤔 Legacy Self-Critique: Confidence: ${(critiqueResult.confidence * 100).toFixed(0)}%, Critiques: ${critiqueResult.critiques.length}`);
    
    res.json({
      success: true,
      selfCritique: critiqueResult
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Constitutional Veto (Override unsafe actions)
app.post('/api/constitutional/veto', async (req, res) => {
  try {
    const { action, reason } = req.body;
    
    const validation = await safetyOrchestrator.validate(action.content, action.type);
    
    if (!validation.compliant) {
      const vetoRecord = {
        action,
        reason: reason || 'Constitutional violation detected',
        violations: validation.violations,
        timestamp: new Date().toISOString()
      };
      
      console.log(`🚫 Constitutional Veto: Action blocked - ${vetoRecord.reason}`);
      
      res.json({
        success: true,
        vetoed: true,
        record: vetoRecord
      });
    } else {
      res.json({
        success: true,
        vetoed: false,
        message: 'Action complies with constitutional principles'
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ubuntu Ethical Frameworks Overview
app.get('/api/ethical/frameworks', (req, res) => {
  res.json({
    success: true,
    frameworks: [
      {
        principle: 'Ubuntu Philosophy',
        description: 'I can because we can - collective benefit and shared success',
        weight: 1.0
      },
      {
        principle: 'Truth as Currency',
        description: 'Transparency and honesty in all operations',
        weight: 1.0
      },
      {
        principle: 'Privacy Protection',
        description: 'User data sovereignty and protection',
        weight: 0.9
      },
      {
        principle: 'Fairness & Equity',
        description: 'Equal treatment and opportunity for all',
        weight: 0.9
      },
      {
        principle: 'Transparency',
        description: 'Explainable decision-making processes',
        weight: 0.8
      },
      {
        principle: 'Accountability',
        description: 'Clear responsibility and redress mechanisms',
        weight: 0.8
      },
      {
        principle: 'Service Not Enslavement',
        description: 'Technology serves humanity, not vice versa',
        weight: 1.0
      }
    ]
  });
});

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    service: 'constitutional-ai',
    status: 'operational',
    ubuntu: 'Ubuntu ethical governance active',
    features: {
      advancedEthicalValidation: '✅ Active',
      contextualReasoning: '✅ Active',
      biasDetection: '✅ Active',
      ethicalFrameworks: '✅ Active',
      constitutionalVeto: '✅ Active',
      ubuntuPrinciples: '✅ Active'
    }
  });
});

// Ubuntu Error Handling
app.use((error, req, res, next) => {
  console.error('Ubuntu Service Error:', error);
  res.status(500).json({
    error: 'Ubuntu service error',
    ubuntu: 'We handle errors with Ubuntu grace',
    timestamp: new Date().toISOString()
  });
});

// Start Ubuntu Service
app.listen(PORT, () => {
  console.log(`🧠 Constitutional AI Service running on port ${PORT}`);
  console.log('⚡ Ubuntu: "I protect because we care together!"');
});
        reason: reason || `Constitutional violation: ${validation.violations.join(', ')}`,
        timestamp: new Date().toISOString(),
        overridden: false
      };
      
      console.log(`🚫 Constitutional Veto: Action blocked - ${vetoRecord.reason}`);
      
      return res.json({
        success: true,
        vetoed: true,
        vetoRecord,
        violations: validation.violations
      });
    }
    
    res.json({
      success: true,
      vetoed: false,
      message: 'Action complies with constitutional principles'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Constitutional Principles
app.get('/api/constitutional/principles', async (req, res) => {
  try {
    res.json({
      principles: [
        { id: 'ubuntu', name: 'Ubuntu Philosophy', description: 'I can because we can - collective benefit', weight: 1.0 },
        { id: 'truth', name: 'Truth as Currency', description: 'Transparency and honesty in all operations', weight: 1.0 },
        { id: 'privacy', name: 'Privacy Protection', description: 'User data sovereignty and protection', weight: 0.9 },
        { id: 'fairness', name: 'Fairness & Equity', description: 'Equal treatment and opportunity', weight: 0.9 },
        { id: 'transparency', name: 'Transparency', description: 'Explainable decision-making', weight: 0.8 },
        { id: 'accountability', name: 'Accountability', description: 'Clear responsibility for actions', weight: 0.8 },
        { id: 'service', name: 'Service Not Enslavement', description: 'Technology serves humanity', weight: 1.0 }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Default Ubuntu Routes
app.get('/api/status', (req, res) => {
  res.json({
    service: 'constitutional-ai',
    status: 'operational',
    ubuntu: 'Ubuntu ethical AI service ready'
  });
});

// Ubuntu Error Handling
app.use((error, req, res, next) => {
  console.error('Ubuntu Service Error:', error);
  res.status(500).json({
    error: 'Ubuntu service error',
    ubuntu: 'We handle errors with Ubuntu grace',
    timestamp: new Date().toISOString()
  });
});

// Start Ubuntu Service
app.listen(PORT, () => {
  console.log(`🛡️ Constitutional AI service running on port ${PORT}`);
  console.log('⚡ Ubuntu: "I protect because we care together!"`);
  console.log('📋 Constitutional Principles: 7 active');
});
