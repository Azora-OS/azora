import { exec } from 'child_process';
import { promisify } from 'util';
import { PlaywrightRunner, E2EResults, E2ETestScenario } from './PlaywrightRunner';
import { AccessibilityChecker, A11yReport, A11yCheckOptions } from './AccessibilityChecker';
import { LighthouseRunner, PerformanceReport, LighthouseOptions } from './LighthouseRunner';

const execAsync = promisify(exec);

export interface TestResults {
  passed: number;
  failed: number;
  total: number;
  coverage?: number;
  duration: number;
  failures: TestFailure[];
}

export interface TestFailure {
  test: string;
  error: string;
  file: string;
}

export interface VerificationReport {
  tests: TestResults;
  e2eTests?: E2EResults;
  accessibility?: A11yReport;
  performance?: PerformanceReport;
  passed: boolean;
  blockers: string[];
  timestamp: Date;
}

export class VerificationPipeline {
  private projectRoot: string;
  private playwrightRunner: PlaywrightRunner;
  private accessibilityChecker: AccessibilityChecker;
  private lighthouseRunner: LighthouseRunner;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.playwrightRunner = new PlaywrightRunner(projectRoot);
    this.accessibilityChecker = new AccessibilityChecker(projectRoot);
    this.lighthouseRunner = new LighthouseRunner(projectRoot);
  }

  async runTests(pattern?: string): Promise<TestResults> {
    try {
      const command = pattern 
        ? `npm test -- ${pattern}` 
        : 'npm test';

      const { stdout } = await execAsync(command, {
        cwd: this.projectRoot,
        timeout: 300000, // 5 minutes
      });

      return this.parseTestOutput(stdout);
    } catch (error: any) {
      return {
        passed: 0,
        failed: 1,
        total: 1,
        duration: 0,
        failures: [{
          test: 'Test execution',
          error: error.message,
          file: '',
        }],
      };
    }
  }

  async verify(
    includeE2E: boolean = false,
    includeAccessibility: boolean = false,
    includePerformance: boolean = false,
    previewUrl?: string
  ): Promise<VerificationReport> {
    const tests = await this.runTests();
    let e2eTests: E2EResults | undefined;
    let accessibility: A11yReport | undefined;
    let performance: PerformanceReport | undefined;
    
    if (includeE2E) {
      e2eTests = await this.runE2ETests();
    }
    
    if (includeAccessibility && previewUrl) {
      accessibility = await this.checkAccessibility(previewUrl);
    }
    
    if (includePerformance && previewUrl) {
      performance = await this.measurePerformance(previewUrl);
    }
    
    const allPassed = 
      tests.failed === 0 && 
      (!e2eTests || e2eTests.failed === 0) &&
      (!accessibility || accessibility.passed) &&
      (!performance || performance.passed);
    
    const blockers = [
      ...tests.failures.map(f => f.error),
      ...(e2eTests?.results.filter(r => !r.passed).map(r => r.error || 'E2E test failed') || []),
      ...(accessibility?.blockers || []),
      ...(performance && !performance.passed ? [`Performance score below threshold: ${performance.scores.performance}`] : []),
    ];
    
    return {
      tests,
      e2eTests,
      accessibility,
      performance,
      passed: allPassed,
      blockers,
      timestamp: new Date(),
    };
  }

  async runE2ETests(scenarios?: E2ETestScenario[]): Promise<E2EResults> {
    try {
      // Configure Playwright if not already done
      await this.playwrightRunner.configure();
      
      // Start preview server
      await this.playwrightRunner.startPreviewServer();
      
      // Run tests
      const results = await this.playwrightRunner.runTests(scenarios);
      
      // Stop preview server
      await this.playwrightRunner.stopPreviewServer();
      
      return results;
    } catch (error: any) {
      return {
        passed: 0,
        failed: 1,
        total: 1,
        duration: 0,
        results: [{
          scenario: 'E2E Test Setup',
          passed: false,
          duration: 0,
          error: error.message,
        }],
      };
    }
  }

  async generateE2EScenarios(userJourneys: string[][]): Promise<E2ETestScenario[]> {
    return this.playwrightRunner.generateTestScenarios(userJourneys);
  }

  /**
   * Check accessibility of a preview URL
   */
  async checkAccessibility(
    url: string,
    options?: A11yCheckOptions
  ): Promise<A11yReport> {
    try {
      return await this.accessibilityChecker.checkAccessibility(url, options);
    } catch (error: any) {
      return {
        url,
        timestamp: new Date(),
        violations: [],
        passes: 0,
        incomplete: 0,
        inapplicable: 0,
        summary: {
          critical: 0,
          serious: 0,
          moderate: 0,
          minor: 0,
          total: 0,
        },
        passed: false,
        blockers: [`Accessibility check failed: ${error.message}`],
      };
    }
  }

  /**
   * Check accessibility of multiple pages
   */
  async checkMultiplePages(
    urls: string[],
    options?: A11yCheckOptions
  ): Promise<A11yReport[]> {
    return await this.accessibilityChecker.checkMultiplePages(urls, options);
  }

  /**
   * Generate HTML report for accessibility violations
   */
  async generateAccessibilityReport(
    report: A11yReport,
    outputPath: string
  ): Promise<void> {
    await this.accessibilityChecker.generateHTMLReport(report, outputPath);
  }

  /**
   * Measure performance with Lighthouse
   */
  async measurePerformance(
    url: string,
    options?: LighthouseOptions
  ): Promise<PerformanceReport> {
    try {
      await this.lighthouseRunner.initialize();
      return await this.lighthouseRunner.runAudit(url, options);
    } catch (error: any) {
      return {
        url,
        timestamp: new Date(),
        scores: {
          performance: 0,
          accessibility: 0,
          bestPractices: 0,
          seo: 0,
          pwa: 0,
        },
        coreWebVitals: {
          LCP: 0,
          FID: 0,
          CLS: 0,
          FCP: 0,
          TTI: 0,
          TBT: 0,
          SI: 0,
        },
        recommendations: [],
        passed: false,
      };
    }
  }

  /**
   * Measure Core Web Vitals specifically
   */
  async measureCoreWebVitals(url: string) {
    await this.lighthouseRunner.initialize();
    return await this.lighthouseRunner.measureCoreWebVitals(url);
  }

  /**
   * Get performance scores
   */
  async getPerformanceScores(url: string) {
    await this.lighthouseRunner.initialize();
    return await this.lighthouseRunner.getPerformanceScores(url);
  }

  /**
   * Get performance recommendations
   */
  async getPerformanceRecommendations(url: string) {
    await this.lighthouseRunner.initialize();
    return await this.lighthouseRunner.getRecommendations(url);
  }

  /**
   * Measure performance on multiple pages
   */
  async measureMultiplePages(
    urls: string[],
    options?: LighthouseOptions
  ): Promise<PerformanceReport[]> {
    await this.lighthouseRunner.initialize();
    return await this.lighthouseRunner.runMultipleAudits(urls, options);
  }

  /**
   * Get performance history for a URL
   */
  getPerformanceHistory(url: string) {
    return this.lighthouseRunner.getHistory(url);
  }

  /**
   * Get all performance history
   */
  getAllPerformanceHistory() {
    return this.lighthouseRunner.getAllHistory();
  }

  /**
   * Get performance trend for a URL
   */
  getPerformanceTrend(url: string) {
    return this.lighthouseRunner.getTrend(url);
  }

  /**
   * Compare two performance reports
   */
  comparePerformanceReports(baseline: PerformanceReport, current: PerformanceReport) {
    return this.lighthouseRunner.compareReports(baseline, current);
  }

  /**
   * Generate HTML report for performance
   */
  async generatePerformanceReport(
    report: PerformanceReport,
    outputPath: string
  ): Promise<void> {
    await this.lighthouseRunner.generateHTMLReport(report, outputPath);
  }

  /**
   * Close all resources
   */
  async close(): Promise<void> {
    await this.accessibilityChecker.close();
  }

  private parseTestOutput(output: string): TestResults {
    // Simplified parser - would be more robust in production
    const passedMatch = output.match(/(\d+) passed/);
    const failedMatch = output.match(/(\d+) failed/);
    
    return {
      passed: passedMatch ? parseInt(passedMatch[1]) : 0,
      failed: failedMatch ? parseInt(failedMatch[1]) : 0,
      total: 0,
      duration: 0,
      failures: [],
    };
  }
}
