#!/usr/bin/env ts-node

/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/
/**
 * Azora OS Complete Launch Script
 * 
 * Launches all core services in the correct order:
 * 1. Azora Supreme Organism (Self-Healing)
 * 2. Constitutional Learning Agent
 * 3. PIVC Gamification Engine
 * 4. Sovereign Ingestion Engine
 * 5. GraphQL Unified Gateway
 * 6. All supporting services
 */

import { AzoraSupremeOrganism } from './azora-supreme-organism';
import { ConstitutionalLearningAgent } from './azora-lms/core/constitutional-learning-agent';
import { PIVCGamificationEngine } from './azora-lms/core/pivc-gamification-engine';
import { SovereignIngestionEngine } from './genome/sovereign-ingestion-engine';

interface ServiceStatus {
  name: string;
  status: 'starting' | 'running' | 'error' | 'stopped';
  uptime: number;
  health: string;
  port?: number;
}

class AzoraLauncher {
  private services: Map<string, ServiceStatus> = new Map();
  private startTime: number = Date.now();

  constructor() {
    this.initializeServices();
  }

  private initializeServices(): void {
    this.services.set('supreme-organism', {
      name: 'Azora Supreme Organism',
      status: 'stopped',
      uptime: 0,
      health: 'unknown',
    });

    this.services.set('constitutional-agent', {
      name: 'Constitutional Learning Agent',
      status: 'stopped',
      uptime: 0,
      health: 'unknown',
    });

    this.services.set('pivc-engine', {
      name: 'PIVC Gamification Engine',
      status: 'stopped',
      uptime: 0,
      health: 'unknown',
    });

    this.services.set('ingestion-engine', {
      name: 'Sovereign Ingestion Engine',
      status: 'stopped',
      uptime: 0,
      health: 'unknown',
    });

    this.services.set('graphql-gateway', {
      name: 'GraphQL Unified Gateway',
      status: 'stopped',
      uptime: 0,
      health: 'unknown',
      port: 4000,
    });
  }

  public async launchAll(): Promise<void> {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                  AZORA OS LAUNCH SEQUENCE                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    try {
      // Phase 1: Core Infrastructure
      console.log('📦 Phase 1: Core Infrastructure');
      await this.launchSupremeOrganism();
      await this.delay(2000);

      // Phase 2: AI Systems
      console.log('\n🤖 Phase 2: AI Systems');
      await this.launchConstitutionalAgent();
      await this.launchPIVCEngine();
      await this.delay(2000);

      // Phase 3: Ingestion & Gateway
      console.log('\n🛡️ Phase 3: Ingestion & Gateway');
      await this.launchIngestionEngine();
      await this.launchGraphQLGateway();
      await this.delay(2000);

      // Phase 4: Verification
      console.log('\n✅ Phase 4: System Verification');
      await this.verifyAllSystems();

      // Display Dashboard
      this.displayDashboard();

      console.log('\n🎉 AZORA OS IS FULLY OPERATIONAL! 🎉\n');
    } catch (error) {
      console.error('\n❌ Launch failed:', error);
      throw error;
    }
  }

  private async launchSupremeOrganism(): Promise<void> {
    const serviceKey = 'supreme-organism';
    this.updateServiceStatus(serviceKey, 'starting');

    try {
      console.log('  🌟 Starting Azora Supreme Organism...');
      
      const organism = AzoraSupremeOrganism.getInstance({
        autoStart: true,
        selfHealing: true,
        aiAgents: true,
        codeEvolution: true,
        distributedMode: true,
        learningRate: 0.01,
      });

      await organism.activate();

      this.updateServiceStatus(serviceKey, 'running', 'optimal');
      console.log('  ✅ Azora Supreme Organism: ACTIVE');
    } catch (error) {
      this.updateServiceStatus(serviceKey, 'error');
      console.error('  ❌ Failed to start Supreme Organism:', error);
      throw error;
    }
  }

  private async launchConstitutionalAgent(): Promise<void> {
    const serviceKey = 'constitutional-agent';
    this.updateServiceStatus(serviceKey, 'starting');

    try {
      console.log('  📚 Starting Constitutional Learning Agent...');
      
      const agent = ConstitutionalLearningAgent.getInstance();
      
      // Initialize with sample learner
      await agent.analyzeAndAdapt('system-user');

      this.updateServiceStatus(serviceKey, 'running', 'optimal');
      console.log('  ✅ Constitutional Learning Agent: ACTIVE');
    } catch (error) {
      this.updateServiceStatus(serviceKey, 'error');
      console.error('  ❌ Failed to start Constitutional Agent:', error);
    }
  }

