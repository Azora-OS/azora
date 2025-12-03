import { PrismaClient } from '@prisma/client';
import { blockchainService } from '../../azora-blockchain/src/blockchain-service';
import axios from 'axios';

const prisma = new PrismaClient();

/**
 * Proof-of-Value Mining Integration
 * Connects value creation tracking to token minting
 */
export class ProofOfValueIntegration {
  private readonly mintServiceUrl: string;
  private readonly rewardMultiplier: number;
  private readonly antiGamingEnabled: boolean;
  private readonly maxDailyRewards: number;

  constructor() {
    this.mintServiceUrl = process.env.MINT_SERVICE_URL || 'http://localhost:3010';
    this.rewardMultiplier = parseFloat(process.env.POV_REWARD_MULTIPLIER || '1.0');
    this.antiGamingEnabled = process.env.POV_ANTI_GAMING_ENABLED === 'true';
    this.maxDailyRewards = parseInt(process.env.POV_MAX_DAILY_REWARDS || '1000');
  }

  /**
   * Calculate and distribute rewards for value creation
   */
  async processValueCreation(userId: string, activity: ValueActivity): Promise<RewardResult> {
    console.log(`🎯 Processing value creation for user ${userId}: ${activity.type}`);

    // Calculate value score
    const valueScore = await this.calculateValueScore(activity);
    
    // Check anti-gaming rules
    if (this.antiGamingEnabled) {
      const isValid = await this.validateActivity(userId, activity, valueScore);
      if (!isValid) {
        console.log(`⚠️  Activity flagged as potential gaming: ${activity.type}`);
        return {
          success: false,
          reason: 'anti_gaming_check_failed',
          valueScore,
        };
      }
    }

    // Check daily limits
    const dailyTotal = await this.getDailyRewardsTotal(userId);
    if (dailyTotal >= this.maxDailyRewards) {
      console.log(`⚠️  Daily reward limit reached for user ${userId}`);
      return {
        success: false,
        reason: 'daily_limit_reached',
        valueScore,
        dailyTotal,
      };
    }

    // Calculate reward amount
    const rewardAmount = this.calculateReward(valueScore);
    
    // Record in database
    const record = await prisma.valueCreationRecord.create({
      data: {
        userId,
        activityType: activity.type,
        valueScore,
        rewardAmount,
        metadata: activity.metadata,
        status: 'pending',
      },
    });

    // Mint tokens
    try {
      const txHash = await this.mintReward(userId, rewardAmount, record.id);
      
      // Update record
      await prisma.valueCreationRecord.update({
        where: { id: record.id },
        data: {
          status: 'completed',
          txHash,
          mintedAt: new Date(),
        },
      });

      console.log(`✅ Minted ${rewardAmount} AZR for ${activity.type} (txHash: ${txHash})`);

      return {
        success: true,
        valueScore,
        rewardAmount,
        txHash,
        recordId: record.id,
      };
    } catch (error: any) {
      // Update record as failed
      await prisma.valueCreationRecord.update({
        where: { id: record.id },
        data: {
          status: 'failed',
          errorMessage: error.message,
        },
      });

      console.error(`❌ Minting failed:`, error);

      return {
        success: false,
        reason: 'minting_failed',
        valueScore,
        error: error.message,
      };
    }
  }

