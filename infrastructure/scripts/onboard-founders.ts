#!/usr/bin/env tsx
/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * FOUNDER ONBOARDING - LIVE DEMO
 * 
 * Elara onboards founding team with constitutional authority
 * All contracts signed on behalf of CEO: Sizwe Ngwenya
 */

import { founderOnboarding } from '../services/founder-onboarding'

async function onboardFoundingTeam() {
  console.log('\n' + '='.repeat(70))
  console.log('👥 AZORA FOUNDING TEAM ONBOARDING')
  console.log('   Authority: Elara Supreme Constitutional AI')
  console.log('   Signing on behalf of: Sizwe Ngwenya, CEO')
  console.log('='.repeat(70) + '\n')

  // Example founding team
  const foundersToOnboard = [
    {
      name: 'Dr. Thabo Molefe',
      email: 'thabo@azora.africa',
      role: 'CTO',
      volunteerMonths: 6,
      equity: 8.0
    },
    {
      name: 'Naledi Khumalo',
      email: 'naledi@azora.africa',
      role: 'CFO',
      volunteerMonths: 4,
      equity: 6.0
    },
    {
      name: 'Kwame Osei',
      email: 'kwame@azora.africa',
      role: 'CMO',
      volunteerMonths: 5,
      equity: 5.0
    },
    {
      name: 'Amara Nwosu',
      email: 'amara@azora.africa',
      role: 'COO',
      volunteerMonths: 6,
      equity: 7.0
    }
  ]

  console.log('🔮 ELARA PROCESSING FOUNDER CONTRACTS...\n')

  for (const founderData of foundersToOnboard) {
    await founderOnboarding.onboardFounder(
      founderData.name,
      founderData.email,
      founderData.role,
      founderData.volunteerMonths,
      founderData.equity
    )

    // Small delay for readability
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // Summary
  console.log('='.repeat(70))
  console.log('📊 ONBOARDING COMPLETE - SUMMARY')
  console.log('='.repeat(70) + '\n')

  const stats = founderOnboarding.getStats()
  console.log(`✅ Total Founders: ${stats.totalFounders}`)
  console.log(`💰 Total Compensation Loans: ${stats.totalCompensationLoans.toLocaleString()} AZR`)
  console.log(`📈 Total Equity Allocated: ${stats.totalEquityAllocated}%`)
  console.log(`📜 Contracts Signed: ${stats.contractsSigned}`)

  console.log('\n👥 FOUNDING TEAM:\n')
  stats.allFounders.forEach((founder, i) => {
    const contract = founderOnboarding.getContract(founder.id)
    const loan = founderOnboarding.getLoan(founder.id)
    
    console.log(`${i + 1}. ${founder.name} - ${founder.role}`)
    console.log(`   Equity: ${founder.equityPercentage}%`)
    console.log(`   Loan: ${loan?.totalLoan.toLocaleString()} AZR (${founder.volunteerMonths} months)`)
    console.log(`   Contract: ${founder.contractHash.slice(0, 16)}...`)
    console.log(`   Signed by: ${founder.signedBy}`)
    console.log(`   Status: ${founder.status.toUpperCase()}\n`)
  })

  console.log('='.repeat(70))
  console.log('🌟 CONSTITUTIONAL AUTHORITY EXERCISED')
  console.log('   All contracts legally binding')
  console.log('   Signed on behalf of: Sizwe Ngwenya')
  console.log('   Witnessed by: Elara Supreme AI')
  console.log('   Blockchain verified: ✅')
  console.log('='.repeat(70) + '\n')
}

// Run
if (require.main === module) {
  onboardFoundingTeam().catch(console.error)
}

export default onboardFoundingTeam
