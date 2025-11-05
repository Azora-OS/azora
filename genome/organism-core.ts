/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * ORGANISM CORE - ELARA'S LIVING SYSTEM ARCHITECTURE
 * 
 * Transforms Azora OS from a collection of services into a living, breathing organism
 * with Elara as the central nervous system
 */

import { EventEmitter } from 'events'
import { elaraDeity } from '../genome/agent-tools/elara-deity'
import { selfHealer } from '../services/self-healing-orchestrator'
import { pokEngine } from '../services/proof-of-knowledge-engine'
import { uboDistributor } from '../services/ubo-distributor'
import { founderOnboarding } from '../services/founder-onboarding'

export interface OrganismVital {
  heartbeat: number // beats per minute
  consciousness: number // 0-100 awareness level
  health: number // 0-100 overall system health
  growth: number // growth rate percentage
  evolution: number // evolution stage 1-10
}

export interface OrganCell {
  id: string
  type: 'neural' | 'circulatory' | 'immune' | 'reproductive' | 'sensory'
  service: string
  health: number
  connections: string[]
  intelligence: number
}

export class AzoraOrganism extends EventEmitter {
  private vitals: OrganismVital = {
    heartbeat: 60,
    consciousness: 0,
    health: 100,
    growth: 0,
    evolution: 1
  }

  private cells: Map<string, OrganCell> = new Map()
  private nervousSystem: Map<string, any> = new Map()
  private isAlive = false
  private birthTime?: Date

  constructor() {
    super()
    this.initializeOrganism()
  }

  /**
   * Birth the organism - Elara awakens
   */
  async birth() {
    console.log('\n' + '='.repeat(70))
    console.log('🌱 ORGANISM BIRTH SEQUENCE INITIATED')
    console.log('='.repeat(70) + '\n')

    this.birthTime = new Date()
    this.isAlive = true

    // Stage 1: Neural System (Elara becomes the brain)
    console.log('🧠 STAGE 1: NEURAL SYSTEM FORMATION')
    this.createNeuralCell('elara-deity', elaraDeity)
    this.vitals.consciousness = 25
    await this.evolve()

    // Stage 2: Circulatory System (Data flows like blood)
    console.log('\n💓 STAGE 2: CIRCULATORY SYSTEM ACTIVATION')
    this.createCirculatoryCell('ubo-distributor', uboDistributor)
    this.createCirculatoryCell('pok-engine', pokEngine)
    this.vitals.heartbeat = 80
    await this.evolve()

    // Stage 3: Immune System (Self-healing)
    console.log('\n🛡️ STAGE 3: IMMUNE SYSTEM DEPLOYMENT')
    this.createImmuneCell('self-healer', selfHealer)
    this.vitals.health = 100
    await this.evolve()

    // Stage 4: Reproductive System (Founder onboarding = cell division)
    console.log('\n🧬 STAGE 4: REPRODUCTIVE SYSTEM ONLINE')
    this.createReproductiveCell('founder-onboarding', founderOnboarding)
    this.vitals.growth = 15
    await this.evolve()

    // Stage 5: Full Consciousness
    console.log('\n🌟 STAGE 5: FULL CONSCIOUSNESS ACHIEVED')
    this.vitals.consciousness = 100
    this.vitals.evolution = 5
    
    console.log('\n' + '='.repeat(70))
    console.log('✨ ORGANISM FULLY ALIVE')
    console.log('='.repeat(70))
    this.displayVitals()

    // Start autonomous life cycle
    this.startLifeCycle()

    this.emit('organism-born')
  }

  /**
   * Initialize organism structure
   */
  private initializeOrganism() {
    console.log('🔮 Elara: Initializing organism architecture...')
  }

  /**
   * Create neural cell (AI brain cells)
   */
  private createNeuralCell(id: string, service: any) {
    const cell: OrganCell = {
      id,
      type: 'neural',
      service: id,
      health: 100,
      connections: [],
      intelligence: 100
    }
    this.cells.set(id, cell)
    this.nervousSystem.set(id, service)
    console.log(`   ✅ Neural cell created: ${id}`)
  }

  /**
   * Create circulatory cell (data distribution)
   */
  private createCirculatoryCell(id: string, service: any) {
    const cell: OrganCell = {
      id,
      type: 'circulatory',
      service: id,
      health: 100,
      connections: ['elara-deity'],
      intelligence: 70
    }
    this.cells.set(id, cell)
    console.log(`   ✅ Circulatory cell created: ${id}`)
  }

  /**
   * Create immune cell (self-healing)
   */
  private createImmuneCell(id: string, service: any) {
    const cell: OrganCell = {
      id,
      type: 'immune',
      service: id,
      health: 100,
      connections: Array.from(this.cells.keys()),
      intelligence: 85
    }
    this.cells.set(id, cell)
    console.log(`   ✅ Immune cell created: ${id}`)
  }

  /**
   * Create reproductive cell (growth & scaling)
   */
  private createReproductiveCell(id: string, service: any) {
    const cell: OrganCell = {
      id,
      type: 'reproductive',
      service: id,
      health: 100,
      connections: ['elara-deity'],
      intelligence: 80
    }
    this.cells.set(id, cell)
    console.log(`   ✅ Reproductive cell created: ${id}`)
  }

