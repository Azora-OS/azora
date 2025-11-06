/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

import { z } from 'zod';

/**
 * Server-side Environment Variables Schema
 * These variables should never be exposed to the client
 */
const serverEnvSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database
  DATABASE_URL: z.string().url().optional(),
  POSTGRES_PASSWORD: z.string().optional(),
  REDIS_URL: z.string().url().optional(),
  REDIS_PASSWORD: z.string().optional(),
  
  // Authentication & Security
  JWT_SECRET: z.string().min(32).optional(),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  
  // AI API Keys
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_AI_API_KEY: z.string().optional(),
  COHERE_API_KEY: z.string().optional(),
  ASSEMBLYAI_API_KEY: z.string().optional(),
  
  // Blockchain
  ALCHEMY_API_KEY: z.string().optional(),
  ETHERSCAN_API_KEY: z.string().optional(),
  LUNO_API_KEY: z.string().optional(),
  LUNO_SECRET: z.string().optional(),
  
  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  
  // Monitoring
  DATADOG_API_KEY: z.string().optional(),
});

/**
 * Client-side Environment Variables Schema
 * These are safe to expose to the browser (must start with NEXT_PUBLIC_)
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3000/api'),
  NEXT_PUBLIC_GRAPHQL_URL: z.string().url().default('http://localhost:4000/graphql'),
});

/**
 * Shared Environment Variables Schema
 * Used by both server and client
 */
const sharedEnvSchema = z.object({
  // Feature Flags
  ENABLE_LEARN_TO_EARN: z.string().transform(val => val === 'true').default('true'),
  ENABLE_CRYPTO_PAYMENTS: z.string().transform(val => val === 'true').default('true'),
  ENABLE_RATE_LIMITING: z.string().transform(val => val === 'true').default('true'),
  ENABLE_FRAUD_DETECTION: z.string().transform(val => val === 'true').default('true'),
  
  // Thresholds
  FRAUD_THRESHOLD: z.string().transform(Number).default('70'),
});

/**
 * Validate and return server environment variables
 * Call this only on the server side
 */
export function getServerEnv() {
  if (typeof window !== 'undefined') {
    throw new Error('getServerEnv() should only be called on the server side');
  }
  
  const parsed = serverEnvSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error('❌ Invalid server environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid server environment variables');
  }
  
  return parsed.data;
}

/**
 * Validate and return client environment variables
 * Safe to call on both client and server
 */
export function getClientEnv() {
  const parsed = clientEnvSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error('❌ Invalid client environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid client environment variables');
  }
  
  return parsed.data;
}

/**
 * Validate and return shared environment variables
 * Safe to call on both client and server
 */
export function getSharedEnv() {
  const parsed = sharedEnvSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error('❌ Invalid shared environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid shared environment variables');
  }
  
  return parsed.data;
}

/**
 * Get all environment variables (server-side only)
 */
export function getAllEnv() {
  return {
    ...getServerEnv(),
    ...getClientEnv(),
    ...getSharedEnv(),
  };
}

// Export types for TypeScript
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type SharedEnv = z.infer<typeof sharedEnvSchema>;
