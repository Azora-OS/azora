import * as fs from 'fs';
import * as path from 'path';

export interface TestExecution {
  testName: string;
  testFile: string;
  passed: boolean;
  duration: number;
  timestamp: Date;
  error?: string;
}

export interface FlakyTestReport {
  testName: string;
  testFile: string;
  flakinessScore: number;
  totalRuns: number;
  failures: number;
  passes: number;
  failureRate: number;
  recentExecutions: TestExecution[];
}

export class FlakyTestDetector {
  private historyFile: string;
  private maxHistorySize: number;

  constructor(historyFile: string = './tests/test-history.json', maxHistorySize: number = 1000) {
    this.historyFile = historyFile;
    this.maxHistorySize = maxHistorySize;
    this.ensureHistoryFile();
  }

  private ensureHistoryFile(): void {
    const dir = path.dirname(this.historyFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(this.historyFile)) {
      fs.writeFileSync(this.historyFile, JSON.stringify([], null, 2));
    }
  }

  async recordExecution(execution: TestExecution): Promise<void> {
    const history = await this.loadHistory();

    history.push({
      ...execution,
      timestamp: execution.timestamp.toISOString(),
    });

    const trimmedHistory = history.slice(-this.maxHistorySize);

    fs.writeFileSync(this.historyFile, JSON.stringify(trimmedHistory, null, 2));
  }

  async loadHistory(): Promise<any[]> {
    const data = fs.readFileSync(this.historyFile, 'utf-8');
    return JSON.parse(data);
  }

  async detectFlakyTests(minRuns: number = 5): Promise<FlakyTestReport[]> {
    const history = await this.loadHistory();

    const testGroups = this.groupByTest(history);

    const flakyTests: FlakyTestReport[] = [];

    Object.entries(testGroups).forEach(([testKey, executions]) => {
      if (executions.length < minRuns) {
        return;
      }

      const passes = executions.filter(e => e.passed).length;
      const failures = executions.length - passes;
      const failureRate = (failures / executions.length) * 100;

      if (failures > 0 && passes > 0) {
        const flakinessScore = this.calculateFlakinessScore(executions);

        flakyTests.push({
          testName: executions[0].testName,
          testFile: executions[0].testFile,
          flakinessScore,
          totalRuns: executions.length,
          failures,
          passes,
          failureRate,
          recentExecutions: executions.slice(-10).map(e => ({
            ...e,
            timestamp: new Date(e.timestamp),
          })),
        });
      }
    });

    return flakyTests.sort((a, b) => b.flakinessScore - a.flakinessScore);
  }

  private groupByTest(history: any[]): Record<string, any[]> {
    return history.reduce((acc, execution) => {
      const key = `${execution.testFile}::${execution.testName}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(execution);
      return acc;
    }, {} as Record<string, any[]>);
  }

  private calculateFlakinessScore(executions: any[]): number {
    const recentExecutions = executions.slice(-20);

    let transitionCount = 0;
    for (let i = 1; i < recentExecutions.length; i++) {
      if (recentExecutions[i].passed !== recentExecutions[i - 1].passed) {
        transitionCount++;
      }
    }

    const passes = recentExecutions.filter(e => e.passed).length;
    const failures = recentExecutions.length - passes;

    const failureRate = failures / recentExecutions.length;
    const transitionRate = transitionCount / (recentExecutions.length - 1);

    return (failureRate * 0.6 + transitionRate * 0.4) * 100;
  }

  generateFlakyTestReport(flakyTests: FlakyTestReport[]): string {
    const lines = [
      '# Flaky Test Report',
      '',
      `Generated: ${new Date().toISOString()}`,
      '',
      `Found ${flakyTests.length} flaky tests`,
      '',
    ];

    if (flakyTests.length === 0) {
      lines.push('✅ No flaky tests detected!');
      return lines.join('\n');
    }

    lines.push('## Flaky Tests (sorted by flakiness score)');
    lines.push('');

    flakyTests.forEach((test, index) => {
      const severity = this.getSeverityEmoji(test.flakinessScore);

      lines.push(`### ${index + 1}. ${severity} ${test.testName}`);
      lines.push(`- **File:** ${test.testFile}`);
      lines.push(`- **Flakiness Score:** ${test.flakinessScore.toFixed(2)}/100`);
      lines.push(`- **Total Runs:** ${test.totalRuns}`);
      lines.push(`- **Passes:** ${test.passes} (${((test.passes / test.totalRuns) * 100).toFixed(1)}%)`);
      lines.push(`- **Failures:** ${test.failures} (${test.failureRate.toFixed(1)}%)`);
      lines.push('');

      lines.push('**Recent Executions:**');
      test.recentExecutions.slice(-5).forEach(exec => {
        const status = exec.passed ? '✅' : '❌';
        lines.push(`  - ${status} ${new Date(exec.timestamp).toLocaleString()} (${exec.duration}ms)`);
      });
      lines.push('');
    });

    return lines.join('\n');
  }

  private getSeverityEmoji(score: number): string {
    if (score >= 70) return '🔴';
    if (score >= 40) return '🟠';
    if (score >= 20) return '🟡';
    return '🟢';
  }
}
