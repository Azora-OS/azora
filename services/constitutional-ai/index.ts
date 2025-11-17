/**
 * Constitutional AI Service - Main Entry Point
 * Ethical AI validation framework for Azora OS
 * 
 * This service implements the Constitutional AI framework that validates
 * all AI outputs against Ubuntu principles, detects bias, filters PII,
 * and prevents harmful content.
 */

// Export all types
export * from './types';
export * from './types/validators';

// Export constants and utilities
export * from './utils/constants';
export * from './utils/helpers';

// Export validators
export * from './validators';

// Export services
export * from './services';

// Export orchestrator (will be implemented in subsequent tasks)
// export * from './orchestrator';

/**
 * Service metadata
 */
export const SERVICE_INFO = {
  name: 'Constitutional AI Service',
  version: '1.0.0',
  description: 'Ethical AI validation framework implementing Ubuntu principles',
  author: 'Azora ES (Pty) Ltd'
} as const;

/**
 * Service health check
 */
export function healthCheck(): { status: string; timestamp: string } {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString()
  };
}
