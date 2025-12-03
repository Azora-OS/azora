import * as fs from 'fs';
import * as path from 'path';

export interface CoverageData {
  lines: {
    total: number;
    covered: number;
    skipped: number;
    pct: number;
  };
  statements: {
    total: number;
    covered: number;
    skipped: number;
    pct: number;
  };
  functions: {
    total: number;
    covered: number;
    skipped: number;
    pct: number;
  };
  branches: {
    total: number;
    covered: number;
    skipped: number;
    pct: number;
  };
}

export interface ServiceCoverage {
  serviceName: string;
  coverage: CoverageData;
  timestamp: Date;
}

export interface CoverageThresholds {
  lines: number;
  statements: number;
  functions: number;
  branches: number;
}

export class CoverageCollector {
  private coverageDir: string;

  constructor(coverageDir: string = './tests/coverage') {
    this.coverageDir = coverageDir;
  }

  async collectCoverageData(): Promise<CoverageData | null> {
    const coverageSummaryPath = path.join(this.coverageDir, 'coverage-summary.json');

    if (!fs.existsSync(coverageSummaryPath)) {
      console.warn('Coverage summary not found');
      return null;
    }

    const coverageData = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf-8'));
    const total = coverageData.total;

    return {
      lines: total.lines,
      statements: total.statements,
      functions: total.functions,
      branches: total.branches,
    };
  }

  async collectServiceCoverage(serviceName: string): Promise<ServiceCoverage | null> {
    const coverage = await this.collectCoverageData();

    if (!coverage) {
      return null;
    }

    return {
      serviceName,
      coverage,
      timestamp: new Date(),
    };
  }
}

export class CoverageReporter {
  formatCoverageReport(coverage: CoverageData): string {
    const lines = [
      'Coverage Report',
      '===============',
      '',
      `Lines:      ${coverage.lines.pct.toFixed(2)}% (${coverage.lines.covered}/${coverage.lines.total})`,
      `Statements: ${coverage.statements.pct.toFixed(2)}% (${coverage.statements.covered}/${coverage.statements.total})`,
      `Functions:  ${coverage.functions.pct.toFixed(2)}% (${coverage.functions.covered}/${coverage.functions.total})`,
      `Branches:   ${coverage.branches.pct.toFixed(2)}% (${coverage.branches.covered}/${coverage.branches.total})`,
    ];

    return lines.join('\n');
  }

  generateMarkdownReport(services: ServiceCoverage[]): string {
    const lines = [
      '# Test Coverage Report',
      '',
      `Generated: ${new Date().toISOString()}`,
      '',
      '## Service Coverage',
      '',
      '| Service | Lines | Statements | Functions | Branches |',
      '|---------|-------|------------|-----------|----------|',
    ];

    services.forEach(service => {
      const { coverage } = service;
      lines.push(
        `| ${service.serviceName} | ${coverage.lines.pct.toFixed(1)}% | ${coverage.statements.pct.toFixed(1)}% | ${coverage.functions.pct.toFixed(1)}% | ${coverage.branches.pct.toFixed(1)}% |`
      );
    });

    return lines.join('\n');
  }
}

export class CoverageThresholdChecker {
  checkThresholds(coverage: CoverageData, thresholds: CoverageThresholds): {
    passed: boolean;
    failures: string[];
  } {
    const failures: string[] = [];

    if (coverage.lines.pct < thresholds.lines) {
      failures.push(`Lines coverage ${coverage.lines.pct.toFixed(2)}% is below threshold ${thresholds.lines}%`);
    }

    if (coverage.statements.pct < thresholds.statements) {
      failures.push(`Statements coverage ${coverage.statements.pct.toFixed(2)}% is below threshold ${thresholds.statements}%`);
    }

    if (coverage.functions.pct < thresholds.functions) {
      failures.push(`Functions coverage ${coverage.functions.pct.toFixed(2)}% is below threshold ${thresholds.functions}%`);
    }

    if (coverage.branches.pct < thresholds.branches) {
      failures.push(`Branches coverage ${coverage.branches.pct.toFixed(2)}% is below threshold ${thresholds.branches}%`);
    }

    return {
      passed: failures.length === 0,
      failures,
    };
  }
}

export class CoverageComparator {
  compareCoverage(current: CoverageData, previous: CoverageData): {
    lines: number;
    statements: number;
    functions: number;
    branches: number;
  } {
    return {
      lines: current.lines.pct - previous.lines.pct,
      statements: current.statements.pct - previous.statements.pct,
      functions: current.functions.pct - previous.functions.pct,
      branches: current.branches.pct - previous.branches.pct,
    };
  }

  formatDelta(delta: number): string {
    const sign = delta >= 0 ? '+' : '';
    return `${sign}${delta.toFixed(2)}%`;
  }
}
