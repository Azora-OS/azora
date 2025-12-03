import { logger } from './logger';

interface TaskMetrics {
  taskId: string;
  agentId?: string;
  status: string;
  duration?: number;
  createdAt: number;
  completedAt?: number;
  constitutionalScore?: number;
}

export class TaskAnalytics {
  private metrics: TaskMetrics[] = [];

  recordTask(metric: TaskMetrics): void {
    this.metrics.push(metric);
    if (this.metrics.length > 10000) {
      this.metrics = this.metrics.slice(-5000);
    }
  }

  getReport(timeRangeMs = 86400000): {
    total: number;
    completed: number;
    failed: number;
    avgDuration: number;
    avgConstitutionalScore: number;
    byAgent: Record<string, number>;
  } {
    const cutoff = Date.now() - timeRangeMs;
    const recent = this.metrics.filter(m => m.createdAt >= cutoff);

    const completed = recent.filter(m => m.status === 'completed');
    const failed = recent.filter(m => m.status === 'failed');
    
    const durations = completed.filter(m => m.duration).map(m => m.duration!);
    const avgDuration = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

    const scores = recent.filter(m => m.constitutionalScore).map(m => m.constitutionalScore!);
    const avgConstitutionalScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    const byAgent: Record<string, number> = {};
    for (const m of recent) {
      if (m.agentId) {
        byAgent[m.agentId] = (byAgent[m.agentId] ?? 0) + 1;
      }
    }

    return {
      total: recent.length,
      completed: completed.length,
      failed: failed.length,
      avgDuration,
      avgConstitutionalScore,
      byAgent
    };
  }

  getAgentPerformance(agentId: string): {
    totalTasks: number;
    successRate: number;
    avgDuration: number;
    avgConstitutionalScore: number;
  } {
    const agentMetrics = this.metrics.filter(m => m.agentId === agentId);
    const completed = agentMetrics.filter(m => m.status === 'completed');
    const successRate = agentMetrics.length ? (completed.length / agentMetrics.length) * 100 : 0;

    const durations = completed.filter(m => m.duration).map(m => m.duration!);
    const avgDuration = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

    const scores = agentMetrics.filter(m => m.constitutionalScore).map(m => m.constitutionalScore!);
    const avgConstitutionalScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    return {
      totalTasks: agentMetrics.length,
      successRate,
      avgDuration,
      avgConstitutionalScore
    };
  }
}
