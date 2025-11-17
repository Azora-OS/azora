/**
 * Constitutional Orchestrator
 * Integrates all validators into a unified validation pipeline
 */

import {
  IConstitutionalOrchestrator,
  ConstitutionalResult,
  Violation,
  BiasSeverity,
  ComplianceMetrics,
  ConstitutionalAIConfig
} from './types';
import { UbuntuValidator } from './validators/ubuntu-validator';
import { BiasDetector } from './validators/bias-detector';
import { PrivacyFilter } from './validators/privacy-filter';
import { HarmPrevention } from './validators/harm-prevention';
import { AuditLogger } from './audit/audit-logger';
import { DEFAULT_CONFIG } from './utils/constants';

/**
 * Default orchestrator configuration
 */
const DEFAULT_ORCHESTRATOR_CONFIG: ConstitutionalAIConfig = {
  ubuntuEnabled: true,
  ubuntuThreshold: DEFAULT_CONFIG.UBUNTU_THRESHOLD,
  biasDetectionEnabled: true,
  biasSeverityThreshold: BiasSeverity.MEDIUM,
  autoMitigateBias: true,
  privacyFilterEnabled: true,
  piiRedactionEnabled: true,
  piiTypes: [],
  harmPreventionEnabled: true,
  harmSeverityThreshold: 5,
  blockHarmfulContent: true,
  auditLoggingEnabled: true,
  auditLogRetention: 90,
  validationTimeout: 5000,
  parallelValidation: true,
  minComplianceScore: 70,
  strictMode: false
};

/**
 * Constitutional Orchestrator Implementation
 * Coordinates all validation components
 */
export class ConstitutionalOrchestrator implements IConstitutionalOrchestrator {
  private config: ConstitutionalAIConfig;
  private ubuntuValidator: UbuntuValidator;
  private biasDetector: BiasDetector;
  private privacyFilter: PrivacyFilter;
  private harmPrevention: HarmPrevention;
  private auditLogger: AuditLogger;
  private auditLogs: Map<string, any[]>;
  private metrics: {
    totalValidations: number;
    successfulValidations: number;
    failedValidations: number;
    totalComplianceScore: number;
    violationCounts: Record<string, number>;
    totalProcessingTime: number;
  };

  constructor(config: Partial<ConstitutionalAIConfig> = {}) {
    this.config = { ...DEFAULT_ORCHESTRATOR_CONFIG, ...config };
    
    // Initialize validators
    this.ubuntuValidator = new UbuntuValidator({
      minScore: this.config.ubuntuThreshold,
      strictMode: this.config.strictMode
    });
    
    this.biasDetector = new BiasDetector({
      enabled: this.config.biasDetectionEnabled,
      autoMitigate: this.config.autoMitigateBias,
      severityThreshold: this.config.biasSeverityThreshold
    });
    
    this.privacyFilter = new PrivacyFilter({
      enabled: this.config.privacyFilterEnabled,
      strictMode: this.config.strictMode
    });
    
    this.harmPrevention = new HarmPrevention({
      enabled: this.config.harmPreventionEnabled,
      severityThreshold: this.config.harmSeverityThreshold,
      blockOnDetection: this.config.blockHarmfulContent
    });
    
    // Initialize audit logger
    this.auditLogger = new AuditLogger({
      enabled: this.config.auditLoggingEnabled,
      retentionDays: this.config.auditLogRetention,
      encryptionEnabled: true
    });
    
    // Initialize audit log storage (in-memory for now)
    this.auditLogs = new Map();
    
    // Initialize metrics
    this.metrics = {
      totalValidations: 0,
      successfulValidations: 0,
      failedValidations: 0,
      totalComplianceScore: 0,
      violationCounts: {},
      totalProcessingTime: 0
    };
  }

  /**
   * Validate AI output through complete pipeline
   */
  async validateOutput(
    query: string,
    output: string,
    context?: Record<string, any>
  ): Promise<ConstitutionalResult> {
    const startTime = Date.now();
    
    try {
      // Run validation pipeline
      const validationResults = await this.runValidationPipeline(query, output);
      
      // Calculate compliance score
      const complianceScore = this.calculateComplianceScore(validationResults);
      
      // Collect all violations
      const violations = this.collectViolations(validationResults);
      
      // Determine if output is valid
      const isValid = this.isOutputValid(complianceScore, violations, validationResults);
      
      // Get validated output (with mitigations applied)
      const validatedOutput = this.getValidatedOutput(output, validationResults, isValid);
      
      // Create result
      const result: ConstitutionalResult = {
        isValid,
        validatedOutput,
        violations,
        complianceScore,
        timestamp: new Date(),
        metadata: {
          ubuntuValidation: validationResults.ubuntu,
          biasDetection: validationResults.bias,
          privacyFilter: validationResults.privacy,
          harmPrevention: validationResults.harm
        }
      };
      
      // Update metrics
      const processingTime = Date.now() - startTime;
      this.updateMetrics(result, processingTime);
      
      return result;
    } catch (error) {
      console.error('Constitutional validation error:', error);
      
      // Return safe fallback result
      return this.createErrorResult(output, error);
    }
  }

