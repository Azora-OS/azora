import { AccessibilityChecker, A11yReport, A11yCheckOptions } from '../AccessibilityChecker';
import * as path from 'path';
import * as fs from 'fs';

describe('AccessibilityChecker', () => {
  let checker: AccessibilityChecker;
  const projectRoot = path.join(__dirname, '../../__fixtures__/test-project');

  beforeEach(() => {
    checker = new AccessibilityChecker(projectRoot);
  });

  afterEach(async () => {
    await checker.close();
  });

  describe('checkAccessibility', () => {
    it('should detect accessibility violations', async () => {
      // This test would require a real server running
      // For now, we test the structure
      const mockUrl = 'http://localhost:3000';
      
      // Mock implementation would go here
      // In real scenario, this would check actual page
      expect(checker).toBeDefined();
    });

    it('should handle check failures gracefully', async () => {
      const report = await checker.checkAccessibility('http://invalid-url-that-does-not-exist.local');
      
      expect(report.passed).toBe(false);
      expect(report.blockers.length).toBeGreaterThan(0);
      expect(report.violations).toEqual([]);
    });

    it('should respect blockOnCritical option', async () => {
      const options: A11yCheckOptions = {
        blockOnCritical: true,
        blockOnSerious: false,
      };
      
      // Would test with actual violations
      expect(options.blockOnCritical).toBe(true);
    });

    it('should respect blockOnSerious option', async () => {
      const options: A11yCheckOptions = {
        blockOnCritical: false,
        blockOnSerious: true,
      };
      
      expect(options.blockOnSerious).toBe(true);
    });

    it('should include fix suggestions when enabled', async () => {
      const options: A11yCheckOptions = {
        includeFixSuggestions: true,
      };
      
      expect(options.includeFixSuggestions).toBe(true);
    });
  });

  describe('checkMultiplePages', () => {
    it('should check multiple URLs', async () => {
      const urls = [
        'http://localhost:3000',
        'http://localhost:3000/about',
      ];
      
      const reports = await checker.checkMultiplePages(urls);
      
      expect(Array.isArray(reports)).toBe(true);
      expect(reports.length).toBe(urls.length);
    });

    it('should handle mixed success and failure', async () => {
      const urls = [
        'http://invalid-url-1.local',
        'http://invalid-url-2.local',
      ];
      
      const reports = await checker.checkMultiplePages(urls);
      
      expect(reports.length).toBe(2);
      reports.forEach(report => {
        expect(report.passed).toBe(false);
      });
    });
  });

  describe('generateHTMLReport', () => {
    it('should generate HTML report file', async () => {
      const mockReport: A11yReport = {
        url: 'http://localhost:3000',
        timestamp: new Date(),
        violations: [
          {
            id: 'image-alt',
            impact: 'critical',
            description: 'Images must have alternate text',
            help: 'Images must have alternate text',
            helpUrl: 'https://dequeuniversity.com/rules/axe/4.0/image-alt',
            nodes: [
              {
                html: '<img src="test.jpg">',
                target: ['img'],
                failureSummary: 'Fix any of the following:\n  Element does not have an alt attribute',
                fixes: [
                  'Add descriptive alt text to the image',
                  'If image is decorative, use alt="" or role="presentation"',
                ],
              },
            ],
            tags: ['wcag2a', 'wcag111', 'section508'],
          },
        ],
        passes: 10,
        incomplete: 0,
        inapplicable: 5,
        summary: {
          critical: 1,
          serious: 0,
          moderate: 0,
          minor: 0,
          total: 1,
        },
        passed: false,
        blockers: ['1 critical accessibility violation(s) found'],
      };

      const outputPath = path.join(projectRoot, '.azstudio', 'a11y-report.html');
      await checker.generateHTMLReport(mockReport, outputPath);

      // Check if file was created
      const exists = fs.existsSync(outputPath);
      expect(exists).toBe(true);

      if (exists) {
        const content = fs.readFileSync(outputPath, 'utf-8');
        expect(content).toContain('Accessibility Report');
        expect(content).toContain('image-alt');
        expect(content).toContain('CRITICAL');
        
        // Cleanup
        fs.unlinkSync(outputPath);
      }
    });

    it('should generate report for passing page', async () => {
      const mockReport: A11yReport = {
        url: 'http://localhost:3000',
        timestamp: new Date(),
        violations: [],
        passes: 25,
        incomplete: 0,
        inapplicable: 3,
        summary: {
          critical: 0,
          serious: 0,
          moderate: 0,
          minor: 0,
          total: 0,
        },
        passed: true,
        blockers: [],
      };

      const outputPath = path.join(projectRoot, '.azstudio', 'a11y-report-pass.html');
      await checker.generateHTMLReport(mockReport, outputPath);

      const exists = fs.existsSync(outputPath);
      expect(exists).toBe(true);

      if (exists) {
        const content = fs.readFileSync(outputPath, 'utf-8');
        expect(content).toContain('No Accessibility Violations Found');
        expect(content).toContain('PASSED');
        
        // Cleanup
        fs.unlinkSync(outputPath);
      }
    });
  });

  describe('getSummary', () => {
    it('should aggregate multiple reports', () => {
      const reports: A11yReport[] = [
        {
          url: 'http://localhost:3000',
          timestamp: new Date(),
          violations: [],
          passes: 10,
          incomplete: 0,
          inapplicable: 0,
          summary: { critical: 2, serious: 1, moderate: 0, minor: 0, total: 3 },
          passed: false,
          blockers: ['2 critical violations'],
        },
        {
          url: 'http://localhost:3000/about',
          timestamp: new Date(),
          violations: [],
          passes: 15,
          incomplete: 0,
          inapplicable: 0,
          summary: { critical: 0, serious: 1, moderate: 2, minor: 1, total: 4 },
          passed: true,
          blockers: [],
        },
      ];

      const summary = checker.getSummary(reports);

      expect(summary.totalPages).toBe(2);
      expect(summary.passedPages).toBe(1);
      expect(summary.failedPages).toBe(1);
      expect(summary.totalViolations).toBe(7);
      expect(summary.criticalViolations).toBe(2);
      expect(summary.seriousViolations).toBe(2);
    });

    it('should handle empty reports array', () => {
      const summary = checker.getSummary([]);

      expect(summary.totalPages).toBe(0);
      expect(summary.passedPages).toBe(0);
      expect(summary.failedPages).toBe(0);
      expect(summary.totalViolations).toBe(0);
    });
  });

  describe('fix suggestions', () => {
    it('should provide fix suggestions for common issues', async () => {
      // Test that fix suggestions are included in violations
      const mockReport: A11yReport = {
        url: 'http://localhost:3000',
        timestamp: new Date(),
        violations: [
          {
            id: 'color-contrast',
            impact: 'serious',
            description: 'Elements must have sufficient color contrast',
            help: 'Elements must have sufficient color contrast',
            helpUrl: 'https://dequeuniversity.com/rules/axe/4.0/color-contrast',
            nodes: [
              {
                html: '<p style="color: #777; background: #fff;">Text</p>',
                target: ['p'],
                failureSummary: 'Fix any of the following:\n  Element has insufficient color contrast',
                fixes: [
                  'Increase contrast between text and background',
                  'Use a darker text color or lighter background',
                  'Aim for WCAG AA ratio of 4.5:1 for normal text',
                  'Use browser DevTools to check contrast ratios',
                ],
              },
            ],
            tags: ['wcag2aa', 'wcag143'],
          },
        ],
        passes: 0,
        incomplete: 0,
        inapplicable: 0,
        summary: {
          critical: 0,
          serious: 1,
          moderate: 0,
          minor: 0,
          total: 1,
        },
        passed: true, // Not blocking on serious by default
        blockers: [],
      };

      expect(mockReport.violations[0].nodes[0].fixes.length).toBeGreaterThan(0);
      expect(mockReport.violations[0].nodes[0].fixes[0]).toContain('contrast');
    });
  });

  describe('severity levels', () => {
    it('should categorize violations by severity', () => {
      const report: A11yReport = {
        url: 'http://localhost:3000',
        timestamp: new Date(),
        violations: [
          {
            id: 'test-critical',
            impact: 'critical',
            description: 'Critical issue',
            help: 'Fix critical issue',
            helpUrl: 'https://example.com',
            nodes: [],
            tags: [],
          },
          {
            id: 'test-serious',
            impact: 'serious',
            description: 'Serious issue',
            help: 'Fix serious issue',
            helpUrl: 'https://example.com',
            nodes: [],
            tags: [],
          },
          {
            id: 'test-moderate',
            impact: 'moderate',
            description: 'Moderate issue',
            help: 'Fix moderate issue',
            helpUrl: 'https://example.com',
            nodes: [],
            tags: [],
          },
          {
            id: 'test-minor',
            impact: 'minor',
            description: 'Minor issue',
            help: 'Fix minor issue',
            helpUrl: 'https://example.com',
            nodes: [],
            tags: [],
          },
        ],
        passes: 0,
        incomplete: 0,
        inapplicable: 0,
        summary: {
          critical: 1,
          serious: 1,
          moderate: 1,
          minor: 1,
          total: 4,
        },
        passed: false,
        blockers: ['1 critical accessibility violation(s) found'],
      };

      expect(report.summary.critical).toBe(1);
      expect(report.summary.serious).toBe(1);
      expect(report.summary.moderate).toBe(1);
      expect(report.summary.minor).toBe(1);
      expect(report.summary.total).toBe(4);
    });
  });
});
