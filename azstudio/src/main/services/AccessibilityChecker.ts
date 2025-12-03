import { chromium, Browser } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export type ViolationSeverity = 'critical' | 'serious' | 'moderate' | 'minor';

export interface A11yViolation {
  id: string;
  impact: ViolationSeverity;
  description: string;
  help: string;
  helpUrl: string;
  nodes: A11yViolationNode[];
  tags: string[];
}

export interface A11yViolationNode {
  html: string;
  target: string[];
  failureSummary: string;
  fixes: string[];
}

export interface A11yReport {
  url: string;
  timestamp: Date;
  violations: A11yViolation[];
  passes: number;
  incomplete: number;
  inapplicable: number;
  summary: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
    total: number;
  };
  passed: boolean;
  blockers: string[];
}

export interface A11yCheckOptions {
  blockOnCritical?: boolean;
  blockOnSerious?: boolean;
  includeFixSuggestions?: boolean;
  rules?: string[];
  excludeRules?: string[];
  timeout?: number;
}

/**
 * AccessibilityChecker runs axe-core against preview pages
 * to detect accessibility violations
 */
export class AccessibilityChecker {
  private browser: Browser | null = null;
  private defaultOptions: A11yCheckOptions = {
    blockOnCritical: true,
    blockOnSerious: false,
    includeFixSuggestions: true,
    timeout: 30000,
  };

  constructor(private projectRoot: string) {}

