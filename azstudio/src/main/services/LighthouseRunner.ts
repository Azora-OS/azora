import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs/promises';

const execAsync = promisify(exec);

export interface CoreWebVitals {
  LCP: number; // Largest Contentful Paint (ms)
  FID: number; // First Input Delay (ms)
  CLS: number; // Cumulative Layout Shift (score)
  FCP: number; // First Contentful Paint (ms)
  TTI: number; // Time to Interactive (ms)
  TBT: number; // Total Blocking Time (ms)
  SI: number;  // Speed Index (ms)
}

export interface PerformanceScores {
  performance: number;      // 0-100
  accessibility: number;    // 0-100
  bestPractices: number;    // 0-100
  seo: number;              // 0-100
  pwa: number;              // 0-100
}

export interface PerformanceRecommendation {
  id: string;
  title: string;
  description: string;
  score: number;
  displayValue?: string;
  numericValue?: number;
  numericUnit?: string;
  details?: any;
}

export interface PerformanceReport {
  url: string;
  timestamp: Date;
  scores: PerformanceScores;
  coreWebVitals: CoreWebVitals;
  recommendations: PerformanceRecommendation[];
  passed: boolean;
  reportPath?: string;
  rawReport?: any;
}

export interface PerformanceHistory {
  url: string;
  reports: PerformanceReport[];
  trend: {
    performance: number[];
    LCP: number[];
    FID: number[];
    CLS: number[];
  };
}

export interface LighthouseOptions {
  formFactor?: 'mobile' | 'desktop';
  throttling?: 'mobile3G' | 'mobile4G' | 'none';
  onlyCategories?: string[];
  skipAudits?: string[];
  output?: 'json' | 'html' | 'csv';
  outputPath?: string;
}

