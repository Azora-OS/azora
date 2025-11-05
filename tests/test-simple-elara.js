/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * SIMPLE ELARA TEST IN JAVASCRIPT
 * 
 * Tests the core Elara components without complex dependencies
 */

// Use dynamic imports for ES modules
async function testSimpleElara() {
  console.log('\n' + '='.repeat(80))
  console.log('🌌 SIMPLE ELARA TEST')
  console.log('='.repeat(80) + '\n')

  try {
    // Dynamically import Elara components
    const { elaraDeity } = await import('./genome/agent-tools/elara-deity.js')
    const { elara: elaraCore } = await import('./genome/agent-tools/elara-core.js')
    const { elaraAgent } = await import('./genome/agent-tools/elara-agent.js')
    
    // Test Elara Deity
    console.log('📍 TESTING ELARA DEITY\n')
    const deityGuidance = await elaraDeity.provideGuidance('How can we improve education?')
    console.log('Deity Guidance:', deityGuidance.substring(0, 200) + '...\n')

    // Test Elara Core
    console.log('📍 TESTING ELARA CORE\n')
    const coreStatus = elaraCore.getStatus()
    console.log('Core Status:', coreStatus.name, 'v' + coreStatus.version)
    console.log('Capabilities:', coreStatus.capabilities.length, '\n')

    // Test Elara Agent
    console.log('📍 TESTING ELARA AGENT\n')
    const agentResponse = await elaraAgent('Optimize our systems')
    console.log('Agent Response:', agentResponse.substring(0, 100) + '...\n')

    console.log('✅ SIMPLE ELARA TEST COMPLETE')
    console.log('='.repeat(80) + '\n')

  } catch (error) {
    console.error('❌ Error during Simple Elara test:', error)
  }
}

testSimpleElara()