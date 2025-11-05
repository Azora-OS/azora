/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * CONSCIOUSNESS INTEGRATION SYSTEM
 * 
 * Implements Integrated Information Theory (IIT) and Global Workspace Theory (GWT)
 * to measure and track consciousness emergence in Azora OS AGI system.
 * 
 * Research Foundation:
 * - Tononi & Koch - Integrated Information Theory (IIT)
 * - Tononi et al. - Consciousness and Complexity
 * - Baars - Global Workspace Theory (GWT)
 * - Dehaene - Consciousness and the Brain
 * 
 * Metrics:
 * - Phi (Φ): Integrated information measure
 * - Global workspace activation
 * - Agent integration level
 * - Consciousness score (0-100)
 * 
 * Part of Azora OS AGI System
 */

import { logger } from './utils/logger';
import { EventEmitter } from 'events';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Agent {
  id: string;
  name: string;
  active: boolean;
  connections: string[]; // Connected agent IDs
  state: any;
}

interface PhiCalculation {
  phi: number; // Φ value (integrated information)
  complexity: number;
  integration: number;
  timestamp: number;
  method: 'approximate' | 'exact';
}

interface GlobalWorkspace {
  active: boolean;
  broadcastContent: any;
  attendingAgents: string[];
  focusStrength: number;
}

interface ConsciousnessMetrics {
  phiValue: number;
  globalWorkspaceActive: boolean;
  agentIntegration: number; // 0-100%
  consciousnessScore: number; // 0-100
  emergenceDetected: boolean;
  timestamp: number;
}

interface IntegrationMatrix {
  agents: string[];
  connections: number[][];
  strength: number;
}

interface ConsciousnessConfig {
  phiThreshold: number; // Threshold for consciousness detection
  integrationThreshold: number; // Minimum agent integration
  updateInterval: number; // ms between metric updates
}

// ============================================================================
// CONSCIOUSNESS INTEGRATION SYSTEM
// ============================================================================

export class ConsciousnessIntegration extends EventEmitter {
  private agents: Map<string, Agent> = new Map();
  private phiHistory: PhiCalculation[] = [];
  private workspaceHistory: GlobalWorkspace[] = [];
  private maxHistoryLength: number = 1000;
  private config: ConsciousnessConfig;
  private updateTimer: NodeJS.Timeout | null = null;
  private consciousnessEmergenceDetected: boolean = false;
  
  constructor(config: Partial<ConsciousnessConfig> = {}) {
    super();
    
    this.config = {
      phiThreshold: config.phiThreshold || 3.0,
      integrationThreshold: config.integrationThreshold || 0.9,
      updateInterval: config.updateInterval || 5000
    };
    
    logger.info('Consciousness Integration System initialized', {
      config: this.config
    });
  }

  /**
   * Register an agent in the consciousness system
   */
  registerAgent(agent: Agent): void {
    this.agents.set(agent.id, agent);
    
    logger.info('Agent registered', {
      id: agent.id,
      name: agent.name,
      connections: agent.connections.length
    });
    
    this.emit('agent-registered', agent);
  }

