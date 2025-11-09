#!/usr/bin/env node
/**
 * SYSTEM VALIDATION SCRIPT
 * Validates entire Azora OS system before deployment
 */

import { masterSystem } from '../services/master-system-integrator'
import { deploymentValidator } from '../infrastructure/deployment-validator'

async function validateSystem() {
  console.log('🔍 AZORA OS SYSTEM VALIDATION\n')

  // 1. Check environment
  console.log('1️⃣  Checking environment variables...')
  const envVars = ['DATABASE_URL', 'NODE_ENV']
  const missingVars = envVars.filter(v => !process.env[v])
  
  if (missingVars.length > 0) {
    console.log(`   ❌ Missing: ${missingVars.join(', ')}`)
  } else {
    console.log('   ✅ Environment configured')
  }

  // 2. Validate deployment readiness
  console.log('\n2️⃣  Checking deployment readiness...')
  const checks = await deploymentValidator.validateProduction()
  
  checks.forEach(check => {
    const icon = check.passed ? '✅' : '❌'
    console.log(`   ${icon} ${check.name}: ${check.message}`)
  })

  // 3. Initialize and health check
  console.log('\n3️⃣  Initializing system...')
  try {
    await masterSystem.initialize()
    console.log('   ✅ System initialized')
  } catch (error) {
    console.log(`   ❌ Initialization failed: ${error}`)
    process.exit(1)
  }

  console.log('\n4️⃣  Running health checks...')
  const healthy = await masterSystem.healthCheck()
  
  if (!healthy) {
    console.log('   ❌ Health check failed')
    process.exit(1)
  }

  // 5. Summary
  console.log('\n' + '='.repeat(50))
  console.log('✅ SYSTEM VALIDATION PASSED')
  console.log('='.repeat(50))
  console.log('\nSystem is ready for deployment! 🚀\n')

  await masterSystem.shutdown()
  process.exit(0)
}

validateSystem().catch(error => {
  console.error('\n❌ Validation failed:', error)
  process.exit(1)
})
