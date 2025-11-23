import * as fs from 'fs';
import * as path from 'path';

export interface CriticalPath {
  name: string;
  description: string;
  services: string[];
  endpoints: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface PathCoverage {
  path: CriticalPath;
  coverage: number;
  coveredEndpoints: string[];
  uncoveredEndpoints: string[];
  gaps: string[];
}

export interface CoverageGap {
  path: string;
  service: string;
  endpoint: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  recommendation: string;
}

export class CriticalPathAnalyzer {
  private criticalPaths: CriticalPath[] = [
    {
      name: 'User Authentication Flow',
      description: 'User registration, login, and token management',
      services: ['auth-service'],
      endpoints: [
        '/auth/register',
        '/auth/login',
        '/auth/refresh',
        '/auth/logout',
        '/auth/verify-email',
      ],
      priority: 'high',
    },
    {
      name: 'Course Enrollment Flow',
      description: 'Browse courses, enroll, and track progress',
      services: ['azora-education'],
      endpoints: [
        '/courses',
        '/courses/:id',
        '/enrollments',
        '/enrollments/:id/progress',
      ],
      priority: 'high',
    },
    {
      name: 'Payment Processing Flow',
      description: 'Process payments and handle webhooks',
      services: ['payment'],
      endpoints: [
        '/payments/create-intent',
        '/payments/confirm',
        '/payments/webhooks',
        '/payments/refund',
      ],
      priority: 'high',
    },
    {
      name: 'Marketplace Job Flow',
      description: 'Post jobs, apply, and manage applications',
      services: ['azora-marketplace'],
      endpoints: [
        '/jobs',
        '/jobs/:id',
        '/applications',
        '/applications/:id',
      ],
      priority: 'medium',
    },
  ];

  getCriticalPaths(): CriticalPath[] {
    return this.criticalPaths;
  }

  calculatePathCoverage(path: CriticalPath, testFiles: string[]): PathCoverage {
    const coveredEndpoints: string[] = [];
    const uncoveredEndpoints: string[] = [];

    path.endpoints.forEach(endpoint => {
      const isCovered = this.isEndpointCovered(endpoint, testFiles);
      if (isCovered) {
        coveredEndpoints.push(endpoint);
      } else {
        uncoveredEndpoints.push(endpoint);
      }
    });

    const coverage = (coveredEndpoints.length / path.endpoints.length) * 100;

    const gaps: string[] = [];
    if (coverage < 80) {
      gaps.push(`${path.name} has insufficient coverage (${coverage.toFixed(1)}%)`);
    }

    uncoveredEndpoints.forEach(endpoint => {
      gaps.push(`Missing tests for ${endpoint}`);
    });

    return {
      path,
      coverage,
      coveredEndpoints,
      uncoveredEndpoints,
      gaps,
    };
  }

  private isEndpointCovered(endpoint: string, testFiles: string[]): boolean {
    const endpointPattern = endpoint.replace(/:\w+/g, '\\w+');
    const regex = new RegExp(endpointPattern);

    return testFiles.some(file => {
      if (!fs.existsSync(file)) {
        return false;
      }

      const content = fs.readFileSync(file, 'utf-8');
      return regex.test(content);
    });
  }

  identifyGaps(pathCoverages: PathCoverage[]): CoverageGap[] {
    const gaps: CoverageGap[] = [];

    pathCoverages.forEach(pathCoverage => {
      pathCoverage.uncoveredEndpoints.forEach(endpoint => {
        const severity = this.determineSeverity(pathCoverage.path.priority, pathCoverage.coverage);

        gaps.push({
          path: pathCoverage.path.name,
          service: pathCoverage.path.services[0],
          endpoint,
          severity,
          recommendation: this.generateRecommendation(endpoint, pathCoverage.path),
        });
      });
    });

    return gaps.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  private determineSeverity(
    priority: 'high' | 'medium' | 'low',
    coverage: number
  ): 'critical' | 'high' | 'medium' | 'low' {
    if (priority === 'high' && coverage < 50) {
      return 'critical';
    }

    if (priority === 'high' && coverage < 80) {
      return 'high';
    }

    if (priority === 'medium' && coverage < 60) {
      return 'high';
    }

    if (priority === 'medium' && coverage < 80) {
      return 'medium';
    }

    return 'low';
  }

  private generateRecommendation(endpoint: string, path: CriticalPath): string {
    return `Add integration tests for ${endpoint} in ${path.services[0]} service`;
  }

  generateGapReport(gaps: CoverageGap[]): string {
    const lines = [
      'Critical Path Coverage Gaps',
      '===========================',
      '',
    ];

    const groupedGaps = this.groupGapsBySeverity(gaps);

    Object.entries(groupedGaps).forEach(([severity, gapList]) => {
      if (gapList.length > 0) {
        lines.push(`## ${severity.toUpperCase()} Priority`);
        lines.push('');

        gapList.forEach(gap => {
          lines.push(`- **${gap.path}** - ${gap.service}`);
          lines.push(`  - Endpoint: ${gap.endpoint}`);
          lines.push(`  - Recommendation: ${gap.recommendation}`);
          lines.push('');
        });
      }
    });

    return lines.join('\n');
  }

  private groupGapsBySeverity(gaps: CoverageGap[]): Record<string, CoverageGap[]> {
    return gaps.reduce((acc, gap) => {
      if (!acc[gap.severity]) {
        acc[gap.severity] = [];
      }
      acc[gap.severity].push(gap);
      return acc;
    }, {} as Record<string, CoverageGap[]>);
  }

  generatePrioritizationReport(pathCoverages: PathCoverage[]): string {
    const lines = [
      'Test Prioritization Recommendations',
      '===================================',
      '',
    ];

    const sortedPaths = pathCoverages.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.path.priority] - priorityOrder[b.path.priority];

      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      return a.coverage - b.coverage;
    });

    sortedPaths.forEach((pathCoverage, index) => {
      const emoji = pathCoverage.coverage >= 80 ? '✅' : pathCoverage.coverage >= 50 ? '⚠️' : '❌';

      lines.push(`${index + 1}. ${emoji} **${pathCoverage.path.name}**`);
      lines.push(`   - Priority: ${pathCoverage.path.priority}`);
      lines.push(`   - Coverage: ${pathCoverage.coverage.toFixed(1)}%`);
      lines.push(`   - Covered: ${pathCoverage.coveredEndpoints.length}/${pathCoverage.path.endpoints.length} endpoints`);

      if (pathCoverage.uncoveredEndpoints.length > 0) {
        lines.push(`   - Missing tests for: ${pathCoverage.uncoveredEndpoints.join(', ')}`);
      }

      lines.push('');
    });

    return lines.join('\n');
  }
}
