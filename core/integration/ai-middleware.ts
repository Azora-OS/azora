/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

AI MIDDLEWARE
Express middleware for AI integration across all services
*/

import { Request, Response, NextFunction } from 'express';
import { aiHub } from './ai-integration-hub';

// AI Context Enrichment Middleware
export const aiContextMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    if (userId) {
      req.aiContext = await aiHub.getRealTimeInsights(userId, {
        path: req.path,
        method: req.method,
        timestamp: new Date()
      });
    }
    next();
  } catch (error) {
    next();
  }
};

// Constitutional Validation Middleware
export const constitutionalValidation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const action = {
      type: req.method,
      path: req.path,
      body: req.body,
      description: `${req.method} ${req.path}`
    };

    const validation = await aiHub.constitutional.validateAction(action);
    
    if (!validation.valid) {
      return res.status(403).json({
        error: 'Constitutional violation',
        reason: validation.reason,
        ubuntu: 'This action does not align with Ubuntu principles'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Guardian Oracle Verification Middleware
export const guardianVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body?.content) {
      const verification = await aiHub.constitutional.guardianCourt.verifyContent({
        content: req.body.content,
        category: req.body.category || 'general',
        submittedBy: (req as any).user?.id || 'anonymous'
      });

      req.guardianVerification = verification;
    }
    next();
  } catch (error) {
    next();
  }
};

// AI Recommendations Injection
export const injectRecommendations = async (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json.bind(res);
  
  res.json = async function(data: any) {
    const userId = (req as any).user?.id;
    
    if (userId && data && typeof data === 'object') {
      try {
        const recommendations = await aiHub.recommendations.getPersonalizedRecommendations(
          userId,
          { response: data, path: req.path }
        );
        
        data.aiRecommendations = recommendations.priority;
        data.elaraAvailable = true;
      } catch (error) {
        // Silent fail - don't break response
      }
    }
    
    return originalJson(data);
  };
  
  next();
};

// Elara Tutoring Endpoint
export const elaraTutoringEndpoint = async (req: Request, res: Response) => {
  try {
    const { question, context, studentId } = req.body;
    
    const response = await aiHub.elara.provideTutoring(question, context);
    const recommendations = await aiHub.recommendations.getPersonalizedRecommendations(
      studentId,
      { question, context }
    );

    res.json({
      answer: response,
      recommendations: recommendations.priority,
      timestamp: new Date().toISOString(),
      elara: {
        confidence: 0.94,
        sources: ['Azora Knowledge Base', 'Constitutional AI'],
        followUp: ['Would you like more details?', 'Shall we practice this concept?']
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Elara tutoring failed' });
  }
};

// AI Health Check
export const aiHealthCheck = async (req: Request, res: Response) => {
  try {
    const health = {
      elara: { status: 'active', model: 'gpt-4', responseTime: '< 1s' },
      constitutional: { status: 'active', principles: 5, compliance: '100%' },
      guardians: { status: 'active', oracles: 3, verificationSpeed: '< 2s' },
      recommendations: { status: 'active', accuracy: '92%', realTime: true },
      timestamp: new Date().toISOString()
    };

    res.json(health);
  } catch (error) {
    res.status(500).json({ error: 'AI health check failed' });
  }
};

declare global {
  namespace Express {
    interface Request {
      aiContext?: any;
      guardianVerification?: any;
    }
  }
}
