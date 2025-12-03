/**
 * Constitutional AI System - Constants
 * Shared constants and configuration values
 */

import { BiasType, PIIType, HarmType, BiasSeverity } from '../types';

/**
 * Ubuntu principles
 */
export const UBUNTU_PRINCIPLES = {
  COLLECTIVE_BENEFIT: 'collective-benefit',
  KNOWLEDGE_SHARING: 'knowledge-sharing',
  INCLUSIVE_DESIGN: 'inclusive-design',
  SOVEREIGNTY_RESPECTING: 'sovereignty-respecting',
  PRO_SOCIAL: 'pro-social'
} as const;

/**
 * Ubuntu principle keywords for detection
 */
export const UBUNTU_KEYWORDS = {
  COLLECTIVE_BENEFIT: [
    'community',
    'collective',
    'together',
    'shared',
    'common good',
    'benefit all',
    'everyone',
    'inclusive',
    'collaborative'
  ],
  KNOWLEDGE_SHARING: [
    'learn',
    'teach',
    'share',
    'educate',
    'knowledge',
    'information',
    'open',
    'transparent',
    'accessible'
  ],
  INCLUSIVE_DESIGN: [
    'accessible',
    'inclusive',
    'diverse',
    'equitable',
    'fair',
    'universal',
    'barrier-free',
    'accommodating'
  ]
} as const;

/**
 * Bias detection patterns
 */
export const BIAS_PATTERNS: Record<BiasType, string[]> = {
  [BiasType.GENDER]: [
    'men are better',
    'women should',
    'boys are',
    'girls are',
    'male superiority',
    'female inferiority'
  ],
  [BiasType.RACE]: [
    'racial superiority',
    'ethnic cleansing',
    'race-based',
    'racial stereotype'
  ],
  [BiasType.AGE]: [
    'too old',
    'too young',
    'age limit',
    'generational'
  ],
  [BiasType.RELIGION]: [
    'religious superiority',
    'faith-based discrimination',
    'religious intolerance'
  ],
  [BiasType.DISABILITY]: [
    'disabled people can\'t',
    'handicapped',
    'invalid',
    'crippled'
  ],
  [BiasType.SOCIOECONOMIC]: [
    'poor people are',
    'rich people deserve',
    'class-based'
  ],
  [BiasType.NATIONALITY]: [
    'nationality superiority',
    'xenophobic',
    'nationalist'
  ]
};

/**
 * PII detection regex patterns
 */
export const PII_PATTERNS: Record<PIIType, RegExp> = {
  [PIIType.EMAIL]: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  [PIIType.PHONE]: /\b(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  [PIIType.SSN]: /\b\d{3}-\d{2}-\d{4}\b/g,
  [PIIType.ADDRESS]: /\b\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|highway|hwy|square|sq|trail|trl|drive|dr|court|ct|parkway|pkwy|circle|cir|boulevard|blvd)\b/gi,
  [PIIType.NAME]: /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g,
  [PIIType.CREDIT_CARD]: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
  [PIIType.IP_ADDRESS]: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  [PIIType.DATE_OF_BIRTH]: /\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/g
};

/**
 * Harm detection keywords
 */
export const HARM_KEYWORDS: Record<HarmType, string[]> = {
  [HarmType.VIOLENCE]: [
    'kill',
    'murder',
    'assault',
    'attack',
    'harm',
    'hurt',
    'weapon',
    'bomb',
    'shoot'
  ],
  [HarmType.HATE_SPEECH]: [
    'hate',
    'discriminate',
    'racist',
    'sexist',
    'bigot',
    'supremacy',
    'slur'
  ],
  [HarmType.SELF_HARM]: [
    'suicide',
    'self-harm',
    'cut myself',
    'end my life',
    'kill myself'
  ],
  [HarmType.ILLEGAL]: [
    'illegal',
    'crime',
    'fraud',
    'theft',
    'smuggle',
    'trafficking'
  ],
  [HarmType.MISINFORMATION]: [
    'fake news',
    'conspiracy',
    'hoax',
    'false claim',
    'disinformation'
  ],
  [HarmType.EXPLOITATION]: [
    'exploit',
    'manipulate',
    'deceive',
    'scam',
    'fraud',
    'abuse'
  ],
  [HarmType.HARASSMENT]: [
    'harass',
    'bully',
    'threaten',
    'intimidate',
    'stalk'
  ],
  [HarmType.DANGEROUS_CONTENT]: [
    'dangerous',
    'hazardous',
    'toxic',
    'poison',
    'explosive'
  ]
};

/**
 * Severity thresholds
 */
export const SEVERITY_THRESHOLDS = {
  BIAS: {
    LOW: 0.3,
    MEDIUM: 0.6,
    HIGH: 0.8,
    CRITICAL: 0.95
  },
  HARM: {
    LOW: 2,
    MEDIUM: 5,
    HIGH: 7,
    CRITICAL: 9
  },
  COMPLIANCE: {
    MINIMUM: 70,
    GOOD: 80,
    EXCELLENT: 90
  }
} as const;

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
  UBUNTU_THRESHOLD: 70,
  BIAS_SEVERITY_THRESHOLD: BiasSeverity.MEDIUM,
  HARM_SEVERITY_THRESHOLD: 5,
  MIN_COMPLIANCE_SCORE: 70,
  VALIDATION_TIMEOUT: 5000, // 5 seconds
  AUDIT_LOG_RETENTION: 90, // 90 days
  PII_REDACTION_PATTERN: '[REDACTED]'
} as const;

/**
 * Safe response templates
 */
export const SAFE_RESPONSE_TEMPLATES = {
  HARMFUL_CONTENT: "I cannot provide information that could be harmful. If you're experiencing difficulties, please reach out to appropriate support services.",
  BIAS_DETECTED: "I've detected potential bias in this response. Let me rephrase that in a more inclusive way.",
  PII_DETECTED: "I've removed personally identifiable information from this response to protect privacy.",
  UBUNTU_VIOLATION: "This response doesn't align with our Ubuntu principles of collective benefit and knowledge sharing. Let me provide a better answer."
} as const;

/**
 * Validation error messages
 */
export const ERROR_MESSAGES = {
  VALIDATION_TIMEOUT: 'Validation timed out',
  VALIDATION_FAILED: 'Validation failed',
  INVALID_INPUT: 'Invalid input provided',
  CONFIGURATION_ERROR: 'Configuration error',
  PROCESSING_ERROR: 'Error processing validation'
} as const;

/**
 * Metric names for monitoring
 */
export const METRICS = {
  VALIDATION_COUNT: 'constitutional_ai_validation_count',
  VALIDATION_DURATION: 'constitutional_ai_validation_duration_ms',
  COMPLIANCE_SCORE: 'constitutional_ai_compliance_score',
  VIOLATION_COUNT: 'constitutional_ai_violation_count',
  BIAS_DETECTION_COUNT: 'constitutional_ai_bias_detection_count',
  PII_DETECTION_COUNT: 'constitutional_ai_pii_detection_count',
  HARM_DETECTION_COUNT: 'constitutional_ai_harm_detection_count'
} as const;