  /**
   * Calculate value score based on activity
   */
  private async calculateValueScore(activity: ValueActivity): Promise<number> {
    let baseScore = 0;

    switch (activity.type) {
      case 'course_completion':
        baseScore = 100;
        // Bonus for high grades
        if (activity.metadata.grade >= 90) baseScore *= 1.5;
        break;

      case 'code_contribution':
        // Score based on lines of code, complexity, and reviews
        const loc = activity.metadata.linesOfCode || 0;
        const complexity = activity.metadata.complexity || 1;
        const reviews = activity.metadata.positiveReviews || 0;
        baseScore = Math.min((loc / 10) * complexity + (reviews * 20), 500);
        break;

      case 'knowledge_sharing':
        // Score based on upvotes and engagement
        const upvotes = activity.metadata.upvotes || 0;
        const views = activity.metadata.views || 0;
        baseScore = (upvotes * 10) + (views / 100);
        break;

      case 'content_creation':
        // Score based on quality and engagement
        const quality = activity.metadata.qualityScore || 0.5;
        const engagement = activity.metadata.engagementRate || 0;
        baseScore = quality * 100 + engagement * 200;
        break;

      case 'community_help':
        // Score based on problem complexity and satisfaction
        const complexity_score = activity.metadata.complexityScore || 1;
        const satisfaction = activity.metadata.satisfactionRating || 0;
        baseScore = complexity_score * 50 + satisfaction * 30;
        break;

      case 'research_publication':
        // High score for research
        baseScore = 500;
        if (activity.metadata.peerReviewed) baseScore *= 2;
        break;

      case 'project_milestone':
        // Score based on project value and impact
        const projectValue = activity.metadata.projectValue || 0;
        const impactScore = activity.metadata.impactScore || 1;
        baseScore = projectValue * impactScore;
        break;

      default:
        baseScore = 10; // Minimal score for unknown activities
    }

    // Apply multiplier from configuration
    const finalScore = baseScore * this.rewardMultiplier;

    return Math.max(1, Math.round(finalScore));
  }

  /**
   * Calculate reward amount based on value score
   */
  private calculateReward(valueScore: number): number {
    // Convert value score to AZR tokens
    // Base formula: 1 AZR per 100 value points
    const baseReward = valueScore / 100;
    
    // Apply reward curve (logarithmic to prevent inflation)
    const reward = Math.log10(baseReward + 1) * 10;
    
    // Round to 2 decimal places
    return Math.round(reward * 100) / 100;
  }

