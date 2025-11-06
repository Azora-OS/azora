/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Environment Variable Validation
 * 
 * Validates all required environment variables at startup
 * Uses Zod for type-safe validation
 */

import { z } from 'zod';
import { log } from './logger';

// Define environment variable schema
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('3001'),
  API_URL: z.string().url().optional(),

  // Database
  DATABASE_URL: z.string().url().optional(),
  POSTGRES_USER: z.string().optional(),
  POSTGRES_PASSWORD: z.string().optional(),
  POSTGRES_DB: z.string().optional(),
  POSTGRES_HOST: z.string().optional(),
  POSTGRES_PORT: z.string().regex(/^\d+$/).optional(),

  // Supabase
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Redis
  REDIS_URL: z.string().url().optional(),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.string().regex(/^\d+$/).optional(),

  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters').optional(),
  JWT_EXPIRATION: z.string().default('24h'),
  SESSION_SECRET: z.string().min(32).optional(),

  // AI Services
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),

  // Blockchain
  BLOCKCHAIN_PRIVATE_KEY: z.string().optional(),
  AZORA_RPC_URL: z.string().url().optional(),
  ETHEREUM_RPC_URL: z.string().url().optional(),

  // Service URLs
  AZORA_MINT_URL: z.string().url().optional(),
  AZORA_SAPIENS_URL: z.string().url().optional(),
  AZORA_ORACLE_URL: z.string().url().optional(),
  AZORA_AEGIS_URL: z.string().url().optional(),

  // External Services
  LUNO_API_KEY: z.string().optional(),
  LUNO_API_SECRET: z.string().optional(),

  // Monitoring
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),

  // CORS
  CORS_ORIGIN: z.string().optional(),
  ALLOWED_ORIGINS: z.string().optional(),

  // Feature Flags
  ENABLE_AI_TUTOR: z.string().transform((val: string) => val === 'true').default('true'),
  ENABLE_POK_REWARDS: z.string().transform((val: string) => val === 'true').default('true'),
  ENABLE_UBO_DISTRIBUTION: z.string().transform((val: string) => val === 'true').default('true'),
  ENABLE_QUANTUM_SECURITY: z.string().transform((val: string) => val === 'true').default('true'),
});

// Required environment variables for production
const requiredForProduction = [
  'DATABASE_URL',
  'JWT_SECRET',
] as const;

/**
 * Validate and parse environment variables
 */
export function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env);
    
    // Check required variables for production
    if (parsed.NODE_ENV === 'production') {
      const missing: string[] = [];
      
      requiredForProduction.forEach((key) => {
        if (!process.env[key]) {
          missing.push(key);
        }
      });

      if (missing.length > 0) {
        log.error('Missing required environment variables for production:', { missing });
        throw new Error(
          `Missing required environment variables: ${missing.join(', ')}\n` +
          'Please check your .env file or environment configuration.'
        );
      }
    }

    log.info('Environment variables validated successfully', {
      nodeEnv: parsed.NODE_ENV,
      port: parsed.PORT,
    });

    return parsed;
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      log.error('Environment variable validation failed:', {
        errors: error.errors.map((e: z.ZodIssue) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      });
      
      throw new Error(
        `Environment variable validation failed:\n` +
        error.errors.map((e: z.ZodIssue) => `  - ${e.path.join('.')}: ${e.message}`).join('\n')
      );
    }
    throw error;
  }
}

// Type for validated environment
export type ValidatedEnv = z.infer<typeof envSchema>;

// Export validated environment
let validatedEnv: ValidatedEnv | null = null;

export function getEnv(): ValidatedEnv {
  if (!validatedEnv) {
    validatedEnv = validateEnv();
  }
  return validatedEnv;
}

// Validate on import (optional - can be called explicitly)
if (process.env.VALIDATE_ENV_ON_START !== 'false') {
  try {
    getEnv();
  } catch (error: unknown) {
    // Only throw in production
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    // In development, just warn
    const errorMessage = error instanceof Error ? error.message : String(error);
    log.warn('Environment validation failed (non-blocking in development):', { error: errorMessage });
  }
}


