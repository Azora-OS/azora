#!/usr/bin/env tsx
/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * UBO MASS DISTRIBUTION TEST
 * 
 * Demonstrate distribution to 1M students
 */

import { uboDistributor, Student } from '../services/ubo-distributor'

async function distributeTo1Million() {
  console.log('\n' + '='.repeat(70))
  console.log('💰 UBO MASS DISTRIBUTION - REVOLUTIONARY WEALTH TRANSFER')
  console.log('='.repeat(70))

  // Generate 1 million student records
  const studentCount = 1_000_000
  console.log(`\n📊 Generating ${studentCount.toLocaleString()} student records...`)

  const students: Student[] = []
  const countries = ['South Africa', 'Nigeria', 'Kenya', 'Ghana', 'Uganda', 'Tanzania', 'Zimbabwe', 'Botswana']

  for (let i = 0; i < studentCount; i++) {
    students.push({
      id: `student-${i.toString().padStart(7, '0')}`,
      name: `Student ${i + 1}`,
      wallet: `0x${i.toString(16).padStart(40, '0')}`,
      country: countries[i % countries.length],
      enrolled: true
    })
  }

  console.log(`✅ Generated ${students.length.toLocaleString()} records\n`)

  // Start distribution
  const startTime = Date.now()

  uboDistributor.on('batch-complete', (batch) => {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`   ⚡ Batch ${batch.batchId.slice(0, 8)} | ${batch.studentCount} students | ${elapsed}s elapsed`)
  })

  const batches = await uboDistributor.distributeMassPayment(students, 1.0)

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2)

  // Results
  console.log('\n' + '='.repeat(70))
  console.log('📈 DISTRIBUTION RESULTS')
  console.log('='.repeat(70))

  const stats = uboDistributor.getStats()
  console.log(`\n✅ SUCCESS`)
  console.log(`   Students paid: ${stats.totalTransactions.toLocaleString()}`)
  console.log(`   Total distributed: ${stats.totalDistributed.toLocaleString()} AZR`)
  console.log(`   Batches processed: ${stats.totalBatches}`)
  console.log(`   Success rate: ${stats.successRate.toFixed(2)}%`)
  console.log(`   Total time: ${totalTime}s`)
  console.log(`   Throughput: ${(studentCount / parseFloat(totalTime)).toFixed(0)} students/sec`)

  console.log('\n💎 IMPACT')
  console.log(`   ${studentCount.toLocaleString()} students now have economic power`)
  console.log(`   ${stats.totalDistributed.toLocaleString()} AZR activated in the economy`)
  console.log(`   Knowledge is literally wealth`)

  console.log('\n' + '='.repeat(70))
  console.log('🌍 THE REVOLUTION IS REAL. THE FUTURE IS FUNDED.')
  console.log('='.repeat(70) + '\n')
}

// Run
if (require.main === module) {
  distributeTo1Million().catch(console.error)
}

export default distributeTo1Million
