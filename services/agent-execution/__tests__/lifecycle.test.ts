import { AgentRuntime } from '../src/runtime';
import { saveTask, getTask } from '../src/persistence';

describe('Agent Lifecycle', () => {
  it('should cancel a task', async () => {
    const runtime = new AgentRuntime();
    const t = { id: 'l-t-1', status: 'pending', createdAt: Date.now(), updatedAt: Date.now(), payload: {} } as any;
    await saveTask(t);
    await runtime.cancelTask(t.id);
    const got = await getTask(t.id);
    expect(got?.status).toBe('cancelled');
  });

  it('should pause and resume a task', async () => {
    const runtime = new AgentRuntime();
    const t = { id: 'l-t-2', status: 'pending', createdAt: Date.now(), updatedAt: Date.now(), payload: {} } as any;
    await saveTask(t);
    await runtime.pauseTask(t.id);
    let got = await getTask(t.id);
    expect(got?.status).toBe('paused');
    await runtime.resumeTask(t.id);
    got = await getTask(t.id);
    expect(got?.status).toBe('in-progress');
  });
});
