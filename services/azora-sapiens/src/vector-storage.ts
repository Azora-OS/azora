import { Pinecone } from '@pinecone-database/pinecone';

export interface KnowledgeMetadata {
  date: string;
  source: string;
  category: string;
  verified: boolean;
  relevance: number;
  tags: string[];
  url?: string;
  title?: string;
}

// Type assertion for Pinecone compatibility
type PineconeMetadata = Record<string, string | number | boolean | string[]>;

export interface VectorRecord {
  id: string;
  values: number[];
  metadata: KnowledgeMetadata;
}

export interface SearchResult {
  id: string;
  score: number;
  metadata: KnowledgeMetadata;
}

export class VectorStorageService {
  private pinecone: Pinecone;
  private indexName: string;

  constructor(apiKey: string, indexName: string = 'azora-knowledge') {
    this.pinecone = new Pinecone({ apiKey });
    this.indexName = indexName;
  }

  /**
   * Store a vector with metadata
   */
  async storeVector(record: VectorRecord): Promise<void> {
    try {
      const index = this.pinecone.Index(this.indexName);
      await index.upsert([
        {
          id: record.id,
          values: record.values,
          metadata: record.metadata as any,
        },
      ]);
    } catch (error) {
      console.error('Error storing vector:', error);
      throw error;
    }
  }

  /**
   * Store multiple vectors in batch
   */
  async storeVectorsBatch(records: VectorRecord[]): Promise<void> {
    try {
      const index = this.pinecone.Index(this.indexName);
      const vectors = records.map((record) => ({
        id: record.id,
        values: record.values,
        metadata: record.metadata as any,
      }));

      // Batch in chunks of 100
      const batchSize = 100;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await index.upsert(batch);
      }
    } catch (error) {
      console.error('Error storing vectors batch:', error);
      throw error;
    }
  }

  /**
   * Semantic search using vector similarity
   */
  async semanticSearch(
    queryVector: number[],
    topK: number = 10,
    filters?: Record<string, unknown>
  ): Promise<SearchResult[]> {
    try {
      const index = this.pinecone.Index(this.indexName);
      const results = await index.query({
        vector: queryVector,
        topK,
        includeMetadata: true,
        filter: filters,
      });

      return results.matches.map((match) => ({
        id: match.id,
        score: match.score || 0,
        metadata: match.metadata as any,
      }));
    } catch (error) {
      console.error('Error performing semantic search:', error);
      throw error;
    }
  }

  /**
   * Delete a vector by ID
   */
  async deleteVector(id: string): Promise<void> {
    try {
      const index = this.pinecone.Index(this.indexName);
      await index.deleteOne(id);
    } catch (error) {
      console.error('Error deleting vector:', error);
      throw error;
    }
  }

  /**
   * Delete multiple vectors
   */
  async deleteVectorsBatch(ids: string[]): Promise<void> {
    try {
      const index = this.pinecone.Index(this.indexName);
      await index.deleteMany(ids);
    } catch (error) {
      console.error('Error deleting vectors batch:', error);
      throw error;
    }
  }

  /**
   * Get vector by ID
   */
  async getVector(id: string): Promise<VectorRecord | null> {
    try {
      const index = this.pinecone.Index(this.indexName);
      const result = await index.fetch([id]);

      if (result.records && result.records[id]) {
        const record = result.records[id];
        return {
          id,
          values: record.values,
          metadata: record.metadata as any,
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching vector:', error);
      throw error;
    }
  }

  /**
   * Get index stats
   */
  async getIndexStats() {
    try {
      const index = this.pinecone.Index(this.indexName);
      const stats = await index.describeIndexStats();
      return stats;
    } catch (error) {
      console.error('Error getting index stats:', error);
      throw error;
    }
  }
}

export default VectorStorageService;
