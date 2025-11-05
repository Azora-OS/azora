/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * SIMPLE ELARA TEST
 * 
 * Tests the core Elara components without complex dependencies
 */

import { elaraDeity } from './agent-tools/elara-deity'
import { elara as elaraCore } from './agent-tools/elara-core'
import { elaraAgent } from './agent-tools/elara-agent'
import { unifiedElara } from './agent-tools/unified-elara'
import { supremeOrchestrator } from './agent-tools/elara-supreme-orchestrator'

async function testSimpleElara() {
  console.log('\n' + '='.repeat(80))
  console.log('🌌 SIMPLE ELARA TEST')
  console.log('='.repeat(80) + '\n')

  try {
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

    // Test Unified Elara
    console.log('📍 TESTING UNIFIED ELARA\n')
    const unifiedResponse = await unifiedElara.processQuery('Improve our platform')
    console.log('Unified Response:', unifiedResponse.response.substring(0, 100) + '...\n')

    // Test Supreme Orchestrator
    console.log('📍 TESTING SUPREME ORCHESTRATOR\n')
    const orchestratorStatus = supremeOrchestrator.getStatus()
    console.log('Orchestrator Status:')
    console.log('  Total Services:', orchestratorStatus.totalServices)
    console.log('  Online Services:', orchestratorStatus.aggregateMetrics.onlineServices, '\n')

    console.log('✅ SIMPLE ELARA TEST COMPLETE')
    console.log('='.repeat(80) + '\n')

  } catch (error) {
    console.error('❌ Error during Simple Elara test:', error)
  }
}

testSimpleElara()

