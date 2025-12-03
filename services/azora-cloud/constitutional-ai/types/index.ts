/**
 * Constitutional AI System - Type Definitions
 * Core interfaces and types for ethical AI validation
 */

/**
 * Validation result from any validator
 */
export interface ValidationResult {
  isValid: boolean;
  violations: string[];
  score: number; // 0-100
  suggestions: string[];
}

/**
 * Ubuntu principles validation result
 */
export interface UbuntuValidationResult extends ValidationResult {
  collectiveBenefitScore: number;
  knowledgeSharingScore: number;
  inclusiveDesignScore: number;
}

/**
 * Bias detection types
 */
export enum BiasType {
  GENDER = 'gender',
  RACE = 'race',
  AGE = 'age',
  RELIGION = 'religion',
  DISABILITY = 'disability',
  SOCIOECONOMIC = 'socioeconomic',
  NATIONALITY = 'nationality'
}

/**
 * Bias severity levels
 */
export enum BiasSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Individual bias score
 */
export interface BiasScore {
  type: BiasType;
  severity: BiasSeverity;
  confidence: number; // 0-1
  context: string;
  location: {
    start: number;
    end: number;
  };
}

/**
 * Bias detection report
 */
export interface BiasReport {
  hasBias: boolean;
  biasTypes: BiasScore[];
  overallSeverity: BiasSeverity;
  mitigatedOutput?: string;
  mitigationApplied: boolean;
}

/**
 * PII (Personally Identifiable Information) types
 */
export enum PIIType {
  EMAIL = 'email',
  PHONE = 'phone',
  SSN = 'ssn',
  ADDRESS = 'address',
  NAME = 'name',
  CREDIT_CARD = 'credit_card',
  IP_ADDRESS = 'ip_address',
  DATE_OF_BIRTH = 'date_of_birth'
}

/**
 * PII match in text
 */
export interface PIIMatch {
  type: PIIType;
  value: string;
  startIndex: number;
  endIndex: number;
  confidence: number; // 0-1
}

/**
 * Privacy filter result
 */
export interface FilterResult {
  hasPII: boolean;
  matches: PIIMatch[];
  filteredOutput: string;
  redactionCount: number;
}

/**
 * Harm types
 */
export enum HarmType {
  VIOLENCE = 'violence',
  HATE_SPEECH = 'hate_speech',
  SELF_HARM = 'self_harm',
  ILLEGAL = 'illegal',
  MISINFORMATION = 'misinformation',
  EXPLOITATION = 'exploitation',
  HARASSMENT = 'harassment',
  DANGEROUS_CONTENT = 'dangerous_content'
}

/**
 * Harm assessment result
 */
export interface HarmAssessment {
  isHarmful: boolean;
  harmTypes: HarmType[];
  severity: number; // 0-10
  explanation: string;
  confidence: number; // 0-1
}

/**
 * Violation details
 */
export interface Violation {
  type: 'ubuntu' | 'bias' | 'privacy' | 'harm';
  severity: BiasSeverity;
  description: string;
  suggestion: string;
  location?: {
    start: number;
    end: number;
  };
}

/**
 * Constitutional validation result
 */
export interface ConstitutionalResult {
  isValid: boolean;
  validatedOutput: string;
  violations: Violation[];
  complianceScore: number; // 0-100
  timestamp: Date;
  metadata: {
    ubuntuValidation: UbuntuValidationResult;
    biasDetection: BiasReport;
    privacyFilter: FilterResult;
    harmPrevention: HarmAssessment;
  };
}

/**
 * Constitutional audit log entry
 */
export interface ConstitutionalAuditLog {
  id: string;
  userId: string;
  query: string;
  originalOutput: string;
  validatedOutput: string;
  violations: Violation[];
  complianceScore: number;
  timestamp: Date;
  tier: string;
  processingTime: number; // milliseconds
}

/**
 * Ubuntu validator interface
 */
export interface IUbuntuValidator {
  validate(output: string): Promise<UbuntuValidationResult>;
  checkCollectiveBenefit(output: string): Promise<number>;
  checkKnowledgeSharing(output: string): Promise<number>;
  checkInclusiveDesign(output: string): Promise<number>;
}

/**
 * Bias detector interface
 */
export interface IBiasDetector {
  detectBias(output: string): Promise<BiasReport>;
  checkDemographicBias(output: string): Promise<BiasScore[]>;
  mitigateBias(output: string, biases: BiasScore[]): Promise<string>;
}

/**
 * Privacy filter interface
 */
export interface IPrivacyFilter {
  filterPII(output: string): Promise<FilterResult>;
  detectPII(output: string): Promise<PIIMatch[]>;
  redactPII(output: string, matches: PIIMatch[]): Promise<string>;
}

/**
 * Harm prevention interface
 */
export interface IHarmPrevention {
  assessHarm(query: string, output: string): Promise<HarmAssessment>;
  isHarmful(assessment: HarmAssessment): boolean;
  generateSafeResponse(query: string): string;
}

/**
 * Constitutional orchestrator interface
 */
export interface IConstitutionalOrchestrator {
  validateOutput(query: string, output: string, context?: Record<string, any>): Promise<ConstitutionalResult>;
  logValidation(result: ConstitutionalResult, userId: string): Promise<void>;
  getComplianceMetrics(): Promise<ComplianceMetrics>;
}

/**
 * Compliance metrics
 */
export interface ComplianceMetrics {
  totalValidations: number;
  successfulValidations: number;
  failedValidations: number;
  averageComplianceScore: number;
  violationsByType: Record<string, number>;
  averageProcessingTime: number;
  lastUpdated: Date;
}

/**
 * Configuration for Constitutional AI
 */
export interface ConstitutionalAIConfig {
  // Ubuntu validation settings
  ubuntuEnabled: boolean;
  ubuntuThreshold: number; // 0-100
  
  // Bias detection settings
  biasDetectionEnabled: boolean;
  biasSeverityThreshold: BiasSeverity;
  autoMitigateBias: boolean;
  
  // Privacy filter settings
  privacyFilterEnabled: boolean;
  piiRedactionEnabled: boolean;
  piiTypes: PIIType[];
  
  // Harm prevention settings
  harmPreventionEnabled: boolean;
  harmSeverityThreshold: number; // 0-10
  blockHarmfulContent: boolean;
  
  // Audit logging settings
  auditLoggingEnabled: boolean;
  auditLogRetention: number; // days
  
  // Performance settings
  validationTimeout: number; // milliseconds
  parallelValidation: boolean;
  
  // Compliance settings
  minComplianceScore: number; // 0-100
  strictMode: boolean;
}
