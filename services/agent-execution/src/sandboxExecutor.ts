import { VM } from 'vm2';
import { AgentTask, AgentExecutionResult } from './types';
import { logger } from './logger';

export class SandboxExecutor {
  async executeTask(task: AgentTask): Promise<AgentExecutionResult> {
    const vm = new VM({ timeout: 1000, sandbox: { payload: task.payload } });
    try {
      // The code to run should be in task.payload.code (string) — for security, only allow small scripts
      const code = task.payload?.code ?? "'no-op'";
      const out = vm.run(code);
      return { success: true, output: out, logs: ['sandboxed run success'] };
    } catch (err: any) {
      logger.error({ err }, 'sandbox error');
      return { success: false, error: { message: err.message, stack: err.stack } };
    }
  }
}
