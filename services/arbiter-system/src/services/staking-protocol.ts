/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { EventEmitter } from 'events';
import type {
  Arbiter,
  StakeInfo,
  StakeTransaction,
  StakingProtocol,
  SlashingRule
} from '../interfaces';

/**
 * STAKING PROTOCOL
 * 
 * Manages arbiter stakes with:
 * - Stake locking and unlocking
 * - Slashing for violations
 * - Reward distribution
 * - Withdrawal management
 */
export class StakingProtocolService extends EventEmitter {
  private stakes: Map<string, StakeInfo> = new Map();
  private protocol: StakingProtocol = {
    minimumStake: 10000, // 10,000 AZORA tokens
    stakingDuration: 90, // 90 days minimum
    slashingRules: this.getDefaultSlashingRules(),
    rewardStructure: [
      { casesPerMonth: 5, rewardMultiplier: 1.0, bonusConditions: [] },
      { casesPerMonth: 10, rewardMultiplier: 1.2, bonusConditions: ['High satisfaction'] },
      { casesPerMonth: 20, rewardMultiplier: 1.5, bonusConditions: ['Expert arbiter'] }
    ]
  };

  constructor() {
    super();
  }

  /**
   * Stake tokens to become an arbiter
   */
  async stakeTokens(arbiterId: string, amount: number): Promise<StakeInfo> {
    if (amount < this.protocol.minimumStake) {
      throw new Error(`Minimum stake is ${this.protocol.minimumStake} AZORA`);
    }

    const existingStake = this.stakes.get(arbiterId);
    const currentAmount = existingStake?.amount || 0;
    const newAmount = currentAmount + amount;

    const transaction: StakeTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'stake',
      amount,
      timestamp: new Date(),
      blockchainTxHash: `0x${Math.random().toString(16).substr(2, 64)}`
    };

    const lockDate = new Date();
    lockDate.setDate(lockDate.getDate() + this.protocol.stakingDuration);

    const stakeInfo: StakeInfo = {
      amount: newAmount,
      currency: 'AZORA',
      lockedUntil: existingStake?.lockedUntil || lockDate,
      slashedAmount: existingStake?.slashedAmount || 0,
      availableForWithdrawal: existingStake?.availableForWithdrawal || 0,
      stakingRewards: existingStake?.stakingRewards || 0,
      history: [...(existingStake?.history || []), transaction]
    };

    this.stakes.set(arbiterId, stakeInfo);
    this.emit('tokensStaked', { arbiterId, amount, stakeInfo });

    return stakeInfo;
  }

  /**
   * Unstake tokens (after lock period)
   */
  async unstakeTokens(arbiterId: string, amount: number): Promise<StakeInfo> {
    const stake = this.stakes.get(arbiterId);
    if (!stake) {
      throw new Error('No stake found');
    }

    if (new Date() < stake.lockedUntil) {
      throw new Error('Stake is still locked');
    }

    if (amount > stake.amount - stake.slashedAmount) {
      throw new Error('Insufficient staked amount');
    }

    const transaction: StakeTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'unstake',
      amount,
      timestamp: new Date(),
      blockchainTxHash: `0x${Math.random().toString(16).substr(2, 64)}`
    };

    stake.amount -= amount;
    stake.availableForWithdrawal += amount;
    stake.history.push(transaction);

    this.emit('tokensUnstaked', { arbiterId, amount, stakeInfo: stake });

    return stake;
  }

  /**
   * Slash stake for violations
   */
  async slashStake(
    arbiterId: string,
    violation: SlashingRule['violation'],
    caseId?: string
  ): Promise<StakeInfo> {
    const stake = this.stakes.get(arbiterId);
    if (!stake) {
      throw new Error('No stake found');
    }

    const rule = this.protocol.slashingRules.find(r => r.violation === violation);
    if (!rule) {
      throw new Error('Unknown violation type');
    }

    const slashAmount = stake.amount * (rule.slashPercentage / 100);

    const transaction: StakeTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'slash',
      amount: slashAmount,
      reason: violation,
      caseId,
      timestamp: new Date(),
      blockchainTxHash: `0x${Math.random().toString(16).substr(2, 64)}`
    };

    stake.slashedAmount += slashAmount;
    stake.amount -= slashAmount;
    stake.history.push(transaction);

    this.emit('stakeSlashed', { arbiterId, violation, amount: slashAmount, stakeInfo: stake });

    return stake;
  }

  /**
   * Distribute rewards to arbiter
   */
  async distributeReward(arbiterId: string, baseReward: number, casesCompleted: number): Promise<StakeInfo> {
    const stake = this.stakes.get(arbiterId);
    if (!stake) {
      throw new Error('No stake found');
    }

    // Find applicable reward tier
    const tier = this.protocol.rewardStructure
      .reverse()
      .find(t => casesCompleted >= t.casesPerMonth) || this.protocol.rewardStructure[0];

    const reward = baseReward * tier.rewardMultiplier;

    const transaction: StakeTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'reward',
      amount: reward,
      timestamp: new Date(),
      blockchainTxHash: `0x${Math.random().toString(16).substr(2, 64)}`
    };

    stake.stakingRewards += reward;
    stake.availableForWithdrawal += reward;
    stake.history.push(transaction);

    this.emit('rewardDistributed', { arbiterId, reward, stakeInfo: stake });

    return stake;
  }

  /**
   * Get stake information
   */
  async getStakeInfo(arbiterId: string): Promise<StakeInfo | null> {
    return this.stakes.get(arbiterId) || null;
  }

  /**
   * Check if arbiter has sufficient stake
   */
  async hasSufficientStake(arbiterId: string): Promise<boolean> {
    const stake = this.stakes.get(arbiterId);
    if (!stake) return false;
    
    return stake.amount >= this.protocol.minimumStake && stake.amount > stake.slashedAmount;
  }

  /**
   * Get staking protocol details
   */
  getProtocol(): StakingProtocol {
    return this.protocol;
  }

  // Private helpers

  private getDefaultSlashingRules(): SlashingRule[] {
    return [
      {
        violation: 'bias',
        severity: 'severe',
        slashPercentage: 50,
        appealable: true
      },
      {
        violation: 'fraud',
        severity: 'severe',
        slashPercentage: 100,
        appealable: false
      },
      {
        violation: 'negligence',
        severity: 'moderate',
        slashPercentage: 20,
        appealable: true
      },
      {
        violation: 'inactivity',
        severity: 'minor',
        slashPercentage: 10,
        appealable: true
      },
      {
        violation: 'misconduct',
        severity: 'moderate',
        slashPercentage: 30,
        appealable: true
      }
    ];
  }
}

export const stakingProtocol = new StakingProtocolService();