  /**
   * Validate activity to prevent gaming
   */
  private async validateActivity(userId: string, activity: ValueActivity, valueScore: number): Promise<boolean> {
    // Check for suspicious patterns
    
    // 1. Rate limiting - max activities per hour
    const recentActivities = await prisma.valueCreationRecord.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        },
      },
    });

    if (recentActivities > 20) {
      console.log(`⚠️  Too many activities in last hour: ${recentActivities}`);
      return false;
    }

    // 2. Check for duplicate activities
    const duplicateWindow = 5 * 60 * 1000; // 5 minutes
    const duplicate = await prisma.valueCreationRecord.findFirst({
      where: {
        userId,
        activityType: activity.type,
        createdAt: {
          gte: new Date(Date.now() - duplicateWindow),
        },
        metadata: {
          equals: activity.metadata,
        },
      },
    });

    if (duplicate) {
      console.log(`⚠️  Duplicate activity detected`);
      return false;
    }

    // 3. Check for abnormally high value scores
    const avgScore = await this.getAverageValueScore(activity.type);
    if (valueScore > avgScore * 5) {
      console.log(`⚠️  Value score too high compared to average: ${valueScore} vs ${avgScore}`);
      return false;
    }

    // 4. Verify activity authenticity (if verification endpoint exists)
    if (activity.metadata.verificationUrl) {
      try {
        const response = await axios.get(activity.metadata.verificationUrl, { timeout: 5000 });
        if (response.data.verified !== true) {
          console.log(`⚠️  Activity verification failed`);
          return false;
        }
      } catch (error) {
        console.log(`⚠️  Could not verify activity`);
        return false;
      }
    }

    return true;
  }

  /**
   * Get total rewards for today
   */
  private async getDailyRewardsTotal(userId: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const result = await prisma.valueCreationRecord.aggregate({
      where: {
        userId,
        createdAt: {
          gte: startOfDay,
        },
        status: 'completed',
      },
      _sum: {
        rewardAmount: true,
      },
    });

    return result._sum.rewardAmount || 0;
  }

  /**
   * Get average value score for activity type
   */
  private async getAverageValueScore(activityType: string): Promise<number> {
    const result = await prisma.valueCreationRecord.aggregate({
      where: {
        activityType,
        status: 'completed',
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      _avg: {
        valueScore: true,
      },
    });

    return result._avg.valueScore || 100;
  }

  /**
   * Mint reward tokens
   */
  private async mintReward(userId: string, amount: number, recordId: string): Promise<string> {
    // Get user's wallet address
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletAddress: true },
    });

    if (!user?.walletAddress) {
      throw new Error('User wallet address not found');
    }

    // Call blockchain service to mint
    const txHash = await blockchainService.mintTokens(
      user.walletAddress,
      amount,
      `Proof-of-Value reward: ${recordId}`
    );

    return txHash;
  }

  /**
   * Batch process pending rewards (run via cron)
   */
  async processPendingRewards(): Promise<{ processed: number; failed: number }> {
    console.log(`🔄 Processing pending rewards...`);

    const pending = await prisma.valueCreationRecord.findMany({
      where: {
        status: 'pending',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours only
        },
      },
      take: 100,
    });

    let processed = 0;
    let failed = 0;

    for (const record of pending) {
      try {
        const txHash = await this.mintReward(record.userId, record.rewardAmount, record.id);
        
        await prisma.valueCreationRecord.update({
          where: { id: record.id },
          data: {
            status: 'completed',
            txHash,
            mintedAt: new Date(),
          },
        });

        processed++;
        console.log(`✅ Processed reward ${record.id}`);
      } catch (error: any) {
        await prisma.valueCreationRecord.update({
          where: { id: record.id },
          data: {
            status: 'failed',
            errorMessage: error.message,
          },
        });

        failed++;
        console.error(`❌ Failed to process reward ${record.id}:`, error);
      }
    }

    console.log(`📊 Batch complete: ${processed} processed, ${failed} failed`);

    return { processed, failed };
  }

  /**
   * Get user's total earned rewards
   */
  async getUserTotalRewards(userId: string): Promise<{ total: number; count: number }> {
    const result = await prisma.valueCreationRecord.aggregate({
      where: {
        userId,
        status: 'completed',
      },
      _sum: {
        rewardAmount: true,
      },
      _count: true,
    });

    return {
      total: result._sum.rewardAmount || 0,
      count: result._count,
    };
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(timeframe: 'day' | 'week' | 'month' | 'all' = 'week', limit: number = 100): Promise<any[]> {
    let startDate: Date;
    
    switch (timeframe) {
      case 'day':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    const leaderboard = await prisma.valueCreationRecord.groupBy({
      by: ['userId'],
      where: {
        status: 'completed',
        createdAt: {
          gte: startDate,
        },
      },
      _sum: {
        rewardAmount: true,
        valueScore: true,
      },
      _count: true,
      orderBy: {
        _sum: {
          rewardAmount: 'desc',
        },
      },
      take: limit,
    });

    // Fetch user details
    const userIds = leaderboard.map(entry => entry.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, avatar: true },
    });

    return leaderboard.map((entry, index) => ({
      rank: index + 1,
      user: users.find(u => u.id === entry.userId),
      totalRewards: entry._sum.rewardAmount || 0,
      totalValueScore: entry._sum.valueScore || 0,
      activityCount: entry._count,
    }));
  }
}

// Types
interface ValueActivity {
  type: 'course_completion' | 'code_contribution' | 'knowledge_sharing' | 'content_creation' | 'community_help' | 'research_publication' | 'project_milestone';
  metadata: Record<string, any>;
}

interface RewardResult {
  success: boolean;
  valueScore: number;
  rewardAmount?: number;
  txHash?: string;
  recordId?: string;
  reason?: string;
  error?: string;
  dailyTotal?: number;
}

// Export singleton
export const povIntegration = new ProofOfValueIntegration();
