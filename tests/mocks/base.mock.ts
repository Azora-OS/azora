/**
 * Base class for mock services
 */
export abstract class BaseMock {
  protected calls: Map<string, any[]> = new Map();
  protected responses: Map<string, any> = new Map();

  /**
   * Track a method call
   */
  protected trackCall(method: string, args: any[]): void {
    if (!this.calls.has(method)) {
      this.calls.set(method, []);
    }
    this.calls.get(method)!.push(args);
  }

  /**
   * Get all calls for a method
   */
  getCalls(method: string): any[][] {
    return this.calls.get(method) || [];
  }

  /**
   * Get call count for a method
   */
  getCallCount(method: string): number {
    return this.getCalls(method).length;
  }

  /**
   * Check if method was called
   */
  wasCalled(method: string): boolean {
    return this.getCallCount(method) > 0;
  }

  /**
   * Check if method was called with specific arguments
   */
  wasCalledWith(method: string, ...args: any[]): boolean {
    const calls = this.getCalls(method);
    return calls.some(call => 
      JSON.stringify(call) === JSON.stringify(args)
    );
  }

  /**
   * Set response for a method
   */
  setResponse(method: string, response: any): void {
    this.responses.set(method, response);
  }

  /**
   * Get response for a method
   */
  protected getResponse(method: string, defaultResponse?: any): any {
    return this.responses.get(method) ?? defaultResponse;
  }

  /**
   * Reset all calls and responses
   */
  reset(): void {
    this.calls.clear();
    this.responses.clear();
  }

  /**
   * Verify method was called exactly n times
   */
  verifyCallCount(method: string, expectedCount: number): void {
    const actualCount = this.getCallCount(method);
    if (actualCount !== expectedCount) {
      throw new Error(
        `Expected ${method} to be called ${expectedCount} times, but was called ${actualCount} times`
      );
    }
  }

  /**
   * Verify method was called at least once
   */
  verifyWasCalled(method: string): void {
    if (!this.wasCalled(method)) {
      throw new Error(`Expected ${method} to be called at least once`);
    }
  }

  /**
   * Verify method was never called
   */
  verifyWasNotCalled(method: string): void {
    if (this.wasCalled(method)) {
      const count = this.getCallCount(method);
      throw new Error(`Expected ${method} to not be called, but was called ${count} times`);
    }
  }
}

/**
 * Mock service registry for managing all mocks
 */
export class MockServiceRegistry {
  private mocks: Map<string, BaseMock> = new Map();

  /**
   * Register a mock service
   */
  register(name: string, mock: BaseMock): void {
    this.mocks.set(name, mock);
  }

  /**
   * Get a mock service
   */
  get<T extends BaseMock>(name: string): T | undefined {
    return this.mocks.get(name) as T;
  }

  /**
   * Reset all registered mocks
   */
  resetAll(): void {
    this.mocks.forEach(mock => mock.reset());
  }

  /**
   * Clear all registered mocks
   */
  clear(): void {
    this.mocks.clear();
  }
}

// Global mock registry
export const mockRegistry = new MockServiceRegistry();
