import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

/**
 * Prisma Client - Real Implementation
 * 
 * Requires DATABASE_URL environment variable to be set.
 * If not set, logs warning and returns null-safe proxy for development.
 * 
 * To configure:
 * 1. Set DATABASE_URL in .env (copy from .env.example)
 * 2. Run: npx prisma generate --schema=../../prisma/unified-schema.prisma
 * 3. Run: npx prisma db push (for development)
 */

function createPrismaClient(): PrismaClient {
    if (!process.env.DATABASE_URL) {
        console.warn('[Prisma] DATABASE_URL not set. Database features will not work.');
        console.warn('[Prisma] To configure: Set DATABASE_URL in .env and run prisma generate');

        // Return a proxy that throws helpful errors instead of crashing
        return new Proxy({} as PrismaClient, {
            get: (target, prop) => {
                if (prop === '$connect' || prop === '$disconnect') {
                    return async () => {
                        console.warn('[Prisma] No database connection configured');
                    };
                }
                if (typeof prop === 'string' && !prop.startsWith('_')) {
                    return {
                        findMany: async () => {
                            console.warn(`[Prisma] ${String(prop)}.findMany() - No database configured`);
                            return [];
                        },
                        findUnique: async () => null,
                        findFirst: async () => null,
                        create: async () => {
                            throw new Error('DATABASE_URL not configured');
                        },
                        update: async () => {
                            throw new Error('DATABASE_URL not configured');
                        },
                        delete: async () => {
                            throw new Error('DATABASE_URL not configured');
                        },
                    };
                }
                return undefined;
            }
        });
    }

    return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
    });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
