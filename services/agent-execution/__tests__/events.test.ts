import { AgentRuntime } from '../src/runtime';
import { EventBus } from '../../packages/shared/event-bus/src/index';

describe('AgentRuntime events', () => {
  it('publishes task.started and task.completed', async () => {
    const bus = new EventBus();
    const started: any[] = [];
    const completed: any[] = [];
    bus.subscribe('task.started', (p) => started.push(p));
    bus.subscribe('task.completed', (p) => completed.push(p));

    const runtime = new AgentRuntime(bus as any);
    const result = await runtime.executeTask({ payload: { test: true } });
    expect(result.success).toBe(true);
    // ensure events were published
    expect(started.length).toBeGreaterThan(0);
    expect(completed.length).toBeGreaterThan(0);
  });
});
