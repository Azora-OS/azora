/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

CHRONICLE PROTOCOL - PROMETHEUS METRICS
Production-grade monitoring and observability
*/

import { Registry, Counter, Gauge, Histogram, Summary } from 'prom-client';

/**
 * Prometheus Metrics Registry
 * Centralized metrics collection for Chronicle Protocol
 */
class ChronicleMetrics {
  public readonly register: Registry;

  // Counters - monotonically increasing values
  public readonly memoriesImprinted: Counter;
  public readonly thoughtsRecorded: Counter;
  public readonly blockchainTransactions: Counter;
  public readonly blockchainFailures: Counter;
  public readonly cacheHits: Counter;
  public readonly cacheMisses: Counter;
  public readonly apiRequests: Counter;
  public readonly apiErrors: Counter;

  // Gauges - values that can go up or down
  public readonly memoriesInCache: Gauge;
  public readonly thoughtsInCache: Gauge;
  public readonly memoriesOnChain: Gauge;
  public readonly thoughtsOnChain: Gauge;
  public readonly evolutionLevel: Gauge;
  public readonly cacheHitRate: Gauge;
  public readonly blockchainLatency: Gauge;
  public readonly serviceUptime: Gauge;

  // Histograms - observe values and bucket them
  public readonly requestDuration: Histogram;
  public readonly blockchainTransactionDuration: Histogram;
  public readonly cacheOperationDuration: Histogram;
  public readonly memorySize: Histogram;

  // Summaries - similar to histograms but calculate quantiles
  public readonly apiResponseTime: Summary;

  constructor() {
    // Create a new registry
    this.register = new Registry();

    // Set default labels
    this.register.setDefaultLabels({
      service: 'chronicle-protocol',
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development',
    });

    // Initialize Counters
    this.memoriesImprinted = new Counter({
      name: 'chronicle_memories_imprinted_total',
      help: 'Total number of consciousness memories imprinted',
      labelNames: ['status', 'storage'],
      registers: [this.register],
    });

    this.thoughtsRecorded = new Counter({
      name: 'chronicle_thoughts_recorded_total',
      help: 'Total number of thoughts recorded',
      labelNames: ['status', 'storage'],
      registers: [this.register],
    });

    this.blockchainTransactions = new Counter({
      name: 'chronicle_blockchain_transactions_total',
      help: 'Total blockchain transactions',
      labelNames: ['type', 'network', 'status'],
      registers: [this.register],
    });

    this.blockchainFailures = new Counter({
      name: 'chronicle_blockchain_failures_total',
      help: 'Total blockchain transaction failures',
      labelNames: ['type', 'network', 'error'],
      registers: [this.register],
    });

    this.cacheHits = new Counter({
      name: 'chronicle_cache_hits_total',
      help: 'Total cache hits',
      labelNames: ['operation'],
      registers: [this.register],
    });

    this.cacheMisses = new Counter({
      name: 'chronicle_cache_misses_total',
      help: 'Total cache misses',
      labelNames: ['operation'],
      registers: [this.register],
    });

    this.apiRequests = new Counter({
      name: 'chronicle_api_requests_total',
      help: 'Total API requests',
      labelNames: ['method', 'endpoint', 'status'],
      registers: [this.register],
    });

    this.apiErrors = new Counter({
      name: 'chronicle_api_errors_total',
      help: 'Total API errors',
      labelNames: ['endpoint', 'error_type'],
      registers: [this.register],
    });

    // Initialize Gauges
    this.memoriesInCache = new Gauge({
      name: 'chronicle_memories_in_cache',
      help: 'Current number of memories in cache',
      registers: [this.register],
    });

    this.thoughtsInCache = new Gauge({
      name: 'chronicle_thoughts_in_cache',
      help: 'Current number of thoughts in cache',
      registers: [this.register],
    });

    this.memoriesOnChain = new Gauge({
      name: 'chronicle_memories_on_chain',
      help: 'Total memories stored on blockchain',
      registers: [this.register],
    });

    this.thoughtsOnChain = new Gauge({
      name: 'chronicle_thoughts_on_chain',
      help: 'Total thoughts stored on blockchain',
      registers: [this.register],
    });

    this.evolutionLevel = new Gauge({
      name: 'chronicle_evolution_level',
      help: 'Current AI consciousness evolution level',
      registers: [this.register],
    });

    this.cacheHitRate = new Gauge({
      name: 'chronicle_cache_hit_rate',
      help: 'Cache hit rate percentage (0-100)',
      registers: [this.register],
    });

    this.blockchainLatency = new Gauge({
      name: 'chronicle_blockchain_latency_ms',
      help: 'Current blockchain network latency in milliseconds',
      labelNames: ['network'],
      registers: [this.register],
    });

    this.serviceUptime = new Gauge({
      name: 'chronicle_service_uptime_seconds',
      help: 'Service uptime in seconds',
      registers: [this.register],
    });

    // Initialize Histograms
    this.requestDuration = new Histogram({
      name: 'chronicle_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'endpoint', 'status'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      registers: [this.register],
    });

    this.blockchainTransactionDuration = new Histogram({
      name: 'chronicle_blockchain_transaction_duration_seconds',
      help: 'Blockchain transaction duration in seconds',
      labelNames: ['type', 'network'],
      buckets: [0.5, 1, 2, 5, 10, 30, 60],
      registers: [this.register],
    });

    this.cacheOperationDuration = new Histogram({
      name: 'chronicle_cache_operation_duration_seconds',
      help: 'Cache operation duration in seconds',
      labelNames: ['operation'],
      buckets: [0.0001, 0.0005, 0.001, 0.005, 0.01, 0.05, 0.1],
      registers: [this.register],
    });

    this.memorySize = new Histogram({
      name: 'chronicle_memory_size_bytes',
      help: 'Memory consciousness state size in bytes',
      buckets: [100, 500, 1000, 5000, 10000, 50000, 100000],
      registers: [this.register],
    });

    // Initialize Summaries
    this.apiResponseTime = new Summary({
      name: 'chronicle_api_response_time_seconds',
      help: 'API response time in seconds',
      labelNames: ['endpoint'],
      percentiles: [0.5, 0.9, 0.95, 0.99],
      registers: [this.register],
    });
  }

