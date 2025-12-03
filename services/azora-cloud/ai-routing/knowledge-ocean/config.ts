/**
 * Knowledge Ocean Configuration
 * Centralized configuration for all Knowledge Ocean components
 */

export interface KnowledgeOceanConfig {
  // Pinecone settings
  pinecone: {
    apiKey: string;
    environment: string;
    indexName: string;
  };

  // OpenAI settings
  openai: {
    apiKey: string;
    embeddingModel: string;
  };

  // 70/30 rule settings
  retrieval: {
    internalRatio: number;
    externalRatio: number;
    minRelevanceScore: number;
    maxResults: number;
  };

  // Performance settings
  performance: {
    cacheTTL: number;
    batchSize: number;
    timeoutMs: number;
    maxRetries: number;
  };

  // Feature flags
  features: {
    enableCache: boolean;
    enableMetrics: boolean;
    enableLogging: boolean;
  };
}

/**
 * Load configuration from environment variables
 */
export function loadConfig(): KnowledgeOceanConfig {
  return {
    pinecone: {
      apiKey: process.env.PINECONE_API_KEY || '',
      environment: process.env.PINECONE_ENVIRONMENT || 'us-east-1',
      indexName: process.env.PINECONE_INDEX_NAME || 'azora-knowledge-ocean'
    },

    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-ada-002'
    },

    retrieval: {
      internalRatio: parseFloat(process.env.KNOWLEDGE_OCEAN_INTERNAL_RATIO || '0.7'),
      externalRatio: parseFloat(process.env.KNOWLEDGE_OCEAN_EXTERNAL_RATIO || '0.3'),
      minRelevanceScore: parseFloat(process.env.KNOWLEDGE_OCEAN_MIN_RELEVANCE_SCORE || '0.7'),
      maxResults: parseInt(process.env.KNOWLEDGE_OCEAN_MAX_RESULTS || '10', 10)
    },

    performance: {
      cacheTTL: parseInt(process.env.KNOWLEDGE_OCEAN_CACHE_TTL || '3600', 10),
      batchSize: parseInt(process.env.KNOWLEDGE_OCEAN_BATCH_SIZE || '100', 10),
      timeoutMs: parseInt(process.env.KNOWLEDGE_OCEAN_TIMEOUT_MS || '5000', 10),
      maxRetries: parseInt(process.env.KNOWLEDGE_OCEAN_MAX_RETRIES || '3', 10)
    },

    features: {
      enableCache: process.env.KNOWLEDGE_OCEAN_ENABLE_CACHE !== 'false',
      enableMetrics: process.env.KNOWLEDGE_OCEAN_ENABLE_METRICS !== 'false',
      enableLogging: process.env.KNOWLEDGE_OCEAN_ENABLE_LOGGING !== 'false'
    }
  };
}

/**
 * Validate configuration
 */
export function validateConfig(config: KnowledgeOceanConfig): void {
  const errors: string[] = [];

  // Validate Pinecone config
  if (!config.pinecone.apiKey) {
    errors.push('PINECONE_API_KEY is required');
  }
  if (!config.pinecone.indexName) {
    errors.push('PINECONE_INDEX_NAME is required');
  }

  // Validate OpenAI config
  if (!config.openai.apiKey) {
    errors.push('OPENAI_API_KEY is required');
  }

  // Validate retrieval ratios
  const totalRatio = config.retrieval.internalRatio + config.retrieval.externalRatio;
  if (Math.abs(totalRatio - 1.0) > 0.01) {
    errors.push(`Internal and external ratios must sum to 1.0 (got ${totalRatio})`);
  }

  if (config.retrieval.internalRatio < 0 || config.retrieval.internalRatio > 1) {
    errors.push('Internal ratio must be between 0 and 1');
  }

  if (config.retrieval.minRelevanceScore < 0 || config.retrieval.minRelevanceScore > 1) {
    errors.push('Min relevance score must be between 0 and 1');
  }

  if (config.retrieval.maxResults < 1) {
    errors.push('Max results must be at least 1');
  }

  // Validate performance settings
  if (config.performance.cacheTTL < 0) {
    errors.push('Cache TTL must be non-negative');
  }

  if (config.performance.batchSize < 1) {
    errors.push('Batch size must be at least 1');
  }

  if (config.performance.timeoutMs < 100) {
    errors.push('Timeout must be at least 100ms');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

/**
 * Get validated configuration
 */
export function getConfig(): KnowledgeOceanConfig {
  const config = loadConfig();
  validateConfig(config);
  return config;
}

/**
 * Default configuration (for testing)
 */
export const DEFAULT_CONFIG: KnowledgeOceanConfig = {
  pinecone: {
    apiKey: 'test-api-key',
    environment: 'us-east-1',
    indexName: 'test-index'
  },
  openai: {
    apiKey: 'test-openai-key',
    embeddingModel: 'text-embedding-ada-002'
  },
  retrieval: {
    internalRatio: 0.7,
    externalRatio: 0.3,
    minRelevanceScore: 0.7,
    maxResults: 10
  },
  performance: {
    cacheTTL: 3600,
    batchSize: 100,
    timeoutMs: 5000,
    maxRetries: 3
  },
  features: {
    enableCache: true,
    enableMetrics: true,
    enableLogging: true
  }
};
