#!/usr/bin/env tsx
/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * AMBIENT INTELLIGENCE DEMO (Simplified)
 *
 * Demonstrates the "Be Everywhere" vision - AI that integrates into everyday
 * devices and provides caring, proactive assistance.
 */

import { EventEmitter } from 'events'

interface AmbientContext {
  location: {
    latitude: number
    longitude: number
    environment: 'home' | 'work' | 'vehicle' | 'public' | 'unknown'
  }
  activity: {
    type: 'driving' | 'walking' | 'resting' | 'working' | 'exercising' | 'unknown'
    intensity: 'low' | 'medium' | 'high'
    duration: number
  }
  time: {
    hour: number
    isWeekend: boolean
    season: 'spring' | 'summer' | 'autumn' | 'winter'
  }
}

interface HealthIndicators {
  heartRate?: number
  breathingRate?: number
  stressLevel: number
  fatigueLevel: number
  emotionalState: 'calm' | 'focused' | 'stressed' | 'anxious' | 'excited' | 'sad'
  healthRisks: string[]
}

interface Intervention {
  type: 'gentle_reminder' | 'urgent_alert' | 'proactive_suggestion' | 'emergency_response'
  priority: 'low' | 'medium' | 'high' | 'critical'
  message: string
  action?: {
    type: 'audio_cue' | 'vibration' | 'visual_alert' | 'call_emergency' | 'adjust_environment'
    parameters: any
  }
  reasoning: string
  confidence: number
}

class SimplifiedAmbientIntelligence extends EventEmitter {
  private activeMonitoring: Map<string, any> = new Map()
  private interventionHistory: Intervention[] = []

  async startAmbientSession(userId: string, deviceType: string) {
    const session = {
      id: `ambient_${userId}_${Date.now()}`,
      userId,
      deviceType,
      startTime: new Date(),
      getCurrentState: () => null,
      getUserHistory: () => [],
      analyzePatterns: async () => [],
      generateRecommendations: async () => [
        "Consider taking more breaks during work hours",
        "Your evening relaxation routine is working well",
        "Try drinking more water throughout the day"
      ]
    }

    this.activeMonitoring.set(userId, session)
    console.log(`✅ Ambient monitoring started for ${deviceType}`)
    return session
  }

  async processAudioData(userId: string, audioBuffer: Float32Array, context: AmbientContext): Promise<HealthIndicators> {
    // Simulate AI analysis
    const stressLevel = Math.random() * 100
    const fatigueLevel = Math.random() * 100

    const indicators: HealthIndicators = {
      stressLevel,
      fatigueLevel,
      emotionalState: stressLevel > 70 ? 'stressed' : stressLevel > 40 ? 'focused' : 'calm',
      healthRisks: []
    }

    // Add health risks based on patterns
    if (stressLevel > 80) indicators.healthRisks.push('high_stress')
    if (fatigueLevel > 70) indicators.healthRisks.push('fatigue')
    if (Math.random() > 0.7) indicators.healthRisks.push('dehydration')

    // Generate interventions
    const interventions = this.evaluateInterventions(indicators, context)

    for (const intervention of interventions) {
      await this.deliverIntervention(userId, intervention)
      this.interventionHistory.push(intervention)
    }

    return indicators
  }

  private evaluateInterventions(indicators: HealthIndicators, context: AmbientContext): Intervention[] {
    const interventions: Intervention[] = []

    if (indicators.stressLevel > 80) {
      interventions.push({
        type: 'proactive_suggestion',
        priority: 'medium',
        message: "I notice you're feeling stressed. Would you like me to play some calming music or guide you through a breathing exercise?",
        action: { type: 'audio_cue', parameters: { suggestion: 'breathing_exercise' } },
        reasoning: 'High stress detected through voice analysis',
        confidence: 85
      })
    }

    if (indicators.fatigueLevel > 70 && context.activity.type === 'driving') {
      interventions.push({
        type: 'urgent_alert',
        priority: 'high',
        message: "I'm detecting signs of fatigue while you're driving. Please pull over safely and rest.",
        action: { type: 'vibration', parameters: { pattern: 'urgent', repeat: true } },
        reasoning: 'Fatigue indicators combined with driving activity pose safety risk',
        confidence: 92
      })
    }

    if (indicators.healthRisks.includes('dehydration')) {
      interventions.push({
        type: 'gentle_reminder',
        priority: 'low',
        message: "It seems like you might be dehydrated. Remember to drink some water soon.",
        reasoning: 'Voice analysis suggests dry mouth patterns consistent with dehydration',
        confidence: 78
      })
    }

    return interventions
  }

