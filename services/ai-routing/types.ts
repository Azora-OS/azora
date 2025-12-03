/**
 * AI Routing System - Type Definitions
 * Interfaces for query classification, routing decisions, and metrics
 */

export enum QueryComplexity {
    SIMPLE = 'SIMPLE',
    MODERATE = 'MODERATE',
    COMPLEX = 'COMPLEX'
}

export enum RoutingTier {
    LOCAL_LLM = 'LOCAL_LLM',
    RAP_SYSTEM = 'RAP_SYSTEM',
    EXTERNAL_LLM = 'EXTERNAL_LLM'
}

export interface AIQuery {
    id?: string;
    query: string;
    userId?: string;
    context?: Record<string, any>;
    metadata?: Record<string, any>;
}

export interface QueryClassificationResult {
    id: string;
    query: string;
    classifiedAs: QueryComplexity;
    confidence: number;
    routedTo: RoutingTier;
    reasoning?: string;
    metadata?: Record<string, any>;
}

export interface RoutingDecision {
    tier: RoutingTier;
    confidence: number;
    estimatedCost: number;
    estimatedLatency: number;
    fallbackTier?: RoutingTier;
    reason: string;
}

export interface AIResponse {
    id: string;
    content: string;
    routingTier: RoutingTier;
    responseTime: number;
    cost: number;
    cached: boolean;
    metadata?: Record<string, any>;
}

export interface RoutingMetricsData {
    routingTier: RoutingTier;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    averageCost: number;
    cacheHits: number;
    cacheMisses: number;
    cacheHitRate: number;
    successRate: number;
    lastUpdated: Date;
}

export interface AIRoutingConfig {
    localLLMEnabled: boolean;
    localLLMModel: string;
    localLLMQuantization: string;
    rapEnabled: boolean;
    knowledgeOceanUrl: string;
    internalSourceWeight: number;
    externalSourceWeight: number;
    externalLLMEnabled: boolean;
    externalLLMProvider: string;
    externalLLMModel: string;
    cacheEnabled: boolean;
    cacheTTL: number;
    cacheMaxSize: number;
    costTrackingEnabled: boolean;
    costThreshold: number;
    latencyThreshold: number;
    fallbackOnLatency: boolean;
    redisUrl: string;
    redisKeyPrefix: string;
}

export interface IHierarchicalRouter {
    route(query: AIQuery): Promise<AIResponse>;
    classify(query: AIQuery): Promise<QueryClassificationResult>;
    getMetrics(): Promise<Record<RoutingTier, RoutingMetricsData>>;
}
