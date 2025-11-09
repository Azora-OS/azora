/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

AGENT INTEGRATION MONITOR
Continuous monitoring and integration of agent contributions
*/

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface AgentContribution {
  agent: 'architect' | 'analyst' | 'designer';
  timestamp: Date;
  files: string[];
  component: string;
  status: 'pending' | 'integrated' | 'validated' | 'deployed';
  dependencies: string[];
  tests: string[];
  documentation: string[];
}

interface RepositoryGap {
  category: string;
  missing: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  assignedTo?: 'architect' | 'analyst' | 'designer';
}

interface IntegrationValidation {
  component: string;
  hasTests: boolean;
  hasDocumentation: boolean;
  hasDependencies: boolean;
  hasTypes: boolean;
  passesLint: boolean;
  integrationPoints: string[];
  status: 'valid' | 'invalid' | 'incomplete';
  issues: string[];
}

/**
 * Agent Integration Monitor
 * Tracks agent contributions and ensures proper integration
 */
export class AgentIntegrationMonitor {
  private contributions: Map<string, AgentContribution> = new Map();
  private gaps: RepositoryGap[] = [];
  private validations: Map<string, IntegrationValidation> = new Map();
  
  private readonly WORKSPACE_ROOT = '/workspace';
  private readonly LOG_FILE = path.join(this.WORKSPACE_ROOT, 'logs/integration-monitor.log');

  constructor() {
    this.ensureLogDirectory();
  }

  /**
   * Scan repository for missing components
   */
  async scanRepository(): Promise<RepositoryGap[]> {
    this.log('🔍 Starting comprehensive repository scan...');
    
    const gaps: RepositoryGap[] = [];

    // 1. Check Chronicle Protocol completeness
    gaps.push(...this.checkChronicleProtocol());

    // 2. Check Design System completeness
    gaps.push(...this.checkDesignSystem());

    // 3. Check Master System Integrator
    gaps.push(...this.checkMasterSystemIntegrator());

    // 4. Check Service Infrastructure
    gaps.push(...this.checkServiceInfrastructure());

    // 5. Check Testing Infrastructure
    gaps.push(...this.checkTestingInfrastructure());

    // 6. Check Documentation
    gaps.push(...this.checkDocumentation());

    // 7. Check Analytics (for Analyst)
    gaps.push(...this.checkAnalyticsInfrastructure());

    // 8. Check Deployment
    gaps.push(...this.checkDeploymentInfrastructure());

    this.gaps = gaps;
    this.log(`✅ Scan complete: Found ${gaps.length} gaps`);
    
    return gaps;
  }

  /**
   * Validate new agent contribution
   */
  async validateContribution(component: string, files: string[]): Promise<IntegrationValidation> {
    this.log(`🔍 Validating contribution: ${component}`);

    const validation: IntegrationValidation = {
      component,
      hasTests: false,
      hasDocumentation: false,
      hasDependencies: false,
      hasTypes: false,
      passesLint: false,
      integrationPoints: [],
      status: 'valid',
      issues: [],
    };

    // Check for tests
    const testFiles = files.filter(f => 
      f.includes('/tests/') || 
      f.includes('.test.') || 
      f.includes('.spec.')
    );
    validation.hasTests = testFiles.length > 0;
    if (!validation.hasTests) {
      validation.issues.push('Missing test files');
      validation.status = 'incomplete';
    }

    // Check for documentation
    const docFiles = files.filter(f => 
      f.endsWith('.md') || 
      f.includes('/docs/')
    );
    validation.hasDocumentation = docFiles.length > 0;
    if (!validation.hasDocumentation) {
      validation.issues.push('Missing documentation');
      validation.status = 'incomplete';
    }

    // Check for TypeScript types
    const hasTypeFiles = files.some(f => 
      f.endsWith('.ts') && !f.endsWith('.test.ts')
    );
    validation.hasTypes = hasTypeFiles;

    // Check for package.json (dependencies)
    const hasDeps = files.some(f => f.endsWith('package.json'));
    validation.hasDependencies = hasDeps;

    // Check integration points
    validation.integrationPoints = this.detectIntegrationPoints(files);

    // Run linting
    try {
      for (const file of files.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'))) {
        if (fs.existsSync(file)) {
          execSync(`npx eslint ${file}`, { stdio: 'pipe' });
        }
      }
      validation.passesLint = true;
    } catch (error) {
      validation.passesLint = false;
      validation.issues.push('Linting errors detected');
      validation.status = 'invalid';
    }

    this.validations.set(component, validation);
    this.log(`${validation.status === 'valid' ? '✅' : '⚠️'} Validation complete: ${component} - ${validation.status}`);

    return validation;
  }

