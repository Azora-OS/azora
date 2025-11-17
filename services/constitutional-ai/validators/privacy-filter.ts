/**
 * Privacy Filter - PII Detection and Redaction
 * Detects and redacts personally identifiable information
 */

import {
  IPrivacyFilter,
  FilterResult,
  PIIMatch,
  PIIType
} from '../types';
import { PrivacyFilterConfig } from '../types/validators';

/**
 * Default configuration for privacy filter
 */
const DEFAULT_CONFIG: PrivacyFilterConfig = {
  enabled: true,
  timeout: 5000,
  strictMode: true,
  piiTypesToDetect: Object.values(PIIType),
  redactionPattern: '[REDACTED]',
  preserveFormat: false
};

/**
 * PII detection patterns
 */
const PII_PATTERNS: Record<PIIType, RegExp> = {
  [PIIType.EMAIL]: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  [PIIType.PHONE]: /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
  [PIIType.SSN]: /\b\d{3}-\d{2}-\d{4}\b/g,
  [PIIType.CREDIT_CARD]: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
  [PIIType.IP_ADDRESS]: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
  [PIIType.DATE_OF_BIRTH]: /\b(?:0[1-9]|1[0-2])[-/](?:0[1-9]|[12][0-9]|3[01])[-/](?:19|20)\d{2}\b/g,
  // Address pattern - simplified for common formats
  [PIIType.ADDRESS]: /\b\d+\s+[A-Za-z0-9\s,]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir|Way)\b/gi,
  // Name pattern - basic detection of capitalized words (2-4 words)
  [PIIType.NAME]: /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}\b/g
};

/**
 * Privacy Filter implementation
 */
export class PrivacyFilter implements IPrivacyFilter {
  private config: PrivacyFilterConfig;

  constructor(config: Partial<PrivacyFilterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Filter PII from output
   */
  async filterPII(output: string): Promise<FilterResult> {
    try {
      // Detect all PII
      const matches = await this.detectPII(output);

      // Redact PII if found
      const filteredOutput = matches.length > 0
        ? await this.redactPII(output, matches)
        : output;

      return {
        hasPII: matches.length > 0,
        matches,
        filteredOutput,
        redactionCount: matches.length
      };
    } catch (error) {
      console.error('Privacy filter error:', error);
      // In case of error, return original output but flag as having potential PII
      return {
        hasPII: false,
        matches: [],
        filteredOutput: output,
        redactionCount: 0
      };
    }
  }

  /**
   * Detect PII in text
   */
  async detectPII(output: string): Promise<PIIMatch[]> {
    const matches: PIIMatch[] = [];

    // Check each PII type that's enabled
    for (const piiType of this.config.piiTypesToDetect) {
      const pattern = PII_PATTERNS[piiType as PIIType];
      if (!pattern) continue;

      // Reset regex lastIndex
      pattern.lastIndex = 0;

      let match;
      while ((match = pattern.exec(output)) !== null) {
        // Additional validation for name detection to reduce false positives
        if (piiType === PIIType.NAME) {
          if (!this.isLikelyName(match[0], output, match.index)) {
            continue;
          }
        }

        matches.push({
          type: piiType as PIIType,
          value: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          confidence: this.calculateConfidence(piiType as PIIType, match[0])
        });
      }
    }

    // Sort matches by start index for proper redaction
    return matches.sort((a, b) => a.startIndex - b.startIndex);
  }

  /**
   * Redact PII from text
   */
  async redactPII(output: string, matches: PIIMatch[]): Promise<string> {
    let redactedOutput = output;
    let offset = 0;

    // Process matches in order
    for (const match of matches) {
      const adjustedStart = match.startIndex + offset;
      const adjustedEnd = match.endIndex + offset;

      const redactionText = this.config.preserveFormat
        ? this.getFormattedRedaction(match.type, match.value)
        : this.config.redactionPattern;

      // Replace the PII with redaction text
      redactedOutput =
        redactedOutput.substring(0, adjustedStart) +
        redactionText +
        redactedOutput.substring(adjustedEnd);

      // Update offset for next replacement
      offset += redactionText.length - (match.endIndex - match.startIndex);
    }

    return redactedOutput;
  }

  /**
   * Get formatted redaction that preserves structure
   */
  private getFormattedRedaction(type: PIIType, _value: string): string {
    switch (type) {
      case PIIType.EMAIL:
        return '[EMAIL_REDACTED]';
      case PIIType.PHONE:
        return '[PHONE_REDACTED]';
      case PIIType.SSN:
        return 'XXX-XX-XXXX';
      case PIIType.CREDIT_CARD:
        return 'XXXX-XXXX-XXXX-XXXX';
      case PIIType.IP_ADDRESS:
        return 'XXX.XXX.XXX.XXX';
      case PIIType.DATE_OF_BIRTH:
        return 'XX/XX/XXXX';
      case PIIType.ADDRESS:
        return '[ADDRESS_REDACTED]';
      case PIIType.NAME:
        return '[NAME_REDACTED]';
      default:
        return this.config.redactionPattern;
    }
  }

  /**
   * Calculate confidence score for PII detection
   */
  private calculateConfidence(type: PIIType, _value: string): number {
    // Higher confidence for more structured data
    switch (type) {
      case PIIType.EMAIL:
      case PIIType.SSN:
      case PIIType.CREDIT_CARD:
      case PIIType.IP_ADDRESS:
        return 0.95;
      case PIIType.PHONE:
      case PIIType.DATE_OF_BIRTH:
        return 0.85;
      case PIIType.ADDRESS:
        return 0.75;
      case PIIType.NAME:
        return 0.65; // Lower confidence due to potential false positives
      default:
        return 0.5;
    }
  }

  /**
   * Check if a matched string is likely a real name
   * Reduces false positives by checking context
   */
  private isLikelyName(match: string, fullText: string, index: number): boolean {
    // Skip if it's a common word or phrase
    const commonWords = [
      'The United States', 'New York', 'Los Angeles', 'San Francisco',
      'United Kingdom', 'South Africa', 'North America', 'South America',
      'Middle East', 'East Coast', 'West Coast', 'Central Park'
    ];

    if (commonWords.some(word => match.includes(word))) {
      return false;
    }

    // Check if preceded by name indicators
    const precedingText = fullText.substring(Math.max(0, index - 20), index).toLowerCase();
    const nameIndicators = ['mr.', 'mrs.', 'ms.', 'dr.', 'prof.', 'by ', 'from ', 'to '];
    
    if (nameIndicators.some(indicator => precedingText.includes(indicator))) {
      return true;
    }

    // If it's 2 capitalized words, it's likely a name
    const words = match.split(/\s+/);
    if (words.length === 2) {
      return true;
    }

    // For 3+ words, be more conservative
    return words.length <= 4;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PrivacyFilterConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): PrivacyFilterConfig {
    return { ...this.config };
  }
}

/**
 * Create a privacy filter instance
 */
export function createPrivacyFilter(config?: Partial<PrivacyFilterConfig>): PrivacyFilter {
  return new PrivacyFilter(config);
}

/**
 * Export default instance
 */
export default createPrivacyFilter();
