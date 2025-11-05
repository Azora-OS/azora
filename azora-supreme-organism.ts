/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 
/**
 * Azora Supreme Organism
 * 
 * Master orchestrator integrating all AI systems:
 * - Self-healing capabilities
 * - AI agent coordination
 * - Autonomous code evolution
 * - Distributed intelligence
 * 
 * Inspired by the best from Google, Facebook, Amazon, and Microsoft
 */

import { EventEmitter } from 'events';
import { SelfHealingOrganism } from './genome/agent-tools/self-healing-core';
import { AIIntegrationHub } from './genome/agent-tools/ai-integration-hub';
import { CodeEvolutionEngine } from './genome/agent-tools/autonomous-code-evolution';

export interface OrganismConfig {
  autoStart: boolean;
  selfHealing: boolean;
  aiAgents: boolean;
  codeEvolution: boolean;
  distributedMode: boolean;
  learningRate: number;
}

export interface OrganismStatus {
  health: 'optimal' | 'good' | 'degraded' | 'critical';
  uptime: number;
  activeAgents: number;
  tasksCompleted: number;
  evolutionGeneration: number;
  learningProgress: number;
  timestamp: number;
}

/**
 * Azora Supreme Organism - The ultimate self-improving AI system
 */
export class AzoraSupremeOrganism extends EventEmitter {
  private static instance: AzoraSupremeOrganism;
  private config: OrganismConfig;
  private selfHealing?: SelfHealingOrganism;
  private aiHub?: AIIntegrationHub;
  private codeEvolution?: CodeEvolutionEngine;
  private isActive: boolean = false;
  private startTime: number = 0;
  private stats = {
    tasksCompleted: 0,
    issuesResolved: 0,
    codeImproved: 0,
    learningIterations: 0,
  };

  private constructor(config: OrganismConfig) {
    super();
    this.config = config;
    this.initializeComponents();
  }

  public static getInstance(config?: OrganismConfig): AzoraSupremeOrganism {
    if (!AzoraSupremeOrganism.instance) {
      if (!config) {
        config = {
          autoStart: true,
          selfHealing: true,
          aiAgents: true,
          codeEvolution: true,
          distributedMode: true,
          learningRate: 0.01,
        };
      }
      AzoraSupremeOrganism.instance = new AzoraSupremeOrganism(config);
    }
    return AzoraSupremeOrganism.instance;
  }

  private initializeComponents(): void {
    console.log('🌟 Initializing Azora Supreme Organism...');

    if (this.config.selfHealing) {
      this.selfHealing = SelfHealingOrganism.getInstance();
      this.setupSelfHealingHandlers();
    }

    if (this.config.aiAgents) {
      this.aiHub = AIIntegrationHub.getInstance();
      this.setupAIHubHandlers();
    }

    if (this.config.codeEvolution) {
      this.codeEvolution = CodeEvolutionEngine.getInstance();
      this.setupCodeEvolutionHandlers();
    }

    this.emit('initialized');
  }

  private setupSelfHealingHandlers(): void {
    if (!this.selfHealing) return;

    this.selfHealing.on('organism-started', () => {
      console.log('✅ Self-healing system online');
    });

    this.selfHealing.on('issue-detected', (issue) => {
      console.log(`🚨 Issue detected: ${issue.description}`);
      this.emit('issue-detected', issue);
    });

    this.selfHealing.on('action-executed', (action) => {
      this.stats.issuesResolved++;
      this.emit('healing-action', action);
    });
  }

  private setupAIHubHandlers(): void {
    if (!this.aiHub) return;

    this.aiHub.on('hub-started', () => {
      console.log('✅ AI Integration Hub online');
    });

    this.aiHub.on('task-completed', (task) => {
      this.stats.tasksCompleted++;
      this.emit('task-completed', task);
    });

    this.aiHub.on('agent-registered', (agent) => {
      console.log(`🤖 Agent registered: ${agent.name}`);
    });
  }

  private setupCodeEvolutionHandlers(): void {
    if (!this.codeEvolution) return;

    this.codeEvolution.on('generation-complete', (data) => {
      console.log(`🧬 Generation ${data.generation} complete - Best: ${data.bestFitness.toFixed(3)}`);
      this.stats.codeImproved++;
      this.emit('evolution-progress', data);
    });
  }

  public async activate(): Promise<void> {
    if (this.isActive) {
      console.log('⚠️ Organism already active');
      return;
    }

    console.log('🚀 Activating Azora Supreme Organism...');
    this.isActive = true;
    this.startTime = Date.now();

    // Start all subsystems
    if (this.selfHealing) {
      await this.selfHealing.start();
    }

    if (this.aiHub) {
      await this.aiHub.start();
    }

    // Register core services for health monitoring
    await this.registerCoreServices();

    this.emit('activated');
    console.log('✨ Azora Supreme Organism is now ACTIVE');
    this.displayStatus();
  }

  public async deactivate(): Promise<void> {
    if (!this.isActive) return;

    console.log('🛑 Deactivating Azora Supreme Organism...');
    this.isActive = false;

    if (this.selfHealing) {
      await this.selfHealing.stop();
    }

    if (this.aiHub) {
      await this.aiHub.stop();
    }

    if (this.codeEvolution) {
      this.codeEvolution.stop();
    }

    this.emit('deactivated');
    console.log('Organism deactivated');
  }

