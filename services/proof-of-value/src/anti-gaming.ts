/**
 * Anti-Gaming System for Proof-of-Value Mining
 * Ubuntu Philosophy: "My security ensures our freedom"
 */

import { getLogger } from '../../../shared/monitoring/logger';
import { metrics } from '../../../shared/monitoring/metrics';

export interface AntiGamingConfig {
  rateLimits: {
    perUser: number; // max proofs per hour per user
    perIP: number; // max proofs per hour per IP
    global: number; // max proofs per hour globally
  };
  duplicateThreshold: number; // similarity threshold for duplicate detection
  minProofValue: number; // minimum proof value to be considered
  maxProofValue: number; // maximum proof value to prevent inflation
  suspiciousPatterns: string[];
}

export interface GamingDetectionResult {
  isGaming: boolean;
  reasons: string[];
  confidence: number;
  action: 'allow' | 'rate_limit' | 'reject' | 'flag';
  metadata: {
    rateLimitStatus: any;
    duplicateStatus: any;
    patternStatus: any;
    valueStatus: any;
  };
}

export class AntiGamingSystem {
  private logger = getLogger('anti-gaming');
  private config: AntiGamingConfig;
  private userProofCounts: Map<string, { count: number; lastReset: Date }> = new Map();
  private ipProofCounts: Map<string, { count: number; lastReset: Date }> = new Map();
  private globalProofCount: { count: number; lastReset: Date } = { count: 0, lastReset: new Date() };
  private recentProofs: Map<string, Array<{ content: string; timestamp: Date; userId: string }>> = new Map();

  constructor(config: AntiGamingConfig) {
    this.config = config;
    this.startPeriodicReset();
  }

  async checkProof(
    userId: string,
    ipAddress: string,
    proofContent: string,
    proofValue: number,
    additionalData?: any
  ): Promise<GamingDetectionResult> {
    const reasons: string[] = [];
    let isGaming = false;
    let maxConfidence = 0;
    let action: GamingDetectionResult['action'] = 'allow';

    const metadata = {
      rateLimitStatus: await this.checkRateLimits(userId, ipAddress),
      duplicateStatus: await this.checkDuplicates(userId, proofContent),
      patternStatus: await this.checkSuspiciousPatterns(proofContent, additionalData),
      valueStatus: await this.checkProofValue(proofValue, userId)
    };

    // Check rate limits
    if (metadata.rateLimitStatus.exceeded) {
      isGaming = true;
      reasons.push(...metadata.rateLimitStatus.reasons);
      maxConfidence = Math.max(maxConfidence, metadata.rateLimitStatus.confidence);
      action = 'rate_limit';
    }

    // Check for duplicates
    if (metadata.duplicateStatus.isDuplicate) {
      isGaming = true;
      reasons.push(...metadata.duplicateStatus.reasons);
      maxConfidence = Math.max(maxConfidence, metadata.duplicateStatus.confidence);
      action = action === 'rate_limit' ? 'reject' : 'flag';
    }

    // Check suspicious patterns
    if (metadata.patternStatus.isSuspicious) {
      isGaming = true;
      reasons.push(...metadata.patternStatus.reasons);
      maxConfidence = Math.max(maxConfidence, metadata.patternStatus.confidence);
      action = action === 'reject' ? 'reject' : 'flag';
    }

    // Check proof value anomalies
    if (metadata.valueStatus.isAnomalous) {
      isGaming = true;
      reasons.push(...metadata.valueStatus.reasons);
      maxConfidence = Math.max(maxConfidence, metadata.valueStatus.confidence);
      action = 'flag';
    }

    const result: GamingDetectionResult = {
      isGaming,
      reasons,
      confidence: maxConfidence,
      action,
      metadata
    };

    // Log gaming attempts
    if (isGaming) {
      this.logger.warn('Gaming behavior detected', {
        userId,
        ipAddress,
        action,
        reasons,
        confidence: maxConfidence
      });

      metrics.incrementCounter('gaming_attempts_detected_total', 1, {
        action,
        primaryReason: reasons[0] || 'unknown'
      });
    }

    return result;
  }

