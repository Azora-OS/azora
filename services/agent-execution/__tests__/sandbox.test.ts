import { SandboxExecutor } from '../src/sandboxExecutor';

describe('SandboxExecutor', () => {
  it('should run simple JS safely', async () => {
    const s = new SandboxExecutor();
    const result = await s.executeTask({ id: 's1', createdAt: new Date().toISOString(), payload: { code: 'payload.x + 1', x: 1 }, status: 'pending' } as any);
    expect(result.success).toBeTruthy();
  });
  it('should not allow requiring modules', async () => {
    const s = new SandboxExecutor();
    const result = await s.executeTask({ id: 's2', createdAt: new Date().toISOString(), payload: { code: "require('fs')" }, status: 'pending' } as any);
    expect(result.success).toBe(false);
  });
});
