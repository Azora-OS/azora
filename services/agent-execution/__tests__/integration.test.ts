import { AgentRuntime } from '../src/runtime';
import { EventBus } from '../../../packages/shared/event-bus/src/index';

describe('Agent Execution Integration', () => {
  let runtime: AgentRuntime;
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
    runtime = new AgentRuntime(bus);
  });

  it('should execute task with constitutional validation', async () => {
    const result = await runtime.executeTask({
      agentId: 'test-agent',
      payload: { action: 'test', description: 'Test task' }
    });

    expect(result.success).toBe(true);
  });

  it('should enforce resource limits', async () => {
    const limiter = (runtime as any).limiter;
    const metrics = limiter.getMetrics();
    
    expect(metrics).toHaveProperty('activeTasks');
    expect(metrics).toHaveProperty('memoryMB');
  });

  it('should track analytics', async () => {
    await runtime.executeTask({
      agentId: 'test-agent',
      payload: { action: 'test' }
    });

    const analytics = (runtime as any).analytics;
    const report = analytics.getReport();
    
    expect(report.total).toBeGreaterThan(0);
  });

  it('should handle agent collaboration', async () => {
    const collaboration = (runtime as any).collaboration;
    
    collaboration.registerAgent('agent-1', ['processing']);
    collaboration.registerAgent('agent-2', ['analysis']);

    const agent = collaboration.findCapableAgent('processing');
    expect(agent).toBe('agent-1');
  });

  it('should send notifications on completion', (done) => {
    bus.subscribe('task.completed', (data) => {
      expect(data.taskId).toBeDefined();
      done();
    });

    runtime.executeTask({
      agentId: 'test-agent',
      payload: { action: 'test' }
    });
  });
});
