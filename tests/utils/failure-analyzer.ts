import * as fs from 'fs';
import * as path from 'path';

export type FailureCategory = 
  | 'assertion'
  | 'timeout'
  | 'network'
  | 'database'
  | 'mock'
  | 'dependency'
  | 'environment'
  | 'unknown';

interface FailureRecord {
  testName: string;
  testFile: string;
  errorMessage: string;
  errorStack?: string;
  category: FailureCategory;
  timestamp: number;
  duration: number;
}

interface FailurePattern {
  category: FailureCategory;
  count: number;
  tests: string[];
  commonErrors: string[];
  rootCause?: string;
}

interface FailureReport {
  timestamp: number;
  totalFailures: number;
  failuresByCategory: Map<FailureCategory, number>;
  patterns: FailurePattern[];
  recommendations: string[];
  topFailingTests: Array<{ testName: string; failureCount: number }>;
}

export class FailureAnalyzer {
  private failures: FailureRecord[] = [];
  private historyFile: string;

  constructor(historyFile: string = '.test-failure-history.json') {
    this.historyFile = path.resolve(process.cwd(), historyFile);
    this.loadHistory();
  }

  recordFailure(
    testName: string,
    testFile: string,
    errorMessage: string,
    errorStack?: string,
    duration: number = 0
  ): void {
    const category = this.categorizeFailure(errorMessage, errorStack);

    const record: FailureRecord = {
      testName,
      testFile,
      errorMessage,
      errorStack,
      category,
      timestamp: Date.now(),
      duration,
    };

    this.failures.push(record);
  }

  private categorizeFailure(errorMessage: string, errorStack?: string): FailureCategory {
    const message = errorMessage.toLowerCase();
    const stack = (errorStack || '').toLowerCase();
    const combined = `${message} ${stack}`;

    if (message.includes('timeout') || message.includes('timed out')) {
      return 'timeout';
    }

    if (
      message.includes('expect') ||
      message.includes('assertion') ||
      message.includes('received') ||
      message.includes('expected')
    ) {
      return 'assertion';
    }

    if (
      combined.includes('econnrefused') ||
      combined.includes('network') ||
      combined.includes('fetch') ||
      combined.includes('axios')
    ) {
      return 'network';
    }

    if (
      combined.includes('prisma') ||
      combined.includes('database') ||
      combined.includes('connection') ||
      combined.includes('query')
    ) {
      return 'database';
    }

    if (
      combined.includes('mock') ||
      combined.includes('spy') ||
      combined.includes('stub')
    ) {
      return 'mock';
    }

    if (
      combined.includes('module') ||
      combined.includes('import') ||
      combined.includes('require') ||
      combined.includes('cannot find')
    ) {
      return 'dependency';
    }

    if (
      combined.includes('env') ||
      combined.includes('environment') ||
      combined.includes('config')
    ) {
      return 'environment';
    }

    return 'unknown';
  }

  identifyPatterns(): FailurePattern[] {
    const patterns: Map<FailureCategory, FailurePattern> = new Map();

    this.failures.forEach(failure => {
      if (!patterns.has(failure.category)) {
        patterns.set(failure.category, {
          category: failure.category,
          count: 0,
          tests: [],
          commonErrors: [],
        });
      }

      const pattern = patterns.get(failure.category)!;
      pattern.count++;
      
      const testKey = `${failure.testFile}::${failure.testName}`;
      if (!pattern.tests.includes(testKey)) {
        pattern.tests.push(testKey);
      }

      if (!pattern.commonErrors.includes(failure.errorMessage)) {
        pattern.commonErrors.push(failure.errorMessage);
      }
    });

    patterns.forEach(pattern => {
      pattern.rootCause = this.identifyRootCause(pattern);
    });

    return Array.from(patterns.values()).sort((a, b) => b.count - a.count);
  }

  private identifyRootCause(pattern: FailurePattern): string {
    switch (pattern.category) {
      case 'timeout':
        return 'Tests are exceeding time limits. Consider increasing timeout, optimizing test logic, or mocking slow operations.';
      case 'assertion':
        return 'Test expectations are not being met. Review test logic and implementation.';
      case 'network':
        return 'Network-related failures detected. Ensure external services are mocked or available.';
      case 'database':
        return 'Database connection or query issues. Check test database setup and cleanup.';
      case 'mock':
        return 'Mock configuration issues. Verify mock setup and expectations.';
      case 'dependency':
        return 'Module resolution or import issues. Check dependencies and module paths.';
      case 'environment':
        return 'Environment configuration issues. Verify test environment variables and setup.';
      default:
        return 'Unknown failure cause. Review error messages and stack traces for details.';
    }
  }

