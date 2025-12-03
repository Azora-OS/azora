import { CircuitBreaker } from '../../../packages/shared/circuit-breaker/src/index';

describe('Circuit Breaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker({ failureThreshold: 3, successThreshold: 2, timeoutMs: 1000 });
  });

  it('should allow operations when closed', async () => {
    const result = await breaker.execute(async () => 'success');
    expect(result).toBe('success');
  });

  it('should open after threshold failures', async () => {
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(async () => { throw new Error('fail'); });
      } catch {}
    }

    await expect(
      breaker.execute(async () => 'test')
    ).rejects.toThrow('Circuit breaker is OPEN');
  });

  it('should transition to half-open after timeout', async (done) => {
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(async () => { throw new Error('fail'); });
      } catch {}
    }

    setTimeout(async () => {
      const result = await breaker.execute(async () => 'recovered');
      expect(result).toBe('recovered');
      done();
    }, 1100);
  });
});
