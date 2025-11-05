/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

Master Agent Orchestrator - Central AI Coordination System
*/

/**
 * Master Agent Orchestrator
 *
 * Central command system for coordinating all AI agents in Azora OS.
 * Provides intelligent task distribution, performance monitoring,
 * and autonomous decision-making capabilities.
 */

import { EventEmitter } from 'events';

// Agent Types
export enum AgentType {
  RESEARCH = 'research',
  IMPLEMENTATION = 'implementation',
  ANALYSIS = 'analysis',
  OPTIMIZATION = 'optimization',
  SECURITY = 'security',
  DEPLOYMENT = 'deployment',
  DOCUMENTATION = 'documentation',
  LEARNING = 'learning',
}

// Task Priority Levels
export enum TaskPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

// Agent Status
export enum AgentStatus {
  IDLE = 'idle',
  BUSY = 'busy',
  OFFLINE = 'offline',
  ERROR = 'error',
}

// Interfaces
export interface Agent {
  id: string;
  type: AgentType;
  status: AgentStatus;
  capabilities: string[];
  currentTask?: Task;
  performance: PerformanceMetrics;
  lastActive: Date;
}

export interface Task {
  id: string;
  type: string;
  priority: TaskPriority;
  description: string;
  requirements: string[];
  assignedAgent?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  result?: any;
  createdAt: Date;
  completedAt?: Date;
}

export interface PerformanceMetrics {
  tasksCompleted: number;
  successRate: number;
  averageCompletionTime: number;
  errorCount: number;
  lastEvaluated: Date;
}

export interface AgentMessage {
  from: string;
  to: string | 'broadcast';
  type: 'task' | 'result' | 'query' | 'notification' | 'error';
  payload: any;
  priority: TaskPriority;
  timestamp: Date;
}

/**
 * Master Orchestrator Class
 */
export class MasterOrchestrator extends EventEmitter {
  private agents: Map<string, Agent> = new Map();
  private tasks: Map<string, Task> = new Map();
  private messageQueue: AgentMessage[] = [];
  private isRunning: boolean = false;
  private stats = {
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    activeAgents: 0,
    uptime: 0,
    startTime: new Date(),
  };

  constructor() {
    super();
    this.initialize();
  }

  /**
   * Initialize the orchestrator
   */
  private initialize(): void {
    console.log('🤖 Master Orchestrator initializing...');

    // Register default agents
    this.registerDefaultAgents();

    // Start monitoring
    this.startMonitoring();

    // Start message processing
    this.startMessageProcessing();

    this.isRunning = true;
    console.log('✅ Master Orchestrator online');
  }

  /**
   * Register default agents
   */
  private registerDefaultAgents(): void {
    // Research Agents
    this.registerAgent({
      id: 'research-agent-1',
      type: AgentType.RESEARCH,
      status: AgentStatus.IDLE,
      capabilities: ['literature-review', 'data-analysis', 'hypothesis-generation'],
      performance: this.getDefaultMetrics(),
      lastActive: new Date(),
    });

    this.registerAgent({
      id: 'research-agent-2',
      type: AgentType.RESEARCH,
      status: AgentStatus.IDLE,
      capabilities: ['scientific-research', 'experiment-design', 'statistical-analysis'],
      performance: this.getDefaultMetrics(),
      lastActive: new Date(),
    });

    // Implementation Agents
    this.registerAgent({
      id: 'implementation-agent-1',
      type: AgentType.IMPLEMENTATION,
      status: AgentStatus.IDLE,
      capabilities: ['code-generation', 'deployment', 'integration'],
      performance: this.getDefaultMetrics(),
      lastActive: new Date(),
    });

    this.registerAgent({
      id: 'implementation-agent-2',
      type: AgentType.IMPLEMENTATION,
      status: AgentStatus.IDLE,
      capabilities: ['feature-development', 'bug-fixing', 'refactoring'],
      performance: this.getDefaultMetrics(),
      lastActive: new Date(),
    });

    // Specialized Agents
    this.registerAgent({
      id: 'security-agent',
      type: AgentType.SECURITY,
      status: AgentStatus.IDLE,
      capabilities: ['vulnerability-scanning', 'threat-detection', 'penetration-testing'],
      performance: this.getDefaultMetrics(),
      lastActive: new Date(),
    });

    this.registerAgent({
      id: 'optimization-agent',
      type: AgentType.OPTIMIZATION,
      status: AgentStatus.IDLE,
      capabilities: ['performance-tuning', 'resource-optimization', 'cost-reduction'],
      performance: this.getDefaultMetrics(),
      lastActive: new Date(),
    });

    console.log(`📋 Registered ${this.agents.size} agents`);
  }

