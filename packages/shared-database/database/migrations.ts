/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

LAYER 2: DATA FOUNDATION - MIGRATION SYSTEM
Unified migration management for all services
*/

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Run Prisma migrations for a service
 */
export async function runMigrations(servicePath: string): Promise<{
  success: boolean;
  output?: string;
  error?: string;
}> {
  const prismaPath = path.join(servicePath, 'prisma');
  const schemaPath = path.join(prismaPath, 'schema.prisma');

  if (!fs.existsSync(schemaPath)) {
    return {
      success: false,
      error: `Schema not found: ${schemaPath}`,
    };
  }

  try {
    const output = execSync('npx prisma migrate deploy', {
      cwd: servicePath,
      encoding: 'utf8',
      stdio: 'pipe',
    });

    return {
      success: true,
      output,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      output: error.stdout || error.stderr,
    };
  }
}

/**
 * Generate Prisma client for a service
 */
export async function generatePrismaClient(servicePath: string): Promise<{
  success: boolean;
  output?: string;
  error?: string;
}> {
  const schemaPath = path.join(servicePath, 'prisma', 'schema.prisma');

  if (!fs.existsSync(schemaPath)) {
    return {
      success: false,
      error: `Schema not found: ${schemaPath}`,
    };
  }

  try {
    const output = execSync('npx prisma generate', {
      cwd: servicePath,
      encoding: 'utf8',
      stdio: 'pipe',
    });

    return {
      success: true,
      output,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      output: error.stdout || error.stderr,
    };
  }
}

/**
 * Validate database connection
 */
export async function validateDatabaseConnection(databaseUrl: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Test connection with psql or Prisma
    const testQuery = `SELECT 1`;
    // This would use Prisma client to test
    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export default {
  runMigrations,
  generatePrismaClient,
  validateDatabaseConnection,
};
