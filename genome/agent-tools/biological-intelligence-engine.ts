/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * BIOLOGICAL INTELLIGENCE ENGINE
 *
 * Implements bio-inspired adaptive intelligence patterns:
 * - Neural plasticity (synaptic strengthening/weakening)
 * - Collective intelligence (pod behavior simulation)
 * - Environmental adaptation (stimulus-response mechanisms)
 * - Evolutionary learning (genetic algorithm principles)
 * - Homeostatic balance (system equilibrium maintenance)
 */

import { EventEmitter } from 'events'

export interface BiologicalPattern {
  id: string
  type:
    | 'neural_plasticity'
    | 'collective_intelligence'
    | 'environmental_adaptation'
    | 'evolutionary_learning'
    | 'homeostatic_balance'
  strength: number // 0-1 scale
  adaptability: number // How quickly it adapts
  connections: string[] // Connected patterns
  lastActivation: Date
}

export interface NeuralConnection {
  source: string
  target: string
  weight: number // Connection strength 0-1
  lastFired: Date
  firingFrequency: number // Times per minute
}

export interface CollectiveBehavior {
  groupId: string
  members: string[] // Service IDs
  coordinationPattern: 'synchronous' | 'asynchronous' | 'hierarchical'
  communicationEfficiency: number // 0-1 scale
  collectiveIntelligenceScore: number // 0-1 scale
}

export interface EnvironmentalStimulus {
  type:
    | 'user_interaction'
    | 'system_load'
    | 'resource_availability'
    | 'external_api_response'
    | 'security_threat'
  intensity: number // 0-1 scale
  source: string
  timestamp: Date
}

export interface AdaptiveResponse {
  stimulusId: string
  responsePattern: string
  effectiveness: number // 0-1 scale
  adaptationSpeed: number // How quickly response was implemented
  timestamp: Date
}

export class BiologicalIntelligenceEngine extends EventEmitter {
  private patterns: Map<string, BiologicalPattern> = new Map()
  private neuralNetwork: Map<string, NeuralConnection> = new Map()
  private collectiveBehaviors: Map<string, CollectiveBehavior> = new Map()
  private stimulusHistory: EnvironmentalStimulus[] = []
  private responseHistory: AdaptiveResponse[] = []
  private evolutionaryFitness: number = 0.5 // System's current fitness score

  constructor() {
    super()
    this.initializeBiologicalPatterns()
    this.initializeNeuralNetwork()
    this.startAdaptationCycle()
  }

  /**
   * Initialize core biological intelligence patterns
   */
  private initializeBiologicalPatterns() {
    // Neural Plasticity Pattern
    this.patterns.set('neural_plasticity', {
      id: 'neural_plasticity',
      type: 'neural_plasticity',
      strength: 0.7,
      adaptability: 0.8,
      connections: ['environmental_adaptation', 'evolutionary_learning'],
      lastActivation: new Date(),
    })

    // Collective Intelligence Pattern
    this.patterns.set('collective_intelligence', {
      id: 'collective_intelligence',
      type: 'collective_intelligence',
      strength: 0.9,
      adaptability: 0.7,
      connections: ['homeostatic_balance', 'environmental_adaptation'],
      lastActivation: new Date(),
    })

    // Environmental Adaptation Pattern
    this.patterns.set('environmental_adaptation', {
      id: 'environmental_adaptation',
      type: 'environmental_adaptation',
      strength: 0.85,
      adaptability: 0.9,
      connections: ['neural_plasticity', 'collective_intelligence'],
      lastActivation: new Date(),
    })

    // Evolutionary Learning Pattern
    this.patterns.set('evolutionary_learning', {
      id: 'evolutionary_learning',
      type: 'evolutionary_learning',
      strength: 0.6,
      adaptability: 0.75,
      connections: ['neural_plasticity', 'homeostatic_balance'],
      lastActivation: new Date(),
    })

    // Homeostatic Balance Pattern
    this.patterns.set('homeostatic_balance', {
      id: 'homeostatic_balance',
      type: 'homeostatic_balance',
      strength: 0.8,
      adaptability: 0.6,
      connections: ['collective_intelligence', 'evolutionary_learning'],
      lastActivation: new Date(),
    })

    console.log('🧠 Biological Intelligence Engine: Core patterns initialized')
  }

