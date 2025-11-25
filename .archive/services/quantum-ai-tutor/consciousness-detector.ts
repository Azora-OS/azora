interface InteractionMetrics {
  keystrokePattern: number[];
  pauseDurations: number[];
  errorRate: number;
  scrollBehavior: number;
  focusTime: number;
}

export interface ConsciousnessState {
  engagementLevel: number;
  cognitiveLoad: number;
  frustrationIndex: number;
  confidenceScore: number;
  predictedOutcome: number;
}

export class ConsciousnessDetector {
  private baselineMetrics = new Map<string, InteractionMetrics>();

  analyzeState(studentId: string, metrics: InteractionMetrics): ConsciousnessState {
    const baseline = this.baselineMetrics.get(studentId);
    
    const engagement = this.calculateEngagement(metrics);
    const cognitiveLoad = this.calculateCognitiveLoad(metrics);
    const frustration = this.detectFrustration(metrics, baseline);
    const confidence = this.assessConfidence(metrics);
    
    return {
      engagementLevel: engagement,
      cognitiveLoad,
      frustrationIndex: frustration,
      confidenceScore: confidence,
      predictedOutcome: this.predictOutcome(engagement, cognitiveLoad, frustration, confidence)
    };
  }

  private calculateEngagement(metrics: InteractionMetrics): number {
    const activeTime = metrics.focusTime / (Date.now() / 1000);
    const interactionRate = metrics.keystrokePattern.length / metrics.focusTime;
    return Math.min(100, (activeTime * 50 + interactionRate * 10) * 100);
  }

  private calculateCognitiveLoad(metrics: InteractionMetrics): number {
    const avgPause = metrics.pauseDurations.reduce((a, b) => a + b, 0) / metrics.pauseDurations.length;
    const errorImpact = metrics.errorRate * 20;
    return Math.min(100, avgPause / 10 + errorImpact);
  }

  private detectFrustration(metrics: InteractionMetrics, baseline?: InteractionMetrics): number {
    if (!baseline) return 0;
    
    const errorIncrease = (metrics.errorRate - baseline.errorRate) * 30;
    const rapidActions = metrics.keystrokePattern.filter(k => k < 50).length / metrics.keystrokePattern.length * 40;
    
    return Math.min(100, errorIncrease + rapidActions);
  }

  private assessConfidence(metrics: InteractionMetrics): number {
    const steadyPacing = 100 - (this.calculateVariance(metrics.keystrokePattern) / 10);
    const lowErrors = (1 - metrics.errorRate) * 100;
    return (steadyPacing + lowErrors) / 2;
  }

  private predictOutcome(engagement: number, load: number, frustration: number, confidence: number): number {
    return (engagement * 0.3 + (100 - load) * 0.2 + (100 - frustration) * 0.2 + confidence * 0.3);
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  updateBaseline(studentId: string, metrics: InteractionMetrics): void {
    this.baselineMetrics.set(studentId, metrics);
  }
}
