/**
 * Reward Distributor
 * Calculates and distributes AZR tokens for completed tasks
 */

import { ParsedIssue } from './issue-parser';

export interface Reward {
  amount: number;
  recipient: string;
  reason: string;
  txHash?: string;
}

export class RewardDistributor {
  /**
   * Calculate reward for completing an issue
   */
  calculateReward(issue: ParsedIssue): Reward {
    let baseReward = 10; // Base AZR per issue

    // Adjust for complexity
    switch (issue.estimatedComplexity) {
      case 'simple':
        baseReward = 5;
        break;
      case 'moderate':
        baseReward = 10;
        break;
      case 'complex':
        baseReward = 25;
        break;
      case 'expert':
        baseReward = 50;
        break;
    }

    // Bonus for priority
    if (issue.priority === 'critical') baseReward *= 2;
    if (issue.priority === 'high') baseReward *= 1.5;

    // Bonus for security/ethics issues
    if (issue.labels.includes('security') || issue.labels.includes('ethics')) {
      baseReward *= 1.2;
    }

    return {
      amount: Math.round(baseReward),
      recipient: issue.author,
      reason: `Completed issue: ${issue.title}`
    };
  }

  /**
   * Distribute rewards to recipient (stub)
   */
  async distribute(reward: Reward): Promise<Reward> {
    // TODO: Call blockchain service to mint AZR tokens
    // TODO: Transfer to recipient wallet
    // TODO: Log to audit trail

    console.log(`✅ Distributed ${reward.amount} AZR to ${reward.recipient}`);

    return {
      ...reward,
      txHash: '0x' + Math.random().toString(16).substr(2)
    };
  }
}
