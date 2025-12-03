export interface CollaborationMessage {
  id: string;
  from: string;
  to?: string;
  type: 'broadcast' | 'direct' | 'query' | 'response';
  content: string;
  metadata?: any;
  timestamp: Date;
}

export interface TaskDecomposition {
  taskId: string;
  description: string;
  subtasks: SubTask[];
  requiredAgents: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface SubTask {
  id: string;
  agent: string;
  task: string;
  type: string;
  dependencies?: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
}

export class ResearchCollaborationProtocol {
  private messageQueue: CollaborationMessage[] = [];
  private taskRegistry: Map<string, TaskDecomposition> = new Map();

  async routeMessage(message: CollaborationMessage): Promise<void> {
    this.messageQueue.push(message);
    
    if (message.type === 'broadcast') {
      await this.broadcastToAll(message);
    } else if (message.type === 'direct' && message.to) {
      await this.sendDirect(message);
    }
  }

  async broadcastToAll(message: CollaborationMessage): Promise<void> {
    const agents = ['elara', 'sankofa', 'themba', 'naledi', 'jabari', 'amara', 'kofi', 'zola', 'abeni', 'thembo', 'nexus'];
    
    for (const agent of agents) {
      if (agent !== message.from) {
        await this.notifyAgent(agent, message);
      }
    }
  }

  async sendDirect(message: CollaborationMessage): Promise<void> {
    if (message.to) {
      await this.notifyAgent(message.to, message);
    }
  }

  private async notifyAgent(agent: string, message: CollaborationMessage): Promise<void> {
    // Agent receives message and can respond
    console.log(`[Protocol] ${agent} received message from ${message.from}`);
  }

  registerTask(task: TaskDecomposition): void {
    this.taskRegistry.set(task.taskId, task);
  }

  getTask(taskId: string): TaskDecomposition | undefined {
    return this.taskRegistry.get(taskId);
  }

  updateSubTaskStatus(taskId: string, subtaskId: string, status: SubTask['status']): void {
    const task = this.taskRegistry.get(taskId);
    if (task) {
      const subtask = task.subtasks.find(st => st.id === subtaskId);
      if (subtask) {
        subtask.status = status;
      }
    }
  }

  getMessageHistory(agent?: string, limit: number = 50): CollaborationMessage[] {
    let messages = this.messageQueue;
    
    if (agent) {
      messages = messages.filter(m => m.from === agent || m.to === agent || m.type === 'broadcast');
    }
    
    return messages.slice(-limit);
  }

  clearHistory(): void {
    this.messageQueue = [];
  }
}

export const collaborationProtocol = new ResearchCollaborationProtocol();
