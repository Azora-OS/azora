import { saveTask, getTask, updateTask, inMemoryTaskStore } from '../src/persistence';

describe('persistence fallback', () => {
  it('should save and load a task in-memory when no DATABASE_URL', async () => {
    const id = 't-123';
    await saveTask({ id, status: 'pending', createdAt: Date.now(), updatedAt: Date.now(), payload: { test: true } });
    const t = await getTask(id);
    expect(t).not.toBeNull();
    expect(inMemoryTaskStore.size).toBeGreaterThan(0);
    await updateTask(id, { status: 'in-progress' });
    const t2 = await getTask(id);
    expect(t2?.status).toBe('in-progress');
  });
});
