import { LighthouseRunner, PerformanceReport } from '../LighthouseRunner';
import * as fs from 'fs/promises';

jest.mock('child_process');
jest.mock('fs/promises');

describe('LighthouseRunner', () => {
  let runner: LighthouseRunner;
  const projectRoot = '/test/project';
  const testUrl = 'http://localhost:3000';

  beforeEach(() => {
    runner = new LighthouseRunner(projectRoot);
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should check if Lighthouse is installed', async () => {
      const mockExec = require('child_process').exec as jest.Mock;
      mockExec.mockImplementation((_cmd: string, _options: any, callback: any) => {
        callback(null, { stdout: 'lighthouse@11.4.0' });
      });

      await runner.initialize();

      expect(mockExec).toHaveBeenCalledWith(
        'npm list lighthouse',
        expect.objectContaining({ cwd: projectRoot }),
        expect.any(Function)
      );
    });

    it('should install Lighthouse if not present', async () => {
      const mockExec = require('child_process').exec as jest.Mock;
      let callCount = 0;
      mockExec.mockImplementation((_cmd: string, _options: any, callback: any) => {
        callCount++;
        if (callCount === 1) {
          // First call - check fails
          callback(new Error('not found'));
        } else {
          // Second call - install succeeds
          callback(null, { stdout: 'installed' });
        }
      });

      (fs.readFile as jest.Mock).mockResolvedValue('[]');

      await runner.initialize();

      expect(mockExec).toHaveBeenCalledWith(
        'npm install --save-dev lighthouse',
        expect.objectContaining({ cwd: projectRoot }),
        expect.any(Function)
      );
    });
  });

  describe('runAudit', () => {
    const mockLighthouseReport = {
      categories: {
        performance: { score: 0.95 },
        accessibility: { score: 0.88 },
        'best-practices': { score: 0.92 },
        seo: { score: 0.85 },
        pwa: { score: 0.70 },
      },
      audits: {
        'largest-contentful-paint': { numericValue: 1500 },
        'max-potential-fid': { numericValue: 80 },
        'cumulative-layout-shift': { numericValue: 0.05 },
        'first-contentful-paint': { numericValue: 1200 },
        'interactive': { numericValue: 3000 },
        'total-blocking-time': { numericValue: 150 },
        'speed-index': { numericValue: 2500 },
        'render-blocking-resources': {
          score: 0.5,
          title: 'Eliminate render-blocking resources',
          description: 'Resources are blocking the first paint',
          displayValue: '500ms',
          numericValue: 500,
        },
      },
    };

    beforeEach(() => {
      const mockExec = require('child_process').exec as jest.Mock;
      mockExec.mockImplementation((_cmd: string, _options: any, callback: any) => {
        callback(null, { stdout: 'Lighthouse audit complete' });
      });

      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockLighthouseReport));
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
    });

    it('should run Lighthouse audit with default options', async () => {
      const report = await runner.runAudit(testUrl);

      expect(report.url).toBe(testUrl);
      expect(report.scores.performance).toBe(95);
      expect(report.scores.accessibility).toBe(88);
      expect(report.passed).toBe(true); // >= 90
    });

    it('should extract Core Web Vitals correctly', async () => {
      const report = await runner.runAudit(testUrl);

      expect(report.coreWebVitals).toEqual({
        LCP: 1500,
        FID: 80,
        CLS: 0.05,
        FCP: 1200,
        TTI: 3000,
        TBT: 150,
        SI: 2500,
      });
    });

    it('should extract recommendations for failed audits', async () => {
      const report = await runner.runAudit(testUrl);

      expect(report.recommendations.length).toBeGreaterThan(0);
      const renderBlockingRec = report.recommendations.find(
        r => r.id === 'render-blocking-resources'
      );
      expect(renderBlockingRec).toBeDefined();
      expect(renderBlockingRec?.score).toBe(50);
    });

    it('should support custom options', async () => {
      const mockExec = require('child_process').exec as jest.Mock;

      await runner.runAudit(testUrl, {
        formFactor: 'mobile',
        throttling: 'mobile3G',
        onlyCategories: ['performance'],
      });

      const execCall = mockExec.mock.calls[0][0];
      expect(execCall).toContain('--form-factor=mobile');
      expect(execCall).toContain('--throttling-method=mobile3G');
      expect(execCall).toContain('--only-categories=performance');
    });

    it('should mark report as failed if performance score < 90', async () => {
      const poorReport = {
        ...mockLighthouseReport,
        categories: {
          ...mockLighthouseReport.categories,
          performance: { score: 0.65 },
        },
      };

      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(poorReport));

      const report = await runner.runAudit(testUrl);

      expect(report.passed).toBe(false);
      expect(report.scores.performance).toBe(65);
    });

    it('should handle audit failures gracefully', async () => {
      const mockExec = require('child_process').exec as jest.Mock;
      mockExec.mockImplementation((_cmd: string, _options: any, callback: any) => {
        callback(new Error('Lighthouse failed'));
      });

      await expect(runner.runAudit(testUrl)).rejects.toThrow('Lighthouse audit failed');
    });
  });

  describe('measureCoreWebVitals', () => {
    beforeEach(() => {
      const mockExec = require('child_process').exec as jest.Mock;
      mockExec.mockImplementation((_cmd: string, _options: any, callback: any) => {
        callback(null, { stdout: 'complete' });
      });

      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify({
        categories: { performance: { score: 0.95 } },
        audits: {
          'largest-contentful-paint': { numericValue: 2000 },
          'max-potential-fid': { numericValue: 100 },
          'cumulative-layout-shift': { numericValue: 0.1 },
          'first-contentful-paint': { numericValue: 1500 },
          'interactive': { numericValue: 3500 },
          'total-blocking-time': { numericValue: 200 },
          'speed-index': { numericValue: 2800 },
        },
      }));
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
    });

    it('should return Core Web Vitals', async () => {
      const vitals = await runner.measureCoreWebVitals(testUrl);

      expect(vitals).toEqual({
        LCP: 2000,
        FID: 100,
        CLS: 0.1,
        FCP: 1500,
        TTI: 3500,
        TBT: 200,
        SI: 2800,
      });
    });
  });

  describe('runMultipleAudits', () => {
    const urls = [
      'http://localhost:3000',
      'http://localhost:3000/about',
      'http://localhost:3000/contact',
    ];

    beforeEach(() => {
      const mockExec = require('child_process').exec as jest.Mock;
      mockExec.mockImplementation((_cmd: string, _options: any, callback: any) => {
        callback(null, { stdout: 'complete' });
      });

      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify({
        categories: { performance: { score: 0.90 } },
        audits: {
          'largest-contentful-paint': { numericValue: 2000 },
          'max-potential-fid': { numericValue: 100 },
          'cumulative-layout-shift': { numericValue: 0.1 },
          'first-contentful-paint': { numericValue: 1500 },
          'interactive': { numericValue: 3500 },
          'total-blocking-time': { numericValue: 200 },
          'speed-index': { numericValue: 2800 },
        },
      }));
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
    });

    it('should audit multiple URLs', async () => {
      const reports = await runner.runMultipleAudits(urls);

      expect(reports).toHaveLength(3);
      expect(reports[0].url).toBe(urls[0]);
      expect(reports[1].url).toBe(urls[1]);
      expect(reports[2].url).toBe(urls[2]);
    });

    it('should continue on individual failures', async () => {
      const mockExec = require('child_process').exec as jest.Mock;
      let callCount = 0;
      mockExec.mockImplementation((_cmd: string, _options: any, callback: any) => {
        callCount++;
        if (callCount === 2) {
          callback(new Error('Failed'));
        } else {
          callback(null, { stdout: 'complete' });
        }
      });

      const reports = await runner.runMultipleAudits(urls);

      // Should have 2 successful reports (1st and 3rd)
      expect(reports).toHaveLength(2);
    });
  });

  describe('performance history', () => {
    beforeEach(() => {
      (fs.readFile as jest.Mock).mockResolvedValue('[]');
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
    });

    it('should track performance history', async () => {
      await runner.initialize();

      // Simulate adding reports through runAudit
      const mockExec = require('child_process').exec as jest.Mock;
      mockExec.mockImplementation((_cmd: string, _options: any, callback: any) => {
        callback(null, { stdout: 'complete' });
      });

      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify({
        categories: { performance: { score: 0.95 } },
        audits: {
          'largest-contentful-paint': { numericValue: 1500 },
          'max-potential-fid': { numericValue: 80 },
          'cumulative-layout-shift': { numericValue: 0.05 },
          'first-contentful-paint': { numericValue: 1200 },
          'interactive': { numericValue: 3000 },
          'total-blocking-time': { numericValue: 150 },
          'speed-index': { numericValue: 2500 },
        },
      }));

      await runner.runAudit(testUrl);

      const history = runner.getHistory(testUrl);
      expect(history).toBeDefined();
      expect(history?.reports).toHaveLength(1);
    });

    it('should get performance trend', async () => {
      await runner.initialize();

      const mockExec = require('child_process').exec as jest.Mock;
      mockExec.mockImplementation((_cmd: string, _options: any, callback: any) => {
        callback(null, { stdout: 'complete' });
      });

      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify({
        categories: { performance: { score: 0.95 } },
        audits: {
          'largest-contentful-paint': { numericValue: 1500 },
          'max-potential-fid': { numericValue: 80 },
          'cumulative-layout-shift': { numericValue: 0.05 },
          'first-contentful-paint': { numericValue: 1200 },
          'interactive': { numericValue: 3000 },
          'total-blocking-time': { numericValue: 150 },
          'speed-index': { numericValue: 2500 },
        },
      }));

      // Run multiple audits
      await runner.runAudit(testUrl);
      await runner.runAudit(testUrl);

      const trend = runner.getTrend(testUrl);
      expect(trend).toBeDefined();
      expect(trend?.performance).toHaveLength(2);
      expect(trend?.LCP).toHaveLength(2);
    });
  });

  describe('compareReports', () => {
    const baseline: PerformanceReport = {
      url: testUrl,
      timestamp: new Date(),
      scores: {
        performance: 90,
        accessibility: 85,
        bestPractices: 88,
        seo: 80,
        pwa: 70,
      },
      coreWebVitals: {
        LCP: 2000,
        FID: 100,
        CLS: 0.1,
        FCP: 1500,
        TTI: 3500,
        TBT: 200,
        SI: 2800,
      },
      recommendations: [],
      passed: true,
    };

    it('should detect improvement', () => {
      const improved: PerformanceReport = {
        ...baseline,
        scores: { ...baseline.scores, performance: 95 },
        coreWebVitals: { ...baseline.coreWebVitals, LCP: 1800 },
      };

      const comparison = runner.compareReports(baseline, improved);

      expect(comparison.improved).toBe(true);
      expect(comparison.scores.performance).toBe(5);
      expect(comparison.coreWebVitals.LCP).toBe(-200);
    });

    it('should detect regression', () => {
      const regressed: PerformanceReport = {
        ...baseline,
        scores: { ...baseline.scores, performance: 85 },
        coreWebVitals: { ...baseline.coreWebVitals, LCP: 2500 },
      };

      const comparison = runner.compareReports(baseline, regressed);

      expect(comparison.improved).toBe(false);
      expect(comparison.scores.performance).toBe(-5);
      expect(comparison.coreWebVitals.LCP).toBe(500);
    });
  });

  describe('generateHTMLReport', () => {
    const mockReport: PerformanceReport = {
      url: testUrl,
      timestamp: new Date(),
      scores: {
        performance: 95,
        accessibility: 88,
        bestPractices: 92,
        seo: 85,
        pwa: 70,
      },
      coreWebVitals: {
        LCP: 1500,
        FID: 80,
        CLS: 0.05,
        FCP: 1200,
        TTI: 3000,
        TBT: 150,
        SI: 2500,
      },
      recommendations: [
        {
          id: 'test-rec',
          title: 'Test Recommendation',
          description: 'This is a test',
          score: 50,
        },
      ],
      passed: true,
    };

    it('should generate HTML report', async () => {
      const outputPath = '/test/report.html';

      await runner.generateHTMLReport(mockReport, outputPath);

      expect(fs.writeFile).toHaveBeenCalledWith(
        outputPath,
        expect.stringContaining('Performance Report'),
        'utf-8'
      );
    });

    it('should include all scores in HTML', async () => {
      const outputPath = '/test/report.html';

      await runner.generateHTMLReport(mockReport, outputPath);

      const htmlContent = (fs.writeFile as jest.Mock).mock.calls[0][1];
      expect(htmlContent).toContain('performance');
      expect(htmlContent).toContain('95');
      expect(htmlContent).toContain('accessibility');
      expect(htmlContent).toContain('88');
    });

    it('should include Core Web Vitals in HTML', async () => {
      const outputPath = '/test/report.html';

      await runner.generateHTMLReport(mockReport, outputPath);

      const htmlContent = (fs.writeFile as jest.Mock).mock.calls[0][1];
      expect(htmlContent).toContain('LCP');
      expect(htmlContent).toContain('FID');
      expect(htmlContent).toContain('CLS');
    });
  });
});
