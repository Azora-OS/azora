import { EventBus } from '../../../packages/shared/event-bus/src/index';
import { logger } from './logger';

interface AgentHandoff {
  fromAgentId: string;
  toAgentId: string;
  taskId: string;
  context: Record<string, any>;
  timestamp: string;
}

interface AgentState {
  agentId: string;
  status: 'idle' | 'busy' | 'offline';
  capabilities: string[];
  currentTasks: string[];
}

export class AgentCollaboration {
  private bus: EventBus;
  private agents = new Map<string, AgentState>();

  constructor(bus?: EventBus) {
    this.bus = bus ?? new EventBus();
    this.setupHandlers();
  }

  private setupHandlers() {
    this.bus.subscribe('agent.register', (data) => {
      this.registerAgent(data.agentId, data.capabilities);
    });

    this.bus.subscribe('agent.status', (data) => {
      this.updateAgentStatus(data.agentId, data.status);
    });

    this.bus.subscribe('task.handoff', (data) => {
      this.handleTaskHandoff(data);
    });
  }

  registerAgent(agentId: string, capabilities: string[]) {
    this.agents.set(agentId, {
      agentId,
      status: 'idle',
      capabilities,
      currentTasks: []
    });
    logger.info({ agentId, capabilities }, 'Agent registered');
  }

  updateAgentStatus(agentId: string, status: 'idle' | 'busy' | 'offline') {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = status;
      this.bus.publish('agent.status.updated', { agentId, status });
    }
  }

  async handoffTask(handoff: Omit<AgentHandoff, 'timestamp'>): Promise<void> {
    const fromAgent = this.agents.get(handoff.fromAgentId);
    const toAgent = this.agents.get(handoff.toAgentId);

    if (!toAgent) {
      throw new Error(`Target agent ${handoff.toAgentId} not found`);
    }

    if (toAgent.status === 'offline') {
      throw new Error(`Target agent ${handoff.toAgentId} is offline`);
    }

    const fullHandoff: AgentHandoff = {
      ...handoff,
      timestamp: new Date().toISOString()
    };

    if (fromAgent) {
      fromAgent.currentTasks = fromAgent.currentTasks.filter(t => t !== handoff.taskId);
    }
    toAgent.currentTasks.push(handoff.taskId);

    await this.bus.publish('task.handoff', fullHandoff);
    logger.info(fullHandoff, 'Task handed off');
  }

  findCapableAgent(requiredCapability: string): string | null {
    for (const [id, agent] of this.agents) {
      if (agent.status === 'idle' && agent.capabilities.includes(requiredCapability)) {
        return id;
      }
    }
    return null;
  }

  getAgentState(agentId: string): AgentState | undefined {
    return this.agents.get(agentId);
  }

  getAllAgents(): AgentState[] {
    return Array.from(this.agents.values());
  }
}