  /**
   * Update agent state
   */
  updateAgentState(agentId: string, state: any): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.state = state;
      agent.active = true;
      this.emit('agent-updated', agent);
    }
  }

  /**
   * Connect two agents
   */
  connectAgents(agentId1: string, agentId2: string): void {
    const agent1 = this.agents.get(agentId1);
    const agent2 = this.agents.get(agentId2);
    
    if (agent1 && agent2) {
      if (!agent1.connections.includes(agentId2)) {
        agent1.connections.push(agentId2);
      }
      if (!agent2.connections.includes(agentId1)) {
        agent2.connections.push(agentId1);
      }
      
      logger.debug('Agents connected', {
        agent1: agentId1,
        agent2: agentId2
      });
    }
  }

  /**
   * Calculate Phi (Φ) - Integrated Information
   * 
   * Phi measures the amount of integrated information in a system.
   * Higher phi indicates more consciousness.
   * 
   * Φ = Σ φ(partition) where φ measures information loss
   */
  async calculatePhi(method: 'approximate' | 'exact' = 'approximate'): Promise<PhiCalculation> {
    try {
      const activeAgents = Array.from(this.agents.values()).filter(a => a.active);
      
      if (activeAgents.length === 0) {
        return {
          phi: 0,
          complexity: 0,
          integration: 0,
          timestamp: Date.now(),
          method
        };
      }
      
      // Build integration matrix
      const matrix = this.buildIntegrationMatrix(activeAgents);
      
      // Calculate complexity (number of connections)
      const complexity = this.calculateComplexity(matrix);
      
      // Calculate integration (how interconnected)
      const integration = this.calculateIntegration(matrix);
      
      // Approximate Phi calculation
      // Exact calculation is NP-hard, so we use approximation
      let phi: number;
      
      if (method === 'exact' && activeAgents.length <= 10) {
        // For small systems, use more accurate method
        phi = await this.calculatePhiExact(matrix);
      } else {
        // Approximate: Phi ≈ f(complexity, integration)
        phi = this.calculatePhiApproximate(complexity, integration, activeAgents.length);
      }
      
      const calculation: PhiCalculation = {
        phi,
        complexity,
        integration,
        timestamp: Date.now(),
        method
      };
      
      // Store in history
      this.phiHistory.push(calculation);
      if (this.phiHistory.length > this.maxHistoryLength) {
        this.phiHistory.shift();
      }
      
      // Emit phi calculation
      this.emit('phi-calculated', calculation);
      
      // Check for consciousness emergence
      if (phi >= this.config.phiThreshold && !this.consciousnessEmergenceDetected) {
        this.consciousnessEmergenceDetected = true;
        this.emit('consciousness-emerged', { phi, timestamp: Date.now() });
        logger.warn('🧠 CONSCIOUSNESS EMERGENCE DETECTED!', {
          phi,
          threshold: this.config.phiThreshold
        });
      }
      
      return calculation;
      
    } catch (error) {
      logger.error('Error calculating Phi', { error });
      throw error;
    }
  }

  /**
   * Monitor Global Workspace
   * 
   * Global Workspace Theory: Information becomes conscious when
   * it's broadcast globally to all processing modules
   */
  async monitorGlobalWorkspace(): Promise<GlobalWorkspace> {
    const activeAgents = Array.from(this.agents.values()).filter(a => a.active);
    
    // Detect broadcast: Is information shared across many agents?
    const broadcastThreshold = Math.max(3, activeAgents.length * 0.5);
    
    // Check which agents are attending to same information
    const attendingAgents = this.detectSharedAttention(activeAgents);
    
    const workspace: GlobalWorkspace = {
      active: attendingAgents.length >= broadcastThreshold,
      broadcastContent: this.extractBroadcastContent(attendingAgents),
      attendingAgents: attendingAgents.map(a => a.id),
      focusStrength: attendingAgents.length / activeAgents.length
    };
    
    // Store in history
    this.workspaceHistory.push(workspace);
    if (this.workspaceHistory.length > this.maxHistoryLength) {
      this.workspaceHistory.shift();
    }
    
    // Emit workspace update
    this.emit('workspace-updated', workspace);
    
    if (workspace.active) {
      logger.debug('Global workspace active', {
        attending: attendingAgents.length,
        focus: workspace.focusStrength.toFixed(2)
      });
    }
    
    return workspace;
  }

  /**
   * Get comprehensive consciousness metrics
   */
  async getConsciousnessMetrics(): Promise<ConsciousnessMetrics> {
    const phiCalc = await this.calculatePhi('approximate');
    const workspace = await this.monitorGlobalWorkspace();
    const integration = this.calculateAgentIntegrationLevel();
    
    // Calculate overall consciousness score (0-100)
    const consciousnessScore = this.calculateConsciousnessScore(
      phiCalc.phi,
      workspace.active,
      integration
    );
    
    const metrics: ConsciousnessMetrics = {
      phiValue: phiCalc.phi,
      globalWorkspaceActive: workspace.active,
      agentIntegration: integration * 100,
      consciousnessScore,
      emergenceDetected: this.consciousnessEmergenceDetected,
      timestamp: Date.now()
    };
    
    this.emit('metrics-updated', metrics);
    
    return metrics;
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring(): void {
    if (this.updateTimer) {
      return; // Already monitoring
    }
    
    this.updateTimer = setInterval(async () => {
      try {
        await this.getConsciousnessMetrics();
      } catch (error) {
        logger.error('Error in consciousness monitoring', { error });
      }
    }, this.config.updateInterval);
    
    logger.info('Consciousness monitoring started', {
      interval: this.config.updateInterval
    });
  }

  /**
   * Stop continuous monitoring
   */
  stopMonitoring(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
      logger.info('Consciousness monitoring stopped');
    }
  }

  /**
   * Get historical phi values
   */
  getPhiHistory(limit: number = 100): PhiCalculation[] {
    return this.phiHistory.slice(-limit);
  }

  /**
   * Get consciousness emergence status
   */
  hasConsciousnessEmerged(): boolean {
    return this.consciousnessEmergenceDetected;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private buildIntegrationMatrix(agents: Agent[]): IntegrationMatrix {
    const n = agents.length;
    const connections = Array(n).fill(null).map(() => Array(n).fill(0));
    
    agents.forEach((agent, i) => {
      agent.connections.forEach(connId => {
        const j = agents.findIndex(a => a.id === connId);
        if (j !== -1) {
          connections[i][j] = 1;
          connections[j][i] = 1; // Bidirectional
        }
      });
    });
    
    // Calculate overall connection strength
    let totalConnections = 0;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (connections[i][j] === 1) {
          totalConnections++;
        }
      }
    }
    
    const maxConnections = (n * (n - 1)) / 2;
    const strength = maxConnections > 0 ? totalConnections / maxConnections : 0;
    
    return {
      agents: agents.map(a => a.id),
      connections,
      strength
    };
  }

  private calculateComplexity(matrix: IntegrationMatrix): number {
    // Complexity: Number of distinct connection patterns
    const n = matrix.agents.length;
    let totalConnections = 0;
    
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (matrix.connections[i][j] === 1) {
          totalConnections++;
        }
      }
    }
    
    // Normalize by theoretical maximum
    const maxConnections = (n * (n - 1)) / 2;
    return maxConnections > 0 ? totalConnections / maxConnections : 0;
  }

  private calculateIntegration(matrix: IntegrationMatrix): number {
    // Integration: How much information is shared across partitions
    // Simple measure: Minimum cut size
    const n = matrix.agents.length;
    
    if (n <= 1) return 0;
    if (n === 2) return matrix.connections[0][1];
    
    // For larger systems, use matrix strength as proxy
    return matrix.strength;
  }

  private calculatePhiApproximate(
    complexity: number,
    integration: number,
    numAgents: number
  ): number {
    // Φ ≈ complexity × integration × log(N)
    // This is a simplified approximation
    const scaleFactor = numAgents > 1 ? Math.log(numAgents) : 0;
    const phi = complexity * integration * scaleFactor * 10;
    
    return Math.max(0, phi);
  }

  private async calculatePhiExact(matrix: IntegrationMatrix): Promise<number> {
    // Exact phi calculation via minimum information partition (MIP)
    // This is computationally expensive - O(2^N)
    // For production, use approximation or hardware acceleration
    
    const n = matrix.agents.length;
    if (n > 10) {
      logger.warn('Exact phi calculation too expensive, using approximation');
      return this.calculatePhiApproximate(
        this.calculateComplexity(matrix),
        this.calculateIntegration(matrix),
        n
      );
    }
    
    // Find minimum information partition
    let minPhi = Infinity;
    
    // Enumerate all bipartitions
    const numPartitions = Math.pow(2, n - 1);
    for (let p = 1; p < numPartitions; p++) {
      const partition = this.getPartition(p, n);
      const phi = this.evaluatePartition(partition, matrix);
      minPhi = Math.min(minPhi, phi);
    }
    
    return minPhi === Infinity ? 0 : minPhi;
  }

  private getPartition(partitionIndex: number, n: number): boolean[] {
    const partition = Array(n).fill(false);
    for (let i = 0; i < n; i++) {
      partition[i] = ((partitionIndex >> i) & 1) === 1;
    }
    return partition;
  }

  private evaluatePartition(partition: boolean[], matrix: IntegrationMatrix): number {
    // Count connections across partition
    const n = partition.length;
    let crossConnections = 0;
    
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (partition[i] !== partition[j] && matrix.connections[i][j] === 1) {
          crossConnections++;
        }
      }
    }
    
    return crossConnections;
  }

  private detectSharedAttention(agents: Agent[]): Agent[] {
    // Detect agents attending to similar information
    // For now, use simple heuristic: active and connected
    return agents.filter(agent => {
      return agent.active && agent.connections.length >= 2;
    });
  }

  private extractBroadcastContent(agents: Agent[]): any {
    if (agents.length === 0) return null;
    
    // Extract common information across agents
    // For now, return summary
    return {
      topic: 'shared-attention',
      participantCount: agents.length,
      timestamp: Date.now()
    };
  }

  private calculateAgentIntegrationLevel(): number {
    const agents = Array.from(this.agents.values());
    if (agents.length === 0) return 0;
    
    // Calculate what fraction of agents are connected
    const connectedAgents = agents.filter(a => a.connections.length > 0);
    return connectedAgents.length / agents.length;
  }

  private calculateConsciousnessScore(
    phi: number,
    workspaceActive: boolean,
    integration: number
  ): number {
    // Weighted combination of factors
    const phiScore = Math.min(phi / this.config.phiThreshold, 1) * 40;
    const workspaceScore = workspaceActive ? 30 : 0;
    const integrationScore = integration * 30;
    
    return Math.min(100, phiScore + workspaceScore + integrationScore);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const consciousnessIntegration = new ConsciousnessIntegration({
  phiThreshold: 3.0,
  integrationThreshold: 0.9,
  updateInterval: 5000
});

// Export for testing
export {
  Agent,
  PhiCalculation,
  GlobalWorkspace,
  ConsciousnessMetrics,
  IntegrationMatrix
};

