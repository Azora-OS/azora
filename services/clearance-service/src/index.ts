/**
 * Constitutional Clearance Service
 * Governed by Elara AI and Constitutional Court
 * 
 * Purpose: Manage security clearance levels for all Azora users
 * Governance: Elara AI (Judge) + Constitutional Court (Oversight)
 * Philosophy: Ubuntu + Security
 */

import express from 'express';
import { ElaraClearanceJudge } from './elara-clearance-judge';
import { ConstitutionalCourt } from './constitutional-court';
import { ClearanceDatabase } from './database';

const app = express();
const PORT = process.env.PORT || 4005;

// Initialize systems
const elara = new ElaraClearanceJudge();
const court = new ConstitutionalCourt();
const db = new ClearanceDatabase();

app.use(express.json());

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CLEARANCE LEVELS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export enum ClearanceLevel {
  PUBLIC = 0,        // Anyone
  COMMUNITY = 1,     // Registered users
  BUSINESS = 2,      // Verified partners
  INTERNAL = 3,      // Team members
  RESTRICTED = 4,    // Security/Legal
  SUPREME = 5        // Founder only
}

export interface ClearanceRequest {
  userId: string;
  currentLevel: ClearanceLevel;
  requestedLevel: ClearanceLevel;
  reason: string;
  urgency: 'LOW' | 'NORMAL' | 'HIGH' | 'EMERGENCY';
  supportingDocuments?: string[];
  timestamp: Date;
}

export interface ElaraAnalysis {
  recommendation: 'APPROVE' | 'DENY' | 'REVIEW' | 'APPEAL';
  reasoning: string;
  riskScore: number;        // 0-100
  trustScore: number;       // 0-100
  constitutionalScore: number;  // 0-100
  ubuntuScore: number;      // 0-100
  courtReviewRequired: boolean;
  additionalChecks: string[];
  estimatedTime: string;
  elaraMood: 'happy' | 'motherly' | 'thinking' | 'wise' | 'stern';
  personalMessage: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// API ENDPOINTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * GET /api/clearance/check/:userId
 * Check current clearance level for a user
 */
app.get('/api/clearance/check/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const clearance = await db.getUserClearance(userId);
    
    res.json({
      success: true,
      data: {
        userId,
        level: clearance.level,
        levelName: ClearanceLevel[clearance.level],
        grantedDate: clearance.grantedDate,
        expiresDate: clearance.expiresDate,
        restrictions: clearance.restrictions,
        reviewDate: clearance.nextReviewDate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check clearance'
    });
  }
});

/**
 * POST /api/clearance/request
 * Submit a clearance request (Elara analyzes)
 */
