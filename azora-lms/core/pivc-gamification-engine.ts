/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/
/**
 * PIVC Gamification Engine
 *
 * Gamified learning system with Sovereign Stars rewards
 * Integrates PIVC (Proven Impact with Verifiable Contributions)
 * with game mechanics for premium learning experience
 */

import { EventEmitter } from 'events';

export interface SovereignStar {
  id: string;
  userId: string;
  type: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  name: string;
  description: string;
  pivcValue: number;
  earnedAt: number;
  verifiableContribution: VerifiableContribution;
  didCredential?: string;
}

export interface VerifiableContribution {
  id: string;
  type: 'peer-review' | 'project' | 'mentoring' | 'content-creation' | 'real-world-application';
  description: string;
  impact: ImpactMetrics;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: number;
  evidence: Evidence[];
}

export interface ImpactMetrics {
  reach: number;
  quality: number;
  innovation: number;
  constitutionalAlignment: number;
  pivcScore: number;
}

export interface Evidence {
  type: 'link' | 'document' | 'code' | 'testimonial' | 'metric';
  url?: string;
  content?: string;
  timestamp: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  requirements: BadgeRequirement[];
  pivcValue: number;
}

export interface BadgeRequirement {
  type: 'complete-modules' | 'pivc-threshold' | 'peer-reviews' | 'projects' | 'streak';
  value: number;
  description: string;
}

export interface Leaderboard {
  id: string;
  name: string;
  type: 'pivc' | 'stars' | 'contributions' | 'streak' | 'impact';
  timeframe: 'daily' | 'weekly' | 'monthly' | 'all-time';
  entries: LeaderboardEntry[];
  lastUpdated: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  stars: number;
  badges: number;
  avatar?: string;
}

export interface MicrolearningChunk {
  id: string;
  title: string;
  duration: number; // 5-15 minutes
  type: 'video' | 'reading' | 'interactive' | 'quiz';
  content: string;
  pivcWeight: number;
  nextChunks: string[];
  prerequisites: string[];
}

export interface LearningStreak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: number;
  streakMultiplier: number;
}

export interface PeerReview {
  id: string;
  reviewerId: string;
  targetUserId: string;
  targetContentId: string;
  rating: number;
  feedback: string;
  pivcAwarded: number;
  constitutionalAlignment: number;
  submittedAt: number;
  verified: boolean;
}

/**
 * PIVC Gamification Engine
 */
export class PIVCGamificationEngine extends EventEmitter {
  private static instance: PIVCGamificationEngine;
  private sovereignStars: Map<string, SovereignStar[]> = new Map();
  private badges: Map<string, Badge> = new Map();
  private leaderboards: Map<string, Leaderboard> = new Map();
  private streaks: Map<string, LearningStreak> = new Map();
  private peerReviews: Map<string, PeerReview[]> = new Map();

  private constructor() {
    super();
    this.initializeDefaultBadges();
    this.initializeLeaderboards();
  }

  public static getInstance(): PIVCGamificationEngine {
    if (!PIVCGamificationEngine.instance) {
      PIVCGamificationEngine.instance = new PIVCGamificationEngine();
    }
    return PIVCGamificationEngine.instance;
  }

