import { AgentRuntime } from '../src/runtime';

describe('AgentRuntime', () => {
  it('should execute a trivial task successfully', async () => {
    const runtime = new AgentRuntime();
    const result = await runtime.executeTask({ payload: { _test: true } });
    expect(result.success).toBe(true);
    expect(result.output).toBeDefined();
  });
});