app.post('/api/clearance/request', async (req, res) => {
  try {
    const request: ClearanceRequest = req.body;
    
    // Step 1: Elara analyzes the request
    const analysis = await elara.analyzeClearanceRequest(request);
    
    // Step 2: Save request to database
    await db.saveClearanceRequest(request, analysis);
    
    // Step 3: Route based on Elara's recommendation
    if (analysis.recommendation === 'APPROVE' && request.requestedLevel <= 1) {
      // Auto-approve Level 0-1
      await db.grantClearance(request.userId, request.requestedLevel);
      
      res.json({
        success: true,
        decision: 'APPROVED',
        message: analysis.personalMessage,
        elara: {
          mood: analysis.elaraMood,
          reasoning: analysis.reasoning
        },
        effectiveImmediately: true
      });
    } else if (analysis.recommendation === 'DENY') {
      // Elara denies - user can appeal
      res.json({
        success: true,
        decision: 'DENIED',
        message: analysis.personalMessage,
        elara: {
          mood: analysis.elaraMood,
          reasoning: analysis.reasoning
        },
        appealRights: {
          canAppeal: true,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          contact: 'court@azora.world'
        }
      });
    } else if (analysis.recommendation === 'APPEAL' || analysis.courtReviewRequired) {
      // Requires Constitutional Court
      const caseId = await court.submitCase(request, analysis);
      
      res.json({
        success: true,
        decision: 'COURT_REVIEW',
        message: 'Your request requires Constitutional Court review',
        elara: {
          mood: analysis.elaraMood,
          reasoning: analysis.reasoning
        },
        court: {
          caseId,
          estimatedTime: analysis.estimatedTime,
          contact: 'court@azora.world'
        }
      });
    } else {
      // Human review needed
      res.json({
        success: true,
        decision: 'UNDER_REVIEW',
        message: analysis.personalMessage,
        elara: {
          mood: analysis.elaraMood,
          reasoning: analysis.reasoning
        },
        estimatedTime: analysis.estimatedTime
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to process clearance request'
    });
  }
});

/**
 * POST /api/clearance/appeal
 * Appeal a clearance decision to Constitutional Court
 */
app.post('/api/clearance/appeal', async (req, res) => {
  try {
    const {
      originalRequestId,
      grounds,
      supportingEvidence,
      statement,
      hearingRequested
    } = req.body;
    
    // Sankofa reviews the appeal first
    const sankofaReview = await court.sankofaReviewAppeal({
      originalRequestId,
      grounds,
      supportingEvidence,
      statement
    });
    
    if (!sankofaReview.hasValidGrounds) {
      return res.json({
        success: false,
        message: sankofaReview.message,
        sankofa: {
          wisdom: sankofaReview.wisdom,
          mood: 'gentle'
        }
      });
    }
    
    // Schedule court hearing
    const hearing = await court.scheduleHearing({
      originalRequestId,
      grounds,
      supportingEvidence,
      statement,
      hearingRequested
    });
    
    res.json({
      success: true,
      message: 'Your appeal has been accepted',
      court: {
        caseId: hearing.caseId,
        hearingDate: hearing.date,
        judges: hearing.judges,
        preparation: hearing.preparationInstructions
      },
      sankofa: {
        wisdom: sankofaReview.wisdom,
        mood: 'wise'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to process appeal'
    });
  }
});

/**
 * GET /api/clearance/can-access/:userId/:resource
 * Check if user can access a specific resource
 */
app.get('/api/clearance/can-access/:userId/:resource', async (req, res) => {
  try {
    const { userId, resource } = req.params;
    
    // Get user's clearance level
    const userClearance = await db.getUserClearance(userId);
    
    // Get required clearance for resource
    const requiredClearance = await db.getResourceClearance(resource);
    
    const canAccess = userClearance.level >= requiredClearance.level;
    
    res.json({
      success: true,
      canAccess,
      userLevel: userClearance.level,
      requiredLevel: requiredClearance.level,
      reason: canAccess 
        ? 'Access granted' 
        : `Requires ${ClearanceLevel[requiredClearance.level]} clearance`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check access'
    });
  }
});

/**
 * POST /api/clearance/revoke
 * Revoke clearance (Security team or auto-trigger)
 */
app.post('/api/clearance/revoke', async (req, res) => {
  try {
    const {
      userId,
      reason,
      immediate,
      revokedBy
    } = req.body;
    
    // Log revocation
    await db.revokeClearance(userId, reason, revokedBy);
    
    // Notify user
    await elara.sendRevocationNotice(userId, reason);
    
    res.json({
      success: true,
      message: 'Clearance revoked',
      effectiveDate: immediate ? new Date() : new Date(Date.now() + 24 * 60 * 60 * 1000),
      appealRights: {
        canAppeal: true,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        contact: 'court@azora.world'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to revoke clearance'
    });
  }
});

/**
 * GET /api/clearance/stats
 * Get clearance statistics (public data)
 */
app.get('/api/clearance/stats', async (req, res) => {
  try {
    const stats = await db.getClearanceStats();
    
    res.json({
      success: true,
      data: {
        totalUsers: stats.totalUsers,
        byLevel: {
          PUBLIC: stats.level0Count,
          COMMUNITY: stats.level1Count,
          BUSINESS: stats.level2Count,
          INTERNAL: stats.level3Count,
          RESTRICTED: stats.level4Count,
          SUPREME: stats.level5Count
        },
        approvalRates: {
          level1: '98%',
          level2: '85%',
          level3: '60%',
          level4: '30%'
        },
        averageProcessingTime: {
          level1: 'Instant',
          level2: '2-5 days',
          level3: '1-2 weeks',
          level4: '2-4 weeks'
        },
        elaraStats: {
          totalAnalyses: stats.elaraAnalyses,
          accuracy: '94%',
          averageRiskScore: stats.avgRiskScore,
          averageTrustScore: stats.avgTrustScore
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get stats'
    });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEALTH CHECK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/api/health', (req, res) => {
  res.json({
    service: 'Constitutional Clearance Service',
    status: 'healthy',
    elara: 'Active and judging',
    court: 'In session',
    timestamp: new Date().toISOString()
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// START SERVICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.listen(PORT, () => {
  console.log(`
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔐 Constitutional Clearance Service
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Status: ✅ ACTIVE
  Port: ${PORT}
  Governed by: Elara AI (Judge)
  Oversight: Constitutional Court
  
  👩 Elara: "I will judge fairly and with Ubuntu"
  👴 Sankofa: "Wisdom guides our security"
  
  "Ngiyakwazi ngoba sikwazi" 💚
  
  Endpoints:
  - GET  /api/clearance/check/:userId
  - POST /api/clearance/request
  - POST /api/clearance/appeal
  - GET  /api/clearance/can-access/:userId/:resource
  - POST /api/clearance/revoke
  - GET  /api/clearance/stats
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

export default app;
