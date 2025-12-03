import EmbeddingService from './embeddings';
import VectorStorageService, { KnowledgeMetadata, VectorRecord } from './vector-storage';
import { v4 as uuidv4 } from 'uuid';

export type KnowledgeType = 'news' | 'research' | 'market' | 'student' | 'business' | 'trend';

export interface KnowledgeSource {
  id: string;
  type: KnowledgeType;
  source: string;
  url: string;
  title: string;
  content: string;
  metadata: {
    date: string;
    category: string;
    verified: boolean;
    relevance: number;
    tags: string[];
  };
  embedding?: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IngestOptions {
  generateEmbedding?: boolean;
  verify?: boolean;
  category?: string;
  tags?: string[];
}

export class KnowledgeOcean {
  private embeddingService: EmbeddingService;
  private vectorStorage: VectorStorageService;
  private sources: Map<string, KnowledgeSource> = new Map();

  constructor(embeddingService: EmbeddingService, vectorStorage: VectorStorageService) {
    this.embeddingService = embeddingService;
    this.vectorStorage = vectorStorage;
  }

  /**
   * Ingest a single knowledge source
   */
  async ingestSource(
    source: Omit<KnowledgeSource, 'id' | 'embedding' | 'createdAt' | 'updatedAt'>,
    options: IngestOptions = {}
  ): Promise<KnowledgeSource> {
    const {
      generateEmbedding = true,
      verify = false,
      category = 'general',
      tags = [],
    } = options;

    try {
      const id = uuidv4();
      const now = new Date();

      // Generate embedding if requested
      let embedding: number[] | undefined;
      if (generateEmbedding) {
        embedding = await this.embeddingService.generateEmbedding(source.content);
      }

      const knowledgeSource: KnowledgeSource = {
        ...source,
        id,
        embedding,
        metadata: {
          ...source.metadata,
          category,
          verified: verify || source.metadata.verified,
          tags: [...source.metadata.tags, ...tags],
        },
        createdAt: now,
        updatedAt: now,
      };

      // Store in memory
      this.sources.set(id, knowledgeSource);

      // Store in vector database if embedding exists
      if (embedding) {
        const metadata: KnowledgeMetadata = {
          date: source.metadata.date,
          source: source.source,
          category: knowledgeSource.metadata.category,
          verified: knowledgeSource.metadata.verified,
          relevance: source.metadata.relevance,
          tags: knowledgeSource.metadata.tags,
          url: source.url,
          title: source.title,
        };

        await this.vectorStorage.storeVector({
          id,
          values: embedding,
          metadata,
        });
      }

      return knowledgeSource;
    } catch (error) {
      console.error('Error ingesting source:', error);
      throw error;
    }
  }

  /**
   * Ingest multiple sources in batch
   */
  async ingestSourcesBatch(
    sources: Omit<KnowledgeSource, 'id' | 'embedding' | 'createdAt' | 'updatedAt'>[],
    options: IngestOptions = {}
  ): Promise<KnowledgeSource[]> {
    const { generateEmbedding = true } = options;

    try {
      const ingested: KnowledgeSource[] = [];

      // Generate embeddings for all sources if requested
      let embeddings: number[][] = [];
      if (generateEmbedding) {
        const contents = sources.map((s) => s.content);
        embeddings = await this.embeddingService.generateBatchEmbeddings(contents);
      }

      // Create vector records for storage
      const vectorRecords: VectorRecord[] = [];

      for (let i = 0; i < sources.length; i++) {
        const source = sources[i];
        const id = uuidv4();
        const now = new Date();
        const embedding = embeddings[i];

        const knowledgeSource: KnowledgeSource = {
          ...source,
          id,
          embedding,
          createdAt: now,
          updatedAt: now,
        };

        this.sources.set(id, knowledgeSource);
        ingested.push(knowledgeSource);

        // Prepare vector record
        if (embedding) {
          const metadata: KnowledgeMetadata = {
            date: source.metadata.date,
            source: source.source,
            category: source.metadata.category,
            verified: source.metadata.verified,
            relevance: source.metadata.relevance,
            tags: source.metadata.tags,
            url: source.url,
            title: source.title,
          };

          vectorRecords.push({
            id,
            values: embedding,
            metadata,
          });
        }
      }

      // Store all vectors in batch
      if (vectorRecords.length > 0) {
        await this.vectorStorage.storeVectorsBatch(vectorRecords);
      }

      return ingested;
    } catch (error) {
      console.error('Error ingesting sources batch:', error);
      throw error;
    }
  }

  /**
   * Get a source by ID
   */
  getSource(id: string): KnowledgeSource | undefined {
    return this.sources.get(id);
  }

  /**
   * Get all sources of a specific type
   */
  getSourcesByType(type: KnowledgeType): KnowledgeSource[] {
    return Array.from(this.sources.values()).filter((source) => source.type === type);
  }

  /**
   * Get sources by category
   */
  getSourcesByCategory(category: string): KnowledgeSource[] {
    return Array.from(this.sources.values()).filter(
      (source) => source.metadata.category === category
    );
  }

  /**
   * Get verified sources only
   */
  getVerifiedSources(): KnowledgeSource[] {
    return Array.from(this.sources.values()).filter((source) => source.metadata.verified);
  }

  /**
   * Get sources within date range
   */
  getSourcesByDateRange(startDate: Date, endDate: Date): KnowledgeSource[] {
    return Array.from(this.sources.values()).filter((source) => {
      const sourceDate = new Date(source.metadata.date);
      return sourceDate >= startDate && sourceDate <= endDate;
    });
  }

  /**
   * Delete a source
   */
  async deleteSource(id: string): Promise<void> {
    try {
      this.sources.delete(id);
      await this.vectorStorage.deleteVector(id);
    } catch (error) {
      console.error('Error deleting source:', error);
      throw error;
    }
  }

  /**
   * Get ocean statistics
   */
  getStats() {
    const sources = Array.from(this.sources.values());
    const byType = new Map<KnowledgeType, number>();
    const byCategory = new Map<string, number>();
    const verified = sources.filter((s) => s.metadata.verified).length;

    for (const source of sources) {
      byType.set(source.type, (byType.get(source.type) || 0) + 1);
      byCategory.set(
        source.metadata.category,
        (byCategory.get(source.metadata.category) || 0) + 1
      );
    }

    return {
      totalSources: sources.length,
      verifiedSources: verified,
      byType: Object.fromEntries(byType),
      byCategory: Object.fromEntries(byCategory),
      oldestSource: sources.length > 0 ? Math.min(...sources.map((s) => s.createdAt.getTime())) : null,
      newestSource: sources.length > 0 ? Math.max(...sources.map((s) => s.createdAt.getTime())) : null,
    };
  }
}

export default KnowledgeOcean;
