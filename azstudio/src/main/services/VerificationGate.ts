import { VerificationPipeline, VerificationReport } from './VerificationPipeline';
import * as fs from 'fs/promises';

/**
 * Types of changes that can be made
 */
export type ChangeType = 
  | 'ui-component'
  | 'api-endpoint'
  | 'database-schema'
  | 'service-logic'
  | 'design-filter'
  | 'configuration'
  | 'documentation'
  | 'test';

/**
 * Verification requirements for a change type
 */
export interface VerificationRequirements {
  changeType: ChangeType;
  required: {
    unitTests: boolean;
    integrationTests: boolean;
    e2eTests: boolean;
    accessibility: boolean;
    performance: boolean;
    typeCheck: boolean;
    lint: boolean;
  };
  thresholds: {
    minCoverage?: number;
    minPerformanceScore?: number;
    maxAccessibilityViolations?: number;
    maxCriticalA11yViolations?: number;
  };
}

/**
 * Fix suggestion for a verification failure
 */
export interface FixSuggestion {
  issue: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'test' | 'accessibility' | 'performance' | 'code-quality';
  suggestion: string;
  autoFixable: boolean;
  autoFixCommand?: string;
}

/**
 * Comprehensive verification gate report
 */
export interface VerificationGateReport extends VerificationReport {
  changeType: ChangeType;
  requirements: VerificationRequirements;
  fixSuggestions: FixSuggestion[];
  canCommit: boolean;
  summary: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    skippedChecks: number;
  };
}

/**
 * Verification Gate System
 * 
 * Defines verification requirements per change type, runs all checks,
 * generates comprehensive reports, and provides actionable fix suggestions.
 */
