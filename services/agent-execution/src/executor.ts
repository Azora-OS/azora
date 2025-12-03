import { AgentTask, AgentExecutionResult } from './types';
import { logger } from './logger';
import axios from 'axios';

// Executor invokes AI providers or other subsystems on behalf of an agent.
export class SimpleExecutor {
  async executeTask(task: AgentTask): Promise<AgentExecutionResult> {
    logger.info({ taskId: task.id }, 'Executing task');

    // Placeholder: Replace with provider call or task-specific logic.
    const logs: string[] = [];
    try {
      logs.push('start');
      // If the task requests llm provider call, route it
      if (task.payload && task.payload.llm) {
        const provider = process.env.AI_PROVIDER_URL ?? 'http://localhost:4010';
        const body = task.payload.llm; // expects OpenAI chat completion body
        const resp = await axios.post(`${provider}/v1/chat/completions`, body);
        logs.push('llm-callback');
        return { success: true, output: resp.data, logs };
      }
      // Simulate some async work otherwise
      await new Promise(resolve => setTimeout(resolve, 100));
      logs.push('done');
      return { success: true, output: { message: 'task completed' }, logs };
    } catch (err: any) {
      return { success: false, error: { message: err.message, stack: err.stack }, logs };
    }
  }
}
