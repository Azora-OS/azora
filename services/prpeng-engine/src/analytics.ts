import { PrPEngMetrics } from './types';

export class AnalyticsManager {
    private metrics: PrPEngMetrics = {
        predictionsGenerated: 0,
        cacheHits: 0,
        cacheMisses: 0,
        apiCallsSaved: 0,
        averageConfidence: 0,
        topPredictedTopics: []
    };

    private readonly COST_PER_API_CALL = 0.001; // $0.001 per call estimate

    /**
     * Track a cache hit
     */
    trackCacheHit(): void {
        this.metrics.cacheHits++;
        this.metrics.apiCallsSaved++;
    }

    /**
     * Track a cache miss
     */
    trackCacheMiss(): void {
        this.metrics.cacheMisses++;
    }

    /**
     * Track generated predictions
     */
    trackPredictions(count: number, averageConfidence: number): void {
        this.metrics.predictionsGenerated += count;

        // Update moving average of confidence
        const totalPredictions = this.metrics.predictionsGenerated;
        const currentAvg = this.metrics.averageConfidence;
        this.metrics.averageConfidence = ((currentAvg * (totalPredictions - count)) + (averageConfidence * count)) / totalPredictions;
    }

    /**
     * Calculate total cost savings
     */
    calculateSavings(): number {
        return this.metrics.apiCallsSaved * this.COST_PER_API_CALL;
    }

    /**
     * Get current metrics
     */
    getMetrics(): PrPEngMetrics {
        return { ...this.metrics };
    }

    /**
     * Get hit rate percentage
     */
    getHitRate(): number {
        const total = this.metrics.cacheHits + this.metrics.cacheMisses;
        if (total === 0) return 0;
        return (this.metrics.cacheHits / total) * 100;
    }
}