export class VerificationGate {
  private pipeline: VerificationPipeline;
  private projectRoot: string;
  private requirementsMap: Map<ChangeType, VerificationRequirements>;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.pipeline = new VerificationPipeline(projectRoot);
    this.requirementsMap = this.initializeRequirements();
  }

  /**
   * Initialize verification requirements for each change type
   */
  private initializeRequirements(): Map<ChangeType, VerificationRequirements> {
    const requirements = new Map<ChangeType, VerificationRequirements>();

    // UI Component changes
    requirements.set('ui-component', {
      changeType: 'ui-component',
      required: {
        unitTests: true,
        integrationTests: false,
        e2eTests: true,
        accessibility: true,
        performance: true,
        typeCheck: true,
        lint: true,
      },
      thresholds: {
        minCoverage: 80,
        minPerformanceScore: 90,
        maxAccessibilityViolations: 0,
        maxCriticalA11yViolations: 0,
      },
    });

    // API Endpoint changes
    requirements.set('api-endpoint', {
      changeType: 'api-endpoint',
      required: {
        unitTests: true,
        integrationTests: true,
        e2eTests: false,
        accessibility: false,
        performance: false,
        typeCheck: true,
        lint: true,
      },
      thresholds: {
        minCoverage: 90,
      },
    });

    // Database Schema changes
    requirements.set('database-schema', {
      changeType: 'database-schema',
      required: {
        unitTests: false,
        integrationTests: true,
        e2eTests: false,
        accessibility: false,
        performance: false,
        typeCheck: true,
        lint: true,
      },
      thresholds: {
        minCoverage: 80,
      },
    });

    // Service Logic changes
    requirements.set('service-logic', {
      changeType: 'service-logic',
      required: {
        unitTests: true,
        integrationTests: true,
        e2eTests: false,
        accessibility: false,
        performance: false,
        typeCheck: true,
        lint: true,
      },
      thresholds: {
        minCoverage: 85,
      },
    });

    // Design Filter changes
    requirements.set('design-filter', {
      changeType: 'design-filter',
      required: {
        unitTests: false,
        integrationTests: false,
        e2eTests: true,
        accessibility: true,
        performance: true,
        typeCheck: true,
        lint: true,
      },
      thresholds: {
        minPerformanceScore: 85,
        maxAccessibilityViolations: 5,
        maxCriticalA11yViolations: 0,
      },
    });

    // Configuration changes
    requirements.set('configuration', {
      changeType: 'configuration',
      required: {
        unitTests: false,
        integrationTests: true,
        e2eTests: false,
        accessibility: false,
        performance: false,
        typeCheck: true,
        lint: true,
      },
      thresholds: {},
    });

    // Documentation changes
    requirements.set('documentation', {
      changeType: 'documentation',
      required: {
        unitTests: false,
        integrationTests: false,
        e2eTests: false,
        accessibility: false,
        performance: false,
        typeCheck: false,
        lint: true,
      },
      thresholds: {},
    });

    // Test changes
    requirements.set('test', {
      changeType: 'test',
      required: {
        unitTests: true,
        integrationTests: false,
        e2eTests: false,
        accessibility: false,
        performance: false,
        typeCheck: true,
        lint: true,
      },
      thresholds: {},
    });

    return requirements;
  }

  /**
   * Detect change type from modified files
   */
  detectChangeType(modifiedFiles: string[]): ChangeType {
    const hasUIFiles = modifiedFiles.some(f => 
      f.includes('/components/') || 
      f.includes('/pages/') || 
      f.endsWith('.tsx') || 
      f.endsWith('.css')
    );

    const hasAPIFiles = modifiedFiles.some(f => 
      f.includes('/api/') || 
      f.includes('/routes/') || 
      f.includes('/controllers/')
    );

    const hasSchemaFiles = modifiedFiles.some(f => 
      f.includes('schema.prisma') || 
      f.includes('/migrations/')
    );

    const hasServiceFiles = modifiedFiles.some(f => 
      f.includes('/services/') && 
      !f.includes('__tests__')
    );

    const hasDesignFiles = modifiedFiles.some(f => 
      f.includes('tailwind.config') || 
      f.includes('design-tokens') || 
      f.includes('theme')
    );

    const hasConfigFiles = modifiedFiles.some(f => 
      f.endsWith('.config.js') || 
      f.endsWith('.config.ts') || 
      f.endsWith('.json')
    );

    const hasDocFiles = modifiedFiles.some(f => 
      f.endsWith('.md') || 
      f.includes('/docs/')
    );

    const hasTestFiles = modifiedFiles.some(f => 
      f.includes('__tests__') || 
      f.includes('.test.') || 
      f.includes('.spec.')
    );

    // Priority order for detection
    if (hasSchemaFiles) return 'database-schema';
    if (hasAPIFiles) return 'api-endpoint';
    if (hasUIFiles) return 'ui-component';
    if (hasDesignFiles) return 'design-filter';
    if (hasServiceFiles) return 'service-logic';
    if (hasTestFiles) return 'test';
    if (hasDocFiles) return 'documentation';
    if (hasConfigFiles) return 'configuration';

    // Default to service logic
    return 'service-logic';
  }

  /**
   * Get verification requirements for a change type
   */
  getRequirements(changeType: ChangeType): VerificationRequirements {
    return this.requirementsMap.get(changeType) || this.requirementsMap.get('service-logic')!;
  }

  /**
   * Run all verification checks based on change type
   */
  async runVerification(
    changeType: ChangeType,
    _modifiedFiles: string[],
    previewUrl?: string
  ): Promise<VerificationGateReport> {
    const requirements = this.getRequirements(changeType);
    let totalChecks = 0;
    let passedChecks = 0;
    let failedChecks = 0;
    let skippedChecks = 0;

    // Run verification pipeline
    const report = await this.pipeline.verify(
      requirements.required.e2eTests,
      requirements.required.accessibility,
      requirements.required.performance,
      previewUrl
    );

    // Count checks
    totalChecks = Object.values(requirements.required).filter(Boolean).length;
    
    // Analyze results
    if (requirements.required.unitTests || requirements.required.integrationTests) {
      if (report.tests.failed === 0) passedChecks++;
      else failedChecks++;
    }

    if (requirements.required.e2eTests && report.e2eTests) {
      if (report.e2eTests.failed === 0) passedChecks++;
      else failedChecks++;
    }

    if (requirements.required.accessibility && report.accessibility) {
      if (report.accessibility.passed) passedChecks++;
      else failedChecks++;
    }

    if (requirements.required.performance && report.performance) {
      if (report.performance.passed) passedChecks++;
      else failedChecks++;
    }

    // Type check and lint
    if (requirements.required.typeCheck) {
      totalChecks++;
      const typeCheckPassed = await this.runTypeCheck();
      if (typeCheckPassed) passedChecks++;
      else failedChecks++;
    }

    if (requirements.required.lint) {
      totalChecks++;
      const lintPassed = await this.runLint();
      if (lintPassed) passedChecks++;
      else failedChecks++;
    }

    skippedChecks = totalChecks - passedChecks - failedChecks;

    // Generate fix suggestions
    const fixSuggestions = this.generateFixSuggestions(report, requirements);

    // Determine if can commit
    const canCommit = this.canCommit(report, requirements, fixSuggestions);

    return {
      ...report,
      changeType,
      requirements,
      fixSuggestions,
      canCommit,
      summary: {
        totalChecks,
        passedChecks,
        failedChecks,
        skippedChecks,
      },
    };
  }

  /**
   * Run type checking
   */
  private async runTypeCheck(): Promise<boolean> {
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      await execAsync('npx tsc --noEmit', {
        cwd: this.projectRoot,
        timeout: 60000,
      });

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Run linting
   */
  private async runLint(): Promise<boolean> {
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      await execAsync('npm run lint', {
        cwd: this.projectRoot,
        timeout: 60000,
      });

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate fix suggestions based on verification results
   */
  private generateFixSuggestions(
    report: VerificationReport,
    requirements: VerificationRequirements
  ): FixSuggestion[] {
    const suggestions: FixSuggestion[] = [];

    // Test failures
    if (report.tests.failed > 0) {
      for (const failure of report.tests.failures) {
        suggestions.push({
          issue: `Test failed: ${failure.test}`,
          severity: 'critical',
          category: 'test',
          suggestion: `Fix the failing test in ${failure.file}. Error: ${failure.error}`,
          autoFixable: false,
        });
      }
    }

    // Coverage threshold
    if (requirements.thresholds.minCoverage && report.tests.coverage) {
      if (report.tests.coverage < requirements.thresholds.minCoverage) {
        suggestions.push({
          issue: `Code coverage (${report.tests.coverage}%) below threshold (${requirements.thresholds.minCoverage}%)`,
          severity: 'high',
          category: 'test',
          suggestion: `Add more tests to increase coverage to at least ${requirements.thresholds.minCoverage}%`,
          autoFixable: false,
        });
      }
    }

    // E2E test failures
    if (report.e2eTests && report.e2eTests.failed > 0) {
      for (const result of report.e2eTests.results) {
        if (!result.passed) {
          suggestions.push({
            issue: `E2E test failed: ${result.scenario}`,
            severity: 'critical',
            category: 'test',
            suggestion: result.error || 'Check the test output and screenshots for details',
            autoFixable: false,
          });
        }
      }
    }

    // Accessibility violations
    if (report.accessibility) {
      const { summary, violations } = report.accessibility;

      if (summary.critical > 0) {
        for (const violation of violations.filter(v => v.impact === 'critical')) {
          suggestions.push({
            issue: `Critical accessibility violation: ${violation.id}`,
            severity: 'critical',
            category: 'accessibility',
            suggestion: `${violation.description}. Fix: ${violation.help}. Affected elements: ${violation.nodes.length}`,
            autoFixable: false,
          });
        }
      }

      if (summary.serious > 0) {
        for (const violation of violations.filter(v => v.impact === 'serious')) {
          suggestions.push({
            issue: `Serious accessibility violation: ${violation.id}`,
            severity: 'high',
            category: 'accessibility',
            suggestion: `${violation.description}. Fix: ${violation.help}`,
            autoFixable: false,
          });
        }
      }

      if (summary.moderate > 0) {
        suggestions.push({
          issue: `${summary.moderate} moderate accessibility violations found`,
          severity: 'medium',
          category: 'accessibility',
          suggestion: 'Review and fix moderate accessibility issues to improve user experience',
          autoFixable: false,
        });
      }
    }

    // Performance issues
    if (report.performance) {
      const { scores, coreWebVitals, recommendations } = report.performance;

      if (requirements.thresholds.minPerformanceScore) {
        if (scores.performance < requirements.thresholds.minPerformanceScore) {
          suggestions.push({
            issue: `Performance score (${scores.performance}) below threshold (${requirements.thresholds.minPerformanceScore})`,
            severity: 'high',
            category: 'performance',
            suggestion: `Improve performance to meet the ${requirements.thresholds.minPerformanceScore} threshold`,
            autoFixable: false,
          });
        }
      }

      // Core Web Vitals issues
      if (coreWebVitals.LCP > 2500) {
        suggestions.push({
          issue: `Largest Contentful Paint (${Math.round(coreWebVitals.LCP)}ms) exceeds 2.5s`,
          severity: 'high',
          category: 'performance',
          suggestion: 'Optimize images, reduce render-blocking resources, and improve server response time',
          autoFixable: false,
        });
      }

      if (coreWebVitals.CLS > 0.1) {
        suggestions.push({
          issue: `Cumulative Layout Shift (${coreWebVitals.CLS.toFixed(3)}) exceeds 0.1`,
          severity: 'medium',
          category: 'performance',
          suggestion: 'Add size attributes to images and videos, avoid inserting content above existing content',
          autoFixable: false,
        });
      }

      // Top performance recommendations
      for (const rec of recommendations.slice(0, 3)) {
        if (rec.score < 50) {
          suggestions.push({
            issue: rec.title,
            severity: rec.score < 25 ? 'high' : 'medium',
            category: 'performance',
            suggestion: rec.description,
            autoFixable: false,
          });
        }
      }
    }

    return suggestions;
  }

  /**
   * Determine if changes can be committed
   */
  private canCommit(
    report: VerificationReport,
    requirements: VerificationRequirements,
    suggestions: FixSuggestion[]
  ): boolean {
    // Check for critical blockers
    const hasCriticalIssues = suggestions.some(s => s.severity === 'critical');
    if (hasCriticalIssues) {
      return false;
    }

    // Check test failures
    if (requirements.required.unitTests || requirements.required.integrationTests) {
      if (report.tests.failed > 0) {
        return false;
      }
    }

    // Check E2E test failures
    if (requirements.required.e2eTests && report.e2eTests) {
      if (report.e2eTests.failed > 0) {
        return false;
      }
    }

    // Check accessibility violations
    if (requirements.required.accessibility && report.accessibility) {
      const { summary } = report.accessibility;
      
      if (requirements.thresholds.maxCriticalA11yViolations !== undefined) {
        if (summary.critical > requirements.thresholds.maxCriticalA11yViolations) {
          return false;
        }
      }

      if (requirements.thresholds.maxAccessibilityViolations !== undefined) {
        if (summary.total > requirements.thresholds.maxAccessibilityViolations) {
          return false;
        }
      }
    }

    // Check performance score
    if (requirements.required.performance && report.performance) {
      if (requirements.thresholds.minPerformanceScore) {
        if (report.performance.scores.performance < requirements.thresholds.minPerformanceScore) {
          return false;
        }
      }
    }

    // Check coverage threshold
    if (requirements.thresholds.minCoverage && report.tests.coverage) {
      if (report.tests.coverage < requirements.thresholds.minCoverage) {
        return false;
      }
    }

    return true;
  }

  /**
   * Generate comprehensive HTML report
   */
  async generateHTMLReport(
    report: VerificationGateReport,
    outputPath: string
  ): Promise<void> {
    const html = this.generateReportHTML(report);
    await fs.writeFile(outputPath, html, 'utf-8');
  }

  /**
   * Generate HTML content for verification gate report
   */
  private generateReportHTML(report: VerificationGateReport): string {
    const { changeType, requirements, fixSuggestions, canCommit, summary } = report;

    const getSeverityColor = (severity: string) => {
      switch (severity) {
        case 'critical': return '#ff4e42';
        case 'high': return '#ffa400';
        case 'medium': return '#ffcc00';
        case 'low': return '#0cce6b';
        default: return '#666';
      }
    };

    const getCategoryIcon = (category: string) => {
      switch (category) {
        case 'test': return '🧪';
        case 'accessibility': return '♿';
        case 'performance': return '⚡';
        case 'code-quality': return '✨';
        default: return '📋';
      }
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Gate Report - ${changeType}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    
    .header {
      background: ${canCommit ? '#0cce6b' : '#ff4e42'};
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header h1 { font-size: 28px; margin-bottom: 10px; }
    .header .status {
      font-size: 18px;
      font-weight: 500;
      margin-bottom: 5px;
    }
    .header .change-type {
      font-size: 14px;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }
    .summary-value {
      font-size: 36px;
      font-weight: bold;
      margin: 10px 0;
    }
    .summary-label {
      color: #666;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .section {
      background: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h2 {
      font-size: 20px;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #eee;
    }
    
    .requirement-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }
    .requirement-item:last-child { border-bottom: none; }
    .requirement-name { font-weight: 500; }
    .requirement-status {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .requirement-status.required { background: #ff4e42; color: white; }
    .requirement-status.optional { background: #e0e0e0; color: #666; }
    
    .suggestion {
      padding: 20px;
      margin-bottom: 15px;
      border-radius: 8px;
      border-left: 4px solid;
    }
    .suggestion.critical { border-color: #ff4e42; background: #fff5f5; }
    .suggestion.high { border-color: #ffa400; background: #fff9f0; }
    .suggestion.medium { border-color: #ffcc00; background: #fffef0; }
    .suggestion.low { border-color: #0cce6b; background: #f0fff5; }
    
    .suggestion-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }
    .suggestion-icon { font-size: 24px; }
    .suggestion-title {
      flex: 1;
      font-weight: 600;
      font-size: 16px;
    }
    .suggestion-severity {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      color: white;
    }
    .suggestion-body {
      color: #666;
      line-height: 1.6;
      margin-left: 34px;
    }
    
    .test-results {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    .test-result-card {
      padding: 15px;
      border-radius: 6px;
      background: #f9f9f9;
    }
    .test-result-title {
      font-weight: 500;
      margin-bottom: 8px;
    }
    .test-result-value {
      font-size: 24px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Verification Gate Report</h1>
      <div class="status">${canCommit ? '✓ Ready to Commit' : '✗ Cannot Commit - Issues Found'}</div>
      <div class="change-type">Change Type: ${changeType.replace('-', ' ')}</div>
      <div style="margin-top: 10px; font-size: 13px;">
        Generated: ${report.timestamp.toLocaleString()}
      </div>
    </div>

    <div class="summary">
      <div class="summary-card">
        <div class="summary-label">Total Checks</div>
        <div class="summary-value">${summary.totalChecks}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Passed</div>
        <div class="summary-value" style="color: #0cce6b">${summary.passedChecks}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Failed</div>
        <div class="summary-value" style="color: #ff4e42">${summary.failedChecks}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Issues Found</div>
        <div class="summary-value" style="color: #ffa400">${fixSuggestions.length}</div>
      </div>
    </div>
    
    <div class="section">
      <h2>Verification Requirements</h2>
      ${Object.entries(requirements.required).map(([key, required]) => `
        <div class="requirement-item">
          <div class="requirement-name">${key.replace(/([A-Z])/g, ' $1').trim()}</div>
          <div class="requirement-status ${required ? 'required' : 'optional'}">
            ${required ? 'Required' : 'Optional'}
          </div>
        </div>
      `).join('')}
      
      ${Object.keys(requirements.thresholds).length > 0 ? `
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
          <h3 style="font-size: 16px; margin-bottom: 15px;">Thresholds</h3>
          ${Object.entries(requirements.thresholds).map(([key, value]) => `
            <div class="requirement-item">
              <div class="requirement-name">${key.replace(/([A-Z])/g, ' $1').trim()}</div>
              <div style="font-weight: 500;">${value}${key.includes('Coverage') ? '%' : ''}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>

    ${fixSuggestions.length > 0 ? `
      <div class="section">
        <h2>Fix Suggestions (${fixSuggestions.length})</h2>
        ${fixSuggestions.map(suggestion => `
          <div class="suggestion ${suggestion.severity}">
            <div class="suggestion-header">
              <div class="suggestion-icon">${getCategoryIcon(suggestion.category)}</div>
              <div class="suggestion-title">${suggestion.issue}</div>
              <div class="suggestion-severity" style="background: ${getSeverityColor(suggestion.severity)}">
                ${suggestion.severity}
              </div>
            </div>
            <div class="suggestion-body">
              ${suggestion.suggestion}
              ${suggestion.autoFixable ? '<div style="margin-top: 8px; color: #0cce6b;">✓ Auto-fixable</div>' : ''}
              ${suggestion.autoFixCommand ? `<div style="margin-top: 8px; font-family: monospace; background: #f0f0f0; padding: 8px; border-radius: 4px;">${suggestion.autoFixCommand}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    ` : '<div class="section"><h2>Fix Suggestions</h2><p style="color: #0cce6b;">✓ No issues found!</p></div>'}
    
    <div class="section">
      <h2>Test Results</h2>
      <div class="test-results">
        <div class="test-result-card">
          <div class="test-result-title">Tests Passed</div>
          <div class="test-result-value" style="color: #0cce6b">${report.tests.passed}</div>
        </div>
        <div class="test-result-card">
          <div class="test-result-title">Tests Failed</div>
          <div class="test-result-value" style="color: #ff4e42">${report.tests.failed}</div>
        </div>
        <div class="test-result-card">
          <div class="test-result-title">Total Tests</div>
          <div class="test-result-value">${report.tests.total}</div>
        </div>
        ${report.tests.coverage ? `
          <div class="test-result-card">
            <div class="test-result-title">Coverage</div>
            <div class="test-result-value">${report.tests.coverage}%</div>
          </div>
        ` : ''}
      </div>
    </div>

    ${report.e2eTests ? `
      <div class="section">
        <h2>E2E Test Results</h2>
        <div class="test-results">
          <div class="test-result-card">
            <div class="test-result-title">E2E Passed</div>
            <div class="test-result-value" style="color: #0cce6b">${report.e2eTests.passed}</div>
          </div>
          <div class="test-result-card">
            <div class="test-result-title">E2E Failed</div>
            <div class="test-result-value" style="color: #ff4e42">${report.e2eTests.failed}</div>
          </div>
          <div class="test-result-card">
            <div class="test-result-title">Duration</div>
            <div class="test-result-value">${Math.round(report.e2eTests.duration / 1000)}s</div>
          </div>
        </div>
      </div>
    ` : ''}
    
    ${report.accessibility ? `
      <div class="section">
        <h2>Accessibility Report</h2>
        <div class="test-results">
          <div class="test-result-card">
            <div class="test-result-title">Critical</div>
            <div class="test-result-value" style="color: #ff4e42">${report.accessibility.summary.critical}</div>
          </div>
          <div class="test-result-card">
            <div class="test-result-title">Serious</div>
            <div class="test-result-value" style="color: #ffa400">${report.accessibility.summary.serious}</div>
          </div>
          <div class="test-result-card">
            <div class="test-result-title">Moderate</div>
            <div class="test-result-value" style="color: #ffcc00">${report.accessibility.summary.moderate}</div>
          </div>
          <div class="test-result-card">
            <div class="test-result-title">Total Violations</div>
            <div class="test-result-value">${report.accessibility.summary.total}</div>
          </div>
        </div>
      </div>
    ` : ''}
    
    ${report.performance ? `
      <div class="section">
        <h2>Performance Report</h2>
        <div class="test-results">
          <div class="test-result-card">
            <div class="test-result-title">Performance</div>
            <div class="test-result-value" style="color: ${report.performance.scores.performance >= 90 ? '#0cce6b' : report.performance.scores.performance >= 50 ? '#ffa400' : '#ff4e42'}">${report.performance.scores.performance}</div>
          </div>
          <div class="test-result-card">
            <div class="test-result-title">LCP</div>
            <div class="test-result-value">${Math.round(report.performance.coreWebVitals.LCP)}ms</div>
          </div>
          <div class="test-result-card">
            <div class="test-result-title">CLS</div>
            <div class="test-result-value">${report.performance.coreWebVitals.CLS.toFixed(3)}</div>
          </div>
          <div class="test-result-card">
            <div class="test-result-title">Recommendations</div>
            <div class="test-result-value">${report.performance.recommendations.length}</div>
          </div>
        </div>
      </div>
    ` : ''}
  </div>
</body>
</html>`;
  }

  /**
   * Generate JSON report
   */
  async generateJSONReport(
    report: VerificationGateReport,
    outputPath: string
  ): Promise<void> {
    await fs.writeFile(
      outputPath,
      JSON.stringify(report, null, 2),
      'utf-8'
    );
  }

  /**
   * Generate markdown summary
   */
  generateMarkdownSummary(report: VerificationGateReport): string {
    const { changeType, canCommit, summary, fixSuggestions } = report;

    let md = `# Verification Gate Report\n\n`;
    md += `**Status:** ${canCommit ? '✅ Ready to Commit' : '❌ Cannot Commit'}\n`;
    md += `**Change Type:** ${changeType}\n`;
    md += `**Generated:** ${report.timestamp.toLocaleString()}\n\n`;

    md += `## Summary\n\n`;
    md += `- Total Checks: ${summary.totalChecks}\n`;
    md += `- Passed: ${summary.passedChecks} ✅\n`;
    md += `- Failed: ${summary.failedChecks} ❌\n`;
    md += `- Issues Found: ${fixSuggestions.length}\n\n`;

    if (fixSuggestions.length > 0) {
      md += `## Issues to Fix\n\n`;
      
      const critical = fixSuggestions.filter(s => s.severity === 'critical');
      const high = fixSuggestions.filter(s => s.severity === 'high');
      const medium = fixSuggestions.filter(s => s.severity === 'medium');
      const low = fixSuggestions.filter(s => s.severity === 'low');

      if (critical.length > 0) {
        md += `### 🔴 Critical (${critical.length})\n\n`;
        critical.forEach(s => {
          md += `- **${s.issue}**\n`;
          md += `  ${s.suggestion}\n\n`;
        });
      }

      if (high.length > 0) {
        md += `### 🟠 High (${high.length})\n\n`;
        high.forEach(s => {
          md += `- **${s.issue}**\n`;
          md += `  ${s.suggestion}\n\n`;
        });
      }

      if (medium.length > 0) {
        md += `### 🟡 Medium (${medium.length})\n\n`;
        medium.forEach(s => {
          md += `- **${s.issue}**\n`;
          md += `  ${s.suggestion}\n\n`;
        });
      }

      if (low.length > 0) {
        md += `### 🟢 Low (${low.length})\n\n`;
        low.forEach(s => {
          md += `- **${s.issue}**\n`;
          md += `  ${s.suggestion}\n\n`;
        });
      }
    } else {
      md += `## ✅ No Issues Found\n\n`;
      md += `All verification checks passed successfully!\n\n`;
    }

    return md;
  }

  /**
   * Close resources
   */
  async close(): Promise<void> {
    await this.pipeline.close();
  }
}
