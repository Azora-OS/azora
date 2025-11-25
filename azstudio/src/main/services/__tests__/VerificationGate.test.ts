import { VerificationGate } from '../VerificationGate';
import { VerificationPipeline } from '../VerificationPipeline';
import * as fs from 'fs/promises';
import * as path from 'path';

// Mock dependencies
jest.mock('../VerificationPipeline');
jest.mock('fs/promises');
jest.mock('child_process');

describe('VerificationGate', () => {
  let gate: VerificationGate;
  const projectRoot = '/test/project';

  beforeEach(() => {
    jest.clearAllMocks();
    gate = new VerificationGate(projectRoot);
  });

  describe('detectChangeType', () => {
    it('should detect UI component changes', () => {
      const files = [
        'src/components/Button.tsx',
        'src/components/Button.css',
      ];

      const changeType = gate.detectChangeType(files);
      expect(changeType).toBe('ui-component');
    });

    it('should detect API endpoint changes', () => {
      const files = [
        'src/api/users.ts',
        'src/routes/auth.ts',
      ];

      const changeType = gate.detectChangeType(files);
      expect(changeType).toBe('api-endpoint');
    });

    it('should detect database schema changes', () => {
      const files = [
        'prisma/schema.prisma',
        'prisma/migrations/001_init.sql',
      ];

      const changeType = gate.detectChangeType(files);
      expect(changeType).toBe('database-schema');
    });

    it('should detect service logic changes', () => {
      const files = [
        'src/services/UserService.ts',
        'src/services/AuthService.ts',
      ];

      const changeType = gate.detectChangeType(files);
      expect(changeType).toBe('service-logic');
    });

    it('should detect design filter changes', () => {
      const files = [
        'tailwind.config.js',
        'src/design-tokens.ts',
      ];

      const changeType = gate.detectChangeType(files);
      expect(changeType).toBe('design-filter');
    });

    it('should detect configuration changes', () => {
      const files = [
        'webpack.config.js',
        'tsconfig.json',
      ];

      const changeType = gate.detectChangeType(files);
      expect(changeType).toBe('configuration');
    });

    it('should detect documentation changes', () => {
      const files = [
        'README.md',
        'docs/api.md',
      ];

      const changeType = gate.detectChangeType(files);
      expect(changeType).toBe('documentation');
    });

    it('should detect test changes', () => {
      const files = [
        'src/__tests__/Button.test.tsx',
        'src/services/UserService.spec.ts',
      ];

      const changeType = gate.detectChangeType(files);
      expect(changeType).toBe('test');
    });
  });

  describe('getRequirements', () => {
    it('should return requirements for UI components', () => {
      const requirements = gate.getRequirements('ui-component');

      expect(requirements.changeType).toBe('ui-component');
      expect(requirements.required.unitTests).toBe(true);
      expect(requirements.required.e2eTests).toBe(true);
      expect(requirements.required.accessibility).toBe(true);
      expect(requirements.required.performance).toBe(true);
      expect(requirements.thresholds.minCoverage).toBe(80);
      expect(requirements.thresholds.minPerformanceScore).toBe(90);
    });

    it('should return requirements for API endpoints', () => {
      const requirements = gate.getRequirements('api-endpoint');

      expect(requirements.changeType).toBe('api-endpoint');
      expect(requirements.required.unitTests).toBe(true);
      expect(requirements.required.integrationTests).toBe(true);
      expect(requirements.required.e2eTests).toBe(false);
      expect(requirements.required.accessibility).toBe(false);
      expect(requirements.thresholds.minCoverage).toBe(90);
    });

    it('should return requirements for database schema', () => {
      const requirements = gate.getRequirements('database-schema');

      expect(requirements.changeType).toBe('database-schema');
      expect(requirements.required.integrationTests).toBe(true);
      expect(requirements.required.unitTests).toBe(false);
      expect(requirements.thresholds.minCoverage).toBe(80);
    });

    it('should return requirements for documentation', () => {
      const requirements = gate.getRequirements('documentation');

      expect(requirements.changeType).toBe('documentation');
      expect(requirements.required.unitTests).toBe(false);
      expect(requirements.required.lint).toBe(true);
      expect(Object.keys(requirements.thresholds).length).toBe(0);
    });
  });

  describe('runVerification', () => {
    it('should run all required checks for UI components', async () => {
      const mockPipeline = VerificationPipeline.prototype as jest.Mocked<VerificationPipeline>;
      
      mockPipeline.verify = jest.fn().mockResolvedValue({
        tests: { passed: 10, failed: 0, total: 10, duration: 1000, failures: [], coverage: 85 },
        e2eTests: { passed: 5, failed: 0, total: 5, duration: 5000, results: [] },
        accessibility: {
          url: 'http://localhost:3000',
          timestamp: new Date(),
          violations: [],
          passes: 20,
          incomplete: 0,
          inapplicable: 0,
          summary: { critical: 0, serious: 0, moderate: 0, minor: 0, total: 0 },
          passed: true,
          blockers: [],
        },
        performance: {
          url: 'http://localhost:3000',
          timestamp: new Date(),
          scores: { performance: 95, accessibility: 100, bestPractices: 90, seo: 85, pwa: 0 },
          coreWebVitals: { LCP: 2000, FID: 50, CLS: 0.05, FCP: 1500, TTI: 3000, TBT: 100, SI: 2500 },
          recommendations: [],
          passed: true,
        },
        passed: true,
        blockers: [],
        timestamp: new Date(),
      });

      const report = await gate.runVerification('ui-component', ['src/components/Button.tsx'], 'http://localhost:3000');

      expect(report.changeType).toBe('ui-component');
      expect(report.canCommit).toBe(true);
      expect(report.fixSuggestions.length).toBe(0);
      expect(report.summary.passedChecks).toBeGreaterThan(0);
    });

    it('should block commit when tests fail', async () => {
      const mockPipeline = VerificationPipeline.prototype as jest.Mocked<VerificationPipeline>;
      
      mockPipeline.verify = jest.fn().mockResolvedValue({
        tests: {
          passed: 8,
          failed: 2,
          total: 10,
          duration: 1000,
          failures: [
            { test: 'Button renders correctly', error: 'Expected true to be false', file: 'Button.test.tsx' },
            { test: 'Button handles click', error: 'Click handler not called', file: 'Button.test.tsx' },
          ],
          coverage: 75,
        },
        passed: false,
        blockers: ['2 tests failed'],
        timestamp: new Date(),
      });

      const report = await gate.runVerification('ui-component', ['src/components/Button.tsx']);

      expect(report.canCommit).toBe(false);
      expect(report.fixSuggestions.length).toBeGreaterThan(0);
      expect(report.fixSuggestions.some(s => s.severity === 'critical')).toBe(true);
    });

    it('should block commit when accessibility violations exceed threshold', async () => {
      const mockPipeline = VerificationPipeline.prototype as jest.Mocked<VerificationPipeline>;
      
      mockPipeline.verify = jest.fn().mockResolvedValue({
        tests: { passed: 10, failed: 0, total: 10, duration: 1000, failures: [], coverage: 85 },
        accessibility: {
          url: 'http://localhost:3000',
          timestamp: new Date(),
          violations: [
            {
              id: 'color-contrast',
              impact: 'critical',
              description: 'Elements must have sufficient color contrast',
              help: 'Ensure text has sufficient contrast',
              helpUrl: 'https://dequeuniversity.com/rules/axe/4.0/color-contrast',
              nodes: [{ html: '<button>Click me</button>', target: ['button'] }],
            },
          ],
          passes: 15,
          incomplete: 0,
          inapplicable: 0,
          summary: { critical: 1, serious: 0, moderate: 0, minor: 0, total: 1 },
          passed: false,
          blockers: ['1 critical accessibility violation'],
        },
        passed: false,
        blockers: ['1 critical accessibility violation'],
        timestamp: new Date(),
      });

      const report = await gate.runVerification('ui-component', ['src/components/Button.tsx'], 'http://localhost:3000');

      expect(report.canCommit).toBe(false);
      expect(report.fixSuggestions.some(s => s.category === 'accessibility' && s.severity === 'critical')).toBe(true);
    });

    it('should block commit when performance score is below threshold', async () => {
      const mockPipeline = VerificationPipeline.prototype as jest.Mocked<VerificationPipeline>;
      
      mockPipeline.verify = jest.fn().mockResolvedValue({
        tests: { passed: 10, failed: 0, total: 10, duration: 1000, failures: [], coverage: 85 },
        performance: {
          url: 'http://localhost:3000',
          timestamp: new Date(),
          scores: { performance: 75, accessibility: 100, bestPractices: 90, seo: 85, pwa: 0 },
          coreWebVitals: { LCP: 4500, FID: 150, CLS: 0.15, FCP: 3000, TTI: 6000, TBT: 500, SI: 5000 },
          recommendations: [
            {
              id: 'largest-contentful-paint',
              title: 'Largest Contentful Paint',
              description: 'LCP is too slow',
              score: 40,
              displayValue: '4.5s',
            },
          ],
          passed: false,
        },
        passed: false,
        blockers: ['Performance score below threshold'],
        timestamp: new Date(),
      });

      const report = await gate.runVerification('ui-component', ['src/components/Button.tsx'], 'http://localhost:3000');

      expect(report.canCommit).toBe(false);
      expect(report.fixSuggestions.some(s => s.category === 'performance')).toBe(true);
    });
  });

  describe('generateMarkdownSummary', () => {
    it('should generate markdown summary with no issues', async () => {
      const mockPipeline = VerificationPipeline.prototype as jest.Mocked<VerificationPipeline>;
      
      mockPipeline.verify = jest.fn().mockResolvedValue({
        tests: { passed: 10, failed: 0, total: 10, duration: 1000, failures: [], coverage: 85 },
        passed: true,
        blockers: [],
        timestamp: new Date(),
      });

      const report = await gate.runVerification('documentation', ['README.md']);
      const markdown = gate.generateMarkdownSummary(report);

      expect(markdown).toContain('✅ Ready to Commit');
      expect(markdown).toContain('documentation');
      expect(markdown).toContain('No Issues Found');
    });

    it('should generate markdown summary with issues', async () => {
      const mockPipeline = VerificationPipeline.prototype as jest.Mocked<VerificationPipeline>;
      
      mockPipeline.verify = jest.fn().mockResolvedValue({
        tests: {
          passed: 8,
          failed: 2,
          total: 10,
          duration: 1000,
          failures: [
            { test: 'Test 1', error: 'Error 1', file: 'test.ts' },
          ],
        },
        passed: false,
        blockers: ['Tests failed'],
        timestamp: new Date(),
      });

      const report = await gate.runVerification('service-logic', ['src/services/UserService.ts']);
      const markdown = gate.generateMarkdownSummary(report);

      expect(markdown).toContain('❌ Cannot Commit');
      expect(markdown).toContain('Issues to Fix');
      expect(markdown).toContain('🔴 Critical');
    });
  });

  describe('generateHTMLReport', () => {
    it('should generate HTML report', async () => {
      const mockPipeline = VerificationPipeline.prototype as jest.Mocked<VerificationPipeline>;
      
      mockPipeline.verify = jest.fn().mockResolvedValue({
        tests: { passed: 10, failed: 0, total: 10, duration: 1000, failures: [], coverage: 85 },
        passed: true,
        blockers: [],
        timestamp: new Date(),
      });

      const report = await gate.runVerification('ui-component', ['src/components/Button.tsx']);
      const outputPath = path.join(projectRoot, 'verification-report.html');

      await gate.generateHTMLReport(report, outputPath);

      expect(fs.writeFile).toHaveBeenCalledWith(
        outputPath,
        expect.stringContaining('<!DOCTYPE html>'),
        'utf-8'
      );
    });
  });

  describe('generateJSONReport', () => {
    it('should generate JSON report', async () => {
      const mockPipeline = VerificationPipeline.prototype as jest.Mocked<VerificationPipeline>;
      
      mockPipeline.verify = jest.fn().mockResolvedValue({
        tests: { passed: 10, failed: 0, total: 10, duration: 1000, failures: [], coverage: 85 },
        passed: true,
        blockers: [],
        timestamp: new Date(),
      });

      const report = await gate.runVerification('api-endpoint', ['src/api/users.ts']);
      const outputPath = path.join(projectRoot, 'verification-report.json');

      await gate.generateJSONReport(report, outputPath);

      expect(fs.writeFile).toHaveBeenCalledWith(
        outputPath,
        expect.stringContaining('"changeType": "api-endpoint"'),
        'utf-8'
      );
    });
  });
});
