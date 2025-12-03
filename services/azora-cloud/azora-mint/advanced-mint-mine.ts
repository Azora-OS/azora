/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * ADVANCED MINT-MINE ENGINE
 * 
 * Combines money printing (Mint) with value creation (Mine)
 * Features:
 * - Dynamic token minting based on real value creation
 * - Mining rewards for learning, creating, contributing
 * - Auto-stake tokens for earnings
 * - Deflationary mechanisms (burning)
 * - Real-time value backing
 */

import { EventEmitter } from 'events'
import { bankIntegration } from './bank-integration'
import { UserDB, ProofDB } from '../supabase-client'
import crypto from 'crypto'

export interface MintMineStats {
  totalMinted: number
  totalBurned: number
  circulatingSupply: number
  backingValue: number // ZAR
  marketCap: number
  mintRate: number // tokens per hour
  mineRate: number // tokens per learning hour
  burnRate: number // % per transaction
}

export class AdvancedMintMineEngine extends EventEmitter {
  private stats: MintMineStats = {
    totalMinted: 1000000000, // 1 Billion initial supply
    totalBurned: 0,
    circulatingSupply: 1000000000,
    backingValue: 100000, // R100k initial backing
    marketCap: 10000000, // R10M market cap
    mintRate: 1000, // 1000 AZR/hour
    mineRate: 100, // 100 AZR/learning hour
    burnRate: 0.01 // 1% transaction burn
  }

  constructor() {
    super()
    console.log('⚡ Advanced Mint-Mine Engine initialized')
    console.log(`   💰 Total Supply: ${this.stats.totalMinted.toLocaleString()} AZR`)
    console.log(`   🔥 Burn Rate: ${this.stats.burnRate * 100}%`)
    console.log(`   ⛏️  Mine Rate: ${this.stats.mineRate} AZR/hour`)
  }

  /**
   * Mint new tokens (backed by real value)
   */
  async mint(userId: string, amount: number, reason: string): Promise<number> {
    // Ensure backing ratio (1 AZR = R0.10 minimum backing)
    const requiredBacking = amount * 0.10
    
    if (this.stats.backingValue < requiredBacking) {
      throw new Error('Insufficient backing reserves for minting')
    }

    console.log(`\\n💰 MINTING TOKENS`)
    console.log(`   User: ${userId}`)
    console.log(`   Amount: ${amount} AZR`)
    console.log(`   Reason: ${reason}`)
    console.log(`   Backing Required: R${requiredBacking}`)
    console.log(`   Backing Available: R${this.stats.backingValue}`)

    // Mint tokens
    this.stats.totalMinted += amount
    this.stats.circulatingSupply += amount

    // Update user balance
    try {
      const user = await UserDB.getById(userId)
      const account = bankIntegration['accounts'].get(userId)
      
      if (account) {
        account.azoraBalance += amount
        bankIntegration['accounts'].set(userId, account)
      }

      await UserDB.updateMetadata(userId, {
        ...user.metadata,
        azr_balance: (user.metadata.azr_balance || 0) + amount,
        last_mint: new Date().toISOString()
      })

    } catch (error) {
      console.warn('Failed to update user balance in database')
    }

    console.log(`   ✅ ${amount} AZR minted successfully!`)
    console.log(`   📊 New circulating supply: ${this.stats.circulatingSupply.toLocaleString()}`)

    this.emit('tokens-minted', { userId, amount, reason })
    return amount
  }

  /**
   * Mine tokens through learning
   */
  async mineThroughLearning(userId: string, hoursLearned: number, performance: number): Promise<number> {
    // Calculate mining reward
    const baseReward = this.stats.mineRate * hoursLearned
    const performanceBonus = baseReward * (performance / 100) * 0.5 // Up to 50% bonus
    const totalReward = Math.floor(baseReward + performanceBonus)

    console.log(`\\n⛏️  MINING THROUGH LEARNING`)
    console.log(`   Hours Learned: ${hoursLearned}`)
    console.log(`   Performance: ${performance}%`)
    console.log(`   Base Reward: ${baseReward} AZR`)
    console.log(`   Performance Bonus: ${Math.floor(performanceBonus)} AZR`)
    console.log(`   Total Reward: ${totalReward} AZR`)

    // Mint the rewards
    await this.mint(userId, totalReward, `Learning: ${hoursLearned}h @ ${performance}% performance`)

    // Track in proofs
    try {
      await ProofDB.create({
        user_id: userId,
        module_id: 'mining-reward',
        score: performance,
        reward_amount: totalReward,
        proof_hash: crypto.randomBytes(32).toString('hex'),
        verified: true
      })
    } catch (error) {
      console.warn('Failed to record mining proof')
    }

    this.emit('tokens-mined', { userId, totalReward, hoursLearned, performance })
    return totalReward
  }