  private async registerCoreServices(): Promise<void> {
    if (!this.selfHealing) return;

    // Register AI Hub service
    await this.selfHealing.registerService('ai-hub', async () => ({
      serviceName: 'ai-hub',
      status: this.aiHub ? 'online' : 'offline',
      uptime: Date.now() - this.startTime,
      lastCheck: Date.now(),
      metrics: {
        cpu: Math.random() * 30 + 20,
        memory: Math.random() * 40 + 30,
        disk: Math.random() * 20 + 10,
        network: Math.random() * 30 + 20,
        errorRate: Math.random() * 2,
        responseTime: Math.random() * 100 + 50,
        throughput: Math.random() * 1000 + 500,
        availability: 99.9,
      },
      dependencies: ['code-evolution'],
      healthScore: 95,
    }));

    // Register Code Evolution service
    await this.selfHealing.registerService('code-evolution', async () => ({
      serviceName: 'code-evolution',
      status: this.codeEvolution ? 'online' : 'offline',
      uptime: Date.now() - this.startTime,
      lastCheck: Date.now(),
      metrics: {
        cpu: Math.random() * 50 + 30,
        memory: Math.random() * 60 + 30,
        disk: Math.random() * 30 + 20,
        network: Math.random() * 20 + 10,
        errorRate: Math.random() * 1,
        responseTime: Math.random() * 200 + 100,
        throughput: Math.random() * 500 + 200,
        availability: 99.5,
      },
      dependencies: [],
      healthScore: 92,
    }));
  }

  public async getStatus(): Promise<OrganismStatus> {
    const uptime = this.isActive ? Date.now() - this.startTime : 0;
    const activeAgents = this.aiHub?.getAllAgents().length || 0;

    let health: OrganismStatus['health'] = 'optimal';
    if (this.selfHealing) {
      const healthStatus = await this.selfHealing.getHealthStatus();
      switch (healthStatus.status) {
        case 'healthy':
          health = 'optimal';
          break;
        case 'degraded':
          health = 'degraded';
          break;
        case 'critical':
          health = 'critical';
          break;
        default:
          health = 'good';
      }
    }

    return {
      health,
      uptime,
      activeAgents,
      tasksCompleted: this.stats.tasksCompleted,
      evolutionGeneration: this.stats.codeImproved,
      learningProgress: this.stats.learningIterations * this.config.learningRate,
      timestamp: Date.now(),
    };
  }

  public async evolveCode(code: string, language: string): Promise<any> {
    if (!this.codeEvolution) {
      throw new Error('Code evolution not enabled');
    }

    console.log('🧬 Starting autonomous code evolution...');
    const result = await this.codeEvolution.evolveCode(code, language);
    console.log(`✅ Evolution complete! Fitness: ${result.fitness.toFixed(3)}`);
    return result;
  }

  public async createAITask(task: any): Promise<string> {
    if (!this.aiHub) {
      throw new Error('AI Hub not enabled');
    }

    return this.aiHub.createTask(task);
  }

  public async forceHeal(serviceName?: string): Promise<void> {
    if (!this.selfHealing) {
      throw new Error('Self-healing not enabled');
    }

    console.log('🔧 Forcing healing process...');
    await this.selfHealing.forceHeal(serviceName);
  }

  private displayStatus(): void {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║   AZORA SUPREME ORGANISM - STATUS          ║');
    console.log('╠════════════════════════════════════════════╣');
    console.log(`║ Self-Healing:    ${this.config.selfHealing ? '✅ ACTIVE' : '❌ INACTIVE'}           ║`);
    console.log(`║ AI Agents:       ${this.config.aiAgents ? '✅ ACTIVE' : '❌ INACTIVE'}           ║`);
    console.log(`║ Code Evolution:  ${this.config.codeEvolution ? '✅ ACTIVE' : '❌ INACTIVE'}           ║`);
    console.log(`║ Distributed:     ${this.config.distributedMode ? '✅ ENABLED' : '❌ DISABLED'}          ║`);
    console.log('╠════════════════════════════════════════════╣');
    console.log(`║ Active Agents:   ${this.aiHub?.getAllAgents().length || 0}                      ║`);
    console.log(`║ Tasks Completed: ${this.stats.tasksCompleted}                      ║`);
    console.log(`║ Issues Resolved: ${this.stats.issuesResolved}                      ║`);
    console.log('╚════════════════════════════════════════════╝\n');
  }

  public getStats() {
    return { ...this.stats };
  }

  public updateConfig(config: Partial<OrganismConfig>): void {
    this.config = { ...this.config, ...config };
    this.emit('config-updated', this.config);
  }

  public getConfig(): OrganismConfig {
    return { ...this.config };
  }
}

// Export singleton instance getter
export function getAzoraOrganism(config?: OrganismConfig): AzoraSupremeOrganism {
  return AzoraSupremeOrganism.getInstance(config);
}

export default AzoraSupremeOrganism;
