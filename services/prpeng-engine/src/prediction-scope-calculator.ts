import { PrPEngConfig, TopicAnalysis } from './types';

export class PredictionScopeCalculator {
    private config: PrPEngConfig;

    constructor(config: PrPEngConfig) {
        this.config = config;
    }

    /**
     * Calculate the optimal prediction scope and count
     */
    calculate(analysis: TopicAnalysis, userTier: string = 'free'): Partial<PrPEngConfig> {
        let scope: 'narrow' | 'medium' | 'wide' = this.config.predictionScope;
        let count = this.config.predictionsPerQuery;

        // Adjust based on complexity
        if (analysis.complexity === 'beginner') {
            // Beginners need broad context but less depth
            scope = 'wide';
            count = Math.min(count, 10);
        } else if (analysis.complexity === 'advanced') {
            // Experts need specific, deep follow-ups
            scope = 'narrow';
            count = Math.max(count, 20);
        }

        // Adjust based on intent
        if (analysis.intent === 'problem-solving') {
            // Focus on solutions, not theory
            scope = 'narrow';
        } else if (analysis.intent === 'exploration') {
            // Broad exploration
            scope = 'wide';
        }

        // Adjust based on user tier (example logic)
        if (userTier === 'premium' || userTier === 'enterprise') {
            count = Math.floor(count * 1.5); // 50% more predictions for premium users
        }

        return {
            predictionScope: scope,
            predictionsPerQuery: count
        };
    }
}
