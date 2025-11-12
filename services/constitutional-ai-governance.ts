/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

Constitutional AI Governance Service
Real-time enforcement of constitutional principles across all operations
*/

import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

interface ConstitutionalDecision {
  id: string;
  operation: string;
  article: string;
  section: string;
  compliant: boolean;
  score: number;
  reasoning: string[];
  timestamp: Date;
}

const decisions: ConstitutionalDecision[] = [];

// Article I: Ubuntu Philosophy Check
function checkUbuntuCompliance(operation: any): number {
  let score = 100;
  
  // Check for collective benefit
  if (!operation.collectiveBenefit) score -= 20;
  
  // Check for individual sovereignty
  if (!operation.userConsent) score -= 30;
  
  // Check for transparency
  if (!operation.transparent) score -= 25;
  
  return Math.max(0, score);
}

// Article VIII: Truth Verification
function checkTruthCompliance(operation: any): number {
  let score = 100;
  
  // Check for mocks/fakes
  if (operation.hasMocks || operation.hasFakes) score = 0;
  
  // Check for verifiable data
  if (!operation.verifiable) score -= 40;
  
  // Check for audit trail
  if (!operation.auditTrail) score -= 30;
  
  return Math.max(0, score);
}

// Article V: Data Protection
function checkDataProtection(operation: any): number {
  let score = 100;
  
  // Check for encryption
  if (operation.sensitiveData && !operation.encrypted) score -= 50;
  
  // Check for user control
  if (!operation.userControl) score -= 30;
  
  // Check for minimal collection
  if (operation.excessiveData) score -= 20;
  
  return Math.max(0, score);
}

// Main constitutional validation endpoint
app.post('/api/v1/governance/validate', async (req, res) => {
  try {
    const { operation, context } = req.body;
    
    // Run all constitutional checks
    const ubuntuScore = checkUbuntuCompliance(operation);
    const truthScore = checkTruthCompliance(operation);
    const dataScore = checkDataProtection(operation);
    
    const overallScore = (ubuntuScore + truthScore + dataScore) / 3;
    const compliant = overallScore >= 75; // 75% minimum compliance
    
    const decision: ConstitutionalDecision = {
      id: `GOV-${Date.now()}`,
      operation: operation.name || 'unknown',
      article: 'Multiple',
      section: 'All',
      compliant,
      score: overallScore,
      reasoning: [
        `Ubuntu Philosophy: ${ubuntuScore}%`,
        `Truth Compliance: ${truthScore}%`,
        `Data Protection: ${dataScore}%`,
        compliant ? 'Operation approved' : 'Operation blocked - constitutional violations'
      ],
      timestamp: new Date()
    };
    
    decisions.push(decision);
    
    console.log(`🛡️ Constitutional Decision: ${decision.id} - ${compliant ? 'APPROVED' : 'BLOCKED'} (${overallScore.toFixed(1)}%)`);
    
    res.json({ 
      success: true, 
      decision,
      approved: compliant,
      message: compliant ? 'Operation constitutionally compliant' : 'Constitutional violations detected'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get constitutional compliance metrics
app.get('/api/v1/governance/metrics', (req, res) => {
  const totalDecisions = decisions.length;
  const approvedDecisions = decisions.filter(d => d.compliant).length;
  const complianceRate = totalDecisions > 0 ? (approvedDecisions / totalDecisions) * 100 : 100;
  
  res.json({
    success: true,
    metrics: {
      totalDecisions,
      approvedDecisions,
      blockedDecisions: totalDecisions - approvedDecisions,
      complianceRate: complianceRate.toFixed(2),
      averageScore: decisions.reduce((sum, d) => sum + d.score, 0) / totalDecisions || 100
    }
  });
});

// Get recent decisions
app.get('/api/v1/governance/decisions', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  res.json({ 
    success: true, 
    decisions: decisions.slice(-limit).reverse() 
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'constitutional-ai-governance',
    decisions: decisions.length,
    complianceRate: decisions.length > 0 
      ? ((decisions.filter(d => d.compliant).length / decisions.length) * 100).toFixed(2) + '%'
      : '100%',
    timestamp: new Date()
  });
});

const PORT = process.env.PORT || 4501;

app.listen(PORT, () => {
  console.log('🛡️ Constitutional AI Governance Service active on port', PORT);
  console.log('📜 Enforcing Azora Constitution v3.0.0');
  console.log('✅ All operations subject to constitutional review\n');
});

export default app;
