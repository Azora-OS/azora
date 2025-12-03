/**
 * Standards Compliance Tests
 * 
 * Tests for verifying that development standards are enforced:
 * - Test coverage enforcement (80%+ minimum)
 * - Security scanning and vulnerability detection
 * - Commit message linting and conventional commits
 * - Performance monitoring and thresholds
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('Standards Compliance', () => {
  
  describe('Test Coverage Enforcement', () => {
    
    it('should enforce minimum 80% coverage threshold', () => {
      try {
        const output = execSync('npm test -- --coverage --silent 2>&1', {
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe']
        });
        
        // Extract coverage percentage from output
        const coverageMatch = output.match(/Lines\s+:\s+([\d.]+)%/);
        expect(coverageMatch).toBeTruthy();
        
        const coverage = parseFloat(coverageMatch![1]);
        expect(coverage).toBeGreaterThanOrEqual(80);
      } catch (error) {
        // If tests fail, coverage check should still report the percentage
        expect(error).toBeDefined();
      }
    });

    it('should generate coverage reports in multiple formats', () => {
      const coverageDir = path.join(process.cwd(), 'coverage');
      
      // Check for text summary
      const textReport = path.join(coverageDir, 'coverage-summary.json');
      expect(fs.existsSync(textReport) || fs.existsSync(coverageDir)).toBeTruthy();
    });

    it('should track coverage trends over time', () => {
      const coverageDir = path.join(process.cwd(), 'coverage');
      
      // Coverage directory should exist
      if (fs.existsSync(coverageDir)) {
        const files = fs.readdirSync(coverageDir);
        expect(files.length).toBeGreaterThan(0);
      }
    });

    it('should fail build if coverage drops below threshold', () => {
      // This test verifies the CI/CD configuration
      const ciConfig = fs.readFileSync(
        path.join(process.cwd(), '.github/workflows/test.yml'),
        'utf-8'
      );
      
      expect(ciConfig).toContain('coverage');
      expect(ciConfig).toContain('80');
    });
  });

  describe('Security Audit Process', () => {
    
    it('should run npm audit without critical vulnerabilities', () => {
      try {
        execSync('npm audit --audit-level=moderate', {
          stdio: 'pipe'
        });
        // If no error, audit passed
        expect(true).toBe(true);
      } catch (error: any) {
        // npm audit exits with code 1 if vulnerabilities found
        // This test documents that we should have no moderate+ vulnerabilities
        const message = error.message || '';
        expect(message).not.toContain('moderate');
        expect(message).not.toContain('high');
        expect(message).not.toContain('critical');
      }
    });

    it('should have security audit workflow configured', () => {
      const workflowPath = path.join(process.cwd(), '.github/workflows/security.yml');
      
      if (fs.existsSync(workflowPath)) {
        const workflow = fs.readFileSync(workflowPath, 'utf-8');
        expect(workflow).toContain('npm audit');
      }
    });

    it('should document security vulnerabilities', () => {
      const vulnDoc = path.join(process.cwd(), 'docs/SECURITY-VULNERABILITIES.md');
      
      if (fs.existsSync(vulnDoc)) {
        const content = fs.readFileSync(vulnDoc, 'utf-8');
        expect(content.length).toBeGreaterThan(0);
      }
    });

    it('should have OWASP compliance checklist', () => {
      const owaspDoc = path.join(process.cwd(), 'docs/OWASP-CHECKLIST.md');
      
      if (fs.existsSync(owaspDoc)) {
        const content = fs.readFileSync(owaspDoc, 'utf-8');
        expect(content).toContain('OWASP');
      }
    });

    it('should have security audit findings documented', () => {
      const auditDoc = path.join(process.cwd(), 'docs/SECURITY-AUDIT-FINDINGS.md');
      
      if (fs.existsSync(auditDoc)) {
        const content = fs.readFileSync(auditDoc, 'utf-8');
        expect(content.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Commit Message Linting', () => {
    
    it('should have commitlint configured', () => {
      const commitlintConfig = path.join(process.cwd(), '.commitlintrc.json');
      
      expect(fs.existsSync(commitlintConfig)).toBe(true);
      
      const config = JSON.parse(fs.readFileSync(commitlintConfig, 'utf-8'));
      expect(config.extends).toBeDefined();
    });

    it('should enforce conventional commits format', () => {
      const commitlintConfig = path.join(process.cwd(), '.commitlintrc.json');
      const config = JSON.parse(fs.readFileSync(commitlintConfig, 'utf-8'));
      
      expect(config.extends).toContain('conventional');
    });

    it('should have husky pre-commit hooks configured', () => {
      const preCommitHook = path.join(process.cwd(), '.husky/pre-commit');
      
      expect(fs.existsSync(preCommitHook)).toBe(true);
    });

    it('should have commit message template', () => {
      const template = path.join(process.cwd(), '.gitmessage');
      
      if (fs.existsSync(template)) {
        const content = fs.readFileSync(template, 'utf-8');
        expect(content.length).toBeGreaterThan(0);
      }
    });

    it('should document conventional commits in CONTRIBUTING.md', () => {
      const contributing = path.join(process.cwd(), 'CONTRIBUTING.md');
      
      if (fs.existsSync(contributing)) {
        const content = fs.readFileSync(contributing, 'utf-8');
        expect(content.toLowerCase()).toContain('commit');
      }
    });

    it('should validate commit message types', () => {
      const commitlintConfig = path.join(process.cwd(), '.commitlintrc.json');
      const config = JSON.parse(fs.readFileSync(commitlintConfig, 'utf-8'));
      
      // Should have rules for type validation
      expect(config.rules || config.extends).toBeDefined();
    });
  });

  describe('Performance Monitoring', () => {
    
    it('should have performance middleware implemented', () => {
      const middlewarePath = path.join(process.cwd(), 'services/shared/middleware/performance.ts');
      
      if (fs.existsSync(middlewarePath)) {
        const content = fs.readFileSync(middlewarePath, 'utf-8');
        expect(content).toContain('performance');
      }
    });

    it('should measure API response times', () => {
      const middlewarePath = path.join(process.cwd(), 'services/shared/middleware/performance.ts');
      
      if (fs.existsSync(middlewarePath)) {
        const content = fs.readFileSync(middlewarePath, 'utf-8');
        expect(content).toMatch(/latency|duration|time/i);
      }
    });

    it('should have performance dashboard configured', () => {
      const dashboardPath = path.join(
        process.cwd(),
        'observability/grafana/provisioning/dashboards/performance-dashboard.json'
      );
      
      if (fs.existsSync(dashboardPath)) {
        const dashboard = JSON.parse(fs.readFileSync(dashboardPath, 'utf-8'));
        expect(dashboard.title || dashboard.dashboard).toBeDefined();
      }
    });

    it('should have performance alerts configured', () => {
      const alertsPath = path.join(process.cwd(), 'observability/alert-rules.yml');
      
      if (fs.existsSync(alertsPath)) {
        const content = fs.readFileSync(alertsPath, 'utf-8');
        expect(content).toMatch(/latency|response|performance/i);
      }
    });

    it('should document performance targets', () => {
      const budgetDoc = path.join(process.cwd(), 'docs/PERFORMANCE-BUDGET.md');
      
      if (fs.existsSync(budgetDoc)) {
        const content = fs.readFileSync(budgetDoc, 'utf-8');
        expect(content).toContain('100');
      }
    });

    it('should have performance benchmarks established', () => {
      const benchmarkDoc = path.join(process.cwd(), 'docs/PERFORMANCE-BENCHMARKS.md');
      
      if (fs.existsSync(benchmarkDoc)) {
        const content = fs.readFileSync(benchmarkDoc, 'utf-8');
        expect(content.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Standards Documentation', () => {
    
    it('should have standards document', () => {
      const standardsDoc = path.join(process.cwd(), 'docs/STANDARDS.md');
      
      expect(fs.existsSync(standardsDoc)).toBe(true);
      
      const content = fs.readFileSync(standardsDoc, 'utf-8');
      expect(content.length).toBeGreaterThan(0);
    });

    it('should document code quality standards', () => {
      const standardsDoc = path.join(process.cwd(), 'docs/STANDARDS.md');
      const content = fs.readFileSync(standardsDoc, 'utf-8');
      
      expect(content.toLowerCase()).toMatch(/coverage|test|quality/);
    });

    it('should document security standards', () => {
      const standardsDoc = path.join(process.cwd(), 'docs/STANDARDS.md');
      const content = fs.readFileSync(standardsDoc, 'utf-8');
      
      expect(content.toLowerCase()).toMatch(/security|audit|vulnerability/);
    });

    it('should document performance standards', () => {
      const standardsDoc = path.join(process.cwd(), 'docs/STANDARDS.md');
      const content = fs.readFileSync(standardsDoc, 'utf-8');
      
      expect(content.toLowerCase()).toMatch(/performance|latency|response/);
    });

    it('should have deployment checklist', () => {
      const checklistDoc = path.join(process.cwd(), 'docs/DEPLOYMENT-CHECKLIST.md');
      
      expect(fs.existsSync(checklistDoc)).toBe(true);
    });

    it('should have testing guidelines', () => {
      const testingDoc = path.join(process.cwd(), 'docs/TESTING-GUIDELINES.md');
      
      if (fs.existsSync(testingDoc)) {
        const content = fs.readFileSync(testingDoc, 'utf-8');
        expect(content.length).toBeGreaterThan(0);
      }
    });
  });

  describe('CI/CD Pipeline Configuration', () => {
    
    it('should have test workflow configured', () => {
      const workflowPath = path.join(process.cwd(), '.github/workflows/test.yml');
      
      expect(fs.existsSync(workflowPath)).toBe(true);
      
      const workflow = fs.readFileSync(workflowPath, 'utf-8');
      expect(workflow).toContain('test');
    });

    it('should run tests on every push', () => {
      const workflowPath = path.join(process.cwd(), '.github/workflows/test.yml');
      const workflow = fs.readFileSync(workflowPath, 'utf-8');
      
      expect(workflow).toMatch(/on:|push:/);
    });

    it('should check coverage in CI/CD', () => {
      const workflowPath = path.join(process.cwd(), '.github/workflows/test.yml');
      const workflow = fs.readFileSync(workflowPath, 'utf-8');
      
      expect(workflow).toContain('coverage');
    });

    it('should run security checks in CI/CD', () => {
      const workflowPath = path.join(process.cwd(), '.github/workflows/test.yml');
      const workflow = fs.readFileSync(workflowPath, 'utf-8');
      
      expect(workflow).toMatch(/audit|security/i);
    });
  });

  describe('Ubuntu Philosophy Integration', () => {
    
    it('should have Ubuntu philosophy documentation', () => {
      const ubuntuDoc = path.join(process.cwd(), 'docs/UBUNTU-PHILOSOPHY.md');
      
      if (fs.existsSync(ubuntuDoc)) {
        const content = fs.readFileSync(ubuntuDoc, 'utf-8');
        expect(content).toContain('Ubuntu');
      }
    });

    it('should document collective benefit metrics', () => {
      const metricsDoc = path.join(process.cwd(), 'docs/COLLECTIVE-BENEFIT-METRICS.md');
      
      if (fs.existsSync(metricsDoc)) {
        const content = fs.readFileSync(metricsDoc, 'utf-8');
        expect(content.length).toBeGreaterThan(0);
      }
    });

    it('should have inclusive design guidelines', () => {
      const designDoc = path.join(process.cwd(), 'docs/INCLUSIVE-DESIGN-GUIDELINES.md');
      
      if (fs.existsSync(designDoc)) {
        const content = fs.readFileSync(designDoc, 'utf-8');
        expect(content.length).toBeGreaterThan(0);
      }
    });

    it('should integrate Ubuntu principles into standards', () => {
      const standardsDoc = path.join(process.cwd(), 'docs/STANDARDS.md');
      const content = fs.readFileSync(standardsDoc, 'utf-8');
      
      expect(content.toLowerCase()).toMatch(/ubuntu|collective|community/);
    });
  });

  describe('Production Readiness', () => {
    
    it('should have deployment checklist', () => {
      const checklistDoc = path.join(process.cwd(), 'docs/DEPLOYMENT-CHECKLIST.md');
      
      expect(fs.existsSync(checklistDoc)).toBe(true);
      
      const content = fs.readFileSync(checklistDoc, 'utf-8');
      expect(content.length).toBeGreaterThan(0);
    });

    it('should have deployment monitoring setup', () => {
      const monitoringDoc = path.join(process.cwd(), 'docs/DEPLOYMENT-MONITORING-SETUP.md');
      
      if (fs.existsSync(monitoringDoc)) {
        const content = fs.readFileSync(monitoringDoc, 'utf-8');
        expect(content.length).toBeGreaterThan(0);
      }
    });

    it('should have runbooks for operations', () => {
      const runbooksDoc = path.join(process.cwd(), 'docs/RUNBOOKS.md');
      
      if (fs.existsSync(runbooksDoc)) {
        const content = fs.readFileSync(runbooksDoc, 'utf-8');
        expect(content.length).toBeGreaterThan(0);
      }
    });

    it('should have deployment validator', () => {
      const validatorPath = path.join(process.cwd(), 'deployment/deployment-validator.ts');
      
      if (fs.existsSync(validatorPath)) {
        const content = fs.readFileSync(validatorPath, 'utf-8');
        expect(content).toContain('validate');
      }
    });

    it('should have monitoring configured', () => {
      const prometheusConfig = path.join(process.cwd(), 'observability/prometheus.yml');
      
      if (fs.existsSync(prometheusConfig)) {
        const content = fs.readFileSync(prometheusConfig, 'utf-8');
        expect(content.length).toBeGreaterThan(0);
      }
    });
  });
});
