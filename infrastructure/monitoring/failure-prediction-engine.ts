interface Metric {
  timestamp: number;
  cpu: number;
  memory: number;
  latency: number;
  errors: number;
}

class FailurePredictor {
  private history = new Map<string, Metric[]>();
  private readonly WINDOW = 100;
  private readonly THRESHOLDS = { cpu: 85, memory: 90, latency: 1000, errors: 50 };

  record(serviceId: string, metric: Omit<Metric, 'timestamp'>): void {
    const metrics = this.history.get(serviceId) || [];
    metrics.push({ ...metric, timestamp: Date.now() });
    
    if (metrics.length > this.WINDOW) {metrics.shift();}
    this.history.set(serviceId, metrics);
  }

  predict(serviceId: string): { risk: number; reasons: string[] } {
    const metrics = this.history.get(serviceId);
    if (!metrics || metrics.length < 10) {return { risk: 0, reasons: [] };}

    const recent = metrics.slice(-10);
    const reasons: string[] = [];
    let risk = 0;

    const cpuTrend = this.calculateTrend(recent.map(m => m.cpu));
    if (cpuTrend > 5 && recent[recent.length - 1].cpu > this.THRESHOLDS.cpu) {
      risk += 30;
      reasons.push('CPU spike detected');
    }

    const memTrend = this.calculateTrend(recent.map(m => m.memory));
    if (memTrend > 3 && recent[recent.length - 1].memory > this.THRESHOLDS.memory) {
      risk += 35;
      reasons.push('Memory leak suspected');
    }

    const latencyTrend = this.calculateTrend(recent.map(m => m.latency));
    if (latencyTrend > 50 && recent[recent.length - 1].latency > this.THRESHOLDS.latency) {
      risk += 25;
      reasons.push('Latency degradation');
    }

    const errorRate = recent.reduce((s, m) => s + m.errors, 0) / recent.length;
    if (errorRate > this.THRESHOLDS.errors) {
      risk += 40;
      reasons.push('High error rate');
    }

    return { risk: Math.min(risk, 100), reasons };
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) {return 0;}
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  getAlert(serviceId: string): string | null {
    const { risk, reasons } = this.predict(serviceId);
    if (risk > 70) {return `CRITICAL: ${reasons.join(', ')} (${risk}% failure risk)`;}
    if (risk > 40) {return `WARNING: ${reasons.join(', ')} (${risk}% failure risk)`;}
    return null;
  }
}

export const predictor = new FailurePredictor();