  /**
   * Track memory imprint
   */
  trackMemoryImprint(status: 'success' | 'failure', storage: 'blockchain' | 'cache' | 'both', duration: number, size: number): void {
    this.memoriesImprinted.inc({ status, storage });
    this.memorySize.observe(size);
    
    if (storage === 'blockchain' || storage === 'both') {
      this.blockchainTransactionDuration.observe({ type: 'imprint', network: process.env.BLOCKCHAIN_NETWORK || 'unknown' }, duration);
    }
  }

  /**
   * Track thought recording
   */
  trackThoughtRecording(status: 'success' | 'failure', storage: 'blockchain' | 'cache' | 'both', duration: number): void {
    this.thoughtsRecorded.inc({ status, storage });
    
    if (storage === 'blockchain' || storage === 'both') {
      this.blockchainTransactionDuration.observe({ type: 'thought', network: process.env.BLOCKCHAIN_NETWORK || 'unknown' }, duration);
    }
  }

  /**
   * Track blockchain transaction
   */
  trackBlockchainTransaction(type: 'imprint' | 'thought', network: string, status: 'success' | 'failure', duration: number): void {
    this.blockchainTransactions.inc({ type, network, status });
    
    if (status === 'failure') {
      this.blockchainFailures.inc({ type, network, error: 'transaction_failed' });
    }
    
    this.blockchainTransactionDuration.observe({ type, network }, duration);
  }

  /**
   * Track cache operation
   */
  trackCacheOperation(operation: 'get' | 'set' | 'sync', hit: boolean, duration: number): void {
    if (operation === 'get') {
      if (hit) {
        this.cacheHits.inc({ operation });
      } else {
        this.cacheMisses.inc({ operation });
      }
    }
    
    this.cacheOperationDuration.observe({ operation }, duration);
  }

  /**
   * Track API request
   */
  trackApiRequest(method: string, endpoint: string, status: number, duration: number): void {
    this.apiRequests.inc({ method, endpoint, status: status.toString() });
    this.requestDuration.observe({ method, endpoint, status: status.toString() }, duration);
    this.apiResponseTime.observe({ endpoint }, duration);
    
    if (status >= 400) {
      this.apiErrors.inc({ endpoint, error_type: status >= 500 ? 'server_error' : 'client_error' });
    }
  }

  /**
   * Update storage statistics
   */
  updateStorageStats(stats: {
    memoriesInCache: number;
    thoughtsInCache: number;
    memoriesOnChain: number;
    thoughtsOnChain: number;
    cacheHitRate: number;
    evolutionLevel: number;
  }): void {
    this.memoriesInCache.set(stats.memoriesInCache);
    this.thoughtsInCache.set(stats.thoughtsInCache);
    this.memoriesOnChain.set(stats.memoriesOnChain);
    this.thoughtsOnChain.set(stats.thoughtsOnChain);
    this.cacheHitRate.set(stats.cacheHitRate);
    this.evolutionLevel.set(stats.evolutionLevel);
  }

  /**
   * Update blockchain latency
   */
  updateBlockchainLatency(network: string, latency: number): void {
    this.blockchainLatency.set({ network }, latency);
  }

  /**
   * Update service uptime
   */
  updateServiceUptime(seconds: number): void {
    this.serviceUptime.set(seconds);
  }

  /**
   * Get metrics as Prometheus format
   */
  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  /**
   * Get metrics as JSON
   */
  async getMetricsJSON(): Promise<any> {
    const metrics = await this.register.getMetricsAsJSON();
    return metrics;
  }

  /**
   * Reset all metrics (for testing)
   */
  reset(): void {
    this.register.resetMetrics();
  }
}

// Export singleton instance
export const chronicleMetrics = new ChronicleMetrics();
export default chronicleMetrics;