  getTopFailingTests(limit: number = 10): Array<{ testName: string; failureCount: number }> {
    const testFailures = new Map<string, number>();

    this.failures.forEach(failure => {
      const key = `${failure.testFile}::${failure.testName}`;
      testFailures.set(key, (testFailures.get(key) || 0) + 1);
    });

    return Array.from(testFailures.entries())
      .map(([testName, failureCount]) => ({ testName, failureCount }))
      .sort((a, b) => b.failureCount - a.failureCount)
      .slice(0, limit);
  }

  generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const patterns = this.identifyPatterns();

    if (this.failures.length === 0) {
      return ['No test failures recorded.'];
    }

    const topCategory = patterns[0];
    if (topCategory) {
      recommendations.push(
        `Most common failure type: ${topCategory.category} (${topCategory.count} failures)`
      );
      recommendations.push(`Root cause: ${topCategory.rootCause}`);
    }

    const topFailingTests = this.getTopFailingTests(5);
    if (topFailingTests.length > 0) {
      recommendations.push(
        `Top failing test: ${topFailingTests[0].testName} (${topFailingTests[0].failureCount} failures)`
      );
    }

    const timeoutFailures = patterns.find(p => p.category === 'timeout');
    if (timeoutFailures && timeoutFailures.count > 5) {
      recommendations.push(
        'High number of timeout failures. Consider reviewing test timeouts and async operations.'
      );
    }

    const databaseFailures = patterns.find(p => p.category === 'database');
    if (databaseFailures && databaseFailures.count > 3) {
      recommendations.push(
        'Database-related failures detected. Ensure test database is properly set up and cleaned between tests.'
      );
    }

    const networkFailures = patterns.find(p => p.category === 'network');
    if (networkFailures && networkFailures.count > 3) {
      recommendations.push(
        'Network failures detected. Ensure external services are properly mocked.'
      );
    }

    return recommendations;
  }

  generateReport(): FailureReport {
    const patterns = this.identifyPatterns();
    const failuresByCategory = new Map<FailureCategory, number>();

    patterns.forEach(pattern => {
      failuresByCategory.set(pattern.category, pattern.count);
    });

    return {
      timestamp: Date.now(),
      totalFailures: this.failures.length,
      failuresByCategory,
      patterns,
      recommendations: this.generateRecommendations(),
      topFailingTests: this.getTopFailingTests(),
    };
  }

  saveHistory(): void {
    try {
      const history = this.loadHistoryData();
      history.push(...this.failures);

      const maxRecords = 5000;
      const trimmedHistory = history.slice(-maxRecords);

      fs.writeFileSync(this.historyFile, JSON.stringify(trimmedHistory, null, 2));
    } catch (error) {
      console.error('Failed to save failure history:', error);
    }
  }

  private loadHistory(): void {
    try {
      const history = this.loadHistoryData();
      this.failures = history;
    } catch (error) {
      this.failures = [];
    }
  }

  private loadHistoryData(): FailureRecord[] {
    if (!fs.existsSync(this.historyFile)) {
      return [];
    }

    const data = fs.readFileSync(this.historyFile, 'utf-8');
    return JSON.parse(data);
  }

  printReport(): void {
    const report = this.generateReport();

    console.log('\n=== Test Failure Analysis Report ===\n');
    console.log(`Total Failures: ${report.totalFailures}`);
    console.log(`Timestamp: ${new Date(report.timestamp).toISOString()}\n`);

    if (report.patterns.length > 0) {
      console.log('Failure Patterns:');
      report.patterns.forEach(pattern => {
        console.log(`  ${pattern.category}: ${pattern.count} failures`);
        console.log(`    Root Cause: ${pattern.rootCause}`);
      });
      console.log('');
    }

    if (report.topFailingTests.length > 0) {
      console.log('Top Failing Tests:');
      report.topFailingTests.slice(0, 5).forEach((test, index) => {
        console.log(`  ${index + 1}. ${test.testName} (${test.failureCount} failures)`);
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
    this.failures = [];
  }
}

export const failureAnalyzer = new FailureAnalyzer();