  /**
   * Get default performance metrics
   */
  private getDefaultMetrics(): PerformanceMetrics {
    return {
      tasksCompleted: 0,
      successRate: 100,
      averageCompletionTime: 0,
      errorCount: 0,
      lastEvaluated: new Date(),
    };
  }

  /**
   * Register a new agent
   */
  public registerAgent(agent: Agent): void {
    this.agents.set(agent.id, agent);
    this.stats.activeAgents = this.getActiveAgentCount();
    this.emit('agent:registered', agent);
    console.log(`✅ Agent registered: ${agent.id} (${agent.type})`);
  }

  /**
   * Submit a new task
   */
  public submitTask(task: Omit<Task, 'id' | 'status' | 'createdAt'>): string {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newTask: Task = {
      ...task,
      id: taskId,
      status: 'pending',
      createdAt: new Date(),
    };

    this.tasks.set(taskId, newTask);
    this.stats.totalTasks++;

    // Assign to best available agent
    this.assignTask(newTask);

    this.emit('task:submitted', newTask);
    console.log(`📝 Task submitted: ${taskId} (${task.priority})`);

    return taskId;
  }

  /**
   * Assign task to most suitable agent
   */
  private assignTask(task: Task): void {
    // Find best agent based on:
    // 1. Capabilities match
    // 2. Current availability
    // 3. Performance metrics
    // 4. Current workload

    const availableAgents = Array.from(this.agents.values())
      .filter((agent) => agent.status === AgentStatus.IDLE)
      .filter((agent) => this.hasRequiredCapabilities(agent, task.requirements));

    if (availableAgents.length === 0) {
      console.log(`⏳ No available agent for task ${task.id}, queuing...`);
      return;
    }

    // Select agent with best performance
    const bestAgent = availableAgents.reduce((best, current) => {
      return current.performance.successRate > best.performance.successRate ? current : best;
    });

    // Assign task
    task.assignedAgent = bestAgent.id;
    task.status = 'in-progress';
    bestAgent.status = AgentStatus.BUSY;
    bestAgent.currentTask = task;
    bestAgent.lastActive = new Date();

    this.emit('task:assigned', { task, agent: bestAgent });
    console.log(`🎯 Task ${task.id} assigned to ${bestAgent.id}`);

    // Simulate task execution (in real system, this would call the actual agent)
    this.executeTask(bestAgent, task);
  }

  /**
   * Check if agent has required capabilities
   */
  private hasRequiredCapabilities(agent: Agent, requirements: string[]): boolean {
    if (!requirements || requirements.length === 0) return true;
    return requirements.every((req) => agent.capabilities.some((cap) => cap.includes(req) || req.includes(cap)));
  }

  /**
   * Execute task on agent
   */
  private async executeTask(agent: Agent, task: Task): Promise<void> {
    try {
      // Simulate task execution
      const executionTime = Math.random() * 5000 + 1000; // 1-6 seconds

      await new Promise((resolve) => setTimeout(resolve, executionTime));

      // Update metrics
      agent.performance.tasksCompleted++;
      agent.performance.averageCompletionTime =
        (agent.performance.averageCompletionTime * (agent.performance.tasksCompleted - 1) + executionTime) /
        agent.performance.tasksCompleted;

      // Complete task
      task.status = 'completed';
      task.completedAt = new Date();
      agent.status = AgentStatus.IDLE;
      agent.currentTask = undefined;

      this.stats.completedTasks++;

      this.emit('task:completed', { task, agent });
      console.log(`✅ Task ${task.id} completed by ${agent.id}`);

      // Try to assign next pending task
      this.assignNextPendingTask();
    } catch (error) {
      console.error(`❌ Task ${task.id} failed:`, error);
      task.status = 'failed';
      agent.status = AgentStatus.IDLE;
      agent.currentTask = undefined;
      agent.performance.errorCount++;
      this.stats.failedTasks++;

      this.emit('task:failed', { task, agent, error });
    }
  }

