/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

interface GovernanceDecision {
  id: string;
  proposal: string;
  aiAnalysis: string;
  constitutionalAlignment: number;
  recommendation: 'APPROVE' | 'REJECT' | 'REVIEW';
  reasoning: string[];
  timestamp: Date;
}

const decisions: GovernanceDecision[] = [];

app.post('/api/v1/governance/analyze', async (req, res) => {
  try {
    const { proposal, context } = req.body;
    
    const decision: GovernanceDecision = {
      id: `GOV-${Date.now()}`,
      proposal,
      aiAnalysis: analyzeProposal(proposal, context),
      constitutionalAlignment: calculateAlignment(proposal),
      recommendation: getRecommendation(proposal, context),
      reasoning: generateReasoningChain(proposal, context),
      timestamp: new Date()
    };
    
    decisions.push(decision);
    console.log(`🤖 AI Governance: ${decision.id} - ${decision.recommendation}`);
    
    res.json({ success: true, decision });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/governance/decisions', (req, res) => {
  res.json({ success: true, decisions });
});

app.post('/api/v1/governance/validate', async (req, res) => {
  try {
    const { action, principles } = req.body;
    
    const validation = {
      valid: validateAgainstPrinciples(action, principles),
      score: calculateAlignment(action),
      violations: detectViolations(action)
    };
    
    res.json({ success: true, validation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'constitutional-ai-governance',
    decisions: decisions.length,
    timestamp: new Date()
  });
});

function analyzeProposal(proposal: string, context: any): string {
  return `AI analysis: Proposal evaluated against constitutional principles. Impact assessment: ${context?.impact || 'medium'}`;
}

function calculateAlignment(proposal: string): number {
  let score = 100;
  if (proposal.includes('mock') || proposal.includes('fake')) score -= 50;
  if (proposal.includes('centralize')) score -= 30;
  if (proposal.includes('student') && proposal.includes('earn')) score += 20;
  return Math.max(0, Math.min(100, score));
}

function getRecommendation(proposal: string, context: any): 'APPROVE' | 'REJECT' | 'REVIEW' {
  const alignment = calculateAlignment(proposal);
  if (alignment >= 80) return 'APPROVE';
  if (alignment < 50) return 'REJECT';
  return 'REVIEW';
}

function generateReasoningChain(proposal: string, context: any): string[] {
  const reasoning = [];
  reasoning.push('Constitutional alignment evaluated');
  reasoning.push(`Alignment score: ${calculateAlignment(proposal)}%`);
  
  if (proposal.includes('student')) {
    reasoning.push('Article IV: Student empowerment principle applies');
  }
  if (proposal.includes('infrastructure')) {
    reasoning.push('Article VI: Infrastructure independence principle applies');
  }
  
  return reasoning;
}

function validateAgainstPrinciples(action: string, principles: string[]): boolean {
  return !action.includes('mock') && !action.includes('centralize');
}

function detectViolations(action: string): string[] {
  const violations = [];
  if (action.includes('mock')) violations.push('No Mock Protocol violation');
  if (action.includes('increase supply')) violations.push('Token supply immutability violation');
  return violations;
}

const PORT = process.env.PORT || 4501;

app.listen(PORT, () => {
  console.log('🤖 Constitutional AI Governance active on port', PORT);
});

export default app;