  /**
   * Register agent contribution
   */
  registerContribution(
    agent: 'architect' | 'analyst' | 'designer',
    component: string,
    files: string[]
  ): void {
    const contribution: AgentContribution = {
      agent,
      timestamp: new Date(),
      files,
      component,
      status: 'pending',
      dependencies: this.detectDependencies(files),
      tests: files.filter(f => f.includes('test') || f.includes('spec')),
      documentation: files.filter(f => f.endsWith('.md')),
    };

    this.contributions.set(component, contribution);
    this.log(`📝 Registered contribution from ${agent}: ${component}`);
  }

  /**
   * Mark contribution as integrated
   */
  markAsIntegrated(component: string): void {
    const contribution = this.contributions.get(component);
    if (contribution) {
      contribution.status = 'integrated';
      this.log(`✅ Marked as integrated: ${component}`);
    }
  }

  /**
   * Generate integration report
   */
  generateReport(): string {
    let report = '\n';
    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    report += '📊 AGENT INTEGRATION MONITOR REPORT\n';
    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

    // Agent contributions
    report += '🤖 AGENT CONTRIBUTIONS:\n';
    const byAgent = {
      architect: 0,
      analyst: 0,
      designer: 0,
    };

    for (const [component, contribution] of this.contributions) {
      byAgent[contribution.agent]++;
      report += `  ${this.getStatusIcon(contribution.status)} ${contribution.agent.toUpperCase()}: ${component}\n`;
    }

    report += `\n  Total: ${this.contributions.size} contributions\n`;
    report += `  • Architect: ${byAgent.architect}\n`;
    report += `  • Analyst: ${byAgent.analyst}\n`;
    report += `  • Designer: ${byAgent.designer}\n\n`;

    // Repository gaps
    if (this.gaps.length > 0) {
      report += '🔍 REPOSITORY GAPS:\n';
      const byPriority = {
        critical: this.gaps.filter(g => g.priority === 'critical'),
        high: this.gaps.filter(g => g.priority === 'high'),
        medium: this.gaps.filter(g => g.priority === 'medium'),
        low: this.gaps.filter(g => g.priority === 'low'),
      };

      if (byPriority.critical.length > 0) {
        report += `  🔴 CRITICAL (${byPriority.critical.length}):\n`;
        byPriority.critical.forEach(gap => {
          report += `     ${gap.category}: ${gap.missing.join(', ')}\n`;
          if (gap.assignedTo) {
            report += `     → Assigned to: ${gap.assignedTo}\n`;
          }
        });
      }

      if (byPriority.high.length > 0) {
        report += `  🟠 HIGH (${byPriority.high.length}):\n`;
        byPriority.high.forEach(gap => {
          report += `     ${gap.category}: ${gap.missing.join(', ')}\n`;
        });
      }

      report += `\n  Total gaps: ${this.gaps.length}\n\n`;
    } else {
      report += '✅ NO GAPS DETECTED - Repository is complete!\n\n';
    }

    // Validation summary
    report += '✓ VALIDATION SUMMARY:\n';
    let valid = 0;
    let incomplete = 0;
    let invalid = 0;

    for (const [component, validation] of this.validations) {
      if (validation.status === 'valid') valid++;
      else if (validation.status === 'incomplete') incomplete++;
      else invalid++;
    }

    report += `  Valid: ${valid}\n`;
    report += `  Incomplete: ${incomplete}\n`;
    report += `  Invalid: ${invalid}\n\n`;

    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';

    return report;
  }

  /**
   * Get integration checklist for component
   */
  getIntegrationChecklist(component: string): string[] {
    return [
      '☐ Component files created',
      '☐ Tests written (40%+ coverage)',
      '☐ Documentation added',
      '☐ Types defined',
      '☐ Linting passed',
      '☐ Integration points identified',
      '☐ Dependencies resolved',
      '☐ Master System Integrator updated',
      '☐ Health checks added',
      '☐ Constitutional compliance verified',
    ];
  }

  // Private helper methods

  private checkChronicleProtocol(): RepositoryGap[] {
    const gaps: RepositoryGap[] = [];
    const chroniclePath = path.join(this.WORKSPACE_ROOT, 'services/chronicle-protocol');

    // Check if monitoring/metrics exist
    const metricsPath = path.join(chroniclePath, 'metrics.ts');
    if (!fs.existsSync(metricsPath)) {
      gaps.push({
        category: 'Chronicle Protocol - Monitoring',
        missing: ['Prometheus metrics', 'Performance tracking'],
        priority: 'high',
        assignedTo: 'architect',
      });
    }

    // Check if Grafana dashboard exists
    const grafanaPath = path.join(chroniclePath, 'grafana-dashboard.json');
    if (!fs.existsSync(grafanaPath)) {
      gaps.push({
        category: 'Chronicle Protocol - Visualization',
        missing: ['Grafana dashboard'],
        priority: 'medium',
        assignedTo: 'analyst',
      });
    }

    return gaps;
  }

