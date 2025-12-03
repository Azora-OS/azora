/**
 * Knowledge Ocean Setup Script
 * Initializes Pinecone index and validates configuration
 */

import { initializePinecone, PineconeConnection } from './connection';
import { VectorDBClient } from './vector-db-client';

interface SetupOptions {
  createIndex?: boolean;
  validateConnection?: boolean;
  seedData?: boolean;
}

export class KnowledgeOceanSetup {
  private connection: PineconeConnection | null = null;
  private client: VectorDBClient | null = null;

  /**
   * Run complete setup
   */
  public async setup(options: SetupOptions = {}): Promise<void> {
    const {
      createIndex = true,
      validateConnection = true,
      seedData = false
    } = options;

    console.log('🌊 Knowledge Ocean Setup Starting...\n');

    try {
      // Step 1: Validate environment variables
      await this.validateEnvironment();

      // Step 2: Initialize connection
      await this.initializeConnection();

      // Step 3: Create index if needed
      if (createIndex) {
        await this.setupIndex();
      }

      // Step 4: Validate connection
      if (validateConnection) {
        await this.validateSetup();
      }

      // Step 5: Seed initial data (optional)
      if (seedData) {
        await this.seedInitialData();
      }

      console.log('\n✅ Knowledge Ocean setup completed successfully!');
      console.log('\nNext steps:');
      console.log('1. Start ingesting documents using the VectorDBClient');
      console.log('2. Test retrieval using the KnowledgeOceanRetriever');
      console.log('3. Monitor performance metrics\n');

    } catch (error) {
      console.error('\n❌ Setup failed:', error);
      throw error;
    }
  }

  /**
   * Validate required environment variables
   */
  private async validateEnvironment(): Promise<void> {
    console.log('📋 Validating environment variables...');

    const required = [
      'PINECONE_API_KEY',
      'PINECONE_INDEX_NAME',
      'OPENAI_API_KEY'
    ];

    const missing: string[] = [];

    for (const key of required) {
      if (!process.env[key]) {
        missing.push(key);
      }
    }

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please copy .env.example to .env and fill in the values.'
      );
    }

    console.log('✓ All required environment variables present\n');
  }

  /**
   * Initialize Pinecone connection
   */
  private async initializeConnection(): Promise<void> {
    console.log('🔌 Initializing Pinecone connection...');

    this.connection = await initializePinecone();
    this.client = new VectorDBClient(this.connection);

    console.log('✓ Connection initialized\n');
  }

  /**
   * Setup Pinecone index
   */
  private async setupIndex(): Promise<void> {
    if (!this.connection) {
      throw new Error('Connection not initialized');
    }

    console.log('📊 Setting up Pinecone index...');

    const indexName = process.env.PINECONE_INDEX_NAME || 'azora-knowledge-ocean';
    const dimension = 1536; // OpenAI text-embedding-ada-002 dimension
    const metric = 'cosine';

    await this.connection.ensureIndex(indexName, dimension, metric);

    console.log('✓ Index setup complete\n');
  }

  /**
   * Validate setup by running health checks
   */
  private async validateSetup(): Promise<void> {
    if (!this.connection || !this.client) {
      throw new Error('Connection or client not initialized');
    }

    console.log('🔍 Validating setup...');

    // Check connection health
    const isHealthy = await this.connection.healthCheck();
    if (!isHealthy) {
      throw new Error('Connection health check failed');
    }
    console.log('✓ Connection health check passed');

    // Check index exists
    const indexName = process.env.PINECONE_INDEX_NAME || 'azora-knowledge-ocean';
    const exists = await this.connection.indexExists(indexName);
    if (!exists) {
      throw new Error(`Index "${indexName}" does not exist`);
    }
    console.log(`✓ Index "${indexName}" exists`);

    // Get index stats
    const stats = await this.client.getStats();
    console.log(`✓ Index stats: ${JSON.stringify(stats, null, 2)}`);

    console.log('✓ Validation complete\n');
  }

  /**
   * Seed initial data (optional)
   */
  private async seedInitialData(): Promise<void> {
    if (!this.client) {
      throw new Error('Client not initialized');
    }

    console.log('🌱 Seeding initial data...');

    // This is a placeholder - actual seeding would come from your data sources
    console.log('ℹ️  Seeding skipped - implement based on your data sources\n');
  }

  /**
   * Get connection status
   */
  public getStatus(): any {
    if (!this.connection) {
      return { status: 'not_initialized' };
    }

    return this.connection.getConnectionStatus();
  }
}

/**
 * CLI entry point
 */
export async function runSetup() {
  const setup = new KnowledgeOceanSetup();
  
  const options: SetupOptions = {
    createIndex: true,
    validateConnection: true,
    seedData: false
  };

  await setup.setup(options);
}

export default KnowledgeOceanSetup;
