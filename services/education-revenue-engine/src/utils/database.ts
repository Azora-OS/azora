import { PrismaClient } from '@prisma/client';
import { InternalServerError } from './errors';

let prisma: PrismaClient;

/**
 * Gets or creates a Prisma client instance
 */
export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

/**
 * Initializes the Prisma client
 */
export async function initializePrisma(): Promise<void> {
  try {
    const client = getPrismaClient();
    await client.$connect();
  } catch (error) {
    throw new InternalServerError('Failed to connect to database');
  }
}

/**
 * Disconnects the Prisma client
 */
export async function disconnectPrisma(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
  }
}

/**
 * Handles Prisma errors and converts them to AppErrors
 */
export function handlePrismaError(error: any): Error {
  if (error.code === 'P2002') {
    // Unique constraint violation
    const field = error.meta?.target?.[0] || 'field';
    return new Error(`A record with this ${field} already exists`);
  }

  if (error.code === 'P2025') {
    // Record not found
    return new Error('Record not found');
  }

  if (error.code === 'P2003') {
    // Foreign key constraint violation
    return new Error('Invalid reference to related record');
  }

  if (error.code === 'P2014') {
    // Required relation violation
    return new Error('Cannot delete record due to related records');
  }

  return new InternalServerError('Database operation failed');
}

/**
 * Wraps a database operation with error handling
 */
export async function withPrismaErrorHandling<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw handlePrismaError(error);
  }
}

/**
 * Transaction wrapper for multiple operations
 */
export async function withTransaction<T>(
  callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  const client = getPrismaClient();
  try {
    return await client.$transaction(async (tx) => {
      return await callback(tx as PrismaClient);
    });
  } catch (error) {
    throw handlePrismaError(error);
  }
}