  private initializeDefaultBadges(): void {
    // Foundation badges
    this.badges.set('first-star', {
      id: 'first-star',
      name: 'First Sovereign Star',
      description: 'Earned your first Sovereign Star',
      icon: '⭐',
      rarity: 'common',
      requirements: [{ type: 'pivc-threshold', value: 10, description: 'Earn 10 PIVC' }],
      pivcValue: 5,
    });

    this.badges.set('peer-reviewer', {
      id: 'peer-reviewer',
      name: 'Peer Reviewer',
      description: 'Completed 10 peer reviews',
      icon: '👁️',
      rarity: 'uncommon',
      requirements: [{ type: 'peer-reviews', value: 10, description: 'Complete 10 peer reviews' }],
      pivcValue: 20,
    });

    this.badges.set('impact-maker', {
      id: 'impact-maker',
      name: 'Impact Maker',
      description: 'Achieved 500 PIVC through real-world applications',
      icon: '💎',
      rarity: 'rare',
      requirements: [{ type: 'pivc-threshold', value: 500, description: 'Earn 500 PIVC' }],
      pivcValue: 100,
    });

    this.badges.set('streak-master', {
      id: 'streak-master',
      name: 'Streak Master',
      description: 'Maintained a 30-day learning streak',
      icon: '🔥',
      rarity: 'epic',
      requirements: [{ type: 'streak', value: 30, description: '30-day streak' }],
      pivcValue: 150,
    });

    this.badges.set('constitutional-guardian', {
      id: 'constitutional-guardian',
      name: 'Constitutional Guardian',
      description: 'Consistently produced constitutionally aligned content',
      icon: '🛡️',
      rarity: 'legendary',
      requirements: [
        { type: 'pivc-threshold', value: 1000, description: 'Earn 1000 PIVC' },
        { type: 'projects', value: 5, description: 'Complete 5 projects' },
      ],
      pivcValue: 500,
    });
  }

  private initializeLeaderboards(): void {
    const timeframes: Leaderboard['timeframe'][] = ['daily', 'weekly', 'monthly', 'all-time'];
    const types: Leaderboard['type'][] = ['pivc', 'stars', 'contributions', 'streak', 'impact'];

    for (const timeframe of timeframes) {
      for (const type of types) {
        const id = `${type}-${timeframe}`;
        this.leaderboards.set(id, {
          id,
          name: `${type.toUpperCase()} - ${timeframe}`,
          type,
          timeframe,
          entries: [],
          lastUpdated: Date.now(),
        });
      }
    }
  }

  /**
   * Award Sovereign Star for verifiable contribution
   */
  public async awardSovereignStar(
    userId: string,
    contribution: VerifiableContribution
  ): Promise<SovereignStar> {
    const starType = this.determineStarType(contribution.impact.pivcScore);

    const star: SovereignStar = {
      id: `star-${Date.now()}-${userId}`,
      userId,
      type: starType,
      name: `${starType.charAt(0).toUpperCase() + starType.slice(1)} Sovereign Star`,
      description: contribution.description,
      pivcValue: contribution.impact.pivcScore,
      earnedAt: Date.now(),
      verifiableContribution: contribution,
    };

    // Store star
    if (!this.sovereignStars.has(userId)) {
      this.sovereignStars.set(userId, []);
    }
    this.sovereignStars.get(userId)!.push(star);

    // Update leaderboards
    await this.updateLeaderboards(userId);

    // Check for badge unlocks
    await this.checkBadgeUnlocks(userId);

    this.emit('star-awarded', star);
    console.log(`⭐ ${star.name} awarded to user ${userId}`);

    return star;
  }

  private determineStarType(pivcScore: number): SovereignStar['type'] {
    if (pivcScore >= 100) return 'diamond';
    if (pivcScore >= 50) return 'platinum';
    if (pivcScore >= 25) return 'gold';
    if (pivcScore >= 10) return 'silver';
    return 'bronze';
  }

  /**
   * Submit peer review
   */
  public async submitPeerReview(review: Omit<PeerReview, 'id' | 'verified'>): Promise<PeerReview> {
    const fullReview: PeerReview = {
      ...review,
      id: `review-${Date.now()}`,
      verified: false,
    };

    // Store review
    if (!this.peerReviews.has(review.reviewerId)) {
      this.peerReviews.set(review.reviewerId, []);
    }
    this.peerReviews.get(review.reviewerId)!.push(fullReview);

    // Award PIVC for quality peer review
    if (review.rating >= 4 && review.feedback.length > 100) {
      const contribution: VerifiableContribution = {
        id: `contrib-${fullReview.id}`,
        type: 'peer-review',
        description: 'Quality peer review provided',
        impact: {
          reach: 1,
          quality: review.rating,
          innovation: 3,
          constitutionalAlignment: review.constitutionalAlignment,
          pivcScore: review.pivcAwarded,
        },
        verified: true,
        verifiedBy: 'system',
        verifiedAt: Date.now(),
        evidence: [
          {
            type: 'document',
            content: review.feedback,
            timestamp: Date.now(),
          },
        ],
      };

      await this.awardSovereignStar(review.reviewerId, contribution);
    }

    this.emit('peer-review-submitted', fullReview);
    return fullReview;
  }

