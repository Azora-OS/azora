/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

PERFORMANCE BENCHMARKING COORDINATION SYSTEM
Coordinates load tests across domains and feeds results into API Gateway Prometheus metrics
*/

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Domain-specific performance targets
 */
export interface DomainTargets {
  domain: string;
  endpoints: string[];
  loadProfile: {
    concurrentUsers: number;
    rampUpDuration: number; // seconds
    sustainedDuration: number; // seconds
    peakUsers?: number;
  };
  thresholds: {
    p50Latency: number; // ms
    p95Latency: number; // ms
    p99Latency: number; // ms
    errorRate: number; // percentage (0-1)
    throughput: number; // requests per second
  };
}

/**
 * Performance test results
 */
export interface PerformanceResults {
  domain: string;
  endpoint: string;
  timestamp: Date;
  metrics: {
    p50Latency: number;
    p95Latency: number;
    p99Latency: number;
    avgLatency: number;
    errorRate: number;
    throughput: number;
    totalRequests: number;
    successfulRequests: number;
  };
  prometheusMetrics: {
    http_request_duration_seconds: number;
    http_requests_total: number;
    error_rate: number;
  };
}

/**
 * Domain-specific targets configuration
 */
export const DOMAIN_TARGETS: Record<string, DomainTargets> = {
  'retail-ai': {
    domain: 'retail-ai',
    endpoints: [
      '/api/retail-ai/inventory',
      '/api/retail-ai/predict-demand',
      '/api/retail-ai/optimize-pricing',
      '/api/retail-ai/recommendations',
    ],
    loadProfile: {
      concurrentUsers: 500,
      rampUpDuration: 300, // 5 minutes
      sustainedDuration: 1800, // 30 minutes
      peakUsers: 1000,
    },
    thresholds: {
      p50Latency: 200,
      p95Latency: 500,
      p99Latency: 1000,
      errorRate: 0.01, // 1%
      throughput: 100, // req/s
    },
  },
  'lms': {
    domain: 'lms',
    endpoints: [
      '/api/lms/courses',
      '/api/lms/enrollments',
      '/api/lms/lessons',
      '/api/lms/progress',
      '/api/lms/assignments',
    ],
    loadProfile: {
      concurrentUsers: 1000,
      rampUpDuration: 600, // 10 minutes
      sustainedDuration: 3600, // 1 hour
      peakUsers: 2000,
    },
    thresholds: {
      p50Latency: 300,
      p95Latency: 800,
      p99Latency: 1500,
      errorRate: 0.005, // 0.5%
      throughput: 200, // req/s
    },
  },
  'institutional': {
    domain: 'institutional',
    endpoints: [
      '/api/institutional/students',
      '/api/institutional/registrations',
      '/api/institutional/credentials',
      '/api/institutional/monitoring',
      '/api/institutional/reports',
    ],
    loadProfile: {
      concurrentUsers: 300,
      rampUpDuration: 300, // 5 minutes
      sustainedDuration: 1800, // 30 minutes
      peakUsers: 500,
    },
    thresholds: {
      p50Latency: 400,
      p95Latency: 1000,
      p99Latency: 2000,
      errorRate: 0.01, // 1%
      throughput: 50, // req/s
    },
  },
};

/**
 * Performance Benchmarking Coordinator
 */
export class PerformanceCoordinator {
  private gatewayUrl: string;
  private prometheusUrl: string;
  private resultsDir: string;

  constructor() {
    this.gatewayUrl = process.env.API_GATEWAY_URL || 'http://localhost:4000';
    this.prometheusUrl = process.env.PROMETHEUS_URL || 'http://localhost:9090';
    this.resultsDir = path.join(__dirname, '../../tests/performance/results');
    
    // Ensure results directory exists
    if (!fs.existsSync(this.resultsDir)) {
      fs.mkdirSync(this.resultsDir, { recursive: true });
    }
  }

  /**
   * Check if service endpoints are ready (not returning mocks)
   */
  async checkEndpointsReady(domain: string): Promise<boolean> {
    const targets = DOMAIN_TARGETS[domain];
    if (!targets) {
      throw new Error(`Unknown domain: ${domain}`);
    }

    const sampleEndpoint = targets.endpoints[0];
    try {
      const response = await fetch(`${this.gatewayUrl}${sampleEndpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.TEST_TOKEN || 'test-token'}`,
        },
      });

      const data = await response.json();
      
      // Check if response contains mock indicators
      const mockIndicators = [
        'mock',
        'TODO',
        'Not implemented',
        'placeholder',
        'sample',
      ];

