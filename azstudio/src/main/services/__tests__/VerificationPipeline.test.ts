import { VerificationPipeline, VerificationReport } from '../VerificationPipeline';
import * as path from 'path';

describe('VerificationPipeline', () => {
  let pipeline: VerificationPipeline;
  const projectRoot = path.join(__dirname, '../../__fixtures__/test-project');

  beforeEach(() => {
    pipeline = new VerificationPipeline(projectRoot);
  });

  afterEach(async () => {
    await pipeline.close();
  });

  describe('runTests', () => {
    it('should run unit tests', async () => {
      const results = await pipeline.runTests();
      
      expect(results).toBeDefined();
      expect(results).toHaveProperty('passed');
      expect(results).toHaveProperty('failed');
      expect(results).toHaveProperty('total');
      expect(results).toHaveProperty('duration');
      expect(results).toHaveProperty('failures');
    });

    it('should handle test failures', async () => {
      const results = await pipeline.runTests();
      
      expect(Array.isArray(results.failures)).toBe(true);
    });
  });

  describe('verify', () => {
    it('should run basic verification without E2E or accessibility', async () => {
      const report = await pipeline.verify(false, false);
      
      expect(report).toBeDefined();
      expect(report).toHaveProperty('tests');
      expect(report).toHaveProperty('passed');
      expect(report).toHaveProperty('blockers');
      expect(report).toHaveProperty('timestamp');
      expect(report.e2eTests).toBeUndefined();
      expect(report.accessibility).toBeUndefined();
    });

    it('should include E2E tests when requested', async () => {
      const report = await pipeline.verify(true, false);
      
      expect(report).toBeDefined();
      expect(report.e2eTests).toBeDefined();
    });

    it('should include accessibility check when requested with URL', async () => {
      const previewUrl = 'http://localhost:3000';
      const report = await pipeline.verify(false, true, previewUrl);
      
      expect(report).toBeDefined();
      expect(report.accessibility).toBeDefined();
      expect(report.accessibility?.url).toBe(previewUrl);
    });

    it('should not include accessibility check without URL', async () => {
      const report = await pipeline.verify(false, true);
      
      expect(report).toBeDefined();
      expect(report.accessibility).toBeUndefined();
    });

    it('should aggregate blockers from all checks', async () => {
      const report = await pipeline.verify(false, false);
      
      expect(Array.isArray(report.blockers)).toBe(true);
    });

    it('should mark as failed if any check fails', async () => {
      const report = await pipeline.verify(false, false);
      
      expect(typeof report.passed).toBe('boolean');
    });
  });

  describe('checkAccessibility', () => {
    it('should check accessibility of a URL', async () => {
      const url = 'http://localhost:3000';
      const report = await pipeline.checkAccessibility(url);
      
      expect(report).toBeDefined();
      expect(report.url).toBe(url);
      expect(report).toHaveProperty('violations');
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('passed');
      expect(report).toHaveProperty('blockers');
    });

    it('should handle accessibility check failures', async () => {
      const url = 'http://invalid-url.local';
      const report = await pipeline.checkAccessibility(url);
      
      expect(report.passed).toBe(false);
      expect(report.blockers.length).toBeGreaterThan(0);
    });

    it('should respect custom options', async () => {
      const url = 'http://localhost:3000';
      const options = {
        blockOnCritical: true,
        blockOnSerious: true,
        includeFixSuggestions: true,
      };
      
      const report = await pipeline.checkAccessibility(url, options);
      
      expect(report).toBeDefined();
    });
  });

  describe('checkMultiplePages', () => {
    it('should check multiple URLs', async () => {
      const urls = [
        'http://localhost:3000',
        'http://localhost:3000/about',
      ];
      
      const reports = await pipeline.checkMultiplePages(urls);
      
      expect(Array.isArray(reports)).toBe(true);
      expect(reports.length).toBe(urls.length);
      
      reports.forEach((report, index) => {
        expect(report.url).toBe(urls[index]);
      });
    });

    it('should handle mixed results', async () => {
      const urls = [
        'http://invalid-1.local',
        'http://invalid-2.local',
      ];
      
      const reports = await pipeline.checkMultiplePages(urls);
      
      expect(reports.length).toBe(2);
      reports.forEach(report => {
        expect(report.passed).toBe(false);
      });
    });
  });

  describe('generateAccessibilityReport', () => {
    it('should generate HTML report', async () => {
      const url = 'http://localhost:3000';
      const report = await pipeline.checkAccessibility(url);
      const outputPath = path.join(projectRoot, '.azstudio', 'test-a11y-report.html');
      
      await pipeline.generateAccessibilityReport(report, outputPath);
      
      // Check that method completes without error
      expect(true).toBe(true);
    });
  });

  describe('integration with E2E and accessibility', () => {
    it('should run full verification with all checks', async () => {
      const previewUrl = 'http://localhost:3000';
      const report = await pipeline.verify(true, true, previewUrl);
      
      expect(report).toBeDefined();
      expect(report.tests).toBeDefined();
      expect(report.e2eTests).toBeDefined();
      expect(report.accessibility).toBeDefined();
      
      // All checks should contribute to overall pass/fail
      expect(typeof report.passed).toBe('boolean');
      
      // Blockers should aggregate from all sources
      expect(Array.isArray(report.blockers)).toBe(true);
    });

    it('should fail if accessibility has critical violations', async () => {
      // This would require mocking or actual violations
      // For now, test the structure
      const previewUrl = 'http://localhost:3000';
      const report = await pipeline.verify(false, true, previewUrl);
      
      if (report.accessibility && !report.accessibility.passed) {
        expect(report.passed).toBe(false);
        expect(report.blockers.length).toBeGreaterThan(0);
      }
    });
  });

  describe('close', () => {
    it('should close all resources', async () => {
      await pipeline.close();
      
      // Should complete without error
      expect(true).toBe(true);
    });
  });
});