  /**
   * Track learning streak
   */
  public async updateStreak(userId: string): Promise<LearningStreak> {
    let streak = this.streaks.get(userId);
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (!streak) {
      streak = {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: now,
        streakMultiplier: 1.0,
      };
    } else {
      const daysSinceLastActivity = Math.floor((now - streak.lastActivityDate) / oneDayMs);

      if (daysSinceLastActivity === 1) {
        // Consecutive day
        streak.currentStreak++;
        streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
        streak.streakMultiplier = 1 + (streak.currentStreak * 0.01); // 1% bonus per day
      } else if (daysSinceLastActivity > 1) {
        // Streak broken
        streak.currentStreak = 1;
        streak.streakMultiplier = 1.0;
      }
      // Same day activity doesn't change streak

      streak.lastActivityDate = now;
    }

    this.streaks.set(userId, streak);
    this.emit('streak-updated', streak);

    // Check for streak badges
    await this.checkBadgeUnlocks(userId);

    return streak;
  }

  /**
   * Create microlearning chunk
   */
  public createMicrolearningChunk(chunk: Omit<MicrolearningChunk, 'id'>): MicrolearningChunk {
    const fullChunk: MicrolearningChunk = {
      ...chunk,
      id: `chunk-${Date.now()}`,
    };

    this.emit('chunk-created', fullChunk);
    return fullChunk;
  }

  /**
   * Check and award badges
   */
  private async checkBadgeUnlocks(userId: string): Promise<Badge[]> {
    const unlockedBadges: Badge[] = [];
    const userStars = this.sovereignStars.get(userId) || [];
    const userReviews = this.peerReviews.get(userId) || [];
    const userStreak = this.streaks.get(userId);

    const totalPivc = userStars.reduce((sum, star) => sum + star.pivcValue, 0);

    for (const badge of this.badges.values()) {
      if (await this.meetsRequirements(badge, userId, totalPivc, userReviews.length, userStreak)) {
        unlockedBadges.push(badge);
        this.emit('badge-unlocked', { userId, badge });
        console.log(`🏆 Badge unlocked: ${badge.name} for user ${userId}`);
      }
    }

    return unlockedBadges;
  }

  private async meetsRequirements(
    badge: Badge,
    userId: string,
    totalPivc: number,
    reviewCount: number,
    streak?: LearningStreak
  ): Promise<boolean> {
    for (const req of badge.requirements) {
      switch (req.type) {
        case 'pivc-threshold':
          if (totalPivc < req.value) return false;
          break;
        case 'peer-reviews':
          if (reviewCount < req.value) return false;
          break;
        case 'streak':
          if (!streak || streak.currentStreak < req.value) return false;
          break;
        case 'projects':
          // Check project completions (would integrate with CLA)
          break;
        case 'complete-modules':
          // Check module completions (would integrate with CLA)
          break;
      }
    }
    return true;
  }

  /**
   * Update leaderboards
   */
  private async updateLeaderboards(userId: string): Promise<void> {
    const userStars = this.sovereignStars.get(userId) || [];
    const totalPivc = userStars.reduce((sum, star) => sum + star.pivcValue, 0);
    const starCount = userStars.length;

    // Update PIVC leaderboard
    const pivcLeaderboard = this.leaderboards.get('pivc-all-time');
    if (pivcLeaderboard) {
      this.updateLeaderboardEntry(pivcLeaderboard, userId, totalPivc, starCount);
    }

    // Update Stars leaderboard
    const starsLeaderboard = this.leaderboards.get('stars-all-time');
    if (starsLeaderboard) {
      this.updateLeaderboardEntry(starsLeaderboard, userId, starCount, starCount);
    }

    this.emit('leaderboards-updated');
  }