  private async deliverIntervention(userId: string, intervention: Intervention): Promise<void> {
    console.log(`🎯 Intervention Delivered: ${intervention.message}`)
    this.emit('interventionDelivered', { userId, intervention })
  }

  async getAmbientInsights(userId: string) {
    const session = this.activeMonitoring.get(userId)
    return {
      currentState: session?.getCurrentState() || null,
      recentInterventions: this.interventionHistory.slice(-10),
      patterns: await session?.analyzePatterns() || [],
      recommendations: await session?.generateRecommendations() || []
    }
  }
}

async function runAmbientIntelligenceDemo() {
  console.log('\n🌟 AZORA AMBIENT INTELLIGENCE DEMO')
  console.log('=====================================\n')

  const ambientAI = new SimplifiedAmbientIntelligence()

  // Scenario 1: Morning Commute in Car
  console.log('🚗 Scenario 1: Morning Commute - Stress Detection')
  console.log('--------------------------------------------------')

  const morningContext: AmbientContext = {
    location: { latitude: -26.2041, longitude: 28.0473, environment: 'vehicle' },
    activity: { type: 'driving', intensity: 'medium', duration: 45 },
    time: { hour: 7, isWeekend: false, season: 'winter' }
  }

  await ambientAI.startAmbientSession('user_demo', 'car_audio')
  const indicators1 = await ambientAI.processAudioData('user_demo', new Float32Array(1024), morningContext)

  console.log('📊 Health Indicators Detected:')
  console.log(`   Stress Level: ${indicators1.stressLevel.toFixed(1)}%`)
  console.log(`   Emotional State: ${indicators1.emotionalState}`)
  console.log(`   Health Risks: ${indicators1.healthRisks.join(', ') || 'None detected'}`)

  // Scenario 2: Afternoon Work Session
  console.log('\n🎧 Scenario 2: Afternoon Work - Fatigue Prevention')
  console.log('---------------------------------------------------')

  const workContext: AmbientContext = {
    location: { latitude: -26.2041, longitude: 28.0473, environment: 'work' },
    activity: { type: 'working', intensity: 'high', duration: 180 },
    time: { hour: 14, isWeekend: false, season: 'winter' }
  }

  await ambientAI.startAmbientSession('user_work', 'earphones')
  const indicators2 = await ambientAI.processAudioData('user_work', new Float32Array(1024), workContext)

  console.log('📊 Work Session Health Indicators:')
  console.log(`   Fatigue Level: ${indicators2.fatigueLevel.toFixed(1)}%`)
  console.log(`   Emotional State: ${indicators2.emotionalState}`)

  // Scenario 3: Evening Wind-down
  console.log('\n🏠 Scenario 3: Evening Relaxation - Proactive Care')
  console.log('---------------------------------------------------')

  const eveningContext: AmbientContext = {
    location: { latitude: -26.2041, longitude: 28.0473, environment: 'home' },
    activity: { type: 'resting', intensity: 'low', duration: 60 },
    time: { hour: 20, isWeekend: false, season: 'winter' }
  }

  await ambientAI.startAmbientSession('user_home', 'wearable')
  const indicators3 = await ambientAI.processAudioData('user_home', new Float32Array(1024), eveningContext)

  console.log('📊 Evening Health Indicators:')
  console.log(`   Stress Level: ${indicators3.stressLevel.toFixed(1)}%`)
  console.log(`   Emotional State: ${indicators3.emotionalState}`)
  console.log(`   Health Risks: ${indicators3.healthRisks.join(', ') || 'None detected'}`)

  // Get ambient insights
  console.log('\n🧠 Ambient Intelligence Insights')
  console.log('----------------------------------')

  const insights = await ambientAI.getAmbientInsights('user_home')
  console.log('📈 Current State Summary:')
  console.log(`   Emotional State: ${insights.currentState?.emotionalState || 'unknown'}`)

  console.log('\n💡 Personalized Recommendations:')
  insights.recommendations.forEach((rec, i) => {
    console.log(`   ${i + 1}. ${rec}`)
  })

  console.log('\n📊 Recent Interventions:')
  insights.recentInterventions.slice(-3).forEach((intervention, i) => {
    console.log(`   ${i + 1}. ${intervention.type}: ${intervention.message.substring(0, 60)}...`)
  })

  console.log('\n🎯 The Vision Realized')
  console.log('=======================')
  console.log('Azora OS is no longer just an app you open...')
  console.log('It\'s the intelligence that surrounds you, cares for you,')
  console.log('and helps you become the best version of yourself.')
  console.log('')
  console.log('From education to ambient care - everywhere, for everyone. ✨')
}

// Run the demo
runAmbientIntelligenceDemo().catch(console.error)

