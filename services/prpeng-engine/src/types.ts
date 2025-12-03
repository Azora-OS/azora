export interface PrPEngConfig {
    predictionScope: 'narrow' | 'medium' | 'wide';
    predictionsPerQuery: number;
    minConfidenceThreshold: number;
    enableBridgePrompts: boolean;
}

export interface PredictionRequest {
    query: string;
    userId: string;
    sessionId: string;
    previousTopics?: string[];
    config?: Partial<PrPEngConfig>;
}

export interface PredictedQA {
    question: string;
    answer: string;
    topic: string;
    confidence: number;
    type: 'follow-up' | 'related' | 'application' | 'comparison' | 'bridge';
}

export interface PredictionResponse {
    originalQuery: string;
    mainTopic: string;
    predictions: PredictedQA[];
    metadata: {
        generatedAt: Date;
        modelUsed: string;
        totalTokens: number;
        processingTimeMs: number;
    };
}

export interface MasterPrompt {
    systemPrompt: string;
    userPrompt: string;
    expectedFormat: string;
}

export interface PrPEngMetrics {
    predictionsGenerated: number;
    cacheHits: number;
    cacheMisses: number;
    apiCallsSaved: number;
    averageConfidence: number;
    topPredictedTopics: string[];
}

export interface TopicAnalysis {
    mainTopic: string;
    subTopics: string[];
    intent: 'learning' | 'problem-solving' | 'exploration' | 'comparison';
    complexity: 'beginner' | 'intermediate' | 'advanced';
    relatedDomains: string[];
}
