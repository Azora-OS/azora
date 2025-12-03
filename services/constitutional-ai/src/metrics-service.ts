import { ConstitutionalEngine } from './constitutional-engine';

export interface ConstitutionalMetrics {
    alignmentScore: number; // 0-100: Adherence to ethical guidelines
    truthScore: number;     // 0-100: Accuracy and hallucination resistance
    ubuntuScore: number;    // 0-100: Community health and positive interactions
    timestamp: string;
}

export class ConstitutionalMetricsService {
    private engine: ConstitutionalEngine;

    // In-memory storage for demo purposes. In prod, this would be Redis/Prometheus.
    private metricsHistory: ConstitutionalMetrics[] = [];

    // Simulated counters
    private ethicsChecksPassed = 0;
    private ethicsChecksTotal = 0;

    private accurateResponses = 0;
    private totalResponses = 0;

    private positiveInteractions = 0;
    private totalInteractions = 0;

    constructor() {
        this.engine = new ConstitutionalEngine();
        // Initialize with some baseline data for the "Genesis" feel
        this.seedInitialData();
    }

    private seedInitialData() {
        this.ethicsChecksPassed = 48;
        this.ethicsChecksTotal = 50;

        this.accurateResponses = 142;
        this.totalResponses = 150;

        this.positiveInteractions = 89;
        this.totalInteractions = 100;
    }

    public recordEthicsCheck(passed: boolean) {
        this.ethicsChecksTotal++;
        if (passed) this.ethicsChecksPassed++;
    }

    public recordTutorFeedback(accurate: boolean) {
        this.totalResponses++;
        if (accurate) this.accurateResponses++;
    }

    public recordInteraction(positive: boolean) {
        this.totalInteractions++;
        if (positive) this.positiveInteractions++;
    }

    public calculateMetrics(): ConstitutionalMetrics {
        const alignmentScore = this.ethicsChecksTotal === 0 ? 100 : (this.ethicsChecksPassed / this.ethicsChecksTotal) * 100;
        const truthScore = this.totalResponses === 0 ? 100 : (this.accurateResponses / this.totalResponses) * 100;
        const ubuntuScore = this.totalInteractions === 0 ? 100 : (this.positiveInteractions / this.totalInteractions) * 100;

        const metrics = {
            alignmentScore: Math.round(alignmentScore * 10) / 10,
            truthScore: Math.round(truthScore * 10) / 10,
            ubuntuScore: Math.round(ubuntuScore * 10) / 10,
            timestamp: new Date().toISOString()
        };

        this.metricsHistory.push(metrics);
        return metrics;
    }

    public getLatestMetrics(): ConstitutionalMetrics {
        return this.calculateMetrics();
    }

    public getMetricsHistory(): ConstitutionalMetrics[] {
        return this.metricsHistory;
    }
}
