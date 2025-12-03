/**
 * Knowledge Ocean Type Definitions
 */

export interface Document {
  id: string;
  content: string;
  metadata: DocumentMetadata;
  embedding?: number[];
  score?: number;
}

export interface DocumentMetadata {
  source: 'internal' | 'external';
  category: string;
  subcategory?: string;
  timestamp: Date;
  author?: string;
  tags: string[];
  accessLevel?: 'public' | 'private' | 'restricted';
}

export interface RetrievalResult {
  documents: Document[];
  internalCount: number;
  externalCount: number;
  totalRelevanceScore: number;
  retrievalTime: number; // milliseconds
}

export interface VectorDBConfig {
  apiKey: string;
  environment: string;
  indexName: string;
}

export interface EmbeddingConfig {
  provider: 'openai' | 'custom';
  model: string;
  apiKey?: string;
}

export interface SearchOptions {
  topK?: number;
  minScore?: number;
  filter?: Record<string, any>;
  includeMetadata?: boolean;
}

export interface UpsertOptions {
  namespace?: string;
  batchSize?: number;
}

export interface KnowledgeDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    source: 'internal' | 'external';
    category: string;
    subcategory?: string;
    author?: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
    accessLevel: 'public' | 'private' | 'restricted';
  };
  stats: {
    retrievalCount: number;
    lastRetrieved?: Date;
    averageRelevanceScore: number;
  };
}

export interface ContextInjectionOptions {
  maxTokens?: number;
  format?: 'markdown' | 'json' | 'plain';
  includeMetadata?: boolean;
}
