import { Event, Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IMultiAgentService, IAgentTask } from './multiAgentService.js';
import { IAIProviderRouter, AIRequest } from './aiProviderRouter.js';

export interface IAgentExecutionResult {
  success: boolean;
  output?: any;
  logs?: string[];
  error?: string;
}

export const IAgentExecutionRuntime = createDecorator<IAgentExecutionRuntime>('agentExecutionRuntime');

export interface IAgentExecutionRuntime {
  executeTask(task: IAgentTask): Promise<IAgentExecutionResult>;
  pauseTask(taskId: string): Promise<void>;
  resumeTask(taskId: string): Promise<void>;
  cancelTask(taskId: string): Promise<void>;
  getAgentStatus(agentName: string): Promise<any>;
}

export class AgentExecutionRuntime extends Disposable implements IAgentExecutionRuntime {
  private active: Map<string, Promise<IAgentExecutionResult>> = new Map();
  private readonly _onExecutionStarted = this._register(new Emitter<string>());
  readonly onExecutionStarted: Event<string> = this._onExecutionStarted.event;

  constructor(private readonly multiAgentService: IMultiAgentService, private readonly aiRouter: IAIProviderRouter) {
    super();
  }

  async executeTask(task: IAgentTask): Promise<IAgentExecutionResult> {
    // Persist task in multiAgentService
    const created = this.multiAgentService.createTask({
      title: task.title,
      description: task.description,
      priority: task.priority as any,
      dependencies: task.dependencies,
      estimatedDuration: task.estimatedDuration
    });

    // assign task
    if (task.assignedTo) {
      this.multiAgentService.assignTask(created.id, task.assignedTo);
    }

    // Notify start
    this._onExecutionStarted.fire(created.id);

    // Perform execution: if payload indicates LLM use, route via AI Router
    // (Task extension to use property `payload.llm` for now)
    const execPromise = (async () => {
      try {
        this.multiAgentService.sendMessage({ from: 'runtime', to: undefined, type: 'status_update', content: `Task ${created.id} started`, metadata: { taskId: created.id } });

        // If task has LLM instruction, route to AI provider
        if ((task as any).payload?.llm) {
          const AIpayload: AIRequest = { prompt: (task as any).payload.llm.prompt || (task as any).payload.llm }; 
          const resp = await this.aiRouter.routeRequest(AIpayload);
          // update task with result
          this.multiAgentService.updateTask(created.id, { status: 'completed', result: resp });
          this.multiAgentService.sendMessage({ from: 'runtime', to: undefined, type: 'task_complete', content: `Task ${created.id} completed`, metadata: { result: resp } });
          return { success: true, output: resp } as IAgentExecutionResult;
        }

        // Simulate non-LLM tasks
        await new Promise(resolve => setTimeout(resolve, 200));
        this.multiAgentService.updateTask(created.id, { status: 'completed' });
        this.multiAgentService.sendMessage({ from: 'runtime', to: undefined, type: 'task_complete', content: `Task ${created.id} completed`, metadata: {} });
        return { success: true, output: { message: 'executed' } } as IAgentExecutionResult;
      } catch (err: any) {
        this.multiAgentService.updateTask(created.id, { status: 'blocked' });
        this.multiAgentService.sendMessage({ from: 'runtime', to: undefined, type: 'status_update', content: `Task ${created.id} failed: ${err}`, metadata: { taskId: created.id } });
        return { success: false, error: String(err) } as IAgentExecutionResult;
      }
    })();

    this.active.set(created.id, execPromise);
    execPromise.finally(() => this.active.delete(created.id));
    return execPromise;
  }

  async pauseTask(taskId: string): Promise<void> {
    // Best effort: set task as blocked
    this.multiAgentService.updateTask(taskId, { status: 'blocked' });
  }

  async resumeTask(taskId: string): Promise<void> {
    // Best effort: set task as in_progress; real resume requires execution context
    this.multiAgentService.updateTask(taskId, { status: 'in_progress' });
  }

  async cancelTask(taskId: string): Promise<void> {
    this.multiAgentService.updateTask(taskId, { status: 'done' });
    // notify
    this.multiAgentService.sendMessage({ from: 'runtime', to: undefined, type: 'task_complete', content: `Task ${taskId} cancelled`, metadata: {} });
  }

  async getAgentStatus(agentName: string): Promise<any> {
    const sessionStatus = this.multiAgentService.getAgentStatus(agentName);
    return { agentName, status: sessionStatus };
  }
}
