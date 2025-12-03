import { UbuntuAction } from "../services/UbuntuTokenomicsEngine";

export interface TokenDistributionRule {
  category: string;
  baseReward: number;
  multiplier: number;
  maxReward: number;
}

export class TokenDistributor {
  private distributionRules: TokenDistributionRule[] = [
    { category: "education", baseReward: 50, multiplier: 1.5, maxReward: 500 },
    { category: "healthcare", baseReward: 60, multiplier: 1.8, maxReward: 600 },
    { category: "community", baseReward: 40, multiplier: 1.2, maxReward: 400 },
    { category: "business", baseReward: 30, multiplier: 1.0, maxReward: 300 },
    { category: "technology", baseReward: 45, multiplier: 1.3, maxReward: 450 },
    { category: "arts", baseReward: 25, multiplier: 0.8, maxReward: 250 }
  ];

  private citadelFundPercentage = 0.1; // 10% to Citadel Fund
  private communityPoolPercentage = 0.2; // 20% to community pool
  private userRewardPercentage = 0.7; // 70% to user

  calculateReward(ubuntuScore: number, action: UbuntuAction): number {
    const rule = this.distributionRules.find(r => r.category === action.category);
    if (!rule) return 10; // Default reward

    const baseReward = rule.baseReward;
    const scoreMultiplier = ubuntuScore / 100;
    const impactMultiplier = this.getImpactMultiplier(action.impact);
    
    let reward = baseReward * scoreMultiplier * rule.multiplier * impactMultiplier;
    
    // Apply maximum reward limit
    reward = Math.min(reward, rule.maxReward);
    
    // Apply bonuses
    reward += this.calculateBonuses(action);
    
    return Math.round(reward * 100) / 100; // Round to 2 decimal places
  }

  private getImpactMultiplier(impact: string): number {
    const multipliers = {
      local: 1.0,
      regional: 1.3,
      continental: 1.6,
      global: 2.0
    };
    
    return multipliers[impact] || 1.0;
  }

  private calculateBonuses(action: UbuntuAction): number {
    let bonuses = 0;
    
    // Collaboration bonus
    if (action.metadata.participants && action.metadata.participants > 1) {
      bonuses += Math.min(action.metadata.participants * 5, 50);
    }
    
    // Innovation bonus
    if (action.metadata.innovative) {
      bonuses += 20;
    }
    
    // Sustainability bonus
    if (action.metadata.sustainable) {
      bonuses += 15;
    }
    
    // Urgency bonus
    if (action.metadata.urgency === "high") {
      bonuses += 10;
    }
    
    return bonuses;
  }

  distributeTokens(totalReward: number): {
    userReward: number;
    citadelFund: number;
    communityPool: number;
  } {
    const userReward = totalReward * this.userRewardPercentage;
    const citadelFund = totalReward * this.citadelFundPercentage;
    const communityPool = totalReward * this.communityPoolPercentage;
    
    return {
      userReward: Math.round(userReward * 100) / 100,
      citadelFund: Math.round(citadelFund * 100) / 100,
      communityPool: Math.round(communityPool * 100) / 100
    };
  }

  calculateStakingRewards(stakedAmount: number, stakingPeriod: number, ubuntuScore: number): number {
    const baseAPY = 0.05; // 5% base APY
    const scoreBonus = (ubuntuScore / 100) * 0.1; // Up to 10% bonus based on Ubuntu score
    const periodBonus = Math.min(stakingPeriod / 365, 1) * 0.05; // Up to 5% for 1+ year
    
    const totalAPY = baseAPY + scoreBonus + periodBonus;
    const rewards = stakedAmount * totalAPY * (stakingPeriod / 365);
    
    return Math.round(rewards * 100) / 100;
  }

  calculateCommunityDistribution(communityPool: number, activeUsers: number): Map<string, number> {
    const distribution = new Map<string, number>();
    
    if (activeUsers === 0) return distribution;
    
    // Distribute based on user activity levels (simplified)
    const baseDistribution = communityPool / activeUsers;
    
    // In a real implementation, this would consider:
    // - User contribution scores
    // - Activity levels
    // - Ubuntu scores
    // - Special roles
    
    for (let i = 0; i < activeUsers; i++) {
      const userId = `user_${i}`;
      const userMultiplier = 0.5 + Math.random(); // Random multiplier 0.5-1.5
      const userDistribution = baseDistribution * userMultiplier;
      distribution.set(userId, Math.round(userDistribution * 100) / 100);
    }
    
    return distribution;
  }

  validateDistribution(distribution: any): boolean {
    // Validate that distribution follows Ubuntu principles
    if (!distribution.userReward || distribution.userReward <= 0) return false;
    if (!distribution.citadelFund || distribution.citadelFund < 0) return false;
    if (!distribution.communityPool || distribution.communityPool < 0) return false;
    
    const total = distribution.userReward + distribution.citadelFund + distribution.communityPool;
    const expectedTotal = distribution.userReward / this.userRewardPercentage;
    
    // Allow small rounding differences
    return Math.abs(total - expectedTotal) < 0.01;
  }
}