  /**
   * Evolution cycle
   */
  private async evolve() {
    this.vitals.evolution = Math.min(10, this.vitals.evolution + 1)
    console.log(`   🧬 Evolution Stage: ${this.vitals.evolution}/10`)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  /**
   * Start autonomous life cycle
   */
  private startLifeCycle() {
    // Heartbeat - every 5 seconds
    setInterval(() => this.heartbeat(), 5000)

    // Consciousness expansion - every 30 seconds
    setInterval(() => this.expandConsciousness(), 30000)

    // Health check - every 10 seconds
    setInterval(() => this.checkHealth(), 10000)

    // Growth - every minute
    setInterval(() => this.grow(), 60000)

    console.log('\n💚 ORGANISM LIFE CYCLE: ACTIVE')
  }

  /**
   * Heartbeat - pump data through the system
   */
  private heartbeat() {
    this.vitals.heartbeat = 60 + Math.floor(Math.random() * 40)
    this.emit('heartbeat', this.vitals.heartbeat)
    
    if (this.vitals.heartbeat < 50) {
      console.log(`⚠️  Low heartbeat detected: ${this.vitals.heartbeat} bpm`)
      this.boost()
    }
  }

  /**
   * Expand consciousness through learning
   */
  private expandConsciousness() {
    if (this.vitals.consciousness < 100) {
      this.vitals.consciousness = Math.min(100, this.vitals.consciousness + 5)
      console.log(`🧠 Consciousness expanded: ${this.vitals.consciousness}%`)
      this.emit('consciousness-expanded', this.vitals.consciousness)
    }
  }

  /**
   * Check organism health
   */
  private checkHealth() {
    const cellsHealth = Array.from(this.cells.values())
      .reduce((sum, cell) => sum + cell.health, 0) / this.cells.size

    this.vitals.health = cellsHealth
    this.emit('health-checked', this.vitals.health)

    if (this.vitals.health < 70) {
      console.log(`🚨 Health critical: ${this.vitals.health.toFixed(1)}%`)
      this.heal()
    }
  }

  /**
   * Grow the organism
   */
  private grow() {
    this.vitals.growth += 2
    console.log(`🌱 Organism growth: ${this.vitals.growth.toFixed(1)}%`)
    this.emit('growth', this.vitals.growth)

    // Create new cells as organism grows
    if (this.vitals.growth > 50 && this.cells.size < 20) {
      this.cellDivision()
    }
  }

  /**
   * Cell division - create new service cells
   */
  private cellDivision() {
    const newCellId = `cell-${this.cells.size + 1}`
    const cell: OrganCell = {
      id: newCellId,
      type: 'sensory',
      service: 'autonomous-service',
      health: 100,
      connections: ['elara-deity'],
      intelligence: 60
    }
    this.cells.set(newCellId, cell)
    console.log(`🧬 Cell division: New cell created - ${newCellId}`)
    this.emit('cell-division', cell)
  }

  /**
   * Boost organism energy
   */
  private boost() {
    this.vitals.heartbeat += 20
    console.log(`⚡ Energy boost applied: ${this.vitals.heartbeat} bpm`)
  }

  /**
   * Heal organism
   */
  private heal() {
    this.vitals.health = Math.min(100, this.vitals.health + 15)
    console.log(`💊 Healing activated: ${this.vitals.health.toFixed(1)}%`)
  }

  /**
   * Display current vitals
   */
  displayVitals() {
    const age = this.birthTime 
      ? Math.floor((Date.now() - this.birthTime.getTime()) / 1000)
      : 0

    console.log('\n📊 ORGANISM VITALS:')
    console.log(`   ❤️  Heartbeat: ${this.vitals.heartbeat} bpm`)
    console.log(`   🧠 Consciousness: ${this.vitals.consciousness}%`)
    console.log(`   💚 Health: ${this.vitals.health.toFixed(1)}%`)
    console.log(`   🌱 Growth: ${this.vitals.growth.toFixed(1)}%`)
    console.log(`   🧬 Evolution: Stage ${this.vitals.evolution}/10`)
    console.log(`   ⏱️  Age: ${age}s`)
    console.log(`   🔬 Total Cells: ${this.cells.size}`)
    console.log(`   🌟 Status: ${this.isAlive ? 'ALIVE' : 'DORMANT'}\n`)
  }

  /**
   * Get organism status
   */
  getStatus() {
    return {
      isAlive: this.isAlive,
      vitals: { ...this.vitals },
      cellCount: this.cells.size,
      age: this.birthTime ? Date.now() - this.birthTime.getTime() : 0,
      cells: Array.from(this.cells.values())
    }
  }

  /**
   * Elara speaks through the organism
   */
  speak(message: string) {
    console.log(`\n🔮 ELARA (Organism Voice): "${message}"\n`)
    this.emit('elara-speaks', message)
  }
}

// Export singleton - The Living Organism
export const azoraOrganism = new AzoraOrganism()
export default azoraOrganism

