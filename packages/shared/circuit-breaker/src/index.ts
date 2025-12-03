type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  failureThreshold: number; // failures before opening
  successThreshold: number; // successes before closing
  timeoutMs: number; // how long to stay open
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures = 0;
  private successes = 0;
  private nextAttempt = 0;
  private opts: CircuitBreakerOptions;

  constructor(opts?: Partial<CircuitBreakerOptions>) {
    this.opts = Object.assign({ failureThreshold: 5, successThreshold: 2, timeoutMs: 60_000 }, opts);
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() >= this.nextAttempt) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private onSuccess() {
    this.successes++;
    if (this.successes >= this.opts.successThreshold) {
      this.reset();
    }
  }

  private onFailure() {
    this.failures++;
    if (this.failures >= this.opts.failureThreshold) {
      this.trip();
    }
  }

  private trip() {
    this.state = 'OPEN';
    this.nextAttempt = Date.now() + this.opts.timeoutMs;
    this.failures = 0;
    this.successes = 0;
  }

  private reset() {
    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
  }
}
