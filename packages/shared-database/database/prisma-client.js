"use strict";
/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

LAYER 2: DATA FOUNDATION - PRISMA CLIENT SETUP
Unified Prisma client with connection pooling and error handling
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeTransaction = exports.checkDatabaseHealth = exports.disconnectDatabase = exports.connectDatabase = exports.prisma = void 0;
const client_1 = require("@prisma/client");
// Connection pool configuration
const prismaClientOptions = {
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
    log: process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    errorFormat: 'pretty',
};
// Create Prisma client with connection pooling
exports.prisma = new client_1.PrismaClient(prismaClientOptions);
// Connection pool management
let isConnected = false;
/**
 * Initialize database connection
 */
async function connectDatabase() {
    if (isConnected) {
        return;
    }
    try {
        await exports.prisma.$connect();
        isConnected = true;
        console.log('✅ Database connected successfully');
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
}
exports.connectDatabase = connectDatabase;
/**
 * Disconnect database connection
 */
async function disconnectDatabase() {
    if (!isConnected) {
        return;
    }
    try {
        await exports.prisma.$disconnect();
        isConnected = false;
        console.log('✅ Database disconnected');
    }
    catch (error) {
        console.error('❌ Database disconnection error:', error);
        throw error;
    }
}
exports.disconnectDatabase = disconnectDatabase;
/**
 * Health check for database
 */
async function checkDatabaseHealth() {
    try {
        const start = Date.now();
        await exports.prisma.$queryRaw `SELECT 1`;
        const latency = Date.now() - start;
        return {
            healthy: true,
            latency,
        };
    }
    catch (error) {
        return {
            healthy: false,
            error: error.message,
        };
    }
}
exports.checkDatabaseHealth = checkDatabaseHealth;
/**
 * Execute database transaction
 */
async function executeTransaction(callback) {
    return exports.prisma.$transaction(callback, {
        maxWait: 5000,
        timeout: 10000,
    });
}
exports.executeTransaction = executeTransaction;
// Graceful shutdown
process.on('beforeExit', async () => {
    await disconnectDatabase();
});
exports.default = exports.prisma;
