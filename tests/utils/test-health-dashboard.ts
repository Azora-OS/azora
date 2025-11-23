import * as fs from 'fs';
import * as path from 'path';
import { TestPerformanceTracker } from './test-performance-tracker';
import { FailureAnalyzer } from './failure-analyzer';
import { FlakyTestDetector } from './flaky-test-detector';

interface HealthMetrics {
  timestamp: number;
  totalTests: number;
  passingTests: number;
  failingTests: number;
  flakyTests: number;
  slowTests: number;
  passRate: number;
  avgDuration: number;
  healthScore: number;
}

interface ProblemArea {
  area: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  affectedTests: number;
  recommendation: string;
}

interface TrendData {
  metric: string;
  current: number;
  previous: number;
  change: number;
  trend: 'improving' | 'degrading' | 'stable';
}

interface HealthDashboard {
  metrics: HealthMetrics;
  problemAreas: ProblemArea[];
  trends: TrendData[];
  recommendations: string[];
  summary: string;
}

export class TestHealthDashboard {
  private performanceTracker: TestPerformanceTracker;
  private failureAnalyzer: FailureAnalyzer;
  private flakyDetector: FlakyTestDetector;
  private historyFile: string;

  constructor(
    performanceTracker?: TestPerformanceTracker,
    failureAnalyzer?: FailureAnalyzer,
    flakyDetector?: FlakyTestDetector
  ) {
    this.performanceTracker = performanceTracker || new TestPerformanceTracker();
    this.failureAnalyzer = failureAnalyzer || new FailureAnalyzer();
    this.flakyDetector = flakyDetector || new FlakyTestDetector();
    this.historyFile = path.resolve(process.cwd(), '.test-health-history.json');
  }

  calculateHealthMetrics(): HealthMetrics {
    const perfReport = this.performanceTracker.generateReport();
    const failureReport = this.failureAnalyzer.generateReport();
    const flakyReport = this.flakyDetector.generateReport();

    const totalTests = perfReport.totalTests;
    const failingTests = failureReport.totalFailures;
    const passingTests = totalTests - failingTests;
    const flakyTests = flakyReport.flakyTests.length;
    const slowTests = perfReport.slowTests.length;

    const passRate = totalTests > 0 ? (passingTests / totalTests) * 100 : 0;

    const avgDuration = perfReport.performanceStats.length > 0
      ? perfReport.performanceStats.reduce((sum, stat) => sum + stat.avgDuration, 0) / perfReport.performanceStats.length
      : 0;

    const healthScore = this.calculateHealthScore(passRate, flakyTests, slowTests, totalTests);

    return {
      timestamp: Date.now(),
      totalTests,
      passingTests,
      failingTests,
      flakyTests,
      slowTests,
      passRate,
      avgDuration,
      healthScore,
    };
  }

  private calculateHealthScore(
    passRate: number,
    flakyTests: number,
    slowTests: number,
    totalTests: number
  ): number {
    let score = 100;

    score -= (100 - passRate) * 2;

    const flakyPercentage = totalTests > 0 ? (flakyTests / totalTests) * 100 : 0;
    score -= flakyPercentage * 1.5;

    const slowPercentage = totalTests > 0 ? (slowTests / totalTests) * 100 : 0;
    score -= slowPercentage * 0.5;

    return Math.max(0, Math.min(100, score));
  }