  /**
   * Assign next pending task
   */
  private assignNextPendingTask(): void {
    const pendingTasks = Array.from(this.tasks.values())
      .filter((task) => task.status === 'pending')
      .sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));

    if (pendingTasks.length > 0) {
      this.assignTask(pendingTasks[0]);
    }
  }

  /**
   * Get numeric priority value
   */
  private getPriorityValue(priority: TaskPriority): number {
    const values = {
      [TaskPriority.CRITICAL]: 4,
      [TaskPriority.HIGH]: 3,
      [TaskPriority.MEDIUM]: 2,
      [TaskPriority.LOW]: 1,
    };
    return values[priority] || 0;
  }

  /**
   * Send message between agents
   */
  public sendMessage(message: Omit<AgentMessage, 'timestamp'>): void {
    const fullMessage: AgentMessage = {
      ...message,
      timestamp: new Date(),
    };

    this.messageQueue.push(fullMessage);
    this.emit('message:sent', fullMessage);
  }

  /**
   * Start message processing
   */
  private startMessageProcessing(): void {
    setInterval(() => {
      if (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        if (message) {
          this.processMessage(message);
        }
      }
    }, 100); // Process every 100ms
  }

  /**
   * Process a message
   */
  private processMessage(message: AgentMessage): void {
    // Handle different message types
    switch (message.type) {
      case 'task':
        // Handle task delegation
        break;
      case 'result':
        // Handle task results
        break;
      case 'query':
        // Handle information requests
        break;
      case 'notification':
        // Handle status updates
        break;
      case 'error':
        // Handle error reports
        console.error(`Agent error from ${message.from}:`, message.payload);
        break;
    }

    this.emit('message:processed', message);
  }

  /**
   * Start system monitoring
   */
  private startMonitoring(): void {
    setInterval(() => {
      this.updateStats();
      this.evaluateAgentPerformance();
      this.emit('stats:updated', this.stats);
    }, 10000); // Update every 10 seconds
  }

  /**
   * Update system statistics
   */
  private updateStats(): void {
    this.stats.activeAgents = this.getActiveAgentCount();
    this.stats.uptime = Date.now() - this.stats.startTime.getTime();
  }

  /**
   * Get active agent count
   */
  private getActiveAgentCount(): number {
    return Array.from(this.agents.values()).filter((agent) => agent.status !== AgentStatus.OFFLINE).length;
  }

  /**
   * Evaluate agent performance
   */
  private evaluateAgentPerformance(): void {
    for (const agent of this.agents.values()) {
      if (agent.performance.tasksCompleted > 0) {
        agent.performance.successRate =
          ((agent.performance.tasksCompleted - agent.performance.errorCount) / agent.performance.tasksCompleted) * 100;
      }
      agent.performance.lastEvaluated = new Date();
    }
  }

  /**
   * Get system status
   */
  public getStatus() {
    return {
      running: this.isRunning,
      agents: {
        total: this.agents.size,
        active: this.getActiveAgentCount(),
        idle: Array.from(this.agents.values()).filter((a) => a.status === AgentStatus.IDLE).length,
        busy: Array.from(this.agents.values()).filter((a) => a.status === AgentStatus.BUSY).length,
      },
      tasks: {
        total: this.stats.totalTasks,
        pending: Array.from(this.tasks.values()).filter((t) => t.status === 'pending').length,
        inProgress: Array.from(this.tasks.values()).filter((t) => t.status === 'in-progress').length,
        completed: this.stats.completedTasks,
        failed: this.stats.failedTasks,
      },
      performance: {
        successRate: this.stats.totalTasks > 0 ? (this.stats.completedTasks / this.stats.totalTasks) * 100 : 100,
        uptime: this.stats.uptime,
      },
    };
  }

  /**
   * Get agent details
   */
  public getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all agents
   */
  public getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get task details
   */
  public getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Shutdown orchestrator
   */
  public shutdown(): void {
    console.log('🛑 Master Orchestrator shutting down...');
    this.isRunning = false;
    this.emit('shutdown');
  }
}

// Export singleton instance
export const masterOrchestrator = new MasterOrchestrator();

// Example usage
if (import.meta.main) {
  console.log('🚀 Starting Master Orchestrator...\n');

  // Submit example tasks
  masterOrchestrator.submitTask({
    type: 'research',
    priority: TaskPriority.HIGH,
    description: 'Analyze latest AI research papers',
    requirements: ['literature-review', 'data-analysis'],
  });

  masterOrchestrator.submitTask({
    type: 'implementation',
    priority: TaskPriority.MEDIUM,
    description: 'Implement new API endpoint',
    requirements: ['code-generation', 'deployment'],
  });

  // Check status after 15 seconds
  setTimeout(() => {
    console.log('\n📊 System Status:');
    console.log(JSON.stringify(masterOrchestrator.getStatus(), null, 2));
  }, 15000);
}

