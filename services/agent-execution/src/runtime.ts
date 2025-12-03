import { SimpleExecutor } from './executor';
import { SandboxExecutor } from './sandboxExecutor';
import { CircuitBreaker } from '../../../packages/shared/circuit-breaker/src/index';
import { AgentTask, AgentExecutionResult } from './types';
import { saveTask, updateTask, TaskRecord, getTask } from './persistence';
import { nanoid } from 'nanoid';
import { logger } from './logger';
import { EventBus } from '../../../packages/shared/event-bus/src/index';

export class AgentRuntime {
  private executor: SimpleExecutor | SandboxExecutor;
  private active: Map<string, Promise<AgentExecutionResult>> = new Map();
  private bus = new EventBus();

  private circuit: CircuitBreaker;
  constructor(bus?: EventBus) {
    if (process.env.SANDBOX_ENABLED === 'true') {
      this.executor = new SandboxExecutor();
    } else this.executor = new SimpleExecutor();
    this.circuit = new CircuitBreaker();
    if (bus) this.bus = bus;
  }

  async executeTask(payload: Omit<AgentTask, 'id' | 'createdAt' | 'status'> & { status?: string }): Promise<AgentExecutionResult> {
    const id = nanoid();
    const task: TaskRecord = {
      id,
      status: 'pending',
      payload: payload.payload,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      agentId: payload.agentId
    };

    await saveTask(task);
    logger.info({ taskId: id }, 'Saved task, starting execution');

    const promise = (async () => {
      try {
        await updateTask(id, { status: 'in-progress' });
        this.bus.publish('task.started', { taskId: id, agentId: payload.agentId });
        const result = await this.circuit.execute(() => this.executor.executeTask({
          id,
          createdAt: new Date().toISOString(),
          payload: payload.payload,
          status: 'in-progress',
          agentId: payload.agentId
        } as AgentTask));

        await updateTask(id, {
          status: result.success ? 'completed' : 'failed'
        });
        this.bus.publish('task.completed', { taskId: id, agentId: payload.agentId, success: result.success });

        return result;
      } catch (err: any) {
        await updateTask(id, { status: 'failed' });
        return { success: false, error: { message: err.message, stack: err.stack } } as AgentExecutionResult;
      }
    })();

    this.active.set(id, promise);
    // Remove active after completion
    promise.finally(() => this.active.delete(id));
    return promise;
  }

  getActiveExecutions(): string[] {
    return Array.from(this.active.keys());
  }

  async getAgentStatus(agentId: string) {
    // Minimal implementation: list active tasks owned by agent and return a status.
    const tasks = [] as any[];
    for (const [id] of this.active) {
      // We can't fetch task details if we don't store execution metadata; return id only
      tasks.push({ id, agentId });
    }
    return { agentId, state: tasks.length ? 'busy' : 'idle', activeTasks: tasks };
  }

  async cancelTask(taskId: string): Promise<void> {
    // Cancellation is best-effort in this minimal skeleton;
    await updateTask(taskId, { status: 'cancelled' });
    logger.info({ taskId }, 'Task cancelled');
  }

  async pauseTask(taskId: string): Promise<void> {
    // Best effort: mark as paused; real pause requires executor cooperation
    await updateTask(taskId, { status: 'paused' as any });
  }

  async resumeTask(taskId: string): Promise<void> {
    const t = await getTask(taskId);
    if (!t) throw new Error('Task not found');
    if (t.status !== 'paused') throw new Error('Task not paused');
    await updateTask(taskId, { status: 'in-progress' });
    // For a resumed task we might re-execute; that behavior is customizable
  }
}
