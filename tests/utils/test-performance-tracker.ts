import * as fs from 'fs';
import * as path from 'path';

interface TestPerformanceRecord {
  testName: string;
  testFile: string;
  duration: number;
  timestamp: number;
  status: 'passed' | 'failed' | 'skipped';
  memoryUsage?: number;
}

interface PerformanceStats {
  testName: string;
  testFile: string;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  executionCount: number;
  slowExecutions: number;
  trend: 'improving' | 'degrading' | 'stable';
}

interface PerformanceReport {
  timestamp: number;
  totalTests: number;
  slowTests: TestPerformanceRecord[];
  performanceStats: PerformanceStats[];
  recommendations: string[];
}

export class TestPerformanceTracker {
  private records: TestPerformanceRecord[] = [];
  private historyFile: string;
  private slowTestThreshold: number;

  constructor(historyFile: string = '.test-performance-history.json', slowTestThreshold: number = 5000) {
    this.historyFile = path.resolve(process.cwd(), historyFile);
    this.slowTestThreshold = slowTestThreshold;
    this.loadHistory();
  }

  recordTest(testName: string, testFile: string, duration: number, status: 'passed' | 'failed' | 'skipped'): void {
    const record: TestPerformanceRecord = {
      testName,
      testFile,
      duration,
      timestamp: Date.now(),
      status,
      memoryUsage: process.memoryUsage().heapUsed,
    };

    this.records.push(record);
  }

  getSlowTests(threshold?: number): TestPerformanceRecord[] {
    const limit = threshold || this.slowTestThreshold;
    return this.records
      .filter(record => record.duration > limit && record.status === 'passed')
      .sort((a, b) => b.duration - a.duration);
  }

  getPerformanceStats(): PerformanceStats[] {
    const testGroups = new Map<string, TestPerformanceRecord[]>();

    this.records.forEach(record => {
      const key = `${record.testFile}::${record.testName}`;
      if (!testGroups.has(key)) {
        testGroups.set(key, []);
      }
      testGroups.get(key)!.push(record);
    });

    const stats: PerformanceStats[] = [];

    testGroups.forEach((records, key) => {
      const durations = records.map(r => r.duration);
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const minDuration = Math.min(...durations);
      const maxDuration = Math.max(...durations);
      const slowExecutions = durations.filter(d => d > this.slowTestThreshold).length;

      const trend = this.calculateTrend(records);

      stats.push({
        testName: records[0].testName,
        testFile: records[0].testFile,
        avgDuration,
        minDuration,
        maxDuration,
        executionCount: records.length,
        slowExecutions,
        trend,
      });
    });

    return stats.sort((a, b) => b.avgDuration - a.avgDuration);
  }

  private calculateTrend(records: TestPerformanceRecord[]): 'improving' | 'degrading' | 'stable' {
    if (records.length < 3) return 'stable';

    const sortedRecords = records.sort((a, b) => a.timestamp - b.timestamp);
    const recentCount = Math.min(5, Math.floor(records.length / 2));
    const recentRecords = sortedRecords.slice(-recentCount);
    const olderRecords = sortedRecords.slice(0, recentCount);

    const recentAvg = recentRecords.reduce((sum, r) => sum + r.duration, 0) / recentRecords.length;
    const olderAvg = olderRecords.reduce((sum, r) => sum + r.duration, 0) / olderRecords.length;

    const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (changePercent < -10) return 'improving';
    if (changePercent > 10) return 'degrading';
    return 'stable';
  }

  generateOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    const slowTests = this.getSlowTests();
    const stats = this.getPerformanceStats();

    if (slowTests.length > 0) {
      recommendations.push(
        `Found ${slowTests.length} slow tests (>${this.slowTestThreshold}ms). Consider optimizing these tests.`
      );
    }

    const degradingTests = stats.filter(s => s.trend === 'degrading');
    if (degradingTests.length > 0) {
      recommendations.push(
        `${degradingTests.length} tests show degrading performance trends. Review recent changes.`
      );
    }

    const highVarianceTests = stats.filter(s => (s.maxDuration - s.minDuration) > s.avgDuration);
    if (highVarianceTests.length > 0) {
      recommendations.push(
        `${highVarianceTests.length} tests have high variance in execution time. Check for flakiness or external dependencies.`
      );
    }

    const verySlowTests = slowTests.filter(t => t.duration > this.slowTestThreshold * 2);
    if (verySlowTests.length > 0) {
      recommendations.push(
        `${verySlowTests.length} tests are extremely slow (>${this.slowTestThreshold * 2}ms). Consider splitting or mocking external services.`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('All tests are performing within acceptable limits.');
    }

    return recommendations;
  }

  generateReport(): PerformanceReport {
    return {
      timestamp: Date.now(),
      totalTests: this.records.length,
      slowTests: this.getSlowTests().slice(0, 20),
      performanceStats: this.getPerformanceStats().slice(0, 50),
      recommendations: this.generateOptimizationRecommendations(),
    };
  }

  saveHistory(): void {
    try {
      const history = this.loadHistoryData();
      history.push(...this.records);

      const maxRecords = 10000;
      const trimmedHistory = history.slice(-maxRecords);

      fs.writeFileSync(this.historyFile, JSON.stringify(trimmedHistory, null, 2));
    } catch (error) {
      console.error('Failed to save performance history:', error);
    }
  }

  private loadHistory(): void {
    try {
      const history = this.loadHistoryData();
      this.records = history;
    } catch (error) {
      this.records = [];
    }
  }

  private loadHistoryData(): TestPerformanceRecord[] {
    if (!fs.existsSync(this.historyFile)) {
      return [];
    }

    const data = fs.readFileSync(this.historyFile, 'utf-8');
    return JSON.parse(data);
  }

  printReport(): void {
    const report = this.generateReport();

    console.log('\n=== Test Performance Report ===\n');
    console.log(`Total Tests: ${report.totalTests}`);
    console.log(`Timestamp: ${new Date(report.timestamp).toISOString()}\n`);

    if (report.slowTests.length > 0) {
      console.log('Slow Tests (Top 10):');
      report.slowTests.slice(0, 10).forEach((test, index) => {
        console.log(`  ${index + 1}. ${test.testName} (${test.testFile})`);
        console.log(`     Duration: ${test.duration}ms`);
      });
      console.log('');
    }

    console.log('Recommendations:');
    report.recommendations.forEach(rec => {
      console.log(`  - ${rec}`);
    });
    console.log('');
  }

  reset(): void {
    this.records = [];
  }
}

export const performanceTracker = new TestPerformanceTracker();
