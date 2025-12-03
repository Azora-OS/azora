import { createExecutionRecord, getExecutionRecord, updateExecutionRecord } from '../src/repo';

describe('execution persistence', () => {
  it('skips when no DATABASE_URL', async () => {
    if (!process.env.DATABASE_URL) return;
    const e = await createExecutionRecord({ taskId: 't-1', status: 'running' });
    expect(e).toHaveProperty('id');
    const got = await getExecutionRecord(e.id);
    expect(got?.id).toBe(e.id);
    await updateExecutionRecord(e.id, { status: 'completed', result: { ok: true } });
    const updated = await getExecutionRecord(e.id);
    expect(updated?.status).toBe('completed');
  });
});