  private async checkRateLimits(userId: string, ipAddress: string): Promise<any> {
    const now = new Date();
    const reasons: string[] = [];
    let exceeded = false;
    let confidence = 0;

    // Check user rate limit
    const userCount = this.userProofCounts.get(userId);
    if (userCount && this.shouldReset(userCount.lastReset, now)) {
      this.userProofCounts.set(userId, { count: 0, lastReset: now });
    }

    const currentUserCount = this.userProofCounts.get(userId)?.count || 0;
    if (currentUserCount >= this.config.rateLimits.perUser) {
      exceeded = true;
      reasons.push(`User rate limit exceeded: ${currentUserCount}/${this.config.rateLimits.perUser}`);
      confidence = Math.max(confidence, 0.8);
    }

    // Check IP rate limit
    const ipCount = this.ipProofCounts.get(ipAddress);
    if (ipCount && this.shouldReset(ipCount.lastReset, now)) {
      this.ipProofCounts.set(ipAddress, { count: 0, lastReset: now });
    }

    const currentIpCount = this.ipProofCounts.get(ipAddress)?.count || 0;
    if (currentIpCount >= this.config.rateLimits.perIP) {
      exceeded = true;
      reasons.push(`IP rate limit exceeded: ${currentIpCount}/${this.config.rateLimits.perIP}`);
      confidence = Math.max(confidence, 0.7);
    }

    // Check global rate limit
    if (this.shouldReset(this.globalProofCount.lastReset, now)) {
      this.globalProofCount = { count: 0, lastReset: now };
    }

    if (this.globalProofCount.count >= this.config.rateLimits.global) {
      exceeded = true;
      reasons.push(`Global rate limit exceeded: ${this.globalProofCount.count}/${this.config.rateLimits.global}`);
      confidence = Math.max(confidence, 0.6);
    }

    return { exceeded, reasons, confidence };
  }

  private async checkDuplicates(userId: string, proofContent: string): Promise<any> {
    const userProofs = this.recentProofs.get(userId) || [];
    const normalizedContent = this.normalizeContent(proofContent);
    
    const duplicates = userProofs.filter(proof => {
      const similarity = this.calculateSimilarity(normalizedContent, this.normalizeContent(proof.content));
      return similarity >= this.config.duplicateThreshold;
    });

    const isDuplicate = duplicates.length > 0;
    const confidence = isDuplicate ? duplicates.length / userProofs.length : 0;

    return {
      isDuplicate,
      reasons: isDuplicate ? [`Found ${duplicates.length} similar recent proofs`] : [],
      confidence,
      similarProofs: duplicates.map(d => ({ timestamp: d.timestamp }))
    };
  }

  private async checkSuspiciousPatterns(content: string, additionalData?: any): Promise<any> {
    const suspiciousPatterns = this.config.suspiciousPatterns;
    const matchedPatterns: string[] = [];
    let confidence = 0;

    for (const pattern of suspiciousPatterns) {
      if (content.toLowerCase().includes(pattern.toLowerCase())) {
        matchedPatterns.push(pattern);
        confidence += 0.2;
      }
    }

    // Check for automated submission patterns
    const autoPatterns = [
      /^.{100,}$/, // Very long uniform content
      /(.)\1{10,}/, // Repeated characters
      /^[A-Z\s]+$/, // All caps
      /^\d+$/, // Only numbers
    ];

    for (const pattern of autoPatterns) {
      if (pattern.test(content)) {
        matchedPatterns.push('Automated pattern detected');
        confidence += 0.3;
      }
    }

    // Check timing patterns (rapid submissions)
    const userProofs = this.recentProofs.get(additionalData?.userId || '') || [];
    const recentProofs = userProofs.filter(proof => 
      (Date.now() - proof.timestamp.getTime()) < 60000 // Last minute
    );

    if (recentProofs.length > 5) {
      matchedPatterns.push('Rapid submission pattern');
      confidence += 0.4;
    }

    const isSuspicious = matchedPatterns.length > 0;
    confidence = Math.min(confidence, 0.9);

    return {
      isSuspicious,
      reasons: matchedPatterns,
      confidence
    };
  }

