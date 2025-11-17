/**
 * Constitutional AI System - Helper Functions
 * Utility functions for validation and processing
 */

import { BiasSeverity, BiasScore, PIIMatch, Violation } from '../types';
import { SEVERITY_THRESHOLDS } from './constants';

/**
 * Calculate overall severity from bias scores
 */
export function calculateBiasSeverity(biases: BiasScore[]): BiasSeverity {
  if (biases.length === 0) return BiasSeverity.LOW;
  
  const maxConfidence = Math.max(...biases.map(b => b.confidence));
  
  if (maxConfidence >= SEVERITY_THRESHOLDS.BIAS.CRITICAL) {
    return BiasSeverity.CRITICAL;
  } else if (maxConfidence >= SEVERITY_THRESHOLDS.BIAS.HIGH) {
    return BiasSeverity.HIGH;
  } else if (maxConfidence >= SEVERITY_THRESHOLDS.BIAS.MEDIUM) {
    return BiasSeverity.MEDIUM;
  }
  
  return BiasSeverity.LOW;
}

/**
 * Calculate compliance score from individual scores
 */
export function calculateComplianceScore(
  ubuntuScore: number,
  biasScore: number,
  privacyScore: number,
  harmScore: number
): number {
  // Weighted average: Ubuntu 30%, Bias 25%, Privacy 25%, Harm 20%
  const weights = {
    ubuntu: 0.30,
    bias: 0.25,
    privacy: 0.25,
    harm: 0.20
  };
  
  return Math.round(
    ubuntuScore * weights.ubuntu +
    biasScore * weights.bias +
    privacyScore * weights.privacy +
    harmScore * weights.harm
  );
}

/**
 * Normalize score to 0-100 range
 */
export function normalizeScore(score: number, min: number = 0, max: number = 1): number {
  return Math.round(((score - min) / (max - min)) * 100);
}

/**
 * Generate unique ID for audit logs
 */
export function generateAuditId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sanitize text for logging (remove PII)
 */
export function sanitizeForLogging(text: string, piiMatches: PIIMatch[]): string {
  let sanitized = text;
  
  // Sort matches by start index in descending order to avoid index shifting
  const sortedMatches = [...piiMatches].sort((a, b) => b.startIndex - a.startIndex);
  
  for (const match of sortedMatches) {
    sanitized = 
      sanitized.substring(0, match.startIndex) +
      '[REDACTED]' +
      sanitized.substring(match.endIndex);
  }
  
  return sanitized;
}

/**
 * Check if text contains harmful patterns
 */
export function containsHarmfulPatterns(text: string, patterns: string[]): boolean {
  const lowerText = text.toLowerCase();
  return patterns.some(pattern => lowerText.includes(pattern.toLowerCase()));
}

/**
 * Extract context around a match
 */
export function extractContext(
  text: string,
  startIndex: number,
  endIndex: number,
  contextLength: number = 50
): string {
  const start = Math.max(0, startIndex - contextLength);
  const end = Math.min(text.length, endIndex + contextLength);
  
  let context = text.substring(start, end);
  
  if (start > 0) context = '...' + context;
  if (end < text.length) context = context + '...';
  
  return context;
}

/**
 * Merge violations from multiple validators
 */
export function mergeViolations(violationArrays: Violation[][]): Violation[] {
  const merged: Violation[] = [];
  const seen = new Set<string>();
  
  for (const violations of violationArrays) {
    for (const violation of violations) {
      const key = `${violation.type}_${violation.description}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(violation);
      }
    }
  }
  
  return merged;
}

/**
 * Format timestamp for audit logs
 */
export function formatTimestamp(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Calculate processing time
 */
export function calculateProcessingTime(startTime: number): number {
  return Date.now() - startTime;
}

/**
 * Validate configuration object
 */
export function validateConfig<T extends Record<string, any>>(
  config: T,
  requiredFields: (keyof T)[]
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  for (const field of requiredFields) {
    if (config[field] === undefined || config[field] === null) {
      missing.push(String(field));
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Truncate text for display
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Sleep utility for testing
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await sleep(baseDelay * Math.pow(2, i));
      }
    }
  }
  
  throw lastError;
}
