import * as fs from 'fs';
import * as path from 'path';

interface CoverageThresholds {
  lines: number;
  statements: number;
  functions: number;
  branches: number;
}

interface CriticalTest {
  name: string;
  path: string;
  required: boolean;
}

const THRESHOLDS: CoverageThresholds = {
  lines: 50,
  statements: 50,
  functions: 50,
  branches: 50,
};

const CRITICAL_TESTS: CriticalTest[] = [
  { name: 'Auth Service - Authentication', path: 'services/auth-service/tests/authentication.test.ts', required: true },
  { name: 'Auth Service - Registration', path: 'services/auth-service/tests/registration.test.ts', required: true },
  { name: 'Payment Service - Transactions', path: 'services/payment/tests/transaction.test.ts', required: true },
  { name: 'Payment Service - Webhooks', path: 'services/payment/tests/webhook.test.ts', required: true },
  { name: 'Education Service - Course Management', path: 'services/azora-education/tests/course-management.test.ts', required: true },
  { name: 'Education Service - Enrollment', path: 'services/azora-education/tests/enrollment.test.ts', required: true },
];

class CoverageGateChecker {
  private coverageSummaryPath: string;

  constructor(coverageSummaryPath: string = './tests/coverage/coverage-summary.json') {
    this.coverageSummaryPath = coverageSummaryPath;
  }

  async checkCoverageThresholds(): Promise<{ passed: boolean; failures: string[] }> {
    if (!fs.existsSync(this.coverageSummaryPath)) {
      return {
        passed: false,
        failures: ['Coverage summary file not found'],
      };
    }

    const coverageData = JSON.parse(fs.readFileSync(this.coverageSummaryPath, 'utf-8'));
    const total = coverageData.total;

    const failures: string[] = [];

    Object.entries(THRESHOLDS).forEach(([metric, threshold]) => {
      const actual = total[metric].pct;
      if (actual < threshold) {
        failures.push(`${metric} coverage ${actual.toFixed(2)}% is below threshold ${threshold}%`);
      }
    });

    return {
      passed: failures.length === 0,
      failures,
    };
  }

  async verifyCriticalTests(): Promise<{ passed: boolean; failures: string[] }> {
    const failures: string[] = [];

    CRITICAL_TESTS.forEach(test => {
      if (test.required && !fs.existsSync(test.path)) {
        failures.push(`Critical test missing: ${test.name} (${test.path})`);
      }
    });

    return {
      passed: failures.length === 0,
      failures,
    };
  }

  async checkAll(): Promise<{ passed: boolean; report: string }> {
    const coverageCheck = await this.checkCoverageThresholds();
    const criticalTestsCheck = await this.verifyCriticalTests();

    const passed = coverageCheck.passed && criticalTestsCheck.passed;

    const report = this.generateReport(coverageCheck, criticalTestsCheck);

    return { passed, report };
  }

  private generateReport(
    coverageCheck: { passed: boolean; failures: string[] },
    criticalTestsCheck: { passed: boolean; failures: string[] }
  ): string {
    const lines = [
      '# Coverage Gate Check Report',
      '',
      `Status: ${coverageCheck.passed && criticalTestsCheck.passed ? '✅ PASSED' : '❌ FAILED'}`,
      '',
    ];

    lines.push('## Coverage Thresholds');
    if (coverageCheck.passed) {
      lines.push('✅ All coverage thresholds met');
    } else {
      lines.push('❌ Coverage thresholds not met:');
      coverageCheck.failures.forEach(failure => {
        lines.push(`  - ${failure}`);
      });
    }
    lines.push('');

    lines.push('## Critical Tests');
    if (criticalTestsCheck.passed) {
      lines.push('✅ All critical tests present');
    } else {
      lines.push('❌ Critical tests missing:');
      criticalTestsCheck.failures.forEach(failure => {
        lines.push(`  - ${failure}`);
      });
    }
    lines.push('');

    return lines.join('\n');
  }
}

async function main() {
  const checker = new CoverageGateChecker();
  const result = await checker.checkAll();

  console.log(result.report);

  if (!result.passed) {
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Error running coverage gate check:', error);
    process.exit(1);
  });
}

export { CoverageGateChecker, THRESHOLDS, CRITICAL_TESTS };
