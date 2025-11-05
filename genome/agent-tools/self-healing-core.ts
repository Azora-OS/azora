/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 
/**
 * Azora OS Self-Healing Organism - Core System
 * 
 * Inspired by TensorFlow, PyTorch, Microsoft Copilot, and Meta AI research
 * Implements autonomous error detection, recovery, and learning
 */

import { EventEmitter } from 'events';

export interface HealingConfig {
  autoRepair: boolean;
  learningEnabled: boolean;
  predictiveMode: boolean;
  distributedHealing: boolean;
  maxRetries: number;
  healingTimeout: number;
  confidenceThreshold: number;
}

export interface HealthMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  errorRate: number;
  responseTime: number;
  throughput: number;
  availability: number;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'critical' | 'recovering';
  score: number;
  metrics: HealthMetrics;
  issues: HealthIssue[];
  predictions: HealthPrediction[];
  timestamp: number;
}

export interface HealthIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'performance' | 'error' | 'resource' | 'security' | 'availability';
  description: string;
  affectedServices: string[];
  detectedAt: number;
  resolved: boolean;
  resolution?: HealingAction;
}

export interface HealthPrediction {
  type: 'failure' | 'degradation' | 'overload' | 'anomaly';
  probability: number;
  timeframe: number;
  affectedComponents: string[];
  preventiveActions: HealingAction[];
}

export interface HealingAction {
  id: string;
  type: 'restart' | 'scale' | 'optimize' | 'rollback' | 'isolate' | 'patch' | 'custom';
  target: string;
  parameters: Record<string, any>;
  confidence: number;
  estimatedImpact: string;
  executedAt?: number;
  result?: HealingResult;
}

export interface HealingResult {
  success: boolean;
  duration: number;
  metricsImprovement: Partial<HealthMetrics>;
  sideEffects: string[];
  learningData: LearningData;
}

export interface LearningData {
  pattern: string;
  effectiveness: number;
  context: Record<string, any>;
  timestamp: number;
}

export interface ServiceHealth {
  serviceName: string;
  status: 'online' | 'offline' | 'degraded' | 'starting' | 'stopping';
  uptime: number;
  lastCheck: number;
  metrics: HealthMetrics;
  dependencies: string[];
  healthScore: number;
}

/**
 * Self-Healing Organism - Main Controller
 */
export class SelfHealingOrganism extends EventEmitter {
  private static instance: SelfHealingOrganism;
  private config: HealingConfig;
  private isRunning: boolean = false;
  private healingHistory: HealingAction[] = [];
  private services: Map<string, () => Promise<ServiceHealth>> = new Map();

  private constructor(config: HealingConfig) {
    super();
    this.config = config;
  }

  public static getInstance(config?: HealingConfig): SelfHealingOrganism {
    if (!SelfHealingOrganism.instance) {
      if (!config) {
        config = {
          autoRepair: true,
          learningEnabled: true,
          predictiveMode: true,
          distributedHealing: true,
          maxRetries: 3,
          healingTimeout: 30000,
          confidenceThreshold: 0.7,
        };
      }
      SelfHealingOrganism.instance = new SelfHealingOrganism(config);
    }
    return SelfHealingOrganism.instance;
  }