  identifyProblemAreas(): ProblemArea[] {
    const problems: ProblemArea[] = [];
    const metrics = this.calculateHealthMetrics();
    const failureReport = this.failureAnalyzer.generateReport();
    const flakyReport = this.flakyDetector.generateReport();

    if (metrics.passRate < 80) {
      problems.push({
        area: 'Test Reliability',
        severity: 'critical',
        description: `Pass rate is ${metrics.passRate.toFixed(1)}%, below the 80% threshold`,
        affectedTests: metrics.failingTests,
        recommendation: 'Investigate and fix failing tests immediately. Review test logic and implementation.',
      });
    }

    if (metrics.flakyTests > 5) {
      problems.push({
        area: 'Test Stability',
        severity: 'high',
        description: `${metrics.flakyTests} flaky tests detected`,
        affectedTests: metrics.flakyTests,
        recommendation: 'Address flaky tests by improving test isolation, removing race conditions, and mocking external dependencies.',
      });
    }

    if (metrics.slowTests > 10) {
      problems.push({
        area: 'Test Performance',
        severity: 'medium',
        description: `${metrics.slowTests} slow tests detected`,
        affectedTests: metrics.slowTests,
        recommendation: 'Optimize slow tests by mocking external services, reducing database operations, and improving test setup.',
      });
    }

    const timeoutFailures = Array.from(failureReport.failuresByCategory.entries())
      .find(([category]) => category === 'timeout');
    if (timeoutFailures && timeoutFailures[1] > 5) {
      problems.push({
        area: 'Timeout Issues',
        severity: 'high',
        description: `${timeoutFailures[1]} timeout failures detected`,
        affectedTests: timeoutFailures[1],
        recommendation: 'Review timeout configurations and optimize async operations in tests.',
      });
    }

    const databaseFailures = Array.from(failureReport.failuresByCategory.entries())
      .find(([category]) => category === 'database');
    if (databaseFailures && databaseFailures[1] > 3) {
      problems.push({
        area: 'Database Issues',
        severity: 'high',
        description: `${databaseFailures[1]} database-related failures`,
        affectedTests: databaseFailures[1],
        recommendation: 'Ensure test database is properly configured and cleaned between tests.',
      });
    }

    return problems.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  calculateTrends(): TrendData[] {
    const trends: TrendData[] = [];
    const currentMetrics = this.calculateHealthMetrics();
    const previousMetrics = this.loadPreviousMetrics();

    if (!previousMetrics) {
      return [];
    }

    const addTrend = (metric: string, current: number, previous: number) => {
      const change = ((current - previous) / previous) * 100;
      let trend: 'improving' | 'degrading' | 'stable' = 'stable';

      if (Math.abs(change) > 5) {
        trend = change > 0 ? 'improving' : 'degrading';
      }

      trends.push({ metric, current, previous, change, trend });
    };

    addTrend('Pass Rate', currentMetrics.passRate, previousMetrics.passRate);
    addTrend('Health Score', currentMetrics.healthScore, previousMetrics.healthScore);
    addTrend('Flaky Tests', currentMetrics.flakyTests, previousMetrics.flakyTests);
    addTrend('Slow Tests', currentMetrics.slowTests, previousMetrics.slowTests);
    addTrend('Avg Duration', currentMetrics.avgDuration, previousMetrics.avgDuration);

    return trends;
  }

  generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const metrics = this.calculateHealthMetrics();
    const problems = this.identifyProblemAreas();

    if (metrics.healthScore >= 90) {
      recommendations.push('✅ Test suite is in excellent health. Keep up the good work!');
    } else if (metrics.healthScore >= 70) {
      recommendations.push('⚠️ Test suite health is acceptable but has room for improvement.');
    } else {
      recommendations.push('🚨 Test suite health needs immediate attention.');
    }

    if (problems.length > 0) {
      recommendations.push(`Address ${problems.length} identified problem area(s):`);
      problems.slice(0, 3).forEach(problem => {
        recommendations.push(`  - ${problem.area}: ${problem.recommendation}`);
      });
    }

    const trends = this.calculateTrends();
    const degradingTrends = trends.filter(t => t.trend === 'degrading');
    if (degradingTrends.length > 0) {
      recommendations.push(`Monitor ${degradingTrends.length} degrading metric(s)`);
    }

    if (metrics.avgDuration > 5000) {
      recommendations.push('Consider implementing test parallelization to reduce overall test execution time.');
    }

    return recommendations;
  }

  generateDashboard(): HealthDashboard {
    const metrics = this.calculateHealthMetrics();
    const problemAreas = this.identifyProblemAreas();
    const trends = this.calculateTrends();
    const recommendations = this.generateRecommendations();

    let summary = '';
    if (metrics.healthScore >= 90) {
      summary = '✅ Excellent - Test suite is healthy and reliable';
    } else if (metrics.healthScore >= 70) {
      summary = '⚠️ Good - Minor issues need attention';
    } else if (metrics.healthScore >= 50) {
      summary = '⚠️ Fair - Several issues require attention';
    } else {
      summary = '🚨 Poor - Critical issues need immediate action';
    }

    return {
      metrics,
      problemAreas,
      trends,
      recommendations,
      summary,
    };
  }