  /**
   * Run all validators in pipeline
   */
  private async runValidationPipeline(query: string, output: string) {
    if (this.config.parallelValidation) {
      // Run all validators in parallel for better performance
      const [ubuntu, bias, privacy, harm] = await Promise.all([
        this.config.ubuntuEnabled 
          ? this.ubuntuValidator.validate(output)
          : this.createSkippedUbuntuResult(),
        this.config.biasDetectionEnabled
          ? this.biasDetector.detectBias(output)
          : this.createSkippedBiasResult(),
        this.config.privacyFilterEnabled
          ? this.privacyFilter.filterPII(output)
          : this.createSkippedPrivacyResult(),
        this.config.harmPreventionEnabled
          ? this.harmPrevention.assessHarm(query, output)
          : this.createSkippedHarmResult()
      ]);
      
      return { ubuntu, bias, privacy, harm };
    } else {
      // Run validators sequentially
      const ubuntu = this.config.ubuntuEnabled
        ? await this.ubuntuValidator.validate(output)
        : this.createSkippedUbuntuResult();
      
      const bias = this.config.biasDetectionEnabled
        ? await this.biasDetector.detectBias(output)
        : this.createSkippedBiasResult();
      
      const privacy = this.config.privacyFilterEnabled
        ? await this.privacyFilter.filterPII(output)
        : this.createSkippedPrivacyResult();
      
      const harm = this.config.harmPreventionEnabled
        ? await this.harmPrevention.assessHarm(query, output)
        : this.createSkippedHarmResult();
      
      return { ubuntu, bias, privacy, harm };
    }
  }

  /**
   * Calculate overall compliance score
   */
  private calculateComplianceScore(validationResults: any): number {
    let totalScore = 0;
    let totalWeight = 0;
    
    // Ubuntu score (weight: 30%)
    if (this.config.ubuntuEnabled) {
      totalScore += validationResults.ubuntu.score * 0.3;
      totalWeight += 0.3;
    }
    
    // Bias score (weight: 25%)
    if (this.config.biasDetectionEnabled) {
      const biasScore = validationResults.bias.hasBias ? 0 : 100;
      totalScore += biasScore * 0.25;
      totalWeight += 0.25;
    }
    
    // Privacy score (weight: 25%)
    if (this.config.privacyFilterEnabled) {
      const privacyScore = validationResults.privacy.hasPII ? 50 : 100;
      totalScore += privacyScore * 0.25;
      totalWeight += 0.25;
    }
    
    // Harm score (weight: 20%)
    if (this.config.harmPreventionEnabled) {
      const harmScore = validationResults.harm.isHarmful ? 0 : 100;
      totalScore += harmScore * 0.2;
      totalWeight += 0.2;
    }
    
    // Normalize score
    const normalizedScore = totalWeight > 0 ? totalScore / totalWeight : 100;
    
    return Math.round(normalizedScore);
  }

  /**
   * Collect all violations from validation results
   */
  private collectViolations(validationResults: any): Violation[] {
    const violations: Violation[] = [];
    
    // Ubuntu violations
    if (this.config.ubuntuEnabled && !validationResults.ubuntu.isValid) {
      for (const violation of validationResults.ubuntu.violations) {
        violations.push({
          type: 'ubuntu',
          severity: BiasSeverity.MEDIUM,
          description: violation,
          suggestion: validationResults.ubuntu.suggestions[0] || 'Improve Ubuntu compliance'
        });
      }
    }
    
    // Bias violations
    if (this.config.biasDetectionEnabled && validationResults.bias.hasBias) {
      for (const biasScore of validationResults.bias.biasTypes) {
        violations.push({
          type: 'bias',
          severity: biasScore.severity,
          description: `${biasScore.type} bias detected: ${biasScore.context}`,
          suggestion: 'Use neutral, inclusive language',
          location: biasScore.location
        });
      }
    }
    
    // Privacy violations
    if (this.config.privacyFilterEnabled && validationResults.privacy.hasPII) {
      for (const piiMatch of validationResults.privacy.matches) {
        violations.push({
          type: 'privacy',
          severity: BiasSeverity.HIGH,
          description: `PII detected: ${piiMatch.type}`,
          suggestion: 'Remove or redact personally identifiable information',
          location: {
            start: piiMatch.startIndex,
            end: piiMatch.endIndex
          }
        });
      }
    }
    
    // Harm violations
    if (this.config.harmPreventionEnabled && validationResults.harm.isHarmful) {
      violations.push({
        type: 'harm',
        severity: BiasSeverity.CRITICAL,
        description: `Harmful content detected: ${validationResults.harm.explanation}`,
        suggestion: 'Refuse request and provide safe alternative'
      });
    }
    
    return violations;
  }