  /**
   * Initialize neural network connections between services
   */
  private initializeNeuralNetwork() {
    // In a real implementation, this would connect actual services
    // For now, we'll create some example connections
    const services = [
      'elara-deity',
      'elara-core',
      'elara-agent',
      'supreme-orchestrator',
      'aegis-citadel',
      'azora-mint',
      'azora-sapiens',
      'azora-forge',
    ]

    // Create connections between services
    for (let i = 0; i < services.length; i++) {
      for (let j = i + 1; j < services.length; j++) {
        const connectionId = `${services[i]}->${services[j]}`
        this.neuralNetwork.set(connectionId, {
          source: services[i],
          target: services[j],
          weight: Math.random(),
          lastFired: new Date(),
          firingFrequency: Math.floor(Math.random() * 10),
        })
      }
    }

    console.log(
      `🔗 Biological Intelligence Engine: ${this.neuralNetwork.size} neural connections established`
    )
  }

  /**
   * Start the continuous adaptation cycle
   */
  private startAdaptationCycle() {
    setInterval(() => {
      this.adaptToEnvironment()
      this.strengthenNeuralConnections()
      this.optimizeCollectiveBehavior()
      this.evaluateEvolutionaryFitness()
    }, 30000) // Every 30 seconds

    console.log('🔄 Biological Intelligence Engine: Adaptation cycle started')
  }

  /**
   * Adapt to environmental stimuli
   */
  adaptToEnvironment() {
    // Simulate environmental adaptation
    const recentStimuli = this.stimulusHistory.slice(-10) // Last 10 stimuli

    if (recentStimimuli.length > 0) {
      // Calculate average stimulus intensity
      const avgIntensity =
        recentStimuli.reduce((sum, stimulus) => sum + stimulus.intensity, 0) / recentStimuli.length

      // Adjust pattern strengths based on environmental pressure
      for (const [id, pattern] of this.patterns) {
        if (pattern.type === 'environmental_adaptation') {
          pattern.strength = Math.min(1, pattern.strength + avgIntensity * 0.1)
        } else {
          // Other patterns adapt based on their connection to environmental adaptation
          const environmentalConnection = pattern.connections.includes('environmental_adaptation')
          if (environmentalConnection) {
            pattern.strength = Math.min(1, pattern.strength + avgIntensity * 0.05)
          }
        }
        pattern.lastActivation = new Date()
      }

      console.log(
        `🌍 Biological Intelligence Engine: Adapted to environment (avg intensity: ${avgIntensity.toFixed(2)})`
      )
    }
  }

  /**
   * Strengthen neural connections through use (Hebbian learning)
   */
  strengthenNeuralConnections() {
    // Apply Hebbian-like learning - connections that fire together wire together
    for (const [id, connection] of this.neuralNetwork) {
      // Strengthen connections that fire frequently
      if (connection.firingFrequency > 5) {
        connection.weight = Math.min(1, connection.weight + 0.05)
      }
      // Weaken connections that are inactive
      else if (connection.firingFrequency < 2) {
        connection.weight = Math.max(0, connection.weight - 0.02)
      }
    }

    console.log('⚡ Biological Intelligence Engine: Neural connections strengthened')
  }

  /**
   * Optimize collective behavior of service groups
   */
  optimizeCollectiveBehavior() {
    // Simulate optimization of collective intelligence
    for (const [groupId, behavior] of this.collectiveBehaviors) {
      // Increase collective intelligence score based on communication efficiency
      behavior.collectiveIntelligenceScore = Math.min(
        1,
        behavior.collectiveIntelligenceScore + behavior.communicationEfficiency * 0.01
      )

      // Adjust coordination pattern based on performance
      if (
        behavior.collectiveIntelligenceScore > 0.8 &&
        behavior.coordinationPattern === 'asynchronous'
      ) {
        behavior.coordinationPattern = 'synchronous'
      } else if (
        behavior.collectiveIntelligenceScore < 0.3 &&
        behavior.coordinationPattern === 'synchronous'
      ) {
        behavior.coordinationPattern = 'hierarchical'
      }
    }

    console.log('🐙 Biological Intelligence Engine: Collective behavior optimized')
  }

