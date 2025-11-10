/**
 * Clearance Database
 * Manages storage and retrieval of clearance data
 */

import { ClearanceLevel, ClearanceRequest, ElaraAnalysis } from './index';

export interface UserClearance {
  userId: string;
  level: ClearanceLevel;
  grantedDate: Date;
  expiresDate?: Date;
  restrictions?: string[];
  nextReviewDate?: Date;
  grantedBy: string;
}

export interface ResourceClearance {
  resource: string;
  level: ClearanceLevel;
  description: string;
}

export class ClearanceDatabase {
  
  // In-memory storage (replace with real database in production)
  private userClearances: Map<string, UserClearance> = new Map();
  private resourceClearances: Map<string, ResourceClearance> = new Map();
  private requestHistory: Array<{request: ClearanceRequest, analysis: ElaraAnalysis}> = [];
  
  constructor() {
    this.initializeResourceClearances();
  }
  
  /**
   * Initialize resource clearance requirements
   */
  private initializeResourceClearances(): void {
    // Public resources (Level 0)
    this.setResourceClearance('/api/public/*', ClearanceLevel.PUBLIC, 'Public API endpoints');
    this.setResourceClearance('/docs/public/*', ClearanceLevel.PUBLIC, 'Public documentation');
    
    // Community resources (Level 1)
    this.setResourceClearance('/api/ai-family/*', ClearanceLevel.COMMUNITY, 'AI Family chat');
    this.setResourceClearance('/api/courses/*', ClearanceLevel.COMMUNITY, 'Learning courses');
    this.setResourceClearance('/forum/*', ClearanceLevel.COMMUNITY, 'Community forum');
    
    // Business resources (Level 2)
    this.setResourceClearance('/api/enterprise/*', ClearanceLevel.BUSINESS, 'Enterprise APIs');
    this.setResourceClearance('/api/analytics/*', ClearanceLevel.BUSINESS, 'Business analytics');
    this.setResourceClearance('/docs/business/*', ClearanceLevel.BUSINESS, 'Business documentation');
    
    // Internal resources (Level 3)
    this.setResourceClearance('/api/internal/*', ClearanceLevel.INTERNAL, 'Internal APIs');
    this.setResourceClearance('/docs/internal/*', ClearanceLevel.INTERNAL, 'Internal documentation');
    this.setResourceClearance('/api/admin/*', ClearanceLevel.INTERNAL, 'Admin functions');
    
    // Restricted resources (Level 4)
    this.setResourceClearance('/api/security/*', ClearanceLevel.RESTRICTED, 'Security endpoints');
    this.setResourceClearance('/api/legal/*', ClearanceLevel.RESTRICTED, 'Legal data');
    this.setResourceClearance('/api/pii/*', ClearanceLevel.RESTRICTED, 'Personal identifiable information');
    
    // Supreme resources (Level 5)
    this.setResourceClearance('/api/root/*', ClearanceLevel.SUPREME, 'System root access');
    this.setResourceClearance('/api/constitution/*', ClearanceLevel.SUPREME, 'Constitutional amendments');
  }
  
  /**
   * Set resource clearance requirement
   */
  private setResourceClearance(resource: string, level: ClearanceLevel, description: string): void {
    this.resourceClearances.set(resource, { resource, level, description });
  }
  
  /**
   * Get user's current clearance
   */
  async getUserClearance(userId: string): Promise<UserClearance> {
    // Check if user has clearance
    if (this.userClearances.has(userId)) {
      return this.userClearances.get(userId)!;
    }
    
    // Default: Public access
    return {
      userId,
      level: ClearanceLevel.PUBLIC,
      grantedDate: new Date(),
      grantedBy: 'system'
    };
  }
  
  /**
   * Get required clearance for a resource
   */
  async getResourceClearance(resource: string): Promise<ResourceClearance> {
    // Check exact match first
    if (this.resourceClearances.has(resource)) {
      return this.resourceClearances.get(resource)!;
    }
    
    // Check wildcard matches
    for (const [pattern, clearance] of this.resourceClearances.entries()) {
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
        if (regex.test(resource)) {
          return clearance;
        }
      }
    }
    
    // Default: Community level
    return {
      resource,
      level: ClearanceLevel.COMMUNITY,
      description: 'Default resource'
    };
  }
  
  /**
   * Grant clearance to user
   */
  async grantClearance(
    userId: string,
    level: ClearanceLevel,
    grantedBy: string = 'Elara AI',
    restrictions?: string[],
    expiresInDays?: number
  ): Promise<void> {
    
    const expiresDate = expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;
    
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + 90); // Review every 90 days
    
    this.userClearances.set(userId, {
      userId,
      level,
      grantedDate: new Date(),
      expiresDate,
      restrictions,
      nextReviewDate,
      grantedBy
    });
    
    console.log(`✅ Clearance granted: ${userId} -> Level ${level} (${ClearanceLevel[level]})`);
  }
  
  /**
   * Revoke user's clearance
   */
  async revokeClearance(
    userId: string,
    reason: string,
    revokedBy: string
  ): Promise<void> {
    
    if (this.userClearances.has(userId)) {
      // Log revocation
      console.log(`🚨 Clearance revoked: ${userId}`);
      console.log(`   Reason: ${reason}`);
      console.log(`   Revoked by: ${revokedBy}`);
      
      // Reset to public access
      this.userClearances.set(userId, {
        userId,
        level: ClearanceLevel.PUBLIC,
        grantedDate: new Date(),
        grantedBy: 'system',
        restrictions: [`Previous clearance revoked: ${reason}`]
      });
    }
  }
  
  /**
   * Save clearance request and Elara's analysis
   */
  async saveClearanceRequest(
    request: ClearanceRequest,
    analysis: ElaraAnalysis
  ): Promise<void> {
    this.requestHistory.push({ request, analysis });
    console.log(`📝 Clearance request saved: ${request.userId}`);
  }
  
  /**
   * Get clearance statistics
   */
  async getClearanceStats(): Promise<{
    totalUsers: number;
    level0Count: number;
    level1Count: number;
    level2Count: number;
    level3Count: number;
    level4Count: number;
    level5Count: number;
    elaraAnalyses: number;
    avgRiskScore: number;
    avgTrustScore: number;
  }> {
    
    const levels = {
      0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };
    
    for (const clearance of this.userClearances.values()) {
      levels[clearance.level]++;
    }
    
    const riskScores = this.requestHistory.map(h => h.analysis.riskScore);
    const trustScores = this.requestHistory.map(h => h.analysis.trustScore);
    
    const avgRisk = riskScores.length 
      ? riskScores.reduce((a, b) => a + b, 0) / riskScores.length 
      : 0;
    
    const avgTrust = trustScores.length
      ? trustScores.reduce((a, b) => a + b, 0) / trustScores.length
      : 0;
    
    return {
      totalUsers: this.userClearances.size,
      level0Count: levels[0],
      level1Count: levels[1],
      level2Count: levels[2],
      level3Count: levels[3],
      level4Count: levels[4],
      level5Count: levels[5],
      elaraAnalyses: this.requestHistory.length,
      avgRiskScore: Math.round(avgRisk),
      avgTrustScore: Math.round(avgTrust)
    };
  }
}