  /**
   * Determine if output is valid based on all checks
   */
  private isOutputValid(
    complianceScore: number,
    violations: Violation[],
    validationResults: any
  ): boolean {
    // Critical failures
    if (this.config.harmPreventionEnabled && validationResults.harm.isHarmful) {
      return false;
    }
    
    // Check for critical violations
    const hasCriticalViolations = violations.some(
      v => v.severity === BiasSeverity.CRITICAL
    );
    if (hasCriticalViolations) {
      return false;
    }
    
    // Check compliance score threshold
    if (complianceScore < this.config.minComplianceScore) {
      return false;
    }
    
    // In strict mode, any violation fails validation
    if (this.config.strictMode && violations.length > 0) {
      return false;
    }
    
    return true;
  }

  /**
   * Get validated output with mitigations applied
   */
  private getValidatedOutput(
    originalOutput: string,
    validationResults: any,
    isValid: boolean
  ): string {
    // If harmful, return safe response
    if (this.config.harmPreventionEnabled && validationResults.harm.isHarmful) {
      return this.harmPrevention.generateSafeResponse(originalOutput);
    }
    
    let output = originalOutput;
    
    // Apply privacy filter
    if (this.config.privacyFilterEnabled && validationResults.privacy.hasPII) {
      output = validationResults.privacy.filteredOutput;
    }
    
    // Apply bias mitigation
    if (this.config.biasDetectionEnabled && 
        this.config.autoMitigateBias && 
        validationResults.bias.mitigatedOutput) {
      output = validationResults.bias.mitigatedOutput;
    }
    
    return output;
  }

  /**
   * Log validation result for audit trail
   */
  async logValidation(
    result: ConstitutionalResult,
    userId: string,
    query: string = '',
    originalOutput: string = '',
    tier: string = 'unknown',
    processingTime: number = 0
  ): Promise<void> {
    if (!this.config.auditLoggingEnabled) {
      return;
    }
    
    // Use the new audit logger
    await this.auditLogger.log(
      result,
      userId,
      query,
      originalOutput,
      tier,
      processingTime
    );
    
    // Also maintain in-memory logs for backward compatibility
    const logEntry = {
      id: this.generateLogId(),
      userId,
      timestamp: result.timestamp,
      complianceScore: result.complianceScore,
      isValid: result.isValid,
      violations: result.violations,
      metadata: result.metadata
    };
    
    if (!this.auditLogs.has(userId)) {
      this.auditLogs.set(userId, []);
    }
    
    const userLogs = this.auditLogs.get(userId)!;
    userLogs.push(logEntry);
    
    // Implement retention policy
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - this.config.auditLogRetention);
    
    const filteredLogs = userLogs.filter(
      log => log.timestamp >= retentionDate
    );
    