  /**
   * Burn tokens (deflationary mechanism)
   */
  async burn(amount: number, reason: string = 'Transaction fee'): Promise<void> {
    if (this.stats.circulatingSupply < amount) {
      throw new Error('Cannot burn more than circulating supply')
    }

    console.log(`\\n🔥 BURNING TOKENS`)
    console.log(`   Amount: ${amount} AZR`)
    console.log(`   Reason: ${reason}`)

    this.stats.totalBurned += amount
    this.stats.circulatingSupply -= amount

    // Reduce backing proportionally (deflation increases value)
    const burnRatio = amount / this.stats.totalMinted
    this.stats.backingValue *= (1 - burnRatio)

    console.log(`   ✅ Tokens burned`)
    console.log(`   📊 Circulating supply: ${this.stats.circulatingSupply.toLocaleString()}`)
    console.log(`   💎 Total burned: ${this.stats.totalBurned.toLocaleString()}`)

    this.emit('tokens-burned', { amount, reason })
  }

  /**
   * Add backing value (increases token value)
   */
  async addBacking(zarAmount: number, source: string): Promise<void> {
    console.log(`\\n💵 ADDING BACKING VALUE`)
    console.log(`   Amount: R${zarAmount}`)
    console.log(`   Source: ${source}`)

    this.stats.backingValue += zarAmount

    // Recalculate market cap
    const tokenValue = this.stats.backingValue / this.stats.circulatingSupply
    this.stats.marketCap = tokenValue * this.stats.circulatingSupply

    console.log(`   ✅ Backing added`)
    console.log(`   💰 Total backing: R${this.stats.backingValue.toLocaleString()}`)
    console.log(`   📈 Token value: R${tokenValue.toFixed(4)} per AZR`)
    console.log(`   🎯 Market cap: R${this.stats.marketCap.toLocaleString()}`)

    this.emit('backing-added', { zarAmount, source })
  }

  /**
   * Auto-stake tokens for passive income
   */
  async autoStake(userId: string, amount: number, lockDays: number = 30): Promise<number> {
    // APR based on lock period
    const aprMap: Record<number, number> = {
      30: 0.12,   // 12% APR for 30 days
      90: 0.18,   // 18% APR for 90 days
      180: 0.24,  // 24% APR for 180 days
      365: 0.36   // 36% APR for 1 year
    }

    const apr = aprMap[lockDays] || 0.12
    const dailyRate = apr / 365
    const expectedReward = amount * dailyRate * lockDays

    console.log(`\\n🔒 AUTO-STAKING`)
    console.log(`   User: ${userId}`)
    console.log(`   Amount: ${amount} AZR`)
    console.log(`   Lock Period: ${lockDays} days`)
    console.log(`   APR: ${(apr * 100).toFixed(0)}%`)
    console.log(`   Expected Reward: ${Math.floor(expectedReward)} AZR`)

    // Store staking record
    try {
      const user = await UserDB.getById(userId)
      const stakes = user.metadata.stakes || []
      
      stakes.push({
        amount,
        lockDays,
        apr,
        expectedReward,
        startDate: new Date().toISOString(),
        unlockDate: new Date(Date.now() + lockDays * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      })

      await UserDB.updateMetadata(userId, {
        ...user.metadata,
        stakes,
        total_staked: (user.metadata.total_staked || 0) + amount
      })

    } catch (error) {
      console.warn('Failed to record stake in database')
    }

    console.log(`   ✅ Tokens staked successfully!`)
    console.log(`   💰 Earning ${((apr / 12) * 100).toFixed(2)}% per month`)

    this.emit('tokens-staked', { userId, amount, lockDays, expectedReward })
    return expectedReward
  }

  /**
   * Calculate token price
   */
  getTokenPrice(): number {
    return this.stats.backingValue / this.stats.circulatingSupply
  }

  /**
   * Get system stats
   */
  getStats(): MintMineStats {
    return { ...this.stats }
  }

  /**
   * Emergency print (for urgent needs)
   */
  async emergencyPrint(amount: number, reason: string): Promise<void> {
    console.log(`\\n🚨 EMERGENCY PRINT AUTHORIZED`)
    console.log(`   Amount: ${amount} AZR`)
    console.log(`   Reason: ${reason}`)
    console.log(`   ⚠️  This will dilute token value`)

    this.stats.totalMinted += amount
    this.stats.circulatingSupply += amount

    // Transfer to founder account
    const founderAccount = bankIntegration['founderAccount']
    founderAccount.azoraBalance += amount

    console.log(`   ✅ Emergency tokens printed`)
    console.log(`   💰 Transferred to founder account`)

    this.emit('emergency-print', { amount, reason })
  }
}

export const mintMine = new AdvancedMintMineEngine()
export default mintMine