export class LighthouseRunner {
  private projectRoot: string;
  private historyPath: string;
  private history: Map<string, PerformanceHistory>;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.historyPath = path.join(projectRoot, '.azstudio', 'performance-history.json');
    this.history = new Map();
  }

  /**
   * Initialize Lighthouse and load history
   */
  async initialize(): Promise<void> {
    try {
      // Ensure Lighthouse is installed
      await execAsync('npm list lighthouse', {
        cwd: this.projectRoot,
      });
    } catch {
      // Install Lighthouse if not present
      console.log('Installing Lighthouse...');
      await execAsync('npm install --save-dev lighthouse', {
        cwd: this.projectRoot,
      });
    }

    // Load performance history
    await this.loadHistory();
  }

  /**
   * Run Lighthouse audit on a preview page
   */
  async runAudit(
    url: string,
    options: LighthouseOptions = {}
  ): Promise<PerformanceReport> {
    try {
      const {
        formFactor = 'desktop',
        throttling = 'none',
        onlyCategories = ['performance', 'accessibility', 'best-practices', 'seo'],
        output = 'json',
        outputPath,
      } = options;

      // Build Lighthouse command
      const outputFile = outputPath || path.join(
        this.projectRoot,
        '.azstudio',
        'lighthouse',
        `report-${Date.now()}.json`
      );

      await fs.mkdir(path.dirname(outputFile), { recursive: true });

      const command = [
        'npx lighthouse',
        url,
        `--output=${output}`,
        `--output-path=${outputFile}`,
        `--form-factor=${formFactor}`,
        `--throttling-method=${throttling}`,
        `--only-categories=${onlyCategories.join(',')}`,
        '--chrome-flags="--headless --no-sandbox --disable-gpu"',
        '--quiet',
      ].join(' ');

      console.log(`Running Lighthouse audit on ${url}...`);
      
      await execAsync(command, {
        cwd: this.projectRoot,
        timeout: 120000, // 2 minutes
      });

      // Read and parse the report
      const reportContent = await fs.readFile(outputFile, 'utf-8');
      const rawReport = JSON.parse(reportContent);

      const report = this.parseReport(url, rawReport);
      
      // Save to history
      await this.addToHistory(report);

      return report;
    } catch (error: any) {
      throw new Error(`Lighthouse audit failed: ${error.message}`);
    }
  }

  /**
   * Parse Lighthouse report into our format
   */
  private parseReport(url: string, rawReport: any): PerformanceReport {
    const categories = rawReport.categories || {};
    const audits = rawReport.audits || {};

    // Extract scores
    const scores: PerformanceScores = {
      performance: Math.round((categories.performance?.score || 0) * 100),
      accessibility: Math.round((categories.accessibility?.score || 0) * 100),
      bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
      seo: Math.round((categories.seo?.score || 0) * 100),
      pwa: Math.round((categories.pwa?.score || 0) * 100),
    };

    // Extract Core Web Vitals
    const coreWebVitals: CoreWebVitals = {
      LCP: audits['largest-contentful-paint']?.numericValue || 0,
      FID: audits['max-potential-fid']?.numericValue || 0,
      CLS: audits['cumulative-layout-shift']?.numericValue || 0,
      FCP: audits['first-contentful-paint']?.numericValue || 0,
      TTI: audits['interactive']?.numericValue || 0,
      TBT: audits['total-blocking-time']?.numericValue || 0,
      SI: audits['speed-index']?.numericValue || 0,
    };

    // Extract recommendations (failed or warning audits)
    const recommendations: PerformanceRecommendation[] = [];
    
    for (const [id, audit] of Object.entries(audits) as [string, any][]) {
      if (audit.score !== null && audit.score < 0.9) {
        recommendations.push({
          id,
          title: audit.title,
          description: audit.description,
          score: Math.round((audit.score || 0) * 100),
          displayValue: audit.displayValue,
          numericValue: audit.numericValue,
          numericUnit: audit.numericUnit,
          details: audit.details,
        });
      }
    }

    // Sort recommendations by score (worst first)
    recommendations.sort((a, b) => a.score - b.score);

    // Determine if passed (performance score >= 90)
    const passed = scores.performance >= 90;

    return {
      url,
      timestamp: new Date(),
      scores,
      coreWebVitals,
      recommendations,
      passed,
      rawReport,
    };
  }

  /**
   * Measure Core Web Vitals specifically
   */
  async measureCoreWebVitals(url: string): Promise<CoreWebVitals> {
    const report = await this.runAudit(url, {
      onlyCategories: ['performance'],
    });

    return report.coreWebVitals;
  }

  /**
   * Get performance scores
   */
  async getPerformanceScores(url: string): Promise<PerformanceScores> {
    const report = await this.runAudit(url);
    return report.scores;
  }

  /**
   * Get performance recommendations
   */
  async getRecommendations(url: string): Promise<PerformanceRecommendation[]> {
    const report = await this.runAudit(url);
    return report.recommendations;
  }

  /**
   * Run audit on multiple pages
   */
  async runMultipleAudits(
    urls: string[],
    options?: LighthouseOptions
  ): Promise<PerformanceReport[]> {
    const reports: PerformanceReport[] = [];

    for (const url of urls) {
      try {
        const report = await this.runAudit(url, options);
        reports.push(report);
      } catch (error: any) {
        console.error(`Failed to audit ${url}:`, error.message);
        // Continue with other URLs
      }
    }

    return reports;
  }

  /**
   * Add report to performance history
   */
  private async addToHistory(report: PerformanceReport): Promise<void> {
    let history = this.history.get(report.url);

    if (!history) {
      history = {
        url: report.url,
        reports: [],
        trend: {
          performance: [],
          LCP: [],
          FID: [],
          CLS: [],
        },
      };
      this.history.set(report.url, history);
    }

    // Add report
    history.reports.push(report);

    // Update trends (keep last 30 reports)
    if (history.reports.length > 30) {
      history.reports = history.reports.slice(-30);
    }

    history.trend.performance = history.reports.map(r => r.scores.performance);
    history.trend.LCP = history.reports.map(r => r.coreWebVitals.LCP);
    history.trend.FID = history.reports.map(r => r.coreWebVitals.FID);
    history.trend.CLS = history.reports.map(r => r.coreWebVitals.CLS);

    // Save to disk
    await this.saveHistory();
  }

  /**
   * Get performance history for a URL
   */
  getHistory(url: string): PerformanceHistory | undefined {
    return this.history.get(url);
  }

  /**
   * Get all performance history
   */
  getAllHistory(): PerformanceHistory[] {
    return Array.from(this.history.values());
  }

  /**
   * Get performance trend for a URL
   */
  getTrend(url: string): PerformanceHistory['trend'] | undefined {
    return this.history.get(url)?.trend;
  }

  /**
   * Compare two reports
   */
  compareReports(
    baseline: PerformanceReport,
    current: PerformanceReport
  ): {
    scores: { [key: string]: number };
    coreWebVitals: { [key: string]: number };
    improved: boolean;
  } {
    const scoreDiff = {
      performance: current.scores.performance - baseline.scores.performance,
      accessibility: current.scores.accessibility - baseline.scores.accessibility,
      bestPractices: current.scores.bestPractices - baseline.scores.bestPractices,
      seo: current.scores.seo - baseline.scores.seo,
    };

    const vitalsDiff = {
      LCP: current.coreWebVitals.LCP - baseline.coreWebVitals.LCP,
      FID: current.coreWebVitals.FID - baseline.coreWebVitals.FID,
      CLS: current.coreWebVitals.CLS - baseline.coreWebVitals.CLS,
      FCP: current.coreWebVitals.FCP - baseline.coreWebVitals.FCP,
      TTI: current.coreWebVitals.TTI - baseline.coreWebVitals.TTI,
    };

    // Consider improved if performance score increased or stayed same
    // and Core Web Vitals didn't regress significantly
    const improved = 
      scoreDiff.performance >= 0 &&
      vitalsDiff.LCP <= 200 && // Allow 200ms regression
      vitalsDiff.CLS <= 0.05;  // Allow 0.05 CLS regression

    return {
      scores: scoreDiff,
      coreWebVitals: vitalsDiff,
      improved,
    };
  }

  /**
   * Generate HTML report
   */
  async generateHTMLReport(
    report: PerformanceReport,
    outputPath: string
  ): Promise<void> {
    const html = this.generateReportHTML(report);
    await fs.writeFile(outputPath, html, 'utf-8');
  }

  /**
   * Generate HTML content for report
   */
  private generateReportHTML(report: PerformanceReport): string {
    const { scores, coreWebVitals, recommendations } = report;

    const getScoreColor = (score: number) => {
      if (score >= 90) return '#0cce6b';
      if (score >= 50) return '#ffa400';
      return '#ff4e42';
    };

    const getVitalStatus = (metric: string, value: number) => {
      const thresholds: { [key: string]: { good: number; poor: number } } = {
        LCP: { good: 2500, poor: 4000 },
        FID: { good: 100, poor: 300 },
        CLS: { good: 0.1, poor: 0.25 },
        FCP: { good: 1800, poor: 3000 },
        TTI: { good: 3800, poor: 7300 },
      };

      const threshold = thresholds[metric];
      if (!threshold) return 'unknown';

      if (value <= threshold.good) return 'good';
      if (value <= threshold.poor) return 'needs-improvement';
      return 'poor';
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Performance Report - ${report.url}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    .header {
      background: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 { font-size: 24px; margin-bottom: 10px; }
    .url { color: #666; font-size: 14px; }
    .timestamp { color: #999; font-size: 12px; margin-top: 5px; }
    
    .scores {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .score-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }
    .score-value {
      font-size: 48px;
      font-weight: bold;
      margin: 10px 0;
    }
    .score-label {
      color: #666;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .vitals {
      background: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h2 { font-size: 20px; margin-bottom: 20px; }
    .vital-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 0;
      border-bottom: 1px solid #eee;
    }
    .vital-item:last-child { border-bottom: none; }
    .vital-name { font-weight: 500; }
    .vital-value {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .vital-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .vital-badge.good { background: #0cce6b; color: white; }
    .vital-badge.needs-improvement { background: #ffa400; color: white; }
    .vital-badge.poor { background: #ff4e42; color: white; }
    
    .recommendations {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .recommendation {
      padding: 20px 0;
      border-bottom: 1px solid #eee;
    }
    .recommendation:last-child { border-bottom: none; }
    .recommendation-title {
      font-weight: 500;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .recommendation-score {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      color: white;
    }
    .recommendation-description {
      color: #666;
      font-size: 14px;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Performance Report</h1>
      <div class="url">${report.url}</div>
      <div class="timestamp">${report.timestamp.toLocaleString()}</div>
    </div>
    
    <div class="scores">
      ${Object.entries(scores).map(([key, value]) => `
        <div class="score-card">
          <div class="score-label">${key}</div>
          <div class="score-value" style="color: ${getScoreColor(value)}">${value}</div>
        </div>
      `).join('')}
    </div>
    
    <div class="vitals">
      <h2>Core Web Vitals</h2>
      ${Object.entries(coreWebVitals).map(([key, value]) => {
        const status = getVitalStatus(key, value);
        const displayValue = key === 'CLS' 
          ? value.toFixed(3) 
          : `${Math.round(value)}ms`;
        
        return `
          <div class="vital-item">
            <div class="vital-name">${key}</div>
            <div class="vital-value">
              <span>${displayValue}</span>
              <span class="vital-badge ${status}">${status.replace('-', ' ')}</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
    
    <div class="recommendations">
      <h2>Recommendations (${recommendations.length})</h2>
      ${recommendations.slice(0, 10).map(rec => `
        <div class="recommendation">
          <div class="recommendation-title">
            <span class="recommendation-score" style="background: ${getScoreColor(rec.score)}">${rec.score}</span>
            <span>${rec.title}</span>
          </div>
          <div class="recommendation-description">${rec.description}</div>
          ${rec.displayValue ? `<div style="margin-top: 5px; font-size: 13px; color: #999;">${rec.displayValue}</div>` : ''}
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Load performance history from disk
   */
  private async loadHistory(): Promise<void> {
    try {
      const content = await fs.readFile(this.historyPath, 'utf-8');
      const data = JSON.parse(content);
      
      this.history = new Map(
        data.map((h: PerformanceHistory) => [h.url, h])
      );
    } catch {
      // No history file yet
      this.history = new Map();
    }
  }

  /**
   * Save performance history to disk
   */
  private async saveHistory(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.historyPath), { recursive: true });
      
      const data = Array.from(this.history.values());
      await fs.writeFile(
        this.historyPath,
        JSON.stringify(data, null, 2),
        'utf-8'
      );
    } catch (error: any) {
      console.error('Failed to save performance history:', error.message);
    }
  }

  /**
   * Clear history for a URL
   */
  async clearHistory(url: string): Promise<void> {
    this.history.delete(url);
    await this.saveHistory();
  }

  /**
   * Clear all history
   */
  async clearAllHistory(): Promise<void> {
    this.history.clear();
    await this.saveHistory();
  }
}
