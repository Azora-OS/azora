import { config } from 'dotenv';
import { resolve } from 'path';

/**
 * Load test environment variables
 */
export function loadTestEnv(): void {
  // Load .env.test file
  const envPath = resolve(process.cwd(), '.env.test');
  const result = config({ path: envPath });
  
  if (result.error) {
    console.warn('Warning: .env.test file not found, using default test values');
  }
  
  // Ensure NODE_ENV is set to test
  process.env.NODE_ENV = 'test';
  
  // Validate required environment variables
  validateTestEnv();
}

/**
 * Validate required test environment variables
 */
function validateTestEnv(): void {
  const required = [
    'DATABASE_URL',
    'REDIS_URL',
    'JWT_SECRET',
  ];
  
  const missing: string[] = [];
  
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required test environment variables: ${missing.join(', ')}\n` +
      'Please create a .env.test file with the required variables.'
    );
  }
}

/**
 * Get test environment variable with fallback
 */
export function getTestEnv(key: string, fallback?: string): string {
  const value = process.env[key];
  
  if (!value && !fallback) {
    throw new Error(`Environment variable ${key} is not set and no fallback provided`);
  }
  
  return value || fallback!;
}

/**
 * Check if running in test environment
 */
export function isTestEnv(): boolean {
  return process.env.NODE_ENV === 'test';
}

/**
 * Get database URL for tests
 */
export function getTestDatabaseUrl(): string {
  return getTestEnv('DATABASE_URL', 'postgresql://postgres:test@localhost:5432/azora_test');
}

/**
 * Get Redis URL for tests
 */
export function getTestRedisUrl(): string {
  return getTestEnv('REDIS_URL', 'redis://localhost:6379');
}

/**
 * Check if debug mode is enabled for tests
 */
export function isDebugEnabled(): boolean {
  return process.env.DEBUG_TESTS === 'true';
}
