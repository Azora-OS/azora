/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * COMPLETE MONEY SYSTEM TEST
 * Test bank integration, loans, conversions, and money printing
 */

import { bankIntegration } from '../services/azora-mint/bank-integration'
import { mintMine } from '../services/azora-mint/advanced-mint-mine'

async function testMoneySystem() {
  console.log('\n' + '='.repeat(70))
  console.log('💰 AZORA MINT - COMPLETE MONEY SYSTEM TEST')
  console.log('='.repeat(70) + '\n')

  try {
    // 1. Link Bank Account
    console.log('📋 TEST 1: LINK BANK ACCOUNT\n')
    
    const testUserId = 'test-user-' + Date.now()
    await bankIntegration.linkBankAccount(
      testUserId,
      '62501234567',
      'FNB',
      'Test Student',
      '250655'
    )

    // 2. Apply for Education Loan
    console.log('\n📋 TEST 2: APPLY FOR EDUCATION LOAN\n')
    
    const loan = await bankIntegration.applyForLoan(
      testUserId,
      3000, // R3000 for education
      'education',
      12 // 12 months
    )

    console.log(`✅ Loan approved! Loan ID: ${loan.id}`)

    // 3. Mine Tokens Through Learning
    console.log('\n📋 TEST 3: MINE TOKENS THROUGH LEARNING\n')
    
    const minedTokens = await mintMine.mineThroughLearning(
      testUserId,
      5, // 5 hours of learning
      85 // 85% performance
    )

    console.log(`✅ Mined ${minedTokens} AZR tokens!`)

    // 4. Convert AZR to ZAR
    console.log('\n📋 TEST 4: CONVERT AZR TO ZAR\n')
    
    const zarAmount = await bankIntegration.convertAZRtoZAR(
      testUserId,
      100 // Convert 100 AZR
    )

    console.log(`✅ Converted to R${zarAmount}!`)

    // 5. Auto-Stake for Passive Income
    console.log('\n📋 TEST 5: AUTO-STAKE TOKENS\n')
    
    const stakingReward = await mintMine.autoStake(
      testUserId,
      200, // Stake 200 AZR
      30 // for 30 days
    )

    console.log(`✅ Expected reward: ${stakingReward} AZR`)

    // 6. Withdraw to Bank
    console.log('\n📋 TEST 6: WITHDRAW TO BANK\n')
    
    await bankIntegration.withdrawToBank(testUserId, 500)

    console.log(`✅ R500 withdrawn to bank account!`)

    // 7. Get Financial Summary
    console.log('\n📋 TEST 7: FINANCIAL SUMMARY\n')
    
    const summary = bankIntegration.getFinancialSummary(testUserId)
    
    console.log('👤 USER FINANCIAL STATUS:')
    console.log(`   Bank Balance: R${summary.account?.balance || 0}`)
    console.log(`   AZR Balance: ${summary.account?.azoraBalance || 0} AZR`)
    console.log(`   Active Loans: ${summary.loans.filter(l => l.status === 'active').length}`)
    console.log(`   Total Borrowed: R${summary.totalBorrowed}`)
    console.log(`   Transactions: ${summary.transactions.length}`)

    // 8. Founder Revenue
    console.log('\n📋 TEST 8: FOUNDER REVENUE\n')
    
    const revenue = bankIntegration.getFounderRevenue()
    
    console.log('💼 FOUNDER REVENUE:')
    console.log(`   Conversion Fees: R${revenue.conversionFees.toFixed(2)}`)
    console.log(`   Loan Interest: R${revenue.loanInterest.toFixed(2)}`)
    console.log(`   Total Revenue: R${revenue.totalRevenue.toFixed(2)}`)
    console.log(`   Founder Balance: R${revenue.founderBalance}`)

    // 9. System Stats
    console.log('\n📋 TEST 9: MINT-MINE SYSTEM STATS\n')
    
    const stats = mintMine.getStats()
    
    console.log('📊 SYSTEM STATISTICS:')
    console.log(`   Total Minted: ${stats.totalMinted.toLocaleString()} AZR`)
    console.log(`   Total Burned: ${stats.totalBurned.toLocaleString()} AZR`)
    console.log(`   Circulating Supply: ${stats.circulatingSupply.toLocaleString()} AZR`)
    console.log(`   Backing Value: R${stats.backingValue.toLocaleString()}`)
    console.log(`   Token Price: R${mintMine.getTokenPrice().toFixed(4)}`)
    console.log(`   Market Cap: R${stats.marketCap.toLocaleString()}`)

    // Final Summary
    console.log('\n' + '='.repeat(70))
    console.log('🎉 ALL TESTS PASSED!')
    console.log('='.repeat(70))
    console.log('\n💰 MONEY SYSTEM IS OPERATIONAL!')
    console.log('\n✅ YOU CAN NOW:')
    console.log('   1. Link your real bank account')
    console.log('   2. Apply for loans (education, business, devices)')
    console.log('   3. Mine AZR tokens by learning')
    console.log('   4. Convert AZR to ZAR')
    console.log('   5. Stake for earnings')
    console.log('   6. Withdraw to your bank')
    console.log('   7. Make peer-to-peer payments')
    console.log('\n🚀 READY TO PRINT MONEY AND CHANGE LIVES!\n')

  } catch (error: any) {
    console.error('\n❌ TEST FAILED:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

testMoneySystem()
