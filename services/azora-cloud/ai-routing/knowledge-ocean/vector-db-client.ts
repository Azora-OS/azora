/**
 * Vector Database Client
 * Handles all interactions with Pinecone vector database
 */

import { PineconeConnection } from './connection';
import { Document, SearchOptions, UpsertOptions } from './types';

export class VectorDBClient {
  private connection: PineconeConnection;
  private indexName: string;

  constructor(connection: PineconeConnection, indexName?: string) {
    this.connection = connection;
    this.indexName = indexName || process.env.PINECONE_INDEX_NAME || 'azora-knowledge-ocean';
  }

  /**
   * Search for similar documents using vector similarity
   */
  public async search(
    queryEmbedding: number[],
    options: SearchOptions = {}
  ): Promise<Document[]> {
    const {
      topK = 10,
      minScore = 0.7,
      filter = {},
      includeMetadata = true
    } = options;

    try {
      const index = await this.connection.getIndex(this.indexName);
      
      const queryResponse = await index.query({
        vector: queryEmbedding,
        topK,
        filter,
        includeMetadata
      });

      const documents: Document[] = (queryResponse.matches || [])
        .filter(match => (match.score || 0) >= minScore)
        .map(match => ({
          id: match.id,
          content: (match.metadata?.content as string) || '',
          metadata: {
            source: (match.metadata?.source as 'internal' | 'external') || 'internal',
            category: (match.metadata?.category as string) || 'general',
            subcategory: match.metadata?.subcategory as string,
            timestamp: match.metadata?.timestamp 
              ? new Date(match.metadata.timestamp as string) 
              : new Date(),
            author: match.metadata?.author as string,
            tags: (match.metadata?.tags as string[]) || [],
            accessLevel: (match.metadata?.accessLevel as 'public' | 'private' | 'restricted') || 'public'
          },
          score: match.score
        }));

      return documents;
    } catch (error) {
      console.error('Vector search failed:', error);
      throw new Error(`Vector search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upsert documents into the vector database
   */
  public async upsert(
    documents: Document[],
    options: UpsertOptions = {}
  ): Promise<void> {
    const { batchSize = 100 } = options;

    try {
      const index = await this.connection.getIndex(this.indexName);
      
      // Process in batches
      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        
        const vectors = batch.map(doc => {
          const metadata: Record<string, string | number | boolean | string[]> = {
            content: doc.content,
            source: doc.metadata.source,
            category: doc.metadata.category,
            timestamp: doc.metadata.timestamp.toISOString(),
            tags: doc.metadata.tags
          };

          // Only add optional fields if they exist
          if (doc.metadata.subcategory) {
            metadata.subcategory = doc.metadata.subcategory;
          }
          if (doc.metadata.author) {
            metadata.author = doc.metadata.author;
          }
          if (doc.metadata.accessLevel) {
            metadata.accessLevel = doc.metadata.accessLevel;
          }

          return {
            id: doc.id,
            values: doc.embedding || [],
            metadata
          };
        });

        await index.upsert(vectors);
        
        console.log(`✓ Upserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} documents)`);
      }

      console.log(`✓ Successfully upserted ${documents.length} documents`);
    } catch (error) {
      console.error('Upsert failed:', error);
      throw new Error(`Upsert failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete documents by IDs
   */
  public async delete(ids: string[]): Promise<void> {
    try {
      const index = await this.connection.getIndex(this.indexName);
      
      await index.deleteMany(ids);
      
      console.log(`✓ Deleted ${ids.length} documents`);
    } catch (error) {
      console.error('Delete failed:', error);
      throw new Error(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete all documents matching a filter
   */
  public async deleteByFilter(filter: Record<string, any>): Promise<void> {
    try {
      const index = await this.connection.getIndex(this.indexName);
      
      await index.deleteMany(filter);
      
      console.log(`✓ Deleted documents matching filter`);
    } catch (error) {
      console.error('Delete by filter failed:', error);
      throw new Error(`Delete by filter failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch documents by IDs
   */
  public async fetch(ids: string[]): Promise<Document[]> {
    try {
      const index = await this.connection.getIndex(this.indexName);
      
      const fetchResponse = await index.fetch(ids);
      
      const documents: Document[] = Object.entries(fetchResponse.records || {}).map(([id, record]) => ({
        id,
        content: (record.metadata?.content as string) || '',
        metadata: {
          source: (record.metadata?.source as 'internal' | 'external') || 'internal',
          category: (record.metadata?.category as string) || 'general',
          subcategory: record.metadata?.subcategory as string,
          timestamp: record.metadata?.timestamp 
            ? new Date(record.metadata.timestamp as string) 
            : new Date(),
          author: record.metadata?.author as string,
          tags: (record.metadata?.tags as string[]) || [],
          accessLevel: (record.metadata?.accessLevel as 'public' | 'private' | 'restricted') || 'public'
        },
        embedding: record.values
      }));

      return documents;
    } catch (error) {
      console.error('Fetch failed:', error);
      throw new Error(`Fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get statistics about the index
   */
  public async getStats(): Promise<any> {
    try {
      return await this.connection.getIndexStats(this.indexName);
    } catch (error) {
      console.error('Failed to get stats:', error);
      throw new Error(`Failed to get stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update document metadata without changing embedding
   */
  public async updateMetadata(
    id: string,
    metadata: Partial<Document['metadata']>
  ): Promise<void> {
    try {
      // Fetch existing document
      const docs = await this.fetch([id]);
      if (docs.length === 0) {
        throw new Error(`Document with id ${id} not found`);
      }

      const doc = docs[0];
      if (!doc) {
        throw new Error(`Document with id ${id} not found`);
      }
      
      // Merge metadata
      const updatedDoc: Document = {
        id: doc.id,
        content: doc.content,
        embedding: doc.embedding,
        metadata: {
          ...doc.metadata,
          ...metadata
        }
      };

      // Upsert with updated metadata
      await this.upsert([updatedDoc]);
      
      console.log(`✓ Updated metadata for document ${id}`);
    } catch (error) {
      console.error('Update metadata failed:', error);
      throw new Error(`Update metadata failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
