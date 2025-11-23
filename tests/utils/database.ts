import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { Pool } from 'pg';

let prisma: PrismaClient | null = null;
let connectionPool: Pool | null = null;

/**
 * Get or create a Prisma client instance for testing
 */
export function getTestPrismaClient(): PrismaClient {
  if (!prisma) {
    const testDatabaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:test@localhost:5432/azora_test';
    
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: testDatabaseUrl,
        },
      },
      log: process.env.DEBUG_TESTS ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  
  return prisma;
}

/**
 * Setup test database - creates database and runs migrations
 */
export async function setupTestDatabase(): Promise<PrismaClient> {
  const client = getTestPrismaClient();
  
  try {
    // Connect to database
    await client.$connect();
    
    // Run migrations
    console.log('Running database migrations...');
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:test@localhost:5432/azora_test' },
      stdio: 'inherit',
    });
    
    console.log('Test database setup complete');
    return client;
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
}

/**
 * Clean up all test data from database
 */
export async function cleanupTestDatabase(): Promise<void> {
  const client = getTestPrismaClient();
  
  try {
    // Delete in reverse order of dependencies
    await client.chatMessage.deleteMany();
    await client.chatSession.deleteMany();
    await client.jobApplication.deleteMany();
    await client.jobSkill.deleteMany();
    await client.userSkill.deleteMany();
    await client.job.deleteMany();
    await client.assessment.deleteMany();
    await client.miningActivity.deleteMany();
    await client.transaction.deleteMany();
    await client.wallet.deleteMany();
    await client.enrollment.deleteMany();
    await client.courseModule.deleteMany();
    await client.courseReview.deleteMany();
    await client.coursePurchase.deleteMany();
    await client.instructorEarnings.deleteMany();
    await client.course.deleteMany();
    await client.receipt.deleteMany();
    await client.payment.deleteMany();
    await client.idempotencyKey.deleteMany();
    await client.token.deleteMany();
    await client.safetyIncident.deleteMany();
    await client.notification.deleteMany();
    await client.aIFamilyInteraction.deleteMany();
    await client.aIFamilyConsultation.deleteMany();
    await client.consentRecord.deleteMany();
    await client.tokenTransaction.deleteMany();
    await client.tokenBalance.deleteMany();
    await client.leaderboardEntry.deleteMany();
    await client.tokenRedemption.deleteMany();
    await client.userProfile.deleteMany();
    await client.user.deleteMany();
  } catch (error) {
    console.error('Error cleaning up test database:', error);
    throw error;
  }
}

/**
 * Reset database to clean state
 */
export async function resetDatabase(): Promise<void> {
  await cleanupTestDatabase();
}

/**
 * Disconnect from test database
 */
export async function disconnectTestDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

/**
 * Execute raw SQL query (useful for complex test setups)
 */
export async function executeRawQuery(query: string): Promise<any> {
  const client = getTestPrismaClient();
  return client.$executeRawUnsafe(query);
}

/**
 * Create a database transaction for test isolation
 */
export async function withTransaction<T>(
  callback: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  const client = getTestPrismaClient();
  return client.$transaction(async (tx) => {
    return callback(tx as PrismaClient);
  });
}

/**
 * Begin a transaction for fast rollback cleanup
 * Returns a transaction client that can be rolled back
 */
export async function beginTestTransaction(): Promise<PrismaClient> {
  const client = getTestPrismaClient();
  await client.$executeRaw`BEGIN`;
  return client;
}

/**
 * Rollback a test transaction for fast cleanup
 */
export async function rollbackTestTransaction(): Promise<void> {
  const client = getTestPrismaClient();
  try {
    await client.$executeRaw`ROLLBACK`;
  } catch (error) {
    // Ignore rollback errors (transaction may already be rolled back)
    console.warn('Transaction rollback warning:', error);
  }
}

/**
 * Get or create a connection pool for tests
 */
export function getConnectionPool(): Pool {
  if (!connectionPool) {
    const testDatabaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:test@localhost:5432/azora_test';
    
    connectionPool = new Pool({
      connectionString: testDatabaseUrl,
      max: 10, // Maximum connections
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  
  return connectionPool;
}

/**
 * Close connection pool
 */
export async function closeConnectionPool(): Promise<void> {
  if (connectionPool) {
    await connectionPool.end();
    connectionPool = null;
  }
}
