import { PredictedQA } from './types';

interface RetentionMetrics {
    query: string;
    frequency: number;
    lastAsked: Date;
    firstAsked: Date;
    promoted: boolean;
}

export class KnowledgeRetentionFilter {
    private metrics: Map<string, RetentionMetrics> = new Map();
    private readonly FREQUENCY_THRESHOLD = 10; // Promote after 10 asks
    private readonly TIME_WINDOW_DAYS = 7; // Within 7 days

    /**
     * Track a query and determine if it should be promoted
     */
    trackQuery(query: string): boolean {
        const normalizedQuery = query.toLowerCase().trim();
        let metric = this.metrics.get(normalizedQuery);

        if (!metric) {
            metric = {
                query: normalizedQuery,
                frequency: 0,
                lastAsked: new Date(),
                firstAsked: new Date(),
                promoted: false
            };
            this.metrics.set(normalizedQuery, metric);
        }

        metric.frequency++;
        metric.lastAsked = new Date();

        return this.shouldPromote(metric);
    }

    /**
     * Check if a metric meets promotion criteria
     */
    private shouldPromote(metric: RetentionMetrics): boolean {
        if (metric.promoted) return false;

        const daysSinceFirstAsk = (new Date().getTime() - metric.firstAsked.getTime()) / (1000 * 60 * 60 * 24);

        // Logic: High frequency within time window
        if (metric.frequency >= this.FREQUENCY_THRESHOLD && daysSinceFirstAsk <= this.TIME_WINDOW_DAYS) {
            metric.promoted = true;
            return true;
        }

        return false;
    }

    /**
     * Get candidates for promotion
     */
    getPromotionCandidates(): string[] {
        return Array.from(this.metrics.values())
            .filter(m => !m.promoted && m.frequency >= this.FREQUENCY_THRESHOLD)
            .map(m => m.query);
    }
}
