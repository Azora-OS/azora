export type AgentTaskStatus = 'pending' | 'in-progress' | 'completed' | 'failed' | 'cancelled';

export interface AgentTask {
  id: string;
  agentId?: string;
  createdAt: string;
  payload: Record<string, any>;
  status: AgentTaskStatus;
  retries?: number;
  priority?: number;
}

export interface AgentExecutionResult {
  success: boolean;
  output?: any;
  logs?: string[];
  error?: { message: string; stack?: string };
}

export interface IAgentExecutor {
  executeTask(task: AgentTask): Promise<AgentExecutionResult>;
  getAgentStatus(agentId: string): Promise<any>;
  pauseTask(taskId: string): Promise<void>;
  resumeTask(taskId: string): Promise<void>;
  cancelTask(taskId: string): Promise<void>;
}
