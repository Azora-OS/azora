/**
 * Validator-specific type definitions
 */

import {
  ValidationResult,
  UbuntuValidationResult,
  BiasReport,
  FilterResult,
  HarmAssessment
} from './index';

/**
 * Base validator configuration
 */
export interface ValidatorConfig {
  enabled: boolean;
  timeout: number; // milliseconds
  strictMode: boolean;
}

/**
 * Ubuntu validator configuration
 */
export interface UbuntuValidatorConfig extends ValidatorConfig {
  collectiveBenefitWeight: number; // 0-1
  knowledgeSharingWeight: number; // 0-1
  inclusiveDesignWeight: number; // 0-1
  minScore: number; // 0-100
}

/**
 * Bias detector configuration
 */
export interface BiasDetectorConfig extends ValidatorConfig {
  biasTypesToCheck: string[];
  confidenceThreshold: number; // 0-1
  autoMitigate: boolean;
  mitigationStrategy: 'replace' | 'remove' | 'rephrase';
}

/**
 * Privacy filter configuration
 */
export interface PrivacyFilterConfig extends ValidatorConfig {
  piiTypesToDetect: string[];
  redactionPattern: string; // e.g., '[REDACTED]', '***'
  preserveFormat: boolean; // e.g., keep email format but redact value
}

/**
 * Harm prevention configuration
 */
export interface HarmPreventionConfig extends ValidatorConfig {
  harmTypesToCheck: string[];
  severityThreshold: number; // 0-10
  blockOnDetection: boolean;
  safeResponseTemplate: string;
}

/**
 * Validation context
 */
export interface ValidationContext {
  userId?: string;
  sessionId?: string;
  tier?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

/**
 * Validator result with context
 */
export interface ValidatorResult<T extends ValidationResult> {
  result: T;
  context: ValidationContext;
  processingTime: number; // milliseconds
  validatorVersion: string;
}
