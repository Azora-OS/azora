class CircuitBreaker {
  constructor() {
    this.circuits = new Map();
    this.threshold = 5;
    this.timeout = 60000;
    this.resetTimeout = 30000;
  }

  getCircuit(serviceName) {
    if (!this.circuits.has(serviceName)) {
      this.circuits.set(serviceName, {
        state: 'closed',
        failures: 0,
        lastFailure: null,
        successCount: 0
      });
    }
    return this.circuits.get(serviceName);
  }

  async call(serviceName, fn) {
    const circuit = this.getCircuit(serviceName);

    if (circuit.state === 'open') {
      if (Date.now() - circuit.lastFailure > this.resetTimeout) {
        circuit.state = 'half-open';
      } else {
        throw new Error(`Circuit breaker open for ${serviceName}`);
      }
    }

    try {
      const result = await Promise.race([
        fn(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), this.timeout)
        )
      ]);

      this.onSuccess(serviceName);
      return result;
    } catch (error) {
      this.onFailure(serviceName);
      throw error;
    }
  }

  onSuccess(serviceName) {
    const circuit = this.getCircuit(serviceName);
    circuit.failures = 0;
    circuit.successCount++;

    if (circuit.state === 'half-open' && circuit.successCount >= 3) {
      circuit.state = 'closed';
      circuit.successCount = 0;
    }
  }

  onFailure(serviceName) {
    const circuit = this.getCircuit(serviceName);
    circuit.failures++;
    circuit.lastFailure = Date.now();

    if (circuit.failures >= this.threshold) {
      circuit.state = 'open';
    }
  }

  getState(serviceName) {
    return this.getCircuit(serviceName).state;
  }

  reset(serviceName) {
    const circuit = this.getCircuit(serviceName);
    circuit.state = 'closed';
    circuit.failures = 0;
    circuit.successCount = 0;
  }
}

module.exports = new CircuitBreaker();
