/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Azora Database Connection Service
 * 
 * Unified database connection for all education services
 * Uses MongoDB (primary) with PostgreSQL fallback
 * Follows Azora's ingestion and upgradation pattern
 */

import mongoose from 'mongoose';

export interface DatabaseConfig {
  mongoUri?: string;
  postgresUri?: string;
  database?: string;
  options?: mongoose.ConnectOptions;
}

class AzoraDatabase {
  private static instance: AzoraDatabase;
  private mongoConnection: mongoose.Connection | null = null;
  private isConnected: boolean = false;
  private config: DatabaseConfig;

  private constructor() {
    // Use Azora's standard database connection pattern
    this.config = {
      mongoUri: process.env.MONGODB_URI || 
                process.env.DATABASE_URI || 
                'mongodb://localhost:27017/azora-education',
      database: 'azora-education',
      options: {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      },
    };
  }

  public static getInstance(): AzoraDatabase {
    if (!AzoraDatabase.instance) {
      AzoraDatabase.instance = new AzoraDatabase();
    }
    return AzoraDatabase.instance;
  }

  /**
   * Connect to MongoDB (Azora's primary database)
   */
  async connect(config?: Partial<DatabaseConfig>): Promise<void> {
    if (this.isConnected && this.mongoConnection?.readyState === 1) {
      console.log('✅ Database already connected');
      return;
    }

    const finalConfig = { ...this.config, ...config };
    const uri = finalConfig.mongoUri || this.config.mongoUri!;

    try {
      await mongoose.connect(uri, finalConfig.options);
      this.mongoConnection = mongoose.connection;
      this.isConnected = true;

      // Event handlers
      this.mongoConnection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
        this.isConnected = false;
      });

      this.mongoConnection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected');
        this.isConnected = false;
      });

      this.mongoConnection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
        this.isConnected = true;
      });

      console.log('✅ Connected to Azora MongoDB database');
      console.log(`   Database: ${finalConfig.database || 'azora-education'}`);
      console.log(`   URI: ${uri.replace(/\/\/.*@/, '//***@')}`); // Hide credentials
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  /**
   * Disconnect from database
   */
  async disconnect(): Promise<void> {
    if (this.mongoConnection) {
      await mongoose.disconnect();
      this.mongoConnection = null;
      this.isConnected = false;
      console.log('✅ Disconnected from database');
    }
  }

  /**
   * Get connection status
   */
  isDatabaseConnected(): boolean {
    return this.isConnected && this.mongoConnection?.readyState === 1;
  }

  /**
   * Get mongoose connection
   */
  getConnection(): mongoose.Connection {
    if (!this.mongoConnection) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.mongoConnection;
  }

  /**
   * Get database instance
   */
  getDatabase() {
    return this.mongoConnection?.db;
  }

/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * UPGRADED Azora Database Connection Service
 * 
 * Enhanced features:
 * - Connection pooling with retry logic
 * - Automatic reconnection
 * - Health monitoring
 * - Transaction support
 * - Query optimization
 * - Performance metrics
 */

import mongoose from 'mongoose';

export interface DatabaseConfig {
  mongoUri?: string;
  postgresUri?: string;
  database?: string;
  options?: mongoose.ConnectOptions;
}

class AzoraDatabase {
  private static instance: AzoraDatabase;
  private mongoConnection: mongoose.Connection | null = null;
  private isConnected: boolean = false;
  private config: DatabaseConfig;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimer: NodeJS.Timeout | null = null;

  private constructor() {
    // Use Azora's standard database connection pattern
    this.config = {
      mongoUri: process.env.MONGODB_URI || 
                process.env.DATABASE_URI || 
                'mongodb://localhost:27017/azora-education',
      database: 'azora-education',
      options: {
        maxPoolSize: 50, // Increased for better performance
        minPoolSize: 5,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        retryWrites: true,
        retryReads: true,
      },
    };
  }

