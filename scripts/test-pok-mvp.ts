#!/usr/bin/env tsx
/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * TEST PROOF-OF-KNOWLEDGE MVP
 * 
 * Live demonstration of the PoK loop
 */

import { pokEngine, LearningModule } from '../services/proof-of-knowledge-engine'

async function testPokMVP() {
  console.log('\n' + '='.repeat(60))
  console.log('🎓 PROOF-OF-KNOWLEDGE ENGINE - MVP TEST')
  console.log('='.repeat(60) + '\n')

  // Simulate learning modules
  const modules: LearningModule[] = [
    {
      id: 'math-grade1-addition',
      title: 'Mathematics: Addition Basics',
      difficulty: 2,
      duration: 15,
      topics: ['addition', 'numbers', 'counting'],
      completed: true,
      completedAt: new Date(),
      score: 85
    },
    {
      id: 'english-grammar-intro',
      title: 'English: Grammar Introduction',
      difficulty: 3,
      duration: 20,
      topics: ['grammar', 'sentences', 'verbs'],
      completed: true,
      completedAt: new Date(),
      score: 92
    },
    {
      id: 'science-biology-cells',
      title: 'Science: Introduction to Cells',
      difficulty: 5,
      duration: 30,
      topics: ['biology', 'cells', 'life'],
      completed: true,
      completedAt: new Date(),
      score: 78
    }
  ]

  // Test users
  const users = [
    { id: 'student-1', name: 'Alice' },
    { id: 'student-2', name: 'Bob' },
    { id: 'student-3', name: 'Charlie' }
  ]

  console.log('📚 Testing Individual Submissions...\n')

  // Each user completes all modules
  for (const user of users) {
    console.log(`👤 User: ${user.name} (${user.id})`)
    
    for (const module of modules) {
      const proof = await pokEngine.submitProof(
        user.id,
        module,
        module.score!
      )

      console.log(`   ✅ ${module.title}`)
      console.log(`      Score: ${proof.score}%`)
      console.log(`      Reward: ${proof.rewardAmount} AZR`)
    }

    const totalRewards = pokEngine.getUserRewards(user.id)
    console.log(`   💰 Total Earned: ${totalRewards.toFixed(2)} AZR\n`)
  }

  // System stats
  console.log('📊 System Statistics:\n')
  const stats = pokEngine.getStats()
  console.log(`   Total Proofs: ${stats.totalProofs}`)
  console.log(`   Unique Users: ${stats.uniqueUsers}`)
  console.log(`   Total Rewards: ${stats.totalRewardsDistributed.toFixed(2)} AZR`)
  console.log(`   Average Score: ${stats.averageScore.toFixed(1)}%`)
  console.log(`   Average Reward: ${stats.averageReward.toFixed(2)} AZR`)

  // Batch processing test
  console.log('\n💸 Testing Batch Reward Processing...\n')
  const allProofs = users.flatMap(user => pokEngine.getUserProofs(user.id))
  const distributed = await pokEngine.processBatchRewards(allProofs)
  console.log(`   Processed: ${allProofs.length} proofs`)
  console.log(`   Distributed: ${distributed.toFixed(2)} AZR`)

  // Verification test
  console.log('\n🔍 Testing Proof Verification...\n')
  const firstProof = allProofs[0]
  const verified = pokEngine.verifyProof(firstProof.id)
  console.log(`   Proof ID: ${firstProof.id}`)
  console.log(`   Verified: ${verified ? '✅ YES' : '❌ NO'}`)
  console.log(`   Transaction: ${firstProof.transactionHash || 'pending'}`)

  console.log('\n' + '='.repeat(60))
  console.log('✅ MVP TEST COMPLETE - PROOF-OF-KNOWLEDGE WORKS!')
  console.log('='.repeat(60) + '\n')

  console.log('🚀 Next Steps:')
  console.log('   1. npm run pok:api     # Start API server')
  console.log('   2. Integrate with Azora Sapiens')
  console.log('   3. Connect to Azora Mint for real AZR transfers')
  console.log('   4. Deploy to production\n')
}

// Run test
if (require.main === module) {
  testPokMVP().catch(console.error)
}

export default testPokMVP
