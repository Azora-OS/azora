import { AIQuery, AIResponse, IHierarchicalRouter, QueryClassificationResult, RoutingTier, AIRoutingConfig, RoutingMetricsData, QueryComplexity } from './types';

export class HierarchicalRouter implements IHierarchicalRouter {
    private config: AIRoutingConfig;

    constructor(config: AIRoutingConfig, ...args: any[]) {
        this.config = config;
    }

    async route(query: AIQuery): Promise<AIResponse> {
        // Community Edition: Simple routing only
        // 1. Try Local LLM (Stubbed)
        // 2. Fallback to External LLM (Direct)

        console.log('[Community Edition] Routing query:', query.query);

        // Simulate External LLM call
        return {
            id: `response-${Date.now()}`,
            content: `[Community Edition] Response to: ${query.query}`,
            routingTier: RoutingTier.EXTERNAL_LLM,
            responseTime: 100,
            cost: 0,
            cached: false,
            metadata: {
                edition: 'community',
                note: 'Advanced routing (RAP/PrPEng) is disabled.'
            }
        };
    }

    async classify(query: AIQuery): Promise<QueryClassificationResult> {
        return {
            id: `class-${Date.now()}`,
            query: query.query,
            classifiedAs: QueryComplexity.SIMPLE,
            confidence: 1.0,
            routedTo: RoutingTier.EXTERNAL_LLM,
            reasoning: 'Community Edition defaults to External LLM'
        };
    }

    async getMetrics(): Promise<Record<RoutingTier, RoutingMetricsData>> {
        const emptyMetrics: RoutingMetricsData = {
            routingTier: RoutingTier.LOCAL_LLM,
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            averageCost: 0,
            cacheHits: 0,
            cacheMisses: 0,
            cacheHitRate: 0,
            successRate: 0,
            lastUpdated: new Date()
        };

        return {
            [RoutingTier.LOCAL_LLM]: { ...emptyMetrics },
            [RoutingTier.RAP_SYSTEM]: { ...emptyMetrics, routingTier: RoutingTier.RAP_SYSTEM },
            [RoutingTier.EXTERNAL_LLM]: { ...emptyMetrics, routingTier: RoutingTier.EXTERNAL_LLM }
        };
    }
}
