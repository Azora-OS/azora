import { AgentTask, AgentExecutionResult } from './types';
import { EventBus } from '../../../packages/shared/event-bus/src/index';
export declare class AgentRuntime {
    private executor;
    private active;
    private bus;
    private circuit;
    constructor(bus?: EventBus);
    executeTask(payload: Omit<AgentTask, 'id' | 'createdAt' | 'status'> & {
        status?: string;
    }): Promise<AgentExecutionResult>;
    getActiveExecutions(): string[];
    getAgentStatus(agentId: string): Promise<{
        agentId: string;
        state: string;
        activeTasks: any[];
    }>;
    cancelTask(taskId: string): Promise<void>;
    pauseTask(taskId: string): Promise<void>;
    resumeTask(taskId: string): Promise<void>;
}
//# sourceMappingURL=runtime.d.ts.map