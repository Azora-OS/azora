import { Reporter, Test, TestResult } from '@jest/reporters';
import { AggregatedResult } from '@jest/test-result';
import { TestPerformanceTracker } from './test-performance-tracker';

export default class PerformanceReporter implements Reporter {
  private tracker: TestPerformanceTracker;

  constructor() {
    this.tracker = new TestPerformanceTracker();
  }

  onTestResult(test: Test, testResult: TestResult): void {
    testResult.testResults.forEach(result => {
      const duration = result.duration || 0;
      const status = result.status === 'passed' ? 'passed' : result.status === 'failed' ? 'failed' : 'skipped';
      
      this.tracker.recordTest(
        result.fullName,
        test.path,
        duration,
        status
      );
    });
  }

  onRunComplete(): void {
    this.tracker.saveHistory();
    this.tracker.printReport();
  }
}