  private updateLeaderboardEntry(
    leaderboard: Leaderboard,
    userId: string,
    score: number,
    stars: number
  ): void {
    const existingIndex = leaderboard.entries.findIndex(e => e.userId === userId);

    if (existingIndex >= 0) {
      leaderboard.entries[existingIndex].score = score;
      leaderboard.entries[existingIndex].stars = stars;
    } else {
      leaderboard.entries.push({
        rank: 0,
        userId,
        username: `User ${userId}`,
        score,
        stars,
        badges: 0,
      });
    }

    // Sort and update ranks
    leaderboard.entries.sort((a, b) => b.score - a.score);
    leaderboard.entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    leaderboard.lastUpdated = Date.now();
  }

  /**
   * Get user's gamification profile
   */
  public getUserProfile(userId: string): GamificationProfile {
    const stars = this.sovereignStars.get(userId) || [];
    const reviews = this.peerReviews.get(userId) || [];
    const streak = this.streaks.get(userId);
    const totalPivc = stars.reduce((sum, star) => sum + star.pivcValue, 0);

    return {
      userId,
      totalPivc,
      sovereignStars: stars,
      badges: [], // Would fetch earned badges
      peerReviews: reviews.length,
      streak: streak?.currentStreak || 0,
      longestStreak: streak?.longestStreak || 0,
      streakMultiplier: streak?.streakMultiplier || 1.0,
      rank: this.getUserRank(userId, 'pivc-all-time'),
    };
  }

  private getUserRank(userId: string, leaderboardId: string): number {
    const leaderboard = this.leaderboards.get(leaderboardId);
    if (!leaderboard) return 0;

    const entry = leaderboard.entries.find(e => e.userId === userId);
    return entry?.rank || 0;
  }

  public getLeaderboard(leaderboardId: string, limit?: number, offset?: number): Leaderboard | undefined {
    const leaderboard = this.leaderboards.get(leaderboardId);
    if (!leaderboard) return undefined;

    if (limit || offset) {
      const start = offset || 0;
      const end = start + (limit || leaderboard.entries.length);
      return {
        ...leaderboard,
        entries: leaderboard.entries.slice(start, end),
      };
    }

    return leaderboard;
  }

  /**
   * Get leaderboard for GraphQL
   */
  public getLeaderboardForGraphQL(timeframe: string): any[] {
    const leaderboard = this.leaderboards.get(`pivc-${timeframe}`);
    if (!leaderboard) return [];

    return leaderboard.entries.map(entry => ({
      rank: entry.rank,
      user: { id: entry.userId }, // Will be populated by resolver
      score: entry.score,
      stars: entry.stars || 0,
    }));
  }

  /**
   * Get user PIVC metrics (for GraphQL)
   */
  public getUserMetrics(userId: string): any {
    const profile = this.getUserProfile(userId);
    const stars = this.sovereignStars.get(userId) || [];

    return {
      total: profile.totalPivc,
      thisWeek: this.calculatePeriodPIVC(userId, 'week'),
      thisMonth: this.calculatePeriodPIVC(userId, 'month'),
      rank: this.getUserRank(userId, 'pivc-all-time'),
      sovereignStars: stars.length,
    };
  }

  /**
   * Award PIVC directly (for GraphQL)
   */
  public async awardPIVC(userId: string, data: { amount: number; reason: string; source: string }): Promise<void> {
    const profile = this.getUserProfile(userId);
    profile.totalPivc += data.amount;

    // Update leaderboards
    await this.updateLeaderboards(userId);

    // Check for badge unlocks
    await this.checkBadgeUnlocks(userId);

    this.emit('pivc-awarded', { userId, amount: data.amount, reason: data.reason });
  }

  private calculatePeriodPIVC(userId: string, period: 'week' | 'month'): number {
    // Placeholder - would calculate from activity history
    return 0;
  }

  public getAllBadges(): Badge[] {
    return Array.from(this.badges.values());
  }
}

export interface GamificationProfile {
  userId: string;
  totalPivc: number;
  sovereignStars: SovereignStar[];
  badges: Badge[];
  peerReviews: number;
  streak: number;
  longestStreak: number;
  streakMultiplier: number;
  rank: number;
}

export default PIVCGamificationEngine;