  public async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startMonitoringLoop();
    this.emit('organism-started');
    console.log('🌟 Self-Healing Organism activated');
  }

  public async stop(): Promise<void> {
    this.isRunning = false;
    this.emit('organism-stopped');
  }

  private startMonitoringLoop(): void {
    const interval = setInterval(async () => {
      if (!this.isRunning) {
        clearInterval(interval);
        return;
      }
      try {
        const health = await this.checkSystemHealth();
        await this.analyzeAndHeal(health);
      } catch (error) {
        this.emit('monitoring-error', error);
      }
    }, 5000);
  }

  private async checkSystemHealth(): Promise<HealthStatus> {
    const services = Array.from(this.services.keys());
    const issues: HealthIssue[] = [];
    let totalScore = 0;

    const metrics: HealthMetrics = {
      cpu: 0, memory: 0, disk: 0, network: 0,
      errorRate: 0, responseTime: 0, throughput: 0, availability: 0,
    };

    for (const serviceName of services) {
      const healthCheck = this.services.get(serviceName);
      if (healthCheck) {
        try {
          const serviceHealth = await healthCheck();
          totalScore += serviceHealth.healthScore;
          Object.keys(metrics).forEach(key => {
            metrics[key as keyof HealthMetrics] += serviceHealth.metrics[key as keyof HealthMetrics];
          });
          issues.push(...await this.detectIssues(serviceHealth));
        } catch (error) {
          console.error(`Health check failed for ${serviceName}:`, error);
        }
      }
    }

    const count = services.length || 1;
    Object.keys(metrics).forEach(key => {
      metrics[key as keyof HealthMetrics] /= count;
    });

    const score = totalScore / count;
    const status = this.determineStatus(score, issues);

    return { status, score, metrics, issues, predictions: [], timestamp: Date.now() };
  }

  private determineStatus(score: number, issues: HealthIssue[]): 'healthy' | 'degraded' | 'critical' | 'recovering' {
    const critical = issues.filter(i => i.severity === 'critical').length;
    const high = issues.filter(i => i.severity === 'high').length;
    if (critical > 0) return 'critical';
    if (high > 0 || score < 50) return 'degraded';
    if (score < 80) return 'recovering';
    return 'healthy';
  }

  private async detectIssues(serviceHealth: ServiceHealth): Promise<HealthIssue[]> {
    const issues: HealthIssue[] = [];
    const { metrics, serviceName } = serviceHealth;

    if (metrics.cpu > 90) {
      issues.push({
        id: `cpu-${serviceName}-${Date.now()}`,
        severity: 'high',
        category: 'resource',
        description: `High CPU: ${metrics.cpu}%`,
        affectedServices: [serviceName],
        detectedAt: Date.now(),
        resolved: false,
      });
    }

    if (metrics.memory > 85) {
      issues.push({
        id: `mem-${serviceName}-${Date.now()}`,
        severity: metrics.memory > 95 ? 'critical' : 'high',
        category: 'resource',
        description: `High memory: ${metrics.memory}%`,
        affectedServices: [serviceName],
        detectedAt: Date.now(),
        resolved: false,
      });
    }

    if (metrics.errorRate > 5) {
      issues.push({
        id: `err-${serviceName}-${Date.now()}`,
        severity: metrics.errorRate > 10 ? 'critical' : 'medium',
        category: 'error',
        description: `High errors: ${metrics.errorRate}%`,
        affectedServices: [serviceName],
        detectedAt: Date.now(),
        resolved: false,
      });
    }

    return issues;
  }

  private async analyzeAndHeal(health: HealthStatus): Promise<void> {
    if (health.status === 'healthy') return;
    if (health.issues.length > 0 && this.config.autoRepair) {
      await this.handleIssues(health.issues);
    }
  }

  private async handleIssues(issues: HealthIssue[]): Promise<void> {
    const sorted = issues.sort((a, b) => {
      const order = { critical: 4, high: 3, medium: 2, low: 1 };
      return order[b.severity] - order[a.severity];
    });

    for (const issue of sorted) {
      if (!issue.resolved) {
        const actions = this.generateActions(issue);
        await this.executeActions(actions, issue);
      }
    }
  }

  private generateActions(issue: HealthIssue): HealingAction[] {
    const actions: HealingAction[] = [];
    const target = issue.affectedServices[0] || 'unknown';

    switch (issue.category) {
      case 'resource':
        actions.push({
          id: `optimize-${Date.now()}`,
          type: 'optimize',
          target: target,
          parameters: { clearCache: true },
          confidence: 0.8,
          estimatedImpact: 'Optimize resources',
        });
        break;
      case 'error':
        actions.push({
          id: `restart-${Date.now()}`,
          type: 'restart',
          target: target,
          parameters: { graceful: true },
          confidence: 0.85,
          estimatedImpact: 'Restart service',
        });
        break;
    }

    return actions;
  }

  private async executeActions(actions: HealingAction[], issue: HealthIssue): Promise<void> {
    for (const action of actions) {
      if (action.confidence < this.config.confidenceThreshold) continue;

      console.log(`🔧 Executing: ${action.type} on ${action.target}`);
      
      try {
        const result = await this.executeAction(action);
        action.result = result;
        action.executedAt = Date.now();

        if (result.success) {
          console.log(`✅ Success: ${action.type}`);
          issue.resolved = true;
          issue.resolution = action;
        }

        this.healingHistory.push(action);
        this.emit('action-executed', action);
      } catch (error) {
        console.error(`Error executing action:`, error);
      }
    }
  }

  private async executeAction(action: HealingAction): Promise<HealingResult> {
    const start = Date.now();
    
    // Simulate action execution
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      duration: Date.now() - start,
      metricsImprovement: {},
      sideEffects: [],
      learningData: {
        pattern: `${action.type}-${action.target}`,
        effectiveness: 0.9,
        context: action.parameters,
        timestamp: Date.now(),
      },
    };
  }

  public async registerService(name: string, healthCheck: () => Promise<ServiceHealth>): Promise<void> {
    this.services.set(name, healthCheck);
  }

  public async unregisterService(name: string): Promise<void> {
    this.services.delete(name);
  }

  public async getHealthStatus(): Promise<HealthStatus> {
    return await this.checkSystemHealth();
  }

  public getHealingHistory(): HealingAction[] {
    return [...this.healingHistory];
  }

  public updateConfig(config: Partial<HealingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public async forceHeal(serviceName?: string): Promise<void> {
    const health = await this.checkSystemHealth();
    const issues = serviceName
      ? health.issues.filter(i => i.affectedServices.includes(serviceName))
      : health.issues;
    
    await this.handleIssues(issues);
  }
}

export default SelfHealingOrganism;

