/**
 * AI Routing System - Type Definitions
 * Interfaces for query classification, routing decisions, and metrics
 */

/**
 * Query complexity levels for routing decisions
 */
export enum QueryComplexity {
  SIMPLE = 'SIMPLE',
  MODERATE = 'MODERATE',
  COMPLEX = 'COMPLEX'
}

/**
 * Routing tiers for different processing strategies
 */
export enum RoutingTier {
  LOCAL_LLM = 'LOCAL_LLM',      // Quantized Llama/Phi on-device
  RAP_SYSTEM = 'RAP_SYSTEM',    // Retrieval-Augmented Prompt with Knowledge Ocean
  EXTERNAL_LLM = 'EXTERNAL_LLM' // OpenAI GPT-4 or similar
}

/**
 * Incoming query from user
 */
export interface AIQuery {
  id?: string;
  query: string;
  userId?: string;
  context?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Query classification result
 */
export interface QueryClassificationResult {
  id: string;
  query: string;
  classifiedAs: QueryComplexity;
  confidence: number; // 0.0 to 1.0
  routedTo: RoutingTier;
  reasoning?: string;
  metadata?: Record<string, any>;
}

/**
 * Routing decision with metrics
 */
export interface RoutingDecision {
  tier: RoutingTier;
  confidence: number;
  estimatedCost: number;
  estimatedLatency: number;
  fallbackTier?: RoutingTier;
  reason: string;
}

/**
 * AI response with routing metadata
 */
export interface AIResponse {
  id: string;
  content: string;
  routingTier: RoutingTier;
  responseTime: number; // milliseconds
  cost: number;
  cached: boolean;
  metadata?: Record<string, any>;
}

/**
 * Routing metrics for a specific tier
 */
export interface RoutingMetricsData {
  routingTier: RoutingTier;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number; // milliseconds
  averageCost: number;
  cacheHits: number;
  cacheMisses: number;
  cacheHitRate: number; // percentage
  successRate: number; // percentage
  lastUpdated: Date;
}

/**
 * Cache entry for routing decisions and responses
 */
export interface CacheEntry {
  id: string;
  queryHash: string;
  query: string;
  response: string;
  routingTier: RoutingTier;
  cost: number;
  ttl: number; // seconds
  expiresAt: Date;
  hitCount: number;
}

/**
 * Query classifier interface
 */
export interface IQueryClassifier {
  classify(query: AIQuery): Promise<QueryClassificationResult>;
  getClassificationMetrics(): Promise<Record<QueryComplexity, number>>;
}

/**
 * Routing decision maker interface
 */
export interface IRoutingDecisionMaker {
  makeDecision(classification: QueryClassificationResult): Promise<RoutingDecision>;
  updateMetrics(tier: RoutingTier, success: boolean, responseTime: number, cost: number): Promise<void>;
  getMetrics(tier: RoutingTier): Promise<RoutingMetricsData>;
}

/**
 * Cache manager interface
 */
export interface ICacheManager {
  get(queryHash: string): Promise<CacheEntry | null>;
  set(entry: CacheEntry): Promise<void>;
  delete(queryHash: string): Promise<void>;
  clear(): Promise<void>;
  getStats(): Promise<{ hits: number; misses: number; size: number }>;
}

/**
 * Cost optimizer interface
 */
export interface ICostOptimizer {
  calculateCost(tier: RoutingTier, queryLength: number): Promise<number>;
  trackSpending(tier: RoutingTier, cost: number): Promise<void>;
  getSpendingMetrics(): Promise<Record<RoutingTier, number>>;
  shouldFallback(tier: RoutingTier, cost: number): Promise<boolean>;
}

/**
 * Hierarchical router interface
 */
export interface IHierarchicalRouter {
  route(query: AIQuery): Promise<AIResponse>;
  classify(query: AIQuery): Promise<QueryClassificationResult>;
  getMetrics(): Promise<Record<RoutingTier, RoutingMetricsData>>;
}

/**
 * Configuration for AI routing system
 */
export interface AIRoutingConfig {
  // Local LLM settings
  localLLMEnabled: boolean;
  localLLMModel: string; // 'llama' or 'phi'
  localLLMQuantization: string; // 'q4', 'q5', 'q8'
  
  // RAP system settings
  rapEnabled: boolean;
  knowledgeOceanUrl: string;
  internalSourceWeight: number; // 0.7 for 70%
  externalSourceWeight: number; // 0.3 for 30%
  
  // External LLM settings
  externalLLMEnabled: boolean;
  externalLLMProvider: string; // 'openai', 'anthropic'
  externalLLMModel: string;
  
  // Cache settings
  cacheEnabled: boolean;
  cacheTTL: number; // seconds
  cacheMaxSize: number; // entries
  
  // Cost settings
  costTrackingEnabled: boolean;
  costThreshold: number; // maximum cost per query
  
  // Latency settings
  latencyThreshold: number; // milliseconds
  fallbackOnLatency: boolean;
  
  // Redis settings
  redisUrl: string;
  redisKeyPrefix: string;
}

/**
 * Classification confidence thresholds
 */
export interface ClassificationThresholds {
  simpleThreshold: number;      // queries below this are SIMPLE
  moderateThreshold: number;    // queries below this are MODERATE
  complexThreshold: number;     // queries at or above this are COMPLEX
  minConfidence: number;        // minimum confidence to accept classification
}

/**
 * Fallback strategy configuration
 */
export interface FallbackStrategy {
  tier: RoutingTier;
  condition: 'latency' | 'cost' | 'failure' | 'all';
  threshold: number;
  nextTier: RoutingTier;
}
