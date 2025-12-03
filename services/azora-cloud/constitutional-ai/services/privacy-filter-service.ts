/**
 * Privacy Filter Service
 * Orchestrates PII detection and redaction with configurable patterns
 */

import {
  FilterResult,
  PIIMatch,
  PIIType
} from '../types';
import { PrivacyFilter } from '../validators/privacy-filter';
import { PrivacyFilterConfig } from '../types/validators';

/**
 * Privacy filter service configuration
 */
export interface PrivacyFilterServiceConfig extends PrivacyFilterConfig {
  // Custom redaction patterns per PII type
  customRedactionPatterns?: Partial<Record<PIIType, string>>;
  
  // Whitelist patterns that should not be redacted
  whitelistPatterns?: RegExp[];
  
  // Enable detailed logging
  enableLogging?: boolean;
  
  // Maximum text length to process
  maxTextLength?: number;
}

/**
 * Privacy filter statistics
 */
export interface PrivacyFilterStats {
  totalFiltered: number;
  totalPIIDetected: number;
  piiByType: Record<PIIType, number>;
  averageProcessingTime: number;
  lastProcessed: Date;
}

/**
 * Privacy Filter Service
 * Provides orchestration and configuration management for privacy filtering
 */
export class PrivacyFilterService {
  private privacyFilter: PrivacyFilter;
  private config: PrivacyFilterServiceConfig;
  private stats: PrivacyFilterStats;

  constructor(config: Partial<PrivacyFilterServiceConfig> = {}) {
    this.config = {
      enabled: true,
      timeout: 5000,
      strictMode: true,
      piiTypesToDetect: Object.values(PIIType),
      redactionPattern: '[REDACTED]',
      preserveFormat: false,
      enableLogging: false,
      maxTextLength: 100000,
      ...config
    };

    this.privacyFilter = new PrivacyFilter(this.config);
    
    this.stats = {
      totalFiltered: 0,
      totalPIIDetected: 0,
      piiByType: {} as Record<PIIType, number>,
      averageProcessingTime: 0,
      lastProcessed: new Date()
    };

    // Initialize stats for each PII type
    Object.values(PIIType).forEach(type => {
      this.stats.piiByType[type] = 0;
    });
  }

  /**
   * Filter text with PII detection and redaction
   */
  async filter(text: string): Promise<FilterResult> {
    const startTime = Date.now();

    try {
      // Validate input
      if (!text || text.trim().length === 0) {
        return {
          hasPII: false,
          matches: [],
          filteredOutput: text,
          redactionCount: 0
        };
      }

      // Check text length
      if (text.length > this.config.maxTextLength!) {
        if (this.config.enableLogging) {
          console.warn(`Text length ${text.length} exceeds maximum ${this.config.maxTextLength}`);
        }
        text = text.substring(0, this.config.maxTextLength!);
      }

      // Apply whitelist filtering
      const whitelistedMatches = this.applyWhitelist(text);

      // Perform PII detection and redaction
      const result = await this.privacyFilter.filterPII(text);

      // Remove whitelisted matches
      if (whitelistedMatches.length > 0) {
        result.matches = result.matches.filter(
          match => !this.isWhitelisted(match, whitelistedMatches)
        );
        
        // Re-redact without whitelisted items
        if (result.matches.length > 0) {
          result.filteredOutput = await this.privacyFilter.redactPII(text, result.matches);
        } else {
          result.filteredOutput = text;
        }
        
        result.hasPII = result.matches.length > 0;
        result.redactionCount = result.matches.length;
      }

      // Apply custom redaction patterns if configured
      if (this.config.customRedactionPatterns) {
        result.filteredOutput = this.applyCustomRedactions(
          result.filteredOutput,
          result.matches
        );
      }

      // Update statistics
      this.updateStats(result, Date.now() - startTime);

      // Log if enabled
      if (this.config.enableLogging && result.hasPII) {
        console.log(`Privacy filter detected ${result.redactionCount} PII instances`);
      }

      return result;
    } catch (error) {
      console.error('Privacy filter service error:', error);
      
      // Return original text in case of error
      return {
        hasPII: false,
        matches: [],
        filteredOutput: text,
        redactionCount: 0
      };
    }
  }

  /**
   * Detect PII without redaction
   */
  async detect(text: string): Promise<PIIMatch[]> {
    try {
      return await this.privacyFilter.detectPII(text);
    } catch (error) {
      console.error('PII detection error:', error);
      return [];
    }
  }