  private async checkProofValue(proofValue: number, userId: string): Promise<any> {
    const reasons: string[] = [];
    let isAnomalous = false;
    let confidence = 0;

    if (proofValue < this.config.minProofValue) {
      isAnomalous = true;
      reasons.push(`Proof value below minimum: ${proofValue} < ${this.config.minProofValue}`);
      confidence = 0.6;
    }

    if (proofValue > this.config.maxProofValue) {
      isAnomalous = true;
      reasons.push(`Proof value above maximum: ${proofValue} > ${this.config.maxProofValue}`);
      confidence = 0.8;
    }

    // Check for unusual value patterns
    const userProofs = this.recentProofs.get(userId) || [];
    if (userProofs.length > 0) {
      const userValues = userProofs.map(p => p.content).map(c => this.extractValue(c));
      const avgValue = userValues.reduce((sum, val) => sum + val, 0) / userValues.length;
      const deviation = Math.abs(proofValue - avgValue) / avgValue;

      if (deviation > 2.0) { // More than 200% deviation from user average
        isAnomalous = true;
        reasons.push(`Unusual value deviation: ${(deviation * 100).toFixed(0)}% from user average`);
        confidence = Math.max(confidence, 0.7);
      }
    }

    return {
      isAnomalous,
      reasons,
      confidence
    };
  }

  private normalizeContent(content: string): string {
    return content
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .trim();
  }

  private calculateSimilarity(content1: string, content2: string): number {
    const longer = content1.length > content2.length ? content1 : content2;
    const shorter = content1.length > content2.length ? content2 : content1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private extractValue(content: string): number {
    // Extract numeric value from proof content
    const match = content.match(/value[:\s]+(\d+(?:\.\d+)?)/i);
    return match ? parseFloat(match[1]) : 0;
  }

  private shouldReset(lastReset: Date, now: Date): boolean {
    return (now.getTime() - lastReset.getTime()) >= 3600000; // 1 hour
  }

  private startPeriodicReset(): void {
    setInterval(() => {
      const now = new Date();
      
      // Reset user counts
      for (const [userId, data] of this.userProofCounts.entries()) {
        if (this.shouldReset(data.lastReset, now)) {
          this.userProofCounts.set(userId, { count: 0, lastReset: now });
        }
      }

      // Reset IP counts
      for (const [ip, data] of this.ipProofCounts.entries()) {
        if (this.shouldReset(data.lastReset, now)) {
          this.ipProofCounts.set(ip, { count: 0, lastReset: now });
        }
      }

      // Reset global count
      if (this.shouldReset(this.globalProofCount.lastReset, now)) {
        this.globalProofCount = { count: 0, lastReset: now };
      }

      // Clean old proofs (older than 24 hours)
      const cutoff = new Date(now.getTime() - 24 * 3600000);
      for (const [userId, proofs] of this.recentProofs.entries()) {
        const filtered = proofs.filter(p => p.timestamp > cutoff);
        this.recentProofs.set(userId, filtered);
      }
    }, 60000); // Check every minute
  }

  recordProofSubmission(userId: string, ipAddress: string, content: string): void {
    const now = new Date();

    // Update user count
    const userCount = this.userProofCounts.get(userId);
    if (userCount) {
      userCount.count++;
    } else {
      this.userProofCounts.set(userId, { count: 1, lastReset: now });
    }

    // Update IP count
    const ipCount = this.ipProofCounts.get(ipAddress);
    if (ipCount) {
      ipCount.count++;
    } else {
      this.ipProofCounts.set(ipAddress, { count: 1, lastReset: now });
    }

    // Update global count
    this.globalProofCount.count++;

    // Store recent proof
    const userProofs = this.recentProofs.get(userId) || [];
    userProofs.push({ content, timestamp: now, userId });
    this.recentProofs.set(userId, userProofs);
  }

  getStatistics(): {
    totalUsers: number;
    totalIPs: number;
    globalProofs: number;
    averageProofsPerUser: number;
  } {
    const totalUsers = this.userProofCounts.size;
    const totalIPs = this.ipProofCounts.size;
    const globalProofs = this.globalProofCount.count;
    const averageProofsPerUser = totalUsers > 0 ? globalProofs / totalUsers : 0;

    return {
      totalUsers,
      totalIPs,
      globalProofs,
      averageProofsPerUser
    };
  }
}

export default AntiGamingSystem;
