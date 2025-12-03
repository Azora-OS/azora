
import { CircuitBreaker, CircuitBreakerState } from '../src/middleware/circuit-breaker';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker('test-service', 3, 1000);
  });

  test('should start in CLOSED state', () => {
    expect(breaker.getState()).toBe(CircuitBreakerState.CLOSED);
    expect(breaker.isOpen()).toBe(false);
  });

  test('should open after threshold failures', () => {
    breaker.recordFailure();
    breaker.recordFailure();
    expect(breaker.getState()).toBe(CircuitBreakerState.CLOSED);
    
    breaker.recordFailure();
    expect(breaker.getState()).toBe(CircuitBreakerState.OPEN);
    expect(breaker.isOpen()).toBe(true);
  });

  test('should reset failures on success', () => {
    breaker.recordFailure();
    breaker.recordFailure();
    breaker.recordSuccess();
    
    expect(breaker.getStats().failureCount).toBe(0);
    expect(breaker.getState()).toBe(CircuitBreakerState.CLOSED);
  });

  test('should transition to HALF_OPEN after timeout', async () => {
    breaker.recordFailure();
    breaker.recordFailure();
    breaker.recordFailure(); // Open
    
    // Fast-forward not possible with Date.now(), need to wait or mock
    const originalNow = Date.now;
    Date.now = jest.fn(() => originalNow() + 2000);
    
    expect(breaker.isOpen()).toBe(false); // Should check timeout and move to half-open
    expect(breaker.getState()).toBe(CircuitBreakerState.HALF_OPEN);
    
    Date.now = originalNow;
  });

  test('should close after successes in HALF_OPEN', () => {
    // Force half-open
    breaker['state'] = CircuitBreakerState.HALF_OPEN;
    
    breaker.recordSuccess();
    breaker.recordSuccess();
    breaker.recordSuccess();
    
    expect(breaker.getState()).toBe(CircuitBreakerState.CLOSED);
  });

  test('should reopen immediately on failure in HALF_OPEN', () => {
    breaker['state'] = CircuitBreakerState.HALF_OPEN;
    
    breaker.recordFailure();
    
    expect(breaker.getState()).toBe(CircuitBreakerState.OPEN);
  });
});