  /**
   * Initialize browser for accessibility testing
   */
  private async initBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
      });
    }
    return this.browser;
  }

  /**
   * Close browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Check accessibility of a URL
   */
  async checkAccessibility(
    url: string,
    options: A11yCheckOptions = {}
  ): Promise<A11yReport> {
    const opts = { ...this.defaultOptions, ...options };
    const browser = await this.initBrowser();
    const page = await browser.newPage();

    try {
      // Navigate to page
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: opts.timeout,
      });

      // Run axe-core analysis via AxeBuilder
      const builder = new AxeBuilder({ page });
      if (opts.rules && opts.rules.length) builder.withRules(opts.rules as any);
      if (opts.excludeRules && opts.excludeRules.length) builder.disableRules(opts.excludeRules as any);
      const analysisResults: any = await builder.analyze();
      const results = analysisResults.violations || [];

      // Process results
      const report = await this.processResults(url, results, opts);

      return report;
    } catch (error: any) {
      console.error('Accessibility check failed:', error);
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
        blockers: [`Failed to check accessibility: ${error.message}`],
      };
    } finally {
      await page.close();
    }
  }

  /**
   * Check accessibility of multiple URLs
   */
  async checkMultiplePages(
    urls: string[],
    options: A11yCheckOptions = {}
  ): Promise<A11yReport[]> {
    const reports: A11yReport[] = [];

    for (const url of urls) {
      const report = await this.checkAccessibility(url, options);
      reports.push(report);
    }

    return reports;
  }

  /**
   * Build rules configuration for axe-core
   */
  private buildRulesConfig(options: A11yCheckOptions): Record<string, { enabled: boolean }> {
    const config: Record<string, { enabled: boolean }> = {};

    // Enable specific rules if provided
    if (options.rules && options.rules.length > 0) {
      for (const rule of options.rules) {
        config[rule] = { enabled: true };
      }
    }

    // Disable excluded rules
    if (options.excludeRules && options.excludeRules.length > 0) {
      for (const rule of options.excludeRules) {
        config[rule] = { enabled: false };
      }
    }

    return config;
  }

  /**
   * Process axe-core results into our report format
   */
  private async processResults(
    url: string,
    results: any[],
    options: A11yCheckOptions
  ): Promise<A11yReport> {
    const violations: A11yViolation[] = [];
    const summary = {
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0,
      total: 0,
    };

    // Process each violation
    for (const result of results) {
      const impact = (result.impact || 'minor') as ViolationSeverity;
      
      // Count by severity
      summary[impact]++;
      summary.total++;

      // Build violation nodes with fix suggestions
      const nodes: A11yViolationNode[] = result.nodes.map((node: any) => ({
        html: node.html,
        target: node.target,
        failureSummary: node.failureSummary || '',
        fixes: options.includeFixSuggestions
          ? this.generateFixSuggestions(result.id, node)
          : [],
      }));

      violations.push({
        id: result.id,
        impact,
        description: result.description,
        help: result.help,
        helpUrl: result.helpUrl,
        nodes,
        tags: result.tags,
      });
    }

    // Determine if check passed
    const blockers: string[] = [];
    let passed = true;

    if (options.blockOnCritical && summary.critical > 0) {
      passed = false;
      blockers.push(`${summary.critical} critical accessibility violation(s) found`);
    }

    if (options.blockOnSerious && summary.serious > 0) {
      passed = false;
      blockers.push(`${summary.serious} serious accessibility violation(s) found`);
    }

    return {
      url,
      timestamp: new Date(),
      violations,
      passes: 0, // Would need full axe results to get this
      incomplete: 0,
      inapplicable: 0,
      summary,
      passed,
      blockers,
    };
  }

  /**
   * Generate fix suggestions for common accessibility issues
   */
  private generateFixSuggestions(ruleId: string, node: any): string[] {
    const fixes: string[] = [];

    // Common fix suggestions based on rule ID
    const fixMap: Record<string, string[]> = {
      'image-alt': [
        'Add descriptive alt text to the image',
        'If image is decorative, use alt="" or role="presentation"',
        'Example: <img src="..." alt="Description of image">',
      ],
      'button-name': [
        'Add accessible text to the button',
        'Use aria-label or aria-labelledby attribute',
        'Ensure button has visible text content',
        'Example: <button aria-label="Close dialog">X</button>',
      ],
      'color-contrast': [
        'Increase contrast between text and background',
        'Use a darker text color or lighter background',
        'Aim for WCAG AA ratio of 4.5:1 for normal text',
        'Use browser DevTools to check contrast ratios',
      ],
      'label': [
        'Associate label with form control using for/id',
        'Use aria-label or aria-labelledby for custom controls',
        'Example: <label for="email">Email</label><input id="email">',
      ],
      'link-name': [
        'Add descriptive text to the link',
        'Avoid generic text like "click here" or "read more"',
        'Use aria-label for icon-only links',
        'Example: <a href="..." aria-label="Read more about accessibility">',
      ],
      'heading-order': [
        'Use heading levels in sequential order (h1, h2, h3)',
        'Do not skip heading levels',
        'Use CSS for visual styling, not heading levels',
      ],
      'html-has-lang': [
        'Add lang attribute to <html> element',
        'Example: <html lang="en">',
        'Use appropriate language code (en, es, fr, etc.)',
      ],
      'landmark-one-main': [
        'Add a <main> landmark to the page',
        'Use <main> element or role="main"',
        'Ensure only one main landmark per page',
      ],
      'region': [
        'Add ARIA landmarks to page regions',
        'Use semantic HTML5 elements (header, nav, main, footer)',
        'Add role attributes for custom regions',
      ],
      'aria-required-attr': [
        'Add required ARIA attributes to the element',
        'Check ARIA specification for required attributes',
        'Example: role="button" requires aria-pressed or aria-expanded',
      ],
      'aria-valid-attr-value': [
        'Use valid values for ARIA attributes',
        'Check ARIA specification for allowed values',
        'Example: aria-hidden accepts "true" or "false"',
      ],
      'duplicate-id': [
        'Ensure all id attributes are unique',
        'Remove or rename duplicate id values',
        'Use classes for styling multiple elements',
      ],
      'form-field-multiple-labels': [
        'Ensure form fields have only one label',
        'Remove duplicate label associations',
        'Use aria-describedby for additional descriptions',
      ],
      'frame-title': [
        'Add title attribute to iframe',
        'Use descriptive title that explains iframe content',
        'Example: <iframe title="YouTube video player" src="...">',
      ],
      'input-button-name': [
        'Add value or aria-label to input button',
        'Example: <input type="submit" value="Submit form">',
        'Or: <input type="button" aria-label="Close">',
      ],
      'meta-viewport': [
        'Add viewport meta tag for responsive design',
        'Ensure user-scalable is not disabled',
        'Example: <meta name="viewport" content="width=device-width, initial-scale=1">',
      ],
      'page-has-heading-one': [
        'Add an h1 heading to the page',
        'Use h1 for main page title',
        'Ensure only one h1 per page',
      ],
      'scrollable-region-focusable': [
        'Make scrollable regions keyboard accessible',
        'Add tabindex="0" to scrollable containers',
        'Ensure keyboard users can scroll content',
      ],
      'select-name': [
        'Add label to select element',
        'Use <label> element or aria-label attribute',
        'Example: <label for="country">Country</label><select id="country">',
      ],
      'tabindex': [
        'Avoid positive tabindex values',
        'Use tabindex="0" to add to tab order',
        'Use tabindex="-1" to remove from tab order',
        'Let natural DOM order determine tab sequence',
      ],
    };

    // Get specific fixes for this rule
    if (fixMap[ruleId]) {
      fixes.push(...fixMap[ruleId]);
    } else {
      // Generic fix suggestion
      fixes.push(
        'Review the element and fix the accessibility issue',
        `See ${node.helpUrl || 'WCAG guidelines'} for more information`
      );
    }

    return fixes;
  }

  /**
   * Generate HTML report for accessibility violations
   */
  async generateHTMLReport(report: A11yReport, outputPath: string): Promise<void> {
    const fs = await import('fs');
    const path = await import('path');

    const html = this.buildReportHTML(report);
    
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await fs.promises.writeFile(outputPath, html, 'utf-8');
  }

  /**
   * Build HTML report
   */
  private buildReportHTML(report: A11yReport): string {
    const violationsHTML = report.violations
      .sort((a, b) => {
        const severityOrder = { critical: 0, serious: 1, moderate: 2, minor: 3 };
        return severityOrder[a.impact] - severityOrder[b.impact];
      })
      .map(violation => {
        const nodesHTML = violation.nodes
          .map(node => {
            const fixesHTML = node.fixes
              .map(fix => `<li>${this.escapeHtml(fix)}</li>`)
              .join('');

            return `
              <div class="violation-node">
                <div class="node-target">
                  <strong>Element:</strong> ${this.escapeHtml(node.target.join(', '))}
                </div>
                <div class="node-html">
                  <strong>HTML:</strong>
                  <pre><code>${this.escapeHtml(node.html)}</code></pre>
                </div>
                ${node.failureSummary ? `
                  <div class="node-failure">
                    <strong>Issue:</strong> ${this.escapeHtml(node.failureSummary)}
                  </div>
                ` : ''}
                ${fixesHTML ? `
                  <div class="node-fixes">
                    <strong>How to fix:</strong>
                    <ul>${fixesHTML}</ul>
                  </div>
                ` : ''}
              </div>
            `;
          })
          .join('');

        return `
          <div class="violation violation-${violation.impact}">
            <div class="violation-header">
              <span class="severity-badge severity-${violation.impact}">
                ${violation.impact.toUpperCase()}
              </span>
              <h3>${this.escapeHtml(violation.help)}</h3>
            </div>
            <div class="violation-description">
              ${this.escapeHtml(violation.description)}
            </div>
            <div class="violation-meta">
              <span class="violation-id">Rule: ${violation.id}</span>
              <a href="${violation.helpUrl}" target="_blank" class="violation-link">
                Learn more →
              </a>
            </div>
            <div class="violation-nodes">
              <strong>${violation.nodes.length} instance(s) found:</strong>
              ${nodesHTML}
            </div>
          </div>
        `;
      })
      .join('');

    const statusClass = report.passed ? 'status-pass' : 'status-fail';
    const statusText = report.passed ? 'PASSED' : 'FAILED';
    const statusIcon = report.passed ? '✓' : '✗';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Report - ${this.escapeHtml(report.url)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      padding: 2rem;
      color: #333;
      line-height: 1.6;
    }
    
    .header {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .header h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      color: #1a1a1a;
    }
    
    .header .url {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 1rem;
      word-break: break-all;
    }
    
    .status {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 1.1rem;
      margin-bottom: 1rem;
    }
    
    .status-pass {
      background: #dcfce7;
      color: #166534;
    }
    
    .status-fail {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-top: 1.5rem;
    }
    
    .summary-item {
      background: #f9f9f9;
      padding: 1rem;
      border-radius: 6px;
      text-align: center;
    }
    
    .summary-item .count {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 0.25rem;
    }
    
    .summary-item .label {
      font-size: 0.85rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .summary-item.critical .count { color: #dc2626; }
    .summary-item.serious .count { color: #ea580c; }
    .summary-item.moderate .count { color: #ca8a04; }
    .summary-item.minor .count { color: #2563eb; }
    
    .violations-container {
      margin-top: 2rem;
    }
    
    .violation {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-left: 4px solid #ddd;
    }
    
    .violation-critical { border-left-color: #dc2626; }
    .violation-serious { border-left-color: #ea580c; }
    .violation-moderate { border-left-color: #ca8a04; }
    .violation-minor { border-left-color: #2563eb; }
    
    .violation-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    
    .violation-header h3 {
      font-size: 1.25rem;
      color: #1a1a1a;
    }
    
    .severity-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    
    .severity-critical {
      background: #dc2626;
      color: white;
    }
    
    .severity-serious {
      background: #ea580c;
      color: white;
    }
    
    .severity-moderate {
      background: #ca8a04;
      color: white;
    }
    
    .severity-minor {
      background: #2563eb;
      color: white;
    }
    
    .violation-description {
      color: #555;
      margin-bottom: 1rem;
    }
    
    .violation-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: #f9f9f9;
      border-radius: 4px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
    
    .violation-id {
      font-family: monospace;
      color: #666;
    }
    
    .violation-link {
      color: #2563eb;
      text-decoration: none;
      font-weight: 500;
    }
    
    .violation-link:hover {
      text-decoration: underline;
    }
    
    .violation-nodes {
      margin-top: 1rem;
    }
    
    .violation-nodes > strong {
      display: block;
      margin-bottom: 0.75rem;
      color: #555;
    }
    
    .violation-node {
      background: #fafafa;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      border: 1px solid #e5e5e5;
    }
    
    .violation-node > div {
      margin-bottom: 0.75rem;
    }
    
    .violation-node > div:last-child {
      margin-bottom: 0;
    }
    
    .node-target {
      font-family: monospace;
      font-size: 0.9rem;
      color: #2563eb;
    }
    
    .node-html pre {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 0.75rem;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }
    
    .node-failure {
      color: #dc2626;
      font-size: 0.95rem;
    }
    
    .node-fixes ul {
      list-style: none;
      padding-left: 0;
      margin-top: 0.5rem;
    }
    
    .node-fixes li {
      padding: 0.5rem 0;
      padding-left: 1.5rem;
      position: relative;
      color: #555;
    }
    
    .node-fixes li:before {
      content: '→';
      position: absolute;
      left: 0;
      color: #22c55e;
      font-weight: bold;
    }
    
    .no-violations {
      background: white;
      padding: 3rem;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .no-violations h2 {
      color: #166534;
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }
    
    .no-violations p {
      color: #666;
    }
    
    .timestamp {
      color: #999;
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }
    
    @media (max-width: 768px) {
      body {
        padding: 1rem;
      }
      
      .summary {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .violation-header {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Accessibility Report</h1>
    <div class="url">${this.escapeHtml(report.url)}</div>
    <div class="status ${statusClass}">
      <span>${statusIcon}</span>
      <span>${statusText}</span>
    </div>
    <div class="timestamp">
      Generated: ${report.timestamp.toLocaleString()}
    </div>
    
    <div class="summary">
      <div class="summary-item critical">
        <div class="count">${report.summary.critical}</div>
        <div class="label">Critical</div>
      </div>
      <div class="summary-item serious">
        <div class="count">${report.summary.serious}</div>
        <div class="label">Serious</div>
      </div>
      <div class="summary-item moderate">
        <div class="count">${report.summary.moderate}</div>
        <div class="label">Moderate</div>
      </div>
      <div class="summary-item minor">
        <div class="count">${report.summary.minor}</div>
        <div class="label">Minor</div>
      </div>
      <div class="summary-item">
        <div class="count">${report.summary.total}</div>
        <div class="label">Total Issues</div>
      </div>
    </div>
  </div>
  
  <div class="violations-container">
    ${report.violations.length > 0 ? violationsHTML : `
      <div class="no-violations">
        <h2>✓ No Accessibility Violations Found</h2>
        <p>This page passed all accessibility checks!</p>
      </div>
    `}
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Get summary of multiple reports
   */
  getSummary(reports: A11yReport[]): {
    totalPages: number;
    passedPages: number;
    failedPages: number;
    totalViolations: number;
    criticalViolations: number;
    seriousViolations: number;
  } {
    return {
      totalPages: reports.length,
      passedPages: reports.filter(r => r.passed).length,
      failedPages: reports.filter(r => !r.passed).length,
      totalViolations: reports.reduce((sum, r) => sum + r.summary.total, 0),
      criticalViolations: reports.reduce((sum, r) => sum + r.summary.critical, 0),
      seriousViolations: reports.reduce((sum, r) => sum + r.summary.serious, 0),
    };
  }
}
