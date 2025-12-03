import { PrismaClient } from '@prisma/client';
export declare const prisma: any;
/**
 * Initialize database connection
 */
export declare function connectDatabase(): Promise<void>;
/**
 * Disconnect database connection
 */
export declare function disconnectDatabase(): Promise<void>;
/**
 * Health check for database
 */
export declare function checkDatabaseHealth(): Promise<{
    healthy: boolean;
    latency?: number;
    error?: string;
}>;
/**
 * Execute database transaction
 */
export declare function executeTransaction<T>(callback: (tx: PrismaClient) => Promise<T>): Promise<T>;
export default prisma;
