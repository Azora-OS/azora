#!/usr/bin/env ts-node

/**
 * Connection Testing Script
 * Tests all service connections and dependencies
 */

import axios from 'axios';
import * as net from 'net';

interface ConnectionTest {
  name: string;
  url?: string;
  host?: string;
  port?: number;
  status: 'success' | 'failed' | 'warning';
  message: string;
  responseTime?: number;
}

class ConnectionTester {
  private results: ConnectionTest[] = [];
  private timeout = 5000;

  /**
   * Test HTTP endpoint
   */
  async testHttpEndpoint(name: string, url: string): Promise<ConnectionTest> {
    const startTime = Date.now();

    try {
      const response = await axios.get(url, { timeout: this.timeout });
      const responseTime = Date.now() - startTime;

      return {
        name,
        url,
        status: response.status === 200 ? 'success' : 'warning',
        message: `HTTP ${response.status} - ${responseTime}ms`,
        responseTime,
      };
    } catch (error: any) {
      return {
        name,
        url,
        status: 'failed',
        message: error.message,
      };
    }
  }

  /**
   * Test TCP connection
   */
  async testTcpConnection(name: string, host: string, port: number): Promise<ConnectionTest> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const socket = new net.Socket();

      socket.setTimeout(this.timeout);

      socket.on('connect', () => {
        const responseTime = Date.now() - startTime;
        socket.destroy();
        resolve({
          name,
          host,
          port,
          status: 'success',
          message: `Connected - ${responseTime}ms`,
          responseTime,
        });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({
          name,
          host,
          port,
          status: 'failed',
          message: 'Connection timeout',
        });
      });

      socket.on('error', (error: any) => {
        resolve({
          name,
          host,
          port,
          status: 'failed',
          message: error.message,
        });
      });

      socket.connect(port, host);
    });
  }

  /**
   * Run all connection tests
   */
  async runAllTests(): Promise<ConnectionTest[]> {
    console.log('🔗 Testing service connections...\n');

    // API Gateway
    this.results.push(
      await this.testHttpEndpoint('API Gateway', 'http://localhost:3000/health')
    );

    // Auth Service
    this.results.push(
      await this.testHttpEndpoint('Auth Service', 'http://localhost:3001/health')
    );

    // Database
    this.results.push(
      await this.testTcpConnection('MySQL Database', 'localhost', 3306)
    );

    // Redis
    this.results.push(
      await this.testTcpConnection('Redis Cache', 'localhost', 6379)
    );

    // Elasticsearch
    this.results.push(
      await this.testHttpEndpoint('Elasticsearch', 'http://localhost:9200')
    );

    // Jaeger
    this.results.push(
      await this.testHttpEndpoint('Jaeger Tracing', 'http://localhost:16686')
    );

    // Prometheus
    this.results.push(
      await this.testHttpEndpoint('Prometheus', 'http://localhost:9090')
    );

    // Grafana
    this.results.push(
      await this.testHttpEndpoint('Grafana', 'http://localhost:3001')
    );

    // RabbitMQ
    this.results.push(
      await this.testTcpConnection('RabbitMQ', 'localhost', 5672)
    );

    // Stripe API (external)
    this.results.push(
      await this.testHttpEndpoint('Stripe API', 'https://api.stripe.com/v1/status')
    );

    return this.results;
  }

  /**
   * Generate report
   */
  generateReport(): string {
    const successful = this.results.filter((r) => r.status === 'success').length;
    const failed = this.results.filter((r) => r.status === 'failed').length;
    const warnings = this.results.filter((r) => r.status === 'warning').length;

    let report = '# Connection Test Report\n\n';
    report += `**Test Date**: ${new Date().toISOString()}\n\n`;

    report += '## Summary\n';
    report += `- **Total Tests**: ${this.results.length}\n`;
    report += `- **Successful**: ${successful} ✅\n`;
    report += `- **Failed**: ${failed} ❌\n`;
    report += `- **Warnings**: ${warnings} ⚠️\n\n`;

    report += '## Results\n\n';

    // Successful connections
    const successfulResults = this.results.filter((r) => r.status === 'success');
    if (successfulResults.length > 0) {
      report += '### ✅ Successful Connections\n';
      successfulResults.forEach((result) => {
        report += `- **${result.name}**: ${result.message}\n`;
      });
      report += '\n';
    }

    // Failed connections
    const failedResults = this.results.filter((r) => r.status === 'failed');
    if (failedResults.length > 0) {
      report += '### ❌ Failed Connections\n';
      failedResults.forEach((result) => {
        report += `- **${result.name}**: ${result.message}\n`;
      });
      report += '\n';
    }

    // Warnings
    const warningResults = this.results.filter((r) => r.status === 'warning');
    if (warningResults.length > 0) {
      report += '### ⚠️ Warnings\n';
      warningResults.forEach((result) => {
        report += `- **${result.name}**: ${result.message}\n`;
      });
      report += '\n';
    }

    report += '## Recommendations\n';
    if (failed === 0) {
      report += '✅ All critical services are connected and operational\n';
    } else {
      report += `⚠️ ${failed} service(s) are not responding - check logs and restart services\n`;
    }

    return report;
  }
}

// Run tests
async function main() {
  const tester = new ConnectionTester();
  await tester.runAllTests();

  const report = tester.generateReport();
  console.log(report);

  // Save report
  const fs = require('fs');
  fs.writeFileSync('.kiro/CONNECTION-TEST-REPORT.md', report);
  console.log('\n✅ Report saved to .kiro/CONNECTION-TEST-REPORT.md');
}

main().catch(console.error);
