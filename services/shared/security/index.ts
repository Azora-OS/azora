/**
 * Security Services Index
 * Exports all security-related services and utilities
 */

export {
  KeyManagementService,
  initializeKeyManagement,
  getKeyManagementService
} from './key-management';

export {
  SecretsManagementService,
  initializeSecretsManagement,
  getSecretsManagementService
} from './secrets-management';

export {
  GDPRComplianceService,
  initializeGDPRCompliance,
  getGDPRComplianceService
} from './gdpr-compliance';

export { default as setupSecurityMiddleware } from '../middleware/security-headers';

// Re-export from middleware
export {
  corsConfig,
  createRateLimiter,
  rateLimiters,
  helmetConfig
} from '../middleware/security';

export {
  configureSecurityHeaders,
  configureRateLimiting,
  configureSanitization,
  configureCORS,
  securityHeadersMiddleware,
  removeSensitiveHeaders,
  setupSecurityMiddleware
} from '../middleware/security-headers';
