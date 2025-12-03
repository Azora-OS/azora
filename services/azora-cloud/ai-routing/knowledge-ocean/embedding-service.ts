/**
 * Document Embedding Service
 * Handles document embedding generation using OpenAI
 */

import OpenAI from 'openai';
import { Document } from './types';

export interface EmbeddingOptions {
  model?: string;
  batchSize?: number;
  enableCache?: boolean;
}

export interface EmbeddingResult {
  embedding: number[];
  tokens: number;
  model: string;
}

export interface BatchEmbeddingResult {
  embeddings: number[][];
  totalTokens: number;
  model: string;
  processingTime: number;
}

/**
 * In-memory cache for embeddings
 */
class EmbeddingCache {
  private cache: Map<string, { embedding: number[]; timestamp: number }>;
  private ttl: number;

  constructor(ttl: number = 3600000) {
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(text: string): number[] | null {
    const key = this.generateKey(text);
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.embedding;
  }

  set(text: string, embedding: number[]): void {
    const key = this.generateKey(text);
    this.cache.set(key, {
      embedding,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  private generateKey(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }
}

export class DocumentEmbeddingService {
  private client: OpenAI;
  private cache: EmbeddingCache;
  private defaultModel: string;
  private defaultBatchSize: number;
  private enableCache: boolean;

  constructor(apiKey?: string, options: EmbeddingOptions = {}) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY
    });

    this.defaultModel = options.model || process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-ada-002';
    this.defaultBatchSize = options.batchSize || 100;
    this.enableCache = options.enableCache !== false;
    this.cache = new EmbeddingCache();
  }

  /**
   * Generate embedding for a single text
   */
  public async embed(text: string, model?: string): Promise<EmbeddingResult> {
    if (this.enableCache) {
      const cached = this.cache.get(text);
      if (cached) {
        return {
          embedding: cached,
          tokens: 0,
          model: model || this.defaultModel
        };
      }
    }

    try {
      const response = await this.client.embeddings.create({
        model: model || this.defaultModel,
        input: text
      });

      const embedding = response.data[0]?.embedding;
      if (!embedding) {
        throw new Error('No embedding returned from OpenAI');
      }

      const tokens = response.usage?.total_tokens || 0;

      if (this.enableCache) {
        this.cache.set(text, embedding);
      }

      return {
        embedding,
        tokens,
        model: model || this.defaultModel
      };
    } catch (error) {
      console.error('Embedding generation failed:', error);
      throw new Error(`Embedding generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate embeddings for multiple texts in batches
   */
  public async batchEmbed(
    texts: string[],
    options: { model?: string; batchSize?: number } = {}
  ): Promise<BatchEmbeddingResult> {
    const model = options.model || this.defaultModel;
    const batchSize = options.batchSize || this.defaultBatchSize;
    const startTime = Date.now();

    const embeddings: number[][] = [];
    let totalTokens = 0;
    let cacheHits = 0;

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      
      const uncachedTexts: string[] = [];
      const uncachedIndices: number[] = [];
      const batchEmbeddings: (number[] | null)[] = new Array(batch.length).fill(null);

      for (let j = 0; j < batch.length; j++) {
        if (this.enableCache) {
          const cached = this.cache.get(batch[j] || '');
          if (cached) {
            batchEmbeddings[j] = cached;
            cacheHits++;
            continue;
          }
        }
        uncachedTexts.push(batch[j] || '');
        uncachedIndices.push(j);
      }

      if (uncachedTexts.length > 0) {
        try {
          const response = await this.client.embeddings.create({
            model,
            input: uncachedTexts
          });

          totalTokens += response.usage?.total_tokens || 0;

          for (let j = 0; j < uncachedIndices.length; j++) {
            const embedding = response.data[j]?.embedding;
            if (embedding) {
              const originalIndex = uncachedIndices[j];
              if (originalIndex !== undefined) {
                batchEmbeddings[originalIndex] = embedding;

                if (this.enableCache) {
                  this.cache.set(uncachedTexts[j] || '', embedding);
                }
              }
            }
          }
        } catch (error) {
          console.error(`Batch embedding failed for batch ${Math.floor(i / batchSize) + 1}:`, error);
          throw new Error(`Batch embedding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      for (const embedding of batchEmbeddings) {
        if (embedding) {
          embeddings.push(embedding);
        }
      }

      console.log(`✓ Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)} (${batch.length} texts, ${cacheHits} cache hits)`);
    }

    const processingTime = Date.now() - startTime;

    console.log(`✓ Batch embedding complete: ${embeddings.length} embeddings, ${totalTokens} tokens, ${processingTime}ms`);

    return {
      embeddings,
      totalTokens,
      model,
      processingTime
    };
  }
