import { SimpleExecutor } from './executor';
import { SandboxExecutor } from './sandboxExecutor';
import { CircuitBreaker } from '../../../packages/shared/circuit-breaker/src/index';
import { AgentTask, AgentExecutionResult } from './types';
import { saveTask, updateTask, TaskRecord, getTask } from './persistence';
import { createExecutionRecord, updateExecutionRecord } from './repo';
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
      let execution: any | undefined;
      try {
        await updateTask(id, { status: 'in-progress' });
        this.bus.publish('task.started', { taskId: id, agentId: payload.agentId });
        if (process.env.DATABASE_URL) {
          execution = await createExecutionRecord({ taskId: id, status: 'running' });
        }
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
        if (process.env.DATABASE_URL && execution) {
          await updateExecutionRecord(execution.id, { status: result.success ? 'completed' : 'failed', result: result.output, logs: result.logs });
        }
        this.bus.publish('task.completed', { taskId: id, agentId: payload.agentId, success: result.success });

        return result;
      } catch (err: any) {
        await updateTask(id, { status: 'failed' });
        if (process.env.DATABASE_URL && execution) {
          try {
            // Best-effort update execution
            await updateExecutionRecord((execution as any)?.id ?? '', { status: 'failed', result: { error: err.message } });
          } catch (e) {
            logger.error({ e }, 'failed to update execution record');
          }
        }
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
    if (process.env.DATABASE_URL) {
      const { getActiveExecutionForTask, updateExecutionRecord } = require('./repo');
      const e = await getActiveExecutionForTask(taskId);
      if (e) await updateExecutionRecord(e.id, { status: 'cancelled' });
    }
    logger.info({ taskId }, 'Task cancelled');
  }

  async pauseTask(taskId: string): Promise<void> {
    // Best effort: mark as paused; real pause requires executor cooperation
    await updateTask(taskId, { status: 'paused' as any });
    if (process.env.DATABASE_URL) {
      const { getActiveExecutionForTask, updateExecutionRecord } = require('./repo');
      const e = await getActiveExecutionForTask(taskId);
      if (e) await updateExecutionRecord(e.id, { status: 'paused' });
    }
  }

  async resumeTask(taskId: string): Promise<void> {
    const t = await getTask(taskId);
    if (!t) throw new Error('Task not found');
    if (t.status !== 'paused') throw new Error('Task not paused');
    await updateTask(taskId, { status: 'in-progress' });
    if (process.env.DATABASE_URL) {
      const { getActiveExecutionForTask, createExecutionRecord, updateExecutionRecord } = require('./repo');
      const e = await getActiveExecutionForTask(taskId);
      if (!e) {
        // create a new execution record for resumed task
        await createExecutionRecord({ taskId, status: 'running' });
      } else {
        await updateExecutionRecord(e.id, { status: 'running' } as any);
      }
    }
    // For a resumed task we might re-execute; that behavior is customizable
  }
}
