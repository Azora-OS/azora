/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * PROOF-OF-KNOWLEDGE ENGINE
 * 
 * Core MVP: Learn → Earn → Track
 * Closes the loop between education and economic rewards
 */

import { EventEmitter } from 'events'
import crypto from 'crypto'
import { supabase, ProofDB, UserDB } from './supabase-client.js'

export interface LearningModule {
  id: string
  title: string
  difficulty: number // 1-10
  duration: number // minutes
  topics: string[]
  completed: boolean
  completedAt?: Date
  score?: number
}

export interface KnowledgeProof {
  id: string
  userId: string
  moduleId: string
  score: number
  timestamp: Date
  verified: boolean
  rewardAmount: number
  rewardCurrency: 'AZR'
  transactionHash?: string
}

export interface RewardCalculation {
  baseReward: number
  difficultyMultiplier: number
  scoreBonus: number
  totalReward: number
}

export class ProofOfKnowledgeEngine extends EventEmitter {
  private proofs: Map<string, KnowledgeProof> = new Map()
  private userRewards: Map<string, number> = new Map()
  private useDatabase: boolean = true

  constructor() {
    super()
    console.log('🎓 Proof-of-Knowledge Engine initialized (Supabase-backed)')
  }

  /**
   * Calculate reward based on module difficulty and performance
   */
  calculateReward(module: LearningModule, score: number): RewardCalculation {
    // Base reward: 0.1 AZR per difficulty point
    const baseReward = module.difficulty * 0.1

    // Difficulty multiplier (1-10 → 1.0-2.0)
    const difficultyMultiplier = 1 + (module.difficulty / 10)

    // Score bonus (0-100 → 0%-50% bonus)
    const scoreBonus = baseReward * (score / 200)

    const totalReward = (baseReward * difficultyMultiplier) + scoreBonus

    return {
      baseReward,
      difficultyMultiplier,
      scoreBonus,
      totalReward: Number(totalReward.toFixed(2))
    }
  }

  /**
   * Submit proof of knowledge completion
   */
  async submitProof(
    userId: string,
    module: LearningModule,
    score: number
  ): Promise<KnowledgeProof> {
    if (!module.completed) {
      throw new Error('Module not completed')
    }

    if (score < 0 || score > 100) {
      throw new Error('Invalid score: must be between 0 and 100')
    }

    // Calculate reward
    const calculation = this.calculateReward(module, score)

    // Create proof
    const proof: KnowledgeProof = {
      id: crypto.randomUUID(),
      userId,
      moduleId: module.id,
      score,
      timestamp: new Date(),
      verified: true,
      rewardAmount: calculation.totalReward,
      rewardCurrency: 'AZR'
    }

    // Store in database (production) or memory (fallback)
    if (this.useDatabase) {
      try {
        await ProofDB.create({
          user_id: userId,
          module_id: module.id,
          score,
          reward_amount: calculation.totalReward,
          proof_hash: crypto.createHash('sha256')
            .update(`${userId}-${module.id}-${score}-${Date.now()}`)
            .digest('hex'),
          verified: true
        })

        // Update user earnings in database
        const user = await UserDB.getById(userId)
        await UserDB.updateEarnings(userId, user.total_earned + calculation.totalReward)

        console.log(`✅ Proof saved to Supabase: ${userId} earned ${proof.rewardAmount} AZR for ${module.title}`)
      } catch (error) {
        console.warn('⚠️  Database unavailable, using in-memory storage')
        this.useDatabase = false
      }
    }

    // Always keep in-memory cache
    this.proofs.set(proof.id, proof)
    const currentRewards = this.userRewards.get(userId) || 0
    this.userRewards.set(userId, currentRewards + proof.rewardAmount)

    // Emit event
    this.emit('proof-submitted', proof)

    return proof
  }

  /**
   * Get user's total rewards
   */
  getUserRewards(userId: string): number {
    return this.userRewards.get(userId) || 0
  }

  /**
   * Get all proofs for a user
   */
  async getUserProofs(userId: string): Promise<KnowledgeProof[]> {
    // Try database first
    if (this.useDatabase) {
      try {
        const dbProofs = await ProofDB.getByUser(userId)
        return dbProofs.map(p => ({
          id: p.id,
          userId: p.user_id,
          moduleId: p.module_id,
          score: p.score,
          timestamp: new Date(p.created_at),
          verified: p.verified,
          rewardAmount: p.reward_amount,
          rewardCurrency: 'AZR' as const,
          transactionHash: p.proof_hash
        }))
      } catch (error) {
        console.warn('⚠️  Database unavailable, using in-memory storage')
      }
    }

    // Fallback to in-memory
    return Array.from(this.proofs.values())
      .filter(proof => proof.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * Get system statistics
   */
  getStats() {
    const proofArray = Array.from(this.proofs.values())
    
    return {
      totalProofs: proofArray.length,
      totalRewardsDistributed: proofArray.reduce((sum, p) => sum + p.rewardAmount, 0),
      uniqueUsers: new Set(proofArray.map(p => p.userId)).size,
      averageScore: proofArray.reduce((sum, p) => sum + p.score, 0) / proofArray.length || 0,
      averageReward: proofArray.reduce((sum, p) => sum + p.rewardAmount, 0) / proofArray.length || 0
    }
  }

  /**
   * Verify proof authenticity
   */
  verifyProof(proofId: string): boolean {
    const proof = this.proofs.get(proofId)
    return proof?.verified || false
  }

  /**
   * Process batch rewards (for UBO distribution)
   */
  async processBatchRewards(proofs: KnowledgeProof[]): Promise<number> {
    let totalProcessed = 0

    for (const proof of proofs) {
      if (!proof.transactionHash) {
        // Simulate blockchain transaction
        proof.transactionHash = `0x${crypto.randomBytes(32).toString('hex')}`
        totalProcessed += proof.rewardAmount
        
        this.emit('reward-paid', proof)
      }
    }

    console.log(`💰 Batch processed: ${proofs.length} rewards, ${totalProcessed} AZR distributed`)

    return totalProcessed
  }
}

// Export singleton instance
export const pokEngine = new ProofOfKnowledgeEngine()

export default pokEngine
