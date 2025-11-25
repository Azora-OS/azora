// AZORA OS - RESILIENCE CONFIGURATION
// Circuit breakers, retry mechanisms, and fallback strategies

const CircuitBreaker = require('opossum');

class ResilienceManager {
  constructor() {
    this.circuitBreakers = new Map();
    this.retryConfigs = new Map();
    this.fallbacks = new Map();
    this.initializeDefaults();
  }

  initializeDefaults() {
    // Default circuit breaker configuration
    this.defaultCircuitConfig = {
      timeout: 5000, // 5 seconds
      errorThresholdPercentage: 50, // Open after 50% failures
      resetTimeout: 30000, // Try to close after 30 seconds
      name: 'default-circuit-breaker'
    };

    // Default retry configuration
    this.defaultRetryConfig = {
      maxRetries: 3,
      baseDelay: 1000, // 1 second
      maxDelay: 10000, // 10 seconds
      backoffMultiplier: 2,
      jitter: true
    };

    // Service-specific configurations
    this.serviceConfigs = {
      auth: {
        circuitBreaker: {
          timeout: 3000,
          errorThresholdPercentage: 30,
          resetTimeout: 20000,
          name: 'auth-service-circuit-breaker'
        },
        retry: {
          maxRetries: 2,
          baseDelay: 500
        }
      },
      payments: {
        circuitBreaker: {
          timeout: 10000,
          errorThresholdPercentage: 20,
          resetTimeout: 60000,
          name: 'payments-service-circuit-breaker'
        },
        retry: {
          maxRetries: 1, // Critical service, fewer retries
          baseDelay: 2000
        }
      },
      database: {
        circuitBreaker: {
          timeout: 8000,
          errorThresholdPercentage: 40,
          resetTimeout: 45000,
          name: 'database-circuit-breaker'
        },
        retry: {
          maxRetries: 2,
          baseDelay: 1500
        }
      }
    };
  }

  // Create or get circuit breaker for a service
  getCircuitBreaker(serviceName, operation) {
    const key = `${serviceName}-${operation}`;

    if (!this.circuitBreakers.has(key)) {
      const config = this.serviceConfigs[serviceName]?.circuitBreaker || this.defaultCircuitConfig;
      const breaker = new CircuitBreaker(operation, {
        ...config,
        name: `${serviceName}-${operation}-circuit-breaker`
      });

      // Add event listeners for monitoring
      breaker.on('open', () => {
        console.log(`Circuit breaker opened for ${serviceName}-${operation}`);
        // Emit metrics event here
      });

      breaker.on('halfOpen', () => {
        console.log(`Circuit breaker half-open for ${serviceName}-${operation}`);
      });

      breaker.on('close', () => {
        console.log(`Circuit breaker closed for ${serviceName}-${operation}`);
      });

      this.circuitBreakers.set(key, breaker);
    }

    return this.circuitBreakers.get(key);
  }

  // Execute operation with circuit breaker protection
  async executeWithCircuitBreaker(serviceName, operation, ...args) {
    const breaker = this.getCircuitBreaker(serviceName, operation);
    return await breaker.fire(...args);
  }

  // Retry mechanism with exponential backoff
  async executeWithRetry(operation, config = {}) {
    const retryConfig = { ...this.defaultRetryConfig, ...config };
    let lastError;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === retryConfig.maxRetries) {
          break; // No more retries
        }

        // Calculate delay with exponential backoff
        let delay = retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt);
        delay = Math.min(delay, retryConfig.maxDelay);

        // Add jitter to prevent thundering herd
        if (retryConfig.jitter) {
          delay = delay * (0.5 + Math.random() * 0.5); // 50-100% of calculated delay
        }

        console.log(`Retry attempt ${attempt + 1} for operation, waiting ${Math.round(delay)}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  // Execute with both circuit breaker and retry
  async executeResilient(serviceName, operation, retryConfig = {}) {
    const circuitOperation = () => this.executeWithRetry(operation, retryConfig);
    return await this.executeWithCircuitBreaker(serviceName, circuitOperation);
  }

  // Register fallback for a service/operation
  registerFallback(serviceName, operation, fallbackFn) {
    const key = `${serviceName}-${operation}`;
    this.fallbacks.set(key, fallbackFn);
  }

  // Execute with fallback
  async executeWithFallback(serviceName, operation, fallbackArgs = []) {
    try {
      return await operation();
    } catch (error) {
      const key = `${serviceName}-${operation.name}`;
      const fallback = this.fallbacks.get(key);

      if (fallback) {
        console.log(`Using fallback for ${serviceName}-${operation.name}`);
        return await fallback(...fallbackArgs);
      }

      throw error;
    }
  }

  // Health check for circuit breakers
  getHealthStatus() {
    const status = {};

    for (const [key, breaker] of this.circuitBreakers.entries()) {
      status[key] = {
        state: breaker.opened ? 'open' : breaker.halfOpen ? 'half-open' : 'closed',
        failures: breaker.stats.failures,
        successes: breaker.stats.successes,
        timeouts: breaker.stats.timeouts,
        lastOpened: breaker.lastOpened,
        lastClosed: breaker.lastClosed
      };
    }

    return status;
  }

  // Graceful shutdown
  async shutdown() {
    console.log('Shutting down resilience manager...');

    for (const breaker of this.circuitBreakers.values()) {
      breaker.shutdown();
    }

    this.circuitBreakers.clear();
    this.fallbacks.clear();
  }
}

// Singleton instance
const resilienceManager = new ResilienceManager();

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  await resilienceManager.shutdown();
});

process.on('SIGINT', async () => {
  await resilienceManager.shutdown();
});

module.exports = resilienceManager;