  printDashboard(): void {
    const dashboard = this.generateDashboard();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║           TEST HEALTH DASHBOARD                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log(`Status: ${dashboard.summary}`);
    console.log(`Health Score: ${dashboard.metrics.healthScore.toFixed(1)}/100\n`);

    console.log('📊 Metrics:');
    console.log(`  Total Tests: ${dashboard.metrics.totalTests}`);
    console.log(`  Passing: ${dashboard.metrics.passingTests} (${dashboard.metrics.passRate.toFixed(1)}%)`);
    console.log(`  Failing: ${dashboard.metrics.failingTests}`);
    console.log(`  Flaky: ${dashboard.metrics.flakyTests}`);
    console.log(`  Slow: ${dashboard.metrics.slowTests}`);
    console.log(`  Avg Duration: ${dashboard.metrics.avgDuration.toFixed(0)}ms\n`);

    if (dashboard.problemAreas.length > 0) {
      console.log('🚨 Problem Areas:');
      dashboard.problemAreas.forEach(problem => {
        const icon = problem.severity === 'critical' ? '🔴' : problem.severity === 'high' ? '🟠' : '🟡';
        console.log(`  ${icon} ${problem.area} (${problem.severity})`);
        console.log(`     ${problem.description}`);
        console.log(`     → ${problem.recommendation}\n`);
      });
    }

    if (dashboard.trends.length > 0) {
      console.log('📈 Trends:');
      dashboard.trends.forEach(trend => {
        const icon = trend.trend === 'improving' ? '📈' : trend.trend === 'degrading' ? '📉' : '➡️';
        const sign = trend.change > 0 ? '+' : '';
        console.log(`  ${icon} ${trend.metric}: ${trend.current.toFixed(1)} (${sign}${trend.change.toFixed(1)}%)`);
      });
      console.log('');
    }

    console.log('💡 Recommendations:');
    dashboard.recommendations.forEach(rec => {
      console.log(`  ${rec}`);
    });
    console.log('');
  }

  saveMetrics(): void {
    try {
      const metrics = this.calculateHealthMetrics();
      const history = this.loadHistory();
      history.push(metrics);

      const maxRecords = 100;
      const trimmedHistory = history.slice(-maxRecords);

      fs.writeFileSync(this.historyFile, JSON.stringify(trimmedHistory, null, 2));
    } catch (error) {
      console.error('Failed to save health metrics:', error);
    }
  }

  private loadPreviousMetrics(): HealthMetrics | null {
    const history = this.loadHistory();
    return history.length > 0 ? history[history.length - 1] : null;
  }

  private loadHistory(): HealthMetrics[] {
    if (!fs.existsSync(this.historyFile)) {
      return [];
    }

    try {
      const data = fs.readFileSync(this.historyFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  exportToHTML(outputPath: string): void {
    const dashboard = this.generateDashboard();
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Test Health Dashboard</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
    .header { text-align: center; margin-bottom: 30px; }
    .health-score { font-size: 48px; font-weight: bold; color: ${this.getScoreColor(dashboard.metrics.healthScore)}; }
    .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
    .metric-card { background: #f9f9f9; padding: 15px; border-radius: 4px; }
    .metric-value { font-size: 24px; font-weight: bold; }
    .problem { background: #fff3cd; padding: 15px; margin: 10px 0; border-left: 4px solid #ffc107; }
    .critical { border-left-color: #dc3545; background: #f8d7da; }
    .high { border-left-color: #fd7e14; background: #fff3cd; }
    .recommendation { background: #d1ecf1; padding: 10px; margin: 5px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Test Health Dashboard</h1>
      <div class="health-score">${dashboard.metrics.healthScore.toFixed(1)}/100</div>
      <p>${dashboard.summary}</p>
      <p><small>Generated: ${new Date(dashboard.metrics.timestamp).toLocaleString()}</small></p>
    </div>
    
    <div class="metrics">
      <div class="metric-card">
        <div>Total Tests</div>
        <div class="metric-value">${dashboard.metrics.totalTests}</div>
      </div>
      <div class="metric-card">
        <div>Pass Rate</div>
        <div class="metric-value">${dashboard.metrics.passRate.toFixed(1)}%</div>
      </div>
      <div class="metric-card">
        <div>Flaky Tests</div>
        <div class="metric-value">${dashboard.metrics.flakyTests}</div>
      </div>
    </div>

    ${dashboard.problemAreas.length > 0 ? `
    <h2>Problem Areas</h2>
    ${dashboard.problemAreas.map(p => `
      <div class="problem ${p.severity}">
        <h3>${p.area} (${p.severity})</h3>
        <p>${p.description}</p>
        <p><strong>Recommendation:</strong> ${p.recommendation}</p>
      </div>
    `).join('')}
    ` : ''}

    <h2>Recommendations</h2>
    ${dashboard.recommendations.map(r => `<div class="recommendation">${r}</div>`).join('')}
  </div>
</body>
</html>
    `;

    fs.writeFileSync(outputPath, html);
  }

  private getScoreColor(score: number): string {
    if (score >= 90) return '#28a745';
    if (score >= 70) return '#ffc107';
    return '#dc3545';
  }
}

export const testHealthDashboard = new TestHealthDashboard();
