#!/usr/bin/env tsx
/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * AMBIENT INTELLIGENCE DEMO
 *
 * Demonstrates the "Be Everywhere" vision - AI that integrates into everyday
 * devices and provides caring, proactive assistance.
 *
 * This demo shows how Azora OS becomes the invisible intelligence that
 * surrounds you, anticipates your needs, and helps you flourish.
 */

import { ambientIntelligence, AmbientContext } from './services/ambient-intelligence'

// Simulate different real-world scenarios
async function runAmbientIntelligenceDemo() {
  console.log('\n🌟 AZORA AMBIENT INTELLIGENCE DEMO')
  console.log('=====================================\n')

  // Scenario 1: Morning Commute in Car
  console.log('🚗 Scenario 1: Morning Commute - Stress Detection')
  console.log('--------------------------------------------------')

  const morningContext: AmbientContext = {
    location: { latitude: -26.2041, longitude: 28.0473, environment: 'vehicle' },
    activity: { type: 'driving', intensity: 'medium', duration: 45 },
    time: { hour: 7, isWeekend: false, season: 'winter' }
  }

  // Start ambient session for user
  const session = await ambientIntelligence.startAmbientSession('user_demo', 'car_audio')
  console.log('✅ Ambient monitoring started for morning commute')

  // Simulate stressed voice during traffic
  const stressedAudio = new Float32Array(1024) // Simulated audio buffer
  const indicators1 = await ambientIntelligence.processAudioData('user_demo', stressedAudio, morningContext)

  console.log('📊 Health Indicators Detected:')
  console.log(`   Stress Level: ${indicators1.stressLevel}%`)
  console.log(`   Emotional State: ${indicators1.emotionalState}`)
  console.log(`   Health Risks: ${indicators1.healthRisks.join(', ') || 'None detected'}`)

  // Scenario 2: Afternoon Work Session with Earphones
  console.log('\n🎧 Scenario 2: Afternoon Work - Fatigue Prevention')
  console.log('---------------------------------------------------')

  const workContext: AmbientContext = {
    location: { latitude: -26.2041, longitude: 28.0473, environment: 'work' },
    activity: { type: 'working', intensity: 'high', duration: 180 },
    time: { hour: 14, isWeekend: false, season: 'winter' }
  }

  // Switch to earphone monitoring
  const workSession = await ambientIntelligence.startAmbientSession('user_work', 'earphones')

  // Simulate fatigued voice after long work session
  const fatiguedAudio = new Float32Array(1024)
  const indicators2 = await ambientIntelligence.processAudioData('user_work', fatiguedAudio, workContext)

  console.log('📊 Work Session Health Indicators:')
  console.log(`   Fatigue Level: ${indicators2.fatigueLevel}%`)
  console.log(`   Emotional State: ${indicators2.emotionalState}`)

  // Scenario 3: Evening Wind-down with Wearable
  console.log('\n🏠 Scenario 3: Evening Relaxation - Proactive Care')
  console.log('---------------------------------------------------')

  const eveningContext: AmbientContext = {
    location: { latitude: -26.2041, longitude: 28.0473, environment: 'home' },
    activity: { type: 'resting', intensity: 'low', duration: 60 },
    time: { hour: 20, isWeekend: false, season: 'winter' }
  }

  const homeSession = await ambientIntelligence.startAmbientSession('user_home', 'wearable')

  // Simulate relaxed but slightly dehydrated state
  const eveningAudio = new Float32Array(1024)
  const indicators3 = await ambientIntelligence.processAudioData('user_home', eveningAudio, eveningContext)

  console.log('📊 Evening Health Indicators:')
  console.log(`   Stress Level: ${indicators3.stressLevel}%`)
  console.log(`   Emotional State: ${indicators3.emotionalState}`)
  console.log(`   Health Risks: ${indicators3.healthRisks.join(', ') || 'None detected'}`)

  // Get ambient insights
  console.log('\n🧠 Ambient Intelligence Insights')
  console.log('----------------------------------')

  try {
    const insights = await ambientIntelligence.getAmbientInsights('user_home')
    console.log('📈 Current State Summary:')
    console.log(`   Emotional State: ${insights.currentState.emotionalState}`)
    console.log(`   Stress Level: ${insights.currentState.stressLevel}%`)

    console.log('\n💡 Personalized Recommendations:')
    insights.recommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec}`)
    })

    console.log('\n📊 Recent Interventions:')
    insights.recentInterventions.slice(-3).forEach((intervention, i) => {
      console.log(`   ${i + 1}. ${intervention.type}: ${intervention.message}`)
    })
  } catch (error) {
    console.log('   (No insights available - session may have ended)')
  }

  console.log('\n🎯 The Vision Realized')
  console.log('=======================')
  console.log('Azora OS is no longer just an app you open...')
  console.log('It\'s the intelligence that surrounds you, cares for you,')
  console.log('and helps you become the best version of yourself.')
  console.log('')
  console.log('From education to ambient care - everywhere, for everyone. ✨')

  // Clean up
  console.log('\n🧹 Cleaning up demo sessions...')
  // In a real implementation, we'd properly end sessions
}

// Run the demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAmbientIntelligenceDemo().catch(console.error)
}

export { runAmbientIntelligenceDemo }