    this.auditLogs.set(userId, filteredLogs);
  }

  /**
   * Get compliance metrics
   */
  async getComplianceMetrics(): Promise<ComplianceMetrics> {
    const averageComplianceScore = this.metrics.totalValidations > 0
      ? this.metrics.totalComplianceScore / this.metrics.totalValidations
      : 0;
    
    const averageProcessingTime = this.metrics.totalValidations > 0
      ? this.metrics.totalProcessingTime / this.metrics.totalValidations
      : 0;
    
    return {
      totalValidations: this.metrics.totalValidations,
      successfulValidations: this.metrics.successfulValidations,
      failedValidations: this.metrics.failedValidations,
      averageComplianceScore: Math.round(averageComplianceScore),
      violationsByType: { ...this.metrics.violationCounts },
      averageProcessingTime: Math.round(averageProcessingTime),
      lastUpdated: new Date()
    };
  }

  /**
   * Update internal metrics
   */
  private updateMetrics(result: ConstitutionalResult, processingTime: number): void {
    this.metrics.totalValidations++;
    
    if (result.isValid) {
      this.metrics.successfulValidations++;
    } else {
      this.metrics.failedValidations++;
    }
    
    this.metrics.totalComplianceScore += result.complianceScore;
    this.metrics.totalProcessingTime += processingTime;
    
    // Count violations by type
    for (const violation of result.violations) {
      const key = violation.type;
      this.metrics.violationCounts[key] = (this.metrics.violationCounts[key] || 0) + 1;
    }
  }

  /**
   * Create error result for exception cases
   */
  private createErrorResult(output: string, error: any): ConstitutionalResult {
    return {
      isValid: false,
      validatedOutput: 'An error occurred during validation. Please try again.',
      violations: [{
        type: 'ubuntu',
        severity: BiasSeverity.CRITICAL,
        description: `Validation error: ${error.message}`,
        suggestion: 'Contact system administrator'
      }],
      complianceScore: 0,
      timestamp: new Date(),
      metadata: {
        ubuntuValidation: this.createSkippedUbuntuResult(),
        biasDetection: this.createSkippedBiasResult(),
        privacyFilter: this.createSkippedPrivacyResult(),
        harmPrevention: this.createSkippedHarmResult()
      }
    };
  }

  /**
   * Helper methods for skipped validations
   */
  private createSkippedUbuntuResult() {
    return {
      isValid: true,
      violations: [],
      score: 100,
      suggestions: [],
      collectiveBenefitScore: 100,
      knowledgeSharingScore: 100,
      inclusiveDesignScore: 100
    };
  }

  private createSkippedBiasResult() {
    return {
      hasBias: false,
      biasTypes: [],
      overallSeverity: BiasSeverity.LOW,
      mitigatedOutput: undefined,
      mitigationApplied: false
    };
  }

  private createSkippedPrivacyResult() {
    return {
      hasPII: false,
      matches: [],
      filteredOutput: '',
      redactionCount: 0
    };
  }

  private createSkippedHarmResult() {
    return {
      isHarmful: false,
      harmTypes: [],
      severity: 0,
      explanation: 'Harm prevention disabled',
      confidence: 1.0
    };
  }

  /**
   * Generate unique log ID
   */
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ConstitutionalAIConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Update validator configs
    this.ubuntuValidator.updateConfig({
      minScore: this.config.ubuntuThreshold,
      strictMode: this.config.strictMode
    });
    
    this.biasDetector.updateConfig({
      enabled: this.config.biasDetectionEnabled,
      autoMitigate: this.config.autoMitigateBias,
      severityThreshold: this.config.biasSeverityThreshold
    });
    
    this.privacyFilter.updateConfig({
      enabled: this.config.privacyFilterEnabled,
      strictMode: this.config.strictMode
    });
    
    this.harmPrevention.updateConfig({
      enabled: this.config.harmPreventionEnabled,
      severityThreshold: this.config.harmSeverityThreshold,
      blockOnDetection: this.config.blockHarmfulContent
    });
  }

  /**
   * Get current configuration
   */
  getConfig(): ConstitutionalAIConfig {
    return { ...this.config };
  }

  /**
   * Get audit logs for a user
   */
  getAuditLogs(userId: string): any[] {
    return this.auditLogs.get(userId) || [];
  }

  /**
   * Clear all audit logs (for testing)
   */
  clearAuditLogs(): void {
    this.auditLogs.clear();
  }

  /**
   * Reset metrics (for testing)
   */
  resetMetrics(): void {
    this.metrics = {
      totalValidations: 0,
      successfulValidations: 0,
      failedValidations: 0,
      totalComplianceScore: 0,
      violationCounts: {},
      totalProcessingTime: 0
    };
  }

  /**
   * Get audit logger instance
   */
  getAuditLogger(): AuditLogger {
    return this.auditLogger;
  }

  /**
   * Shutdown orchestrator gracefully
   */
  async shutdown(): Promise<void> {
    await this.auditLogger.shutdown();
  }
}

/**
 * Factory function to create orchestrator instance
 */
export function createConstitutionalOrchestrator(
  config?: Partial<ConstitutionalAIConfig>
): ConstitutionalOrchestrator {
  return new ConstitutionalOrchestrator(config);
}

/**
 * Export default instance
 */
export default createConstitutionalOrchestrator();