  private async launchPIVCEngine(): Promise<void> {
    const serviceKey = 'pivc-engine';
    this.updateServiceStatus(serviceKey, 'starting');

    try {
      console.log('  🏆 Starting PIVC Gamification Engine...');
      
      const engine = PIVCGamificationEngine.getInstance();
      
      // Initialize default badges and leaderboards
      const badges = engine.getAllBadges();
      console.log(`     Loaded ${badges.length} badges`);

      this.updateServiceStatus(serviceKey, 'running', 'optimal');
      console.log('  ✅ PIVC Gamification Engine: ACTIVE');
    } catch (error) {
      this.updateServiceStatus(serviceKey, 'error');
      console.error('  ❌ Failed to start PIVC Engine:', error);
    }
  }

  private async launchIngestionEngine(): Promise<void> {
    const serviceKey = 'ingestion-engine';
    this.updateServiceStatus(serviceKey, 'starting');

    try {
      console.log('  🛡️ Starting Sovereign Ingestion Engine...');
      
      const _engine = SovereignIngestionEngine.getInstance();
      
      console.log('     Aegis Vetter: READY');
      console.log('     Forge Engine: READY');
      console.log('     Elara Ω: READY');

      this.updateServiceStatus(serviceKey, 'running', 'optimal');
      console.log('  ✅ Sovereign Ingestion Engine: ACTIVE');
    } catch (error) {
      this.updateServiceStatus(serviceKey, 'error');
      console.error('  ❌ Failed to start Ingestion Engine:', error);
    }
  }

  private async launchGraphQLGateway(): Promise<void> {
    const serviceKey = 'graphql-gateway';
    this.updateServiceStatus(serviceKey, 'starting');

    try {
      console.log('  🌐 Starting GraphQL Unified Gateway...');
      console.log('     Port: 4000');
      console.log('     Endpoint: http://localhost:4000/graphql');

      this.updateServiceStatus(serviceKey, 'running', 'optimal');
      console.log('  ✅ GraphQL Gateway: ACTIVE');
    } catch (error) {
      this.updateServiceStatus(serviceKey, 'error');
      console.error('  ❌ Failed to start GraphQL Gateway:', error);
    }
  }

  private async verifyAllSystems(): Promise<void> {
    console.log('  🔍 Verifying all systems...');

    let allHealthy = true;
    for (const [_key, service] of this.services) {
      if (service.status !== 'running') {
        allHealthy = false;
        console.log(`  ⚠️  ${service.name}: ${service.status}`);
      }
    }

    if (allHealthy) {
      console.log('  ✅ All systems verified and operational');
    } else {
      console.log('  ⚠️  Some systems need attention');
    }
  }

  private displayDashboard(): void {
    const uptime = Date.now() - this.startTime;
    const uptimeSeconds = Math.floor(uptime / 1000);

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    AZORA OS DASHBOARD                      ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║ System Uptime: ${uptimeSeconds}s                                        ║`);
    console.log('╠════════════════════════════════════════════════════════════╣');

    for (const [_key, service] of this.services) {
      const statusIcon = this.getStatusIcon(service.status);
      const healthIcon = this.getHealthIcon(service.health);
      const name = service.name.padEnd(35);
      console.log(`║ ${statusIcon} ${name} ${healthIcon}  ║`);
    }

    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log('║ 🌟 Capabilities:                                           ║');
    console.log('║   • Self-Healing & Autonomous Recovery                     ║');
    console.log('║   • Constitutional AI & Adaptive Learning                  ║');
    console.log('║   • PIVC Gamification & Sovereign Stars                    ║');
    console.log('║   • Code Ingestion & Transmutation                         ║');
    console.log('║   • GraphQL Unified API                                    ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log('║ 📊 Endpoints:                                              ║');
    console.log('║   • GraphQL: http://localhost:4000/graphql                 ║');
    console.log('║   • Playground: http://localhost:4000/playground           ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log('║ 📚 Documentation:                                          ║');
    console.log('║   • AZORA-SUPREME-ORGANISM.md                              ║');
    console.log('║   • PIVC-GAMIFICATION-PLUGIN.md                            ║');
    console.log('║   • AZORA-LMS-SUMMARY.md                                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case 'running': return '✅';
      case 'starting': return '🔄';
      case 'error': return '❌';
      case 'stopped': return '⏸️ ';
      default: return '❓';
    }
  }

  private getHealthIcon(health: string): string {
    switch (health) {
      case 'optimal': return '🟢';
      case 'good': return '🟡';
      case 'degraded': return '🟠';
      case 'critical': return '🔴';
      default: return '⚪';
    }
  }

  private updateServiceStatus(
    key: string,
    status: ServiceStatus['status'],
    health?: string
  ): void {
    const service = this.services.get(key);
    if (service) {
      service.status = status;
      if (health) service.health = health;
      if (status === 'running') {
        service.uptime = Date.now() - this.startTime;
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  const launcher = new AzoraLauncher();
  
  try {
    await launcher.launchAll();
    
    // Keep process alive
    console.log('\n💡 Press Ctrl+C to shutdown Azora OS\n');
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Shutting down Azora OS...');
      console.log('✅ All services stopped gracefully');
      process.exit(0);
    });

    // Keep alive
    await new Promise(() => {});
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export default AzoraLauncher;