      const responseStr = JSON.stringify(data).toLowerCase();
      const isMock = mockIndicators.some(indicator => 
        responseStr.includes(indicator.toLowerCase())
      );

      return !isMock && response.ok;
    } catch (error) {
      console.error(`Error checking endpoint readiness: ${error}`);
      return false;
    }
  }

  /**
   * Run load test for a domain
   */
  async runLoadTest(domain: string): Promise<PerformanceResults[]> {
    const targets = DOMAIN_TARGETS[domain];
    if (!targets) {
      throw new Error(`Unknown domain: ${domain}`);
    }

    console.log(`🚀 Starting load test for domain: ${domain}`);

    // Check if endpoints are ready
    const ready = await this.checkEndpointsReady(domain);
    if (!ready) {
      throw new Error(
        `Endpoints for domain ${domain} are not ready (still returning mocks). ` +
        `Please implement real endpoints before running load tests.`
      );
    }

    const results: PerformanceResults[] = [];

    // Run load test for each endpoint
    for (const endpoint of targets.endpoints) {
      console.log(`  Testing endpoint: ${endpoint}`);
      
      const result = await this.runEndpointLoadTest(
        domain,
        endpoint,
        targets.loadProfile,
        targets.thresholds
      );

      results.push(result);

      // Push metrics to Prometheus via gateway
      await this.pushMetricsToGateway(result);
    }

    // Save results to file
    const resultsFile = path.join(
      this.resultsDir,
      `${domain}-${Date.now()}.json`
    );
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    console.log(`✅ Results saved to: ${resultsFile}`);

    return results;
  }

  /**
   * Run load test for a specific endpoint
   */
  private async runEndpointLoadTest(
    domain: string,
    endpoint: string,
    loadProfile: DomainTargets['loadProfile'],
    thresholds: DomainTargets['thresholds']
  ): Promise<PerformanceResults> {
    const latencies: number[] = [];
    let totalRequests = 0;
    let successfulRequests = 0;
    let errors = 0;

    const startTime = Date.now();
    const endTime = startTime + (loadProfile.sustainedDuration * 1000);

    // Ramp up phase
    console.log(`    Ramping up to ${loadProfile.concurrentUsers} users...`);
    await this.rampUpUsers(
      endpoint,
      loadProfile.concurrentUsers,
      loadProfile.rampUpDuration,
      latencies,
      () => {
        totalRequests++;
        successfulRequests++;
      },
      () => {
        totalRequests++;
        errors++;
      }
    );

    // Sustained load phase
    console.log(`    Sustaining load for ${loadProfile.sustainedDuration}s...`);
    while (Date.now() < endTime) {
      await this.sustainedLoad(
        endpoint,
        loadProfile.concurrentUsers,
        latencies,
        () => {
          totalRequests++;
          successfulRequests++;
        },
        () => {
          totalRequests++;
          errors++;
        }
      );
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Calculate metrics
    latencies.sort((a, b) => a - b);
    const p50 = this.percentile(latencies, 50);
    const p95 = this.percentile(latencies, 95);
    const p99 = this.percentile(latencies, 99);
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const errorRate = errors / totalRequests;
    const duration = (Date.now() - startTime) / 1000;
    const throughput = totalRequests / duration;

    return {
      domain,
      endpoint,
      timestamp: new Date(),
      metrics: {
        p50Latency: p50,
        p95Latency: p95,
        p99Latency: p99,
        avgLatency,
        errorRate,
        throughput,
        totalRequests,
        successfulRequests,
      },
      prometheusMetrics: {
        http_request_duration_seconds: avgLatency / 1000,
        http_requests_total: totalRequests,
        error_rate: errorRate,
      },
    };
  }

  /**
   * Ramp up users gradually
   */
  private async rampUpUsers(
    endpoint: string,
    targetUsers: number,
    duration: number,
    latencies: number[],
    onSuccess: () => void,
    onError: () => void
  ): Promise<void> {
    const usersPerSecond = targetUsers / duration;
    const requests: Promise<void>[] = [];

    for (let i = 0; i < targetUsers; i++) {
      const delay = (i / usersPerSecond) * 1000;
      
      setTimeout(async () => {
        const start = Date.now();
        try {
          const response = await fetch(`${this.gatewayUrl}${endpoint}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${process.env.TEST_TOKEN || 'test-token'}`,
            },
          });

          const latency = Date.now() - start;
          latencies.push(latency);

          if (response.ok) {
            onSuccess();
          } else {
            onError();
          }
        } catch (error) {
          onError();
        }
      }, delay);
    }

    // Wait for ramp-up to complete
    await new Promise(resolve => setTimeout(resolve, duration * 1000));
  }

  /**
   * Sustained load phase
   */
  private async sustainedLoad(
    endpoint: string,
    concurrentUsers: number,
    latencies: number[],
    onSuccess: () => void,
    onError: () => void
  ): Promise<void> {
    const requests: Promise<void>[] = [];

    for (let i = 0; i < concurrentUsers; i++) {
      requests.push(
        (async () => {
          const start = Date.now();
          try {
            const response = await fetch(`${this.gatewayUrl}${endpoint}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${process.env.TEST_TOKEN || 'test-token'}`,
              },
            });

            const latency = Date.now() - start;
            latencies.push(latency);

            if (response.ok) {
              onSuccess();
            } else {
              onError();
            }
          } catch (error) {
            onError();
          }
        })()
      );
    }

    await Promise.all(requests);
  }

  /**
   * Push metrics to API Gateway Prometheus endpoint
   */
  private async pushMetricsToGateway(result: PerformanceResults): Promise<void> {
    try {
      // The gateway already collects metrics via Prometheus client
      // We can push custom metrics or use the existing /metrics endpoint
      // For now, we'll log metrics that will be picked up by Prometheus scraper
      
      console.log(`    Metrics for ${result.endpoint}:`, {
        p50: `${result.metrics.p50Latency}ms`,
        p95: `${result.metrics.p95Latency}ms`,
        p99: `${result.metrics.p99Latency}ms`,
        errorRate: `${(result.metrics.errorRate * 100).toFixed(2)}%`,
        throughput: `${result.metrics.throughput.toFixed(2)} req/s`,
      });

      // Metrics are automatically collected by Prometheus via the gateway's /metrics endpoint
      // The gateway already tracks: http_request_duration_seconds, http_requests_total
    } catch (error) {
      console.error(`Error pushing metrics: ${error}`);
    }
  }

  /**
   * Calculate percentile
   */
  private percentile(sortedArray: number[], percentile: number): number {
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, index)] || 0;
  }

  /**
   * Schedule coordinated load tests
   */
  async scheduleLoadTests(domains: string[]): Promise<void> {
    console.log('📅 Scheduling coordinated load tests...');

    for (const domain of domains) {
      const ready = await this.checkEndpointsReady(domain);
      if (ready) {
        console.log(`  ✅ ${domain}: Ready for load testing`);
        // In production, this would schedule via cron or task queue
        // For now, we'll run immediately
        await this.runLoadTest(domain);
      } else {
        console.log(`  ⏳ ${domain}: Waiting for endpoints to move off mocks`);
      }
    }
  }

  /**
   * Generate performance dashboard data
   */
  async generateDashboardData(): Promise<any> {
    const resultsFiles = fs.readdirSync(this.resultsDir)
      .filter(f => f.endsWith('.json'))
      .map(f => path.join(this.resultsDir, f));

    const allResults: PerformanceResults[] = [];
    for (const file of resultsFiles) {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (Array.isArray(data)) {
        allResults.push(...data);
      } else {
        allResults.push(data);
      }
    }

    // Group by domain
    const byDomain: Record<string, PerformanceResults[]> = {};
    for (const result of allResults) {
      if (!byDomain[result.domain]) {
        byDomain[result.domain] = [];
      }
      byDomain[result.domain].push(result);
    }

    return {
      domains: Object.keys(byDomain),
      results: byDomain,
      summary: this.generateSummary(allResults),
    };
  }

  /**
   * Generate performance summary
   */
  private generateSummary(results: PerformanceResults[]): any {
    if (results.length === 0) {
      return { message: 'No performance test results available' };
    }

    const avgP95 = results.reduce((sum, r) => sum + r.metrics.p95Latency, 0) / results.length;
    const avgErrorRate = results.reduce((sum, r) => sum + r.metrics.errorRate, 0) / results.length;
    const totalRequests = results.reduce((sum, r) => sum + r.metrics.totalRequests, 0);

    return {
      totalTests: results.length,
      averageP95Latency: `${avgP95.toFixed(2)}ms`,
      averageErrorRate: `${(avgErrorRate * 100).toFixed(2)}%`,
      totalRequests,
      lastTest: results[results.length - 1].timestamp,
    };
  }
}

export default PerformanceCoordinator;