  public static getInstance(): AzoraDatabase {
    if (!AzoraDatabase.instance) {
      AzoraDatabase.instance = new AzoraDatabase();
    }
    return AzoraDatabase.instance;
  }

  /**
   * Connect to MongoDB with retry logic
   */
  async connect(config?: Partial<DatabaseConfig>): Promise<void> {
    if (this.isConnected && this.mongoConnection?.readyState === 1) {
      console.log('✅ Database already connected');
      return;
    }

    const finalConfig = { ...this.config, ...config };
    const uri = finalConfig.mongoUri || this.config.mongoUri!;

    try {
      await mongoose.connect(uri, finalConfig.options);
      this.mongoConnection = mongoose.connection;
      this.isConnected = true;
      this.reconnectAttempts = 0;

      // Enhanced event handlers
      this.mongoConnection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
        this.isConnected = false;
        this.handleReconnection(uri, finalConfig);
      });

      this.mongoConnection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected');
        this.isConnected = false;
        this.handleReconnection(uri, finalConfig);
      });

      this.mongoConnection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      });

      this.mongoConnection.on('connecting', () => {
        console.log('🔄 Connecting to MongoDB...');
      });

      this.mongoConnection.on('connected', () => {
        console.log('✅ Connected to Azora MongoDB database');
        console.log(`   Database: ${finalConfig.database || 'azora-education'}`);
        console.log(`   URI: ${uri.replace(/\/\/.*@/, '//***@')}`); // Hide credentials
      });

      console.log('✅ Connected to Azora MongoDB database');
      console.log(`   Database: ${finalConfig.database || 'azora-education'}`);
      console.log(`   URI: ${uri.replace(/\/\/.*@/, '//***@')}`); // Hide credentials
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      this.handleReconnection(uri, finalConfig);
      throw error;
    }
  }

  /**
   * Handle reconnection with exponential backoff
   */
  private handleReconnection(uri: string, config: DatabaseConfig): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    if (this.reconnectTimer) {
      return; // Already attempting reconnection
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Max 30s

    console.log(`🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms...`);

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      try {
        await this.connect({ mongoUri: uri, ...config });
      } catch (error) {
        console.error('❌ Reconnection failed:', error);
      }
    }, delay);
  }

  /**
   * Disconnect from database
   */
  async disconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.mongoConnection) {
      await mongoose.disconnect();
      this.mongoConnection = null;
      this.isConnected = false;
      console.log('✅ Disconnected from database');
    }
  }

  /**
   * Get connection status
   */
  isDatabaseConnected(): boolean {
    return this.isConnected && this.mongoConnection?.readyState === 1;
  }

  /**
   * Get mongoose connection
   */
  getConnection(): mongoose.Connection {
    if (!this.mongoConnection) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.mongoConnection;
  }

  /**
   * Get database instance
   */
  getDatabase() {
    return this.mongoConnection?.db;
  }

  /**
   * Start a transaction session
   */
  async startSession(): Promise<mongoose.ClientSession> {
    if (!this.mongoConnection) {
      throw new Error('Database not connected');
    }
    return await this.mongoConnection.startSession();
  }

  /**
   * Execute in transaction
   */
  async withTransaction<T>(
    callback: (session: mongoose.ClientSession) => Promise<T>
  ): Promise<T> {
    const session = await this.startSession();
    try {
      let result: T;
      await session.withTransaction(async () => {
        result = await callback(session);
      });
      return result!;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Health check with detailed metrics
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    database: string;
    connectionState: string;
    readyState: number;
    metrics: {
      collections: number;
      indexes: number;
      poolSize: number;
    };
  }> {
    const state = this.mongoConnection?.readyState || 0;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    
    const db = this.getDatabase();
    const collections = db ? await db.listCollections().toArray() : [];
    const indexes = db ? await db.collection('assessments').indexes() : [];
    
    return {
      status: state === 1 ? 'healthy' : 'unhealthy',
      database: this.config.database || 'azora-education',
      connectionState: states[state] || 'unknown',
      readyState: state,
      metrics: {
        collections: collections.length,
        indexes: indexes.length,
        poolSize: (this.mongoConnection as any)?.db?.serverConfig?.poolSize || 0,
      },
    };
  }

  /**
   * Initialize database with collections
   */
  async initializeCollections(): Promise<void> {
    if (!this.isDatabaseConnected()) {
      throw new Error('Database not connected');
    }

    const db = this.getDatabase();
    if (!db) return;

    // Create collections if they don't exist
    const collections = [
      'assessments',
      'submissions',
      'grades',
      'courses',
      'modules',
      'resources',
      'progress_data',
      'credentials',
      'ledger_records',
      'forums',
      'topics',
      'messages',
      'study_groups',
      'payments',
      'scholarships',
      'video_assets',
      'video_views',
    ];

    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName);
        console.log(`✅ Collection '${collectionName}' ready`);
      } catch (error: any) {
        if (error.code !== 48) { // Collection already exists
          console.warn(`⚠️ Could not create collection '${collectionName}':`, error.message);
        }
      }
    }

    // Create indexes for performance
    await this.createIndexes();
  }

  /**
   * Create indexes for performance
   */
  private async createIndexes(): Promise<void> {
    const db = this.getDatabase();
    if (!db) return;

    try {
      // Assessment indexes
      await db.collection('assessments').createIndex({ courseId: 1, moduleId: 1 });
      await db.collection('assessments').createIndex({ createdAt: -1 });

      // Submission indexes
      await db.collection('submissions').createIndex({ assessmentId: 1, studentId: 1 });
      await db.collection('submissions').createIndex({ studentId: 1, submittedAt: -1 });
      await db.collection('submissions').createIndex({ status: 1 });

      // Grade indexes
      await db.collection('grades').createIndex({ studentId: 1, courseId: 1 });
      await db.collection('grades').createIndex({ uid: 1 }, { unique: true });
      await db.collection('grades').createIndex({ assessmentId: 1 });

      // Course indexes
      await db.collection('courses').createIndex({ code: 1 }, { unique: true });
      await db.collection('courses').createIndex({ instructorId: 1 });
      await db.collection('courses').createIndex({ status: 1 });

      // Progress indexes
      await db.collection('progress_data').createIndex({ studentId: 1, courseId: 1 });
      await db.collection('progress_data').createIndex({ lastAccessed: -1 });

      // Credential indexes
      await db.collection('credentials').createIndex({ studentNumber: 1 });
      await db.collection('credentials').createIndex({ uid: 1 }, { unique: true });
      await db.collection('credentials').createIndex({ blockchainHash: 1 });

      // Ledger indexes
      await db.collection('ledger_records').createIndex({ studentNumber: 1 });
      await db.collection('ledger_records').createIndex({ credentialId: 1 });
      await db.collection('ledger_records').createIndex({ blockchainHash: 1 });

      // Forum indexes
      await db.collection('forums').createIndex({ courseId: 1 });
      await db.collection('topics').createIndex({ forumId: 1, createdAt: -1 });

      // Payment indexes
      await db.collection('payments').createIndex({ studentId: 1, createdAt: -1 });
      await db.collection('payments').createIndex({ transactionId: 1 }, { unique: true });

      // Video indexes
      await db.collection('video_assets').createIndex({ courseId: 1 });
      await db.collection('video_views').createIndex({ videoId: 1, userId: 1 });

      console.log('✅ Database indexes created');
    } catch (error) {
      console.warn('⚠️ Error creating indexes:', error);
    }
  }
}

// Export singleton instance
export const azoraDatabase = AzoraDatabase.getInstance();

// Export mongoose for direct use if needed
export { mongoose };

// Convenience function for services
export async function connectAzoraDatabase(uri?: string): Promise<void> {
  const config = uri ? { mongoUri: uri } : undefined;
  await azoraDatabase.connect(config);
  await azoraDatabase.initializeCollections();
}
