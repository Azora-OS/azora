/**
 * Knowledge Ocean - Main Entry Point
 * Exports all components for easy importing
 */

// Connection utilities
export { PineconeConnection, initializePinecone } from './connection';

// Vector database client
export { VectorDBClient } from './vector-db-client';

// Embedding service
export { DocumentEmbeddingService } from './embedding-service';

// Retriever
export { KnowledgeOceanRetriever } from './retriever';
export type { RetrieverOptions, SeventyThirtyResult } from './retriever';

// Context ranker
export { ContextRanker } from './context-ranker';
export type { RankingOptions, RankedDocument, RankingResult } from './context-ranker';

// Context injector
export { ContextInjector } from './context-injector';
export type { ContextInjectionResult, PromptTemplate } from './context-injector';

// Configuration
export { 
  loadConfig, 
  validateConfig, 
  getConfig, 
  DEFAULT_CONFIG,
  type KnowledgeOceanConfig 
} from './config';

// Setup utilities
export { KnowledgeOceanSetup } from './setup';

// Types
export type {
  Document,
  DocumentMetadata,
  RetrievalResult,
  VectorDBConfig,
  EmbeddingConfig,
  SearchOptions,
  UpsertOptions,
  KnowledgeDocument,
  ContextInjectionOptions
} from './types';
