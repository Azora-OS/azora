import { CircuitBreaker } from '../src/index';

describe('CircuitBreaker', () => {
  it('should execute successful operation', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 2, successThreshold: 1, timeoutMs: 1000 });
    const r = await cb.execute(async () => 'ok');
    expect(r).toBe('ok');
  });

  it('should trip on failures', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 1, successThreshold: 1, timeoutMs: 100 });
    await expect(cb.execute(async () => { throw new Error('fail'); })).rejects.toThrow();
    await expect(cb.execute(async () => 'ok')).rejects.toThrow('Circuit breaker is OPEN');
  });
});