  /**
   * Apply whitelist patterns
   */
  private applyWhitelist(text: string): PIIMatch[] {
    if (!this.config.whitelistPatterns || this.config.whitelistPatterns.length === 0) {
      return [];
    }

    const whitelisted: PIIMatch[] = [];

    for (const pattern of this.config.whitelistPatterns) {
      pattern.lastIndex = 0;
      let match;
      
      while ((match = pattern.exec(text)) !== null) {
        whitelisted.push({
          type: PIIType.NAME, // Generic type for whitelisted items
          value: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          confidence: 1.0
        });
      }
    }

    return whitelisted;
  }

  /**
   * Check if a match is whitelisted
   */
  private isWhitelisted(match: PIIMatch, whitelisted: PIIMatch[]): boolean {
    return whitelisted.some(
      w => w.startIndex <= match.startIndex && w.endIndex >= match.endIndex
    );
  }

  /**
   * Apply custom redaction patterns
   */
  private applyCustomRedactions(text: string, matches: PIIMatch[]): string {
    if (!this.config.customRedactionPatterns) {
      return text;
    }

    let result = text;
    let offset = 0;

    for (const match of matches) {
      const customPattern = this.config.customRedactionPatterns[match.type];
      if (!customPattern) {continue;}

      const adjustedStart = match.startIndex + offset;
      const adjustedEnd = match.endIndex + offset;

      // Find the current redacted text
      const currentRedaction = result.substring(adjustedStart, adjustedEnd);
      
      // Only replace if it's a standard redaction pattern
      if (currentRedaction.includes('REDACTED') || currentRedaction.includes('XXX')) {
        result =
          result.substring(0, adjustedStart) +
          customPattern +
          result.substring(adjustedEnd);

        offset += customPattern.length - (adjustedEnd - adjustedStart);
      }
    }

    return result;
  }

  /**
   * Update statistics
   */
  private updateStats(result: FilterResult, processingTime: number): void {
    this.stats.totalFiltered++;
    this.stats.totalPIIDetected += result.redactionCount;
    this.stats.lastProcessed = new Date();

    // Update PII type counts
    result.matches.forEach(match => {
      this.stats.piiByType[match.type]++;
    });

    // Update average processing time
    this.stats.averageProcessingTime =
      (this.stats.averageProcessingTime * (this.stats.totalFiltered - 1) + processingTime) /
      this.stats.totalFiltered;
  }

  /**
   * Get statistics
   */
  getStats(): PrivacyFilterStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalFiltered: 0,
      totalPIIDetected: 0,
      piiByType: {} as Record<PIIType, number>,
      averageProcessingTime: 0,
      lastProcessed: new Date()
    };

    Object.values(PIIType).forEach(type => {
      this.stats.piiByType[type] = 0;
    });
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PrivacyFilterServiceConfig>): void {
    this.config = { ...this.config, ...config };
    this.privacyFilter.updateConfig(this.config);
  }

  /**
   * Get current configuration
   */
  getConfig(): PrivacyFilterServiceConfig {
    return { ...this.config };
  }

  /**
   * Add custom redaction pattern for a PII type
   */
  addCustomRedactionPattern(type: PIIType, pattern: string): void {
    if (!this.config.customRedactionPatterns) {
      this.config.customRedactionPatterns = {};
    }
    this.config.customRedactionPatterns[type] = pattern;
  }

  /**
   * Add whitelist pattern
   */
  addWhitelistPattern(pattern: RegExp): void {
    if (!this.config.whitelistPatterns) {
      this.config.whitelistPatterns = [];
    }
    this.config.whitelistPatterns.push(pattern);
  }

  /**
   * Enable/disable specific PII type detection
   */
  setPIITypeEnabled(type: PIIType, enabled: boolean): void {
    if (enabled) {
      if (!this.config.piiTypesToDetect.includes(type)) {
        this.config.piiTypesToDetect.push(type);
      }
    } else {
      this.config.piiTypesToDetect = this.config.piiTypesToDetect.filter(t => t !== type);
    }
    this.privacyFilter.updateConfig(this.config);
  }

  /**
   * Check if service is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Enable/disable service
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.privacyFilter.updateConfig(this.config);
  }
}

/**
 * Create a privacy filter service instance
 */
export function createPrivacyFilterService(
  config?: Partial<PrivacyFilterServiceConfig>
): PrivacyFilterService {
  return new PrivacyFilterService(config);
}

/**
 * Export singleton instance
 */
export const privacyFilterService = createPrivacyFilterService();

export default privacyFilterService;
