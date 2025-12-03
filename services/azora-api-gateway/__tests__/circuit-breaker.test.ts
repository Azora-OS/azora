import { CircuitBreaker, CircuitBreakerState } from '../src/middleware/circuit-breaker';

describe('Circuit Breaker', () => {
  it('opens after threshold failures and transitions to half-open after timeout', async () => {
    const cb = new CircuitBreaker('test-service', 3, 1000); // threshold 3, timeout 1 sec
    expect(cb.getState()).toBe(CircuitBreakerState.CLOSED);

    cb.recordFailure();
    cb.recordFailure();
    expect(cb.getState()).toBe(CircuitBreakerState.CLOSED);

    cb.recordFailure();
    expect(cb.getState()).toBe(CircuitBreakerState.OPEN);

    // Wait for timeout
    await new Promise(r => setTimeout(r, 1100));
    expect(cb.isOpen()).toBe(false); // Should transition to HALF_OPEN
    expect(cb.getState()).toBe(CircuitBreakerState.HALF_OPEN);

    // In half-open, record success 3 times to close
    cb.recordSuccess(); cb.recordSuccess(); cb.recordSuccess();
    expect(cb.getState()).toBe(CircuitBreakerState.CLOSED);
  });
});