  private checkDesignSystem(): RepositoryGap[] {
    const gaps: RepositoryGap[] = [];
    const designPath = path.join(this.WORKSPACE_ROOT, 'tools/design-system');

    // Check for Storybook
    const storybookPath = path.join(designPath, '.storybook');
    if (!fs.existsSync(storybookPath)) {
      gaps.push({
        category: 'Design System - Documentation',
        missing: ['Storybook configuration'],
        priority: 'medium',
        assignedTo: 'designer',
      });
    }

    return gaps;
  }

  private checkMasterSystemIntegrator(): RepositoryGap[] {
    const gaps: RepositoryGap[] = [];
    // Check if all services are registered
    // This would require parsing the file
    return gaps;
  }

  private checkServiceInfrastructure(): RepositoryGap[] {
    const gaps: RepositoryGap[] = [];
    const servicesPath = path.join(this.WORKSPACE_ROOT, 'services');

    // Check for health check endpoints
    // Check for monitoring
    // Check for error handling

    return gaps;
  }

  private checkTestingInfrastructure(): RepositoryGap[] {
    const gaps: RepositoryGap[] = [];

    // Check for E2E tests
    const e2ePath = path.join(this.WORKSPACE_ROOT, 'tests/e2e');
    if (!fs.existsSync(e2ePath)) {
      gaps.push({
        category: 'Testing Infrastructure',
        missing: ['E2E test suite', 'Integration tests'],
        priority: 'high',
        assignedTo: 'analyst',
      });
    }

    // Check for load testing
    const loadTestPath = path.join(this.WORKSPACE_ROOT, 'tests/load');
    if (!fs.existsSync(loadTestPath)) {
      gaps.push({
        category: 'Testing Infrastructure',
        missing: ['Load testing suite'],
        priority: 'medium',
        assignedTo: 'analyst',
      });
    }

    return gaps;
  }

  private checkDocumentation(): RepositoryGap[] {
    const gaps: RepositoryGap[] = [];

    // Check for API documentation
    const apiDocsPath = path.join(this.WORKSPACE_ROOT, 'docs/api');
    if (!fs.existsSync(apiDocsPath)) {
      gaps.push({
        category: 'Documentation',
        missing: ['API documentation'],
        priority: 'high',
      });
    }

    return gaps;
  }

  private checkAnalyticsInfrastructure(): RepositoryGap[] {
    const gaps: RepositoryGap[] = [];

    // Check for analytics service
    const analyticsPath = path.join(this.WORKSPACE_ROOT, 'services/analytics-service');
    if (!fs.existsSync(path.join(analyticsPath, 'index.ts'))) {
      gaps.push({
        category: 'Analytics Infrastructure',
        missing: ['Analytics service implementation', 'Data collection', 'Metrics aggregation'],
        priority: 'high',
        assignedTo: 'analyst',
      });
    }

    return gaps;
  }

  private checkDeploymentInfrastructure(): RepositoryGap[] {
    const gaps: RepositoryGap[] = [];

    // Check for CI/CD
    const githubActionsPath = path.join(this.WORKSPACE_ROOT, '.github/workflows');
    if (!fs.existsSync(githubActionsPath)) {
      gaps.push({
        category: 'Deployment Infrastructure',
        missing: ['GitHub Actions workflows'],
        priority: 'high',
      });
    }

    return gaps;
  }

  private detectIntegrationPoints(files: string[]): string[] {
    const points: string[] = [];

    for (const file of files) {
      if (!fs.existsSync(file)) continue;

      const content = fs.readFileSync(file, 'utf-8');

      // Check for Master System Integrator
      if (content.includes('master-system-integrator')) {
        points.push('Master System Integrator');
      }

      // Check for Chronicle Protocol
      if (content.includes('chronicle-protocol')) {
        points.push('Chronicle Protocol');
      }

      // Check for Design Infrastructure
      if (content.includes('design-infrastructure')) {
        points.push('Design Infrastructure');
      }

      // Check for Event Bus
      if (content.includes('event-bus') || content.includes('nervousSystem')) {
        points.push('Event Bus');
      }
    }

    return [...new Set(points)];
  }

  private detectDependencies(files: string[]): string[] {
    const deps: string[] = [];

    for (const file of files) {
      if (file.endsWith('package.json') && fs.existsSync(file)) {
        const pkg = JSON.parse(fs.readFileSync(file, 'utf-8'));
        if (pkg.dependencies) {
          deps.push(...Object.keys(pkg.dependencies));
        }
      }
    }

    return [...new Set(deps)];
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case 'pending': return '⏳';
      case 'integrated': return '✅';
      case 'validated': return '✓';
      case 'deployed': return '🚀';
      default: return '•';
    }
  }

  private ensureLogDirectory(): void {
    const logDir = path.dirname(this.LOG_FILE);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  private log(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    
    console.log(message);
    fs.appendFileSync(this.LOG_FILE, logMessage);
  }
}

// Export singleton instance
export const integrationMonitor = new AgentIntegrationMonitor();
export default integrationMonitor;