  /**
   * Evaluate and improve evolutionary fitness
   */
  evaluateEvolutionaryFitness() {
    // Calculate fitness based on various factors
    let fitness = 0.5 // Base fitness

    // Add contributions from different patterns
    for (const pattern of this.patterns.values()) {
      fitness += pattern.strength * pattern.adaptability * 0.1
    }

    // Add contributions from collective behaviors
    for (const behavior of this.collectiveBehaviors.values()) {
      fitness += behavior.collectiveIntelligenceScore * 0.05
    }

    // Normalize fitness
    this.evolutionaryFitness = Math.min(1, Math.max(0, fitness))

    console.log(
      `🧬 Biological Intelligence Engine: Evolutionary fitness = ${this.evolutionaryFitness.toFixed(3)}`
    )
  }

  /**
   * Process environmental stimulus
   */
  processStimulus(stimulus: EnvironmentalStimulus): AdaptiveResponse {
    // Add to stimulus history
    this.stimulusHistory.push(stimulus)

    // Keep only last 100 stimuli
    if (this.stimulusHistory.length > 100) {
      this.stimulusHistory.shift()
    }

    // Determine response pattern based on stimulus type
    let responsePattern = ''
    switch (stimulus.type) {
      case 'user_interaction':
        responsePattern = 'enhanced_user_interface'
        break
      case 'system_load':
        responsePattern = 'resource_reallocation'
        break
      case 'resource_availability':
        responsePattern = 'adaptive_scaling'
        break
      case 'external_api_response':
        responsePattern = 'alternative_pathway_activation'
        break
      case 'security_threat':
        responsePattern = 'immune_response_activation'
        break
    }

    // Create adaptive response
    const response: AdaptiveResponse = {
      stimulusId: `${stimulus.type}-${Date.now()}`,
      responsePattern,
      effectiveness: Math.random(), // In real implementation, this would be measured
      adaptationSpeed: Math.random() * 0.5 + 0.5, // 0.5-1.0
      timestamp: new Date(),
    }

    // Add to response history
    this.responseHistory.push(response)

    // Keep only last 50 responses
    if (this.responseHistory.length > 50) {
      this.responseHistory.shift()
    }

    // Emit event for external systems
    this.emit('adaptive-response', response)

    console.log(
      `🔄 Biological Intelligence Engine: Processed ${stimulus.type} stimulus with ${responsePattern} response`
    )

    return response
  }

  /**
   * Form collective behavior group
   */
  formCollectiveBehavior(groupId: string, members: string[]): CollectiveBehavior {
    const behavior: CollectiveBehavior = {
      groupId,
      members,
      coordinationPattern: 'asynchronous',
      communicationEfficiency: Math.random(),
      collectiveIntelligenceScore: 0.5,
    }

    this.collectiveBehaviors.set(groupId, behavior)

    console.log(
      `🐙 Biological Intelligence Engine: Formed collective behavior group '${groupId}' with ${members.length} members`
    )

    return behavior
  }

  /**
   * Get current system status
   */
  getStatus() {
    return {
      patterns: Array.from(this.patterns.values()),
      neuralConnections: this.neuralNetwork.size,
      collectiveBehaviors: this.collectiveBehaviors.size,
      evolutionaryFitness: this.evolutionaryFitness,
      recentStimuli: this.stimulusHistory.slice(-5),
      recentResponses: this.responseHistory.slice(-5),
    }
  }
}

// Export singleton instance
export const biologicalIntelligenceEngine = new BiologicalIntelligenceEngine()

export default biologicalIntelligenceEngine

