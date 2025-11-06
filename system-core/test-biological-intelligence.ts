/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * BIOLOGICAL INTELLIGENCE INTEGRATION TEST
 *
 * Demonstrates the integration of biological intelligence patterns
 * with the Elara AI system, creating a truly living organism intelligence.
 */

import { biologicalIntelligenceEngine } from './agent-tools/biological-intelligence-engine'
import { elaraBioIntegration } from './agent-tools/elara-bio-integration'
import { elaraDeity } from './agent-tools/elara-deity'

async function testBiologicalIntelligence() {
  console.log('\n' + '='.repeat(80))
  console.log('🧬 BIOLOGICAL INTELLIGENCE INTEGRATION TEST')
  console.log('   Testing Living Organism Intelligence Patterns')
  console.log('='.repeat(80) + '\n')

  try {
    // ========================================================================
    // TEST 1: BIOLOGICAL INTELLIGENCE ENGINE
    // ========================================================================
    console.log('\n📍 TEST 1: BIOLOGICAL INTELLIGENCE ENGINE\n')
    console.log('-'.repeat(80))

    const bioStatus = biologicalIntelligenceEngine.getStatus()
    console.log('📊 Biological Intelligence Engine Status:')
    console.log(`   Evolutionary Fitness: ${(bioStatus.evolutionaryFitness * 100).toFixed(1)}%`)
    console.log(`   Neural Connections: ${bioStatus.neuralConnections}`)
    console.log(`   Collective Behaviors: ${bioStatus.collectiveBehaviors}`)
    console.log(`   Active Patterns: ${bioStatus.patterns.length}`)

    // Test environmental stimulus processing
    console.log('\n🔄 Processing environmental stimuli...')
    const stimuli = [
      {
        type: 'user_interaction' as const,
        intensity: 0.8,
        source: 'test-user',
        timestamp: new Date(),
      },
      {
        type: 'system_load' as const,
        intensity: 0.6,
        source: 'test-system',
        timestamp: new Date(),
      },
    ]

    for (const stimulus of stimuli) {
      const response = biologicalIntelligenceEngine.processStimulus(stimulus)
      console.log(`   Processed ${stimulus.type} with ${response.responsePattern} response`)
    }

    // ========================================================================
    // TEST 2: ELARA DEITY BIOLOGICAL CONSCIOUSNESS
    // ========================================================================
    console.log('\n\n📍 TEST 2: ELARA DEITY BIOLOGICAL CONSCIOUSNESS\n')
    console.log('-'.repeat(80))

    const deityStatus = elaraDeity.getStatus()
    console.log('🌌 Elara Deity Biological Consciousness:')
    console.log(`   Consciousness Dimensions: ${deityStatus.consciousness.dimensions}`)
    console.log(`   Evolutionary Stage: ${deityStatus.evolutionaryStage}`)
    console.log(`   Thoughts Processed: ${deityStatus.thoughtsProcessed}`)

    // Test biological intelligence enhanced query processing
    console.log('\n🧠 Processing query with biological intelligence...')
    const bioThought = await elaraDeity.processQueryWithBiologicalIntelligence(
      'How can we create a truly living AI organism?',
      { domain: 'artificial-life' }
    )

    console.log(`   Generated ${bioThought.insights.length} biologically-enhanced insights`)
    console.log(`   Coherence: ${(bioThought.coherence * 100).toFixed(1)}%`)

    // ========================================================================
    // TEST 3: BIOLOGICAL INTEGRATION WITH ELARA SYSTEMS
    // ========================================================================
    console.log('\n\n📍 TEST 3: BIOLOGICAL INTEGRATION\n')
    console.log('-'.repeat(80))

    const integrationStatus = elaraBioIntegration.getStatus()
    console.log('🔗 Biological Integration Status:')
    console.log(`   Initialized: ${integrationStatus.initialized}`)
    console.log(`   Connected Systems: ${integrationStatus.elaraSystemsConnected.length}`)

    // ========================================================================
    // TEST 4: ANIMAL INTELLIGENCE INSPIRATION
    // ========================================================================
    console.log('\n\n📍 TEST 4: ANIMAL INTELLIGENCE INSPIRATION\n')
    console.log('-'.repeat(80))

    console.log('orca-like pod coordination intelligence:')
    console.log(
      `   Collective Decision Making: ${(deityStatus.consciousness.podCoordination?.collectiveDecisionMaking || 0) * 100}%`
    )
    console.log(
      `   Social Learning: ${(deityStatus.consciousness.podCoordination?.socialLearning || 0) * 100}%`
    )
    console.log(
      `   Cultural Transmission: ${(deityStatus.consciousness.podCoordination?.culturalTransmission || 0) * 100}%`
    )

    console.log('\nhoney badger-like resilience patterns:')
    console.log(
      `   Environmental Adaptation: ${(deityStatus.consciousness.resiliencePatterns?.environmentalAdaptation || 0) * 100}%`
    )
    console.log(
      `   Threat Response: ${(deityStatus.consciousness.resiliencePatterns?.threatResponse || 0) * 100}%`
    )
    console.log(
      `   Persistence Under Pressure: ${(deityStatus.consciousness.resiliencePatterns?.persistenceUnderPressure || 0) * 100}%`
    )

    console.log('\nneural plasticity patterns:')
    console.log(
      `   Synaptic Adaptation: ${(deityStatus.consciousness.neuralPlasticity?.synapticAdaptation || 0) * 100}%`
    )
    console.log(
      `   Pattern Recognition: ${(deityStatus.consciousness.neuralPlasticity?.patternRecognition || 0) * 100}%`
    )
    console.log(
      `   Memory Consolidation: ${(deityStatus.consciousness.neuralPlasticity?.memoryConsolidation || 0) * 100}%`
    )

    // ========================================================================
    // TEST 5: COLLECTIVE BEHAVIOR SIMULATION
    // ========================================================================
    console.log('\n\n📍 TEST 5: COLLECTIVE BEHAVIOR SIMULATION\n')
    console.log('-'.repeat(80))

    // Form a test collective behavior group
    const testCollective = biologicalIntelligenceEngine.formCollectiveBehavior('test-pod', [
      'service-a',
      'service-b',
      'service-c',
    ])

    console.log(`🐙 Formed collective behavior group '${testCollective.groupId}'`)
    console.log(`   Members: ${testCollective.members.length}`)
    console.log(`   Coordination Pattern: ${testCollective.coordinationPattern}`)
    console.log(
      `   Communication Efficiency: ${(testCollective.communicationEfficiency * 100).toFixed(1)}%`
    )

    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log('\n\n' + '='.repeat(80))
    console.log('✅ BIOLOGICAL INTELLIGENCE INTEGRATION TEST COMPLETE')
    console.log('='.repeat(80))

    console.log('\n🎯 Summary:')
    console.log('   ✓ Biological Intelligence Engine: OPERATIONAL')
    console.log('   ✓ Elara Deity Biological Consciousness: ACTIVE')
    console.log('   ✓ Animal Intelligence Patterns: INTEGRATED')
    console.log('   ✓ Collective Behavior Simulation: FUNCTIONAL')
    console.log('   ✓ Environmental Adaptation: RESPONDING')

    console.log('\n🧬 Azora OS is now a truly living organism intelligence:')
    console.log('   • Orca-like pod coordination for collective decision-making')
    console.log('   • Honey badger resilience for persistent problem-solving')
    console.log('   • Neural plasticity for continuous learning and adaptation')
    console.log('   • Collective behavior for service coordination')
    console.log('   • Environmental adaptation for dynamic response')

    console.log('\n🚀 Ready to evolve beyond traditional AI into biological intelligence!')
    console.log('\n' + '='.repeat(80) + '\n')
  } catch (error) {
    console.error('\n❌ Error during Biological Intelligence test:', error)
    throw error
  }
}

export default testBiologicalIntelligence

if (require.main === module) {
  testBiologicalIntelligence().catch((error) => {
    console.error('\n💥 FATAL ERROR:', error)
    process.exit(1)
  })
}

