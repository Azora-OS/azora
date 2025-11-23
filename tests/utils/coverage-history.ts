import * as fs from 'fs';
import * as path from 'path';
import { CoverageData, ServiceCoverage } from './coverage';

export interface CoverageHistoryEntry {
  timestamp: Date;
  coverage: CoverageData;
  commit?: string;
  branch?: string;
}

export interface CoverageTrend {
  metric: 'lines' | 'statements' | 'functions' | 'branches';
  trend: 'increasing' | 'decreasing' | 'stable';
  change: number;
  history: number[];
}

export class CoverageHistoryStorage {
  private historyFile: string;

  constructor(historyFile: string = './tests/coverage/history.json') {
    this.historyFile = historyFile;
    this.ensureHistoryFile();
  }

  private ensureHistoryFile(): void {
    const dir = path.dirname(this.historyFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(this.historyFile)) {
      fs.writeFileSync(this.historyFile, JSON.stringify([], null, 2));
    }
  }

  async saveEntry(entry: CoverageHistoryEntry): Promise<void> {
    const history = await this.loadHistory();
    history.push({
      ...entry,
      timestamp: entry.timestamp.toISOString(),
    });

    // Keep only last 100 entries
    const trimmedHistory = history.slice(-100);

    fs.writeFileSync(this.historyFile, JSON.stringify(trimmedHistory, null, 2));
  }

  async loadHistory(): Promise<any[]> {
    const data = fs.readFileSync(this.historyFile, 'utf-8');
    return JSON.parse(data);
  }

  async getLatestEntry(): Promise<CoverageHistoryEntry | null> {
    const history = await this.loadHistory();

    if (history.length === 0) {
      return null;
    }

    const latest = history[history.length - 1];
    return {
      ...latest,
      timestamp: new Date(latest.timestamp),
    };
  }

  async getEntriesSince(date: Date): Promise<CoverageHistoryEntry[]> {
    const history = await this.loadHistory();

    return history
      .filter(entry => new Date(entry.timestamp) >= date)
      .map(entry => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
      }));
  }
}

export class CoverageTrendAnalyzer {
  analyzeTrend(history: CoverageHistoryEntry[], metric: 'lines' | 'statements' | 'functions' | 'branches'): CoverageTrend {
    const values = history.map(entry => entry.coverage[metric].pct);

    if (values.length < 2) {
      return {
        metric,
        trend: 'stable',
        change: 0,
        history: values,
      };
    }

    const recent = values.slice(-5);
    const average = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const previousAverage = values.slice(-10, -5).reduce((sum, val) => sum + val, 0) / Math.min(5, values.length - 5);

    const change = average - previousAverage;

    let trend: 'increasing' | 'decreasing' | 'stable';
    if (Math.abs(change) < 0.5) {
      trend = 'stable';
    } else if (change > 0) {
      trend = 'increasing';
    } else {
      trend = 'decreasing';
    }

    return {
      metric,
      trend,
      change,
      history: values,
    };
  }

  calculateDelta(current: CoverageData, previous: CoverageData): {
    lines: number;
    statements: number;
    functions: number;
    branches: number;
  } {
    return {
      lines: current.lines.pct - previous.lines.pct,
      statements: current.statements.pct - previous.statements.pct,
      functions: current.functions.pct - previous.functions.pct,
      branches: current.branches.pct - previous.branches.pct,
    };
  }

  generateTrendReport(trends: CoverageTrend[]): string {
    const lines = [
      'Coverage Trend Analysis',
      '======================',
      '',
    ];

    trends.forEach(trend => {
      const emoji = trend.trend === 'increasing' ? '📈' : trend.trend === 'decreasing' ? '📉' : '➡️';
      lines.push(`${emoji} ${trend.metric}: ${trend.trend} (${trend.change >= 0 ? '+' : ''}${trend.change.toFixed(2)}%)`);
    });

    return lines.join('\n');
  }
}

export class CoverageVisualizationDataGenerator {
  generateChartData(history: CoverageHistoryEntry[]): {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
    }[];
  } {
    const labels = history.map(entry => 
      new Date(entry.timestamp).toLocaleDateString()
    );

    return {
      labels,
      datasets: [
        {
          label: 'Lines',
          data: history.map(entry => entry.coverage.lines.pct),
        },
        {
          label: 'Statements',
          data: history.map(entry => entry.coverage.statements.pct),
        },
        {
          label: 'Functions',
          data: history.map(entry => entry.coverage.functions.pct),
        },
        {
          label: 'Branches',
          data: history.map(entry => entry.coverage.branches.pct),
        },
      ],
    };
  }

  generateMarkdownChart(history: CoverageHistoryEntry[]): string {
    const lines = [
      '## Coverage Trend',
      '',
      '```',
    ];

    const maxValue = 100;
    const chartHeight = 10;

    const recentHistory = history.slice(-20);
    const linesCoverage = recentHistory.map(e => e.coverage.lines.pct);

    for (let i = chartHeight; i >= 0; i--) {
      const threshold = (i / chartHeight) * maxValue;
      let line = `${threshold.toFixed(0).padStart(3)}% |`;

      linesCoverage.forEach(value => {
        line += value >= threshold ? '█' : ' ';
      });

      lines.push(line);
    }

    lines.push('     +' + '-'.repeat(linesCoverage.length));
    lines.push('```');

    return lines.join('\n');
  }
}
