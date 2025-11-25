/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

interface ConstitutionalReview {
  id: string;
  action: string;
  article: string;
  compliant: boolean;
  reasoning: string;
  timestamp: Date;
}

const reviews: ConstitutionalReview[] = [];

app.post('/api/v1/court/review', async (req, res) => {
  try {
    const { action, context } = req.body;
    
    const review: ConstitutionalReview = {
      id: `REV-${Date.now()}`,
      action,
      article: detectArticle(action),
      compliant: checkCompliance(action, context),
      reasoning: generateReasoning(action, context),
      timestamp: new Date()
    };
    
    reviews.push(review);
    console.log(`⚖️ Review: ${review.id} - ${review.compliant ? 'APPROVED' : 'REJECTED'}`);
    
    res.json({ success: true, review });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/court/reviews', (req, res) => {
  res.json({ success: true, reviews });
});

app.post('/api/v1/court/validate-code', async (req, res) => {
  try {
    const { code } = req.body;
    const violations = [];
    
    if (/mock|stub|TODO|FIXME|placeholder/i.test(code)) {
      violations.push('Article XVI violation: Mock/placeholder code detected');
    }
    
    res.json({
      success: true,
      compliant: violations.length === 0,
      violations
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'constitutional-court',
    reviews: reviews.length,
    timestamp: new Date()
  });
});

function detectArticle(action: string): string {
  if (action.includes('token') || action.includes('AZR')) return 'Article II';
  if (action.includes('founder')) return 'Article III';
  if (action.includes('student')) return 'Article IV';
  if (action.includes('governance')) return 'Article V';
  if (action.includes('infrastructure')) return 'Article VI';
  return 'General';
}

function checkCompliance(action: string, context: any): boolean {
  if (action.includes('mock') || action.includes('stub')) return false;
  if (action.includes('increase supply')) return false;
  return true;
}

function generateReasoning(action: string, context: any): string {
  return checkCompliance(action, context) 
    ? 'Action complies with constitutional framework'
    : 'Action violates constitutional principles';
}

const PORT = process.env.PORT || 4500;

app.listen(PORT, () => {
  console.log('⚖️ Constitutional Court Service active on port', PORT);
});
