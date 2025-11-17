/**
 * Pinecone Connection Utilities
 * Manages connection to Pinecone vector database
 */

import { Pinecone } from '@pinecone-database/pinecone';
import { VectorDBConfig } from './types';

export class PineconeConnection {
  private static instance: PineconeConnection;
  private client: Pinecone | null = null;
  private config: VectorDBConfig;
  private isConnected: boolean = false;

  private constructor(config: VectorDBConfig) {
    this.config = config;
  }

  /**
   * Get singleton instance of PineconeConnection
   */
  public static getInstance(config?: VectorDBConfig): PineconeConnection {
    if (!PineconeConnection.instance) {
      if (!config) {
        throw new Error('Configuration required for first initialization');
      }
      PineconeConnection.instance = new PineconeConnection(config);
    }
    return PineconeConnection.instance;
  }

  /**
   * Initialize connection to Pinecone
   */
  public async connect(): Promise<void> {
    if (this.isConnected && this.client) {
      return;
    }

    try {
      this.client = new Pinecone({
        apiKey: this.config.apiKey,
      });

      // Test connection by listing indexes
      await this.client.listIndexes();
      
      this.isConnected = true;
      console.log('✓ Connected to Pinecone successfully');
    } catch (error) {
      this.isConnected = false;
      console.error('✗ Failed to connect to Pinecone:', error);
      throw new Error(`Pinecone connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get Pinecone client instance
   */
  public getClient(): Pinecone {
    if (!this.client || !this.isConnected) {
      throw new Error('Pinecone client not initialized. Call connect() first.');
    }
    return this.client;
  }

  /**
   * Get index by name
   */
  public async getIndex(indexName?: string) {
    const client = this.getClient();
    const name = indexName || this.config.indexName;
    
    try {
      return client.index(name);
    } catch (error) {
      throw new Error(`Failed to get index "${name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if index exists
   */
  public async indexExists(indexName?: string): Promise<boolean> {
    const client = this.getClient();
    const name = indexName || this.config.indexName;
    
    try {
      const indexes = await client.listIndexes();
      return indexes.indexes?.some(index => index.name === name) || false;
    } catch (error) {
      console.error('Error checking index existence:', error);
      return false;
    }
  }

  /**
   * Create index if it doesn't exist
   */
  public async ensureIndex(
    indexName?: string,
    dimension: number = 1536,
    metric: 'cosine' | 'euclidean' | 'dotproduct' = 'cosine'
  ): Promise<void> {
    const client = this.getClient();
    const name = indexName || this.config.indexName;

    const exists = await this.indexExists(name);
    
    if (!exists) {
      console.log(`Creating index "${name}"...`);
      await client.createIndex({
        name,
        dimension,
        metric,
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'
          }
        }
      });
      
      // Wait for index to be ready
      await this.waitForIndexReady(name);
      console.log(`✓ Index "${name}" created successfully`);
    } else {
      console.log(`✓ Index "${name}" already exists`);
    }
  }

  /**
   * Wait for index to be ready
   */
  private async waitForIndexReady(indexName: string, maxWaitTime: number = 60000): Promise<void> {
    const client = this.getClient();
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        const description = await client.describeIndex(indexName);
        if (description.status?.ready) {
          return;
        }
      } catch (error) {
        // Index might not be available yet
      }
      
      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error(`Index "${indexName}" did not become ready within ${maxWaitTime}ms`);
  }

  /**
   * Get index statistics
   */
  public async getIndexStats(indexName?: string): Promise<any> {
    const index = await this.getIndex(indexName);
    return await index.describeIndexStats();
  }

  /**
   * Check connection health
   */
  public async healthCheck(): Promise<boolean> {
    try {
      if (!this.isConnected || !this.client) {
        return false;
      }
      
      await this.client.listIndexes();
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Disconnect from Pinecone
   */
  public disconnect(): void {
    this.client = null;
    this.isConnected = false;
    console.log('✓ Disconnected from Pinecone');
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): { connected: boolean; config: VectorDBConfig } {
    return {
      connected: this.isConnected,
      config: this.config
    };
  }
}

/**
 * Initialize Pinecone connection from environment variables
 */
export async function initializePinecone(): Promise<PineconeConnection> {
  const config: VectorDBConfig = {
    apiKey: process.env.PINECONE_API_KEY || '',
    environment: process.env.PINECONE_ENVIRONMENT || 'us-east-1',
    indexName: process.env.PINECONE_INDEX_NAME || 'azora-knowledge-ocean'
  };

  if (!config.apiKey) {
    throw new Error('PINECONE_API_KEY environment variable is required');
  }

  const connection = PineconeConnection.getInstance(config);
  await connection.connect();
  await connection.ensureIndex();

  return connection;
}
