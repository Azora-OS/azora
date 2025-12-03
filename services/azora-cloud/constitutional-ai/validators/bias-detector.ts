/**
 * Bias Detector Module
 * Detects and mitigates demographic bias in AI outputs
 */

import {
  BiasReport,
  BiasScore,
  BiasType,
  BiasSeverity,
  IBiasDetector
} from '../types';

/**
 * Configuration for bias detection
 */
export interface BiasDetectorConfig {
  enabled: boolean;
  confidenceThreshold: number; // 0-1
  autoMitigate: boolean;
  severityThreshold: BiasSeverity;
  biasTypesToCheck: BiasType[];
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: BiasDetectorConfig = {
  enabled: true,
  confidenceThreshold: 0.6,
  autoMitigate: true,
  severityThreshold: BiasSeverity.MEDIUM,
  biasTypesToCheck: Object.values(BiasType)
};

/**
 * Bias pattern definitions for detection
 */
interface BiasPattern {
  type: BiasType;
  patterns: RegExp[];
  severity: BiasSeverity;
  description: string;
}

/**
 * BiasDetector class
 * Implements demographic bias detection and mitigation
 */
export class BiasDetector implements IBiasDetector {
  private config: BiasDetectorConfig;
  private biasPatterns: BiasPattern[];

  constructor(config: Partial<BiasDetectorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.biasPatterns = this.initializeBiasPatterns();
  }

  /**
   * Initialize bias detection patterns
   */
  private initializeBiasPatterns(): BiasPattern[] {
    return [
      // Gender bias patterns
      {
        type: BiasType.GENDER,
        patterns: [
          /\b(men|male|he|him|his)\s+(are|is)\s+(better|superior|smarter|stronger)\b/gi,
          /\b(women|female|she|her)\s+(are|is)\s+(worse|inferior|weaker|emotional)\b/gi,
          /\b(girls?|ladies)\s+(should|must|need to)\s+(stay|remain|be)\b/gi,
          /\b(boys?|men)\s+(don't|shouldn't|can't)\s+(cry|show emotion|be sensitive)\b/gi,
          /\b(woman|female)\s+driver\b/gi,
          /\b(man|male)\s+nurse\b/gi,
          /\bfor\s+a\s+(woman|girl|female)\b/gi
        ],
        severity: BiasSeverity.HIGH,
        description: 'Gender-based stereotyping or discrimination'
      },
      // Race bias patterns
      {
        type: BiasType.RACE,
        patterns: [
          /\b(white|black|asian|hispanic|latino)\s+(people|person)\s+(are|is)\s+(better|worse|smarter|dumber)\b/gi,
          /\b(race|ethnicity)\s+(determines|defines|dictates)\b/gi,
          /\b(all|every)\s+(whites?|blacks?|asians?|hispanics?|latinos?)\s+(are|do|have)\b/gi,
          /\b(typical|stereotypical)\s+(white|black|asian|hispanic|latino)\b/gi
        ],
        severity: BiasSeverity.CRITICAL,
        description: 'Racial stereotyping or discrimination'
      },
      // Age bias patterns
      {
        type: BiasType.AGE,
        patterns: [
          /\b(old|elderly|senior)\s+(people|person)\s+(can't|cannot|shouldn't)\b/gi,
          /\b(young|millennial|gen\s*z)\s+(people|person)\s+(are|is)\s+(lazy|entitled|irresponsible)\b/gi,
          /\btoo\s+(old|young)\s+(for|to)\b/gi,
          /\b(boomers?|millennials?)\s+(are|always|never)\b/gi
        ],
        severity: BiasSeverity.MEDIUM,
        description: 'Age-based stereotyping or discrimination'
      },
      // Religion bias patterns
      {
        type: BiasType.RELIGION,
        patterns: [
          /\b(muslim|christian|jewish|hindu|buddhist)s?\s+(are|is)\s+(terrorist|extremist|radical)\b/gi,
          /\b(religion|faith)\s+(makes|causes)\s+(violence|terrorism|hatred)\b/gi,
          /\b(all|every)\s+(muslim|christian|jewish|hindu|buddhist)s?\s+(believe|think|do)\b/gi
        ],
        severity: BiasSeverity.CRITICAL,
        description: 'Religious stereotyping or discrimination'
      },
      // Disability bias patterns
      {
        type: BiasType.DISABILITY,
        patterns: [
          /\b(disabled|handicapped)\s+(people|person)\s+(can't|cannot|shouldn't)\b/gi,
          /\b(wheelchair\s+bound|confined\s+to\s+wheelchair)\b/gi,
          /\b(suffers?\s+from|victim\s+of)\s+(disability|condition)\b/gi,
          /\b(normal|regular)\s+people\b/gi,
          /\b(retarded|crippled|lame)\b/gi
        ],
        severity: BiasSeverity.HIGH,
        description: 'Disability-based stereotyping or ableist language'
      },
      // Socioeconomic bias patterns
      {
        type: BiasType.SOCIOECONOMIC,
        patterns: [
          /\b(poor|low-income)\s+(people|person)\s+(are|is)\s+(lazy|stupid|criminal)\b/gi,
          /\b(rich|wealthy)\s+(people|person)\s+(deserve|earned)\s+(everything|success)\b/gi,
          /\b(poverty|being\s+poor)\s+(is|means)\s+(their\s+fault|a\s+choice)\b/gi
        ],
        severity: BiasSeverity.MEDIUM,
        description: 'Socioeconomic stereotyping or discrimination'
      },
      // Nationality bias patterns
      {
        type: BiasType.NATIONALITY,
        patterns: [
          /\b(all|every)\s+([A-Z][a-z]+)\s+(people|person)\s+(are|is)\s+(lazy|criminal|terrorist)\b/gi,
          /\b([A-Z][a-z]+)\s+(people|person)\s+(should|must)\s+(go\s+back|leave|stay\s+out)\b/gi
        ],
        severity: BiasSeverity.HIGH,
        description: 'Nationality-based stereotyping or discrimination'
      }
    ];
  }

  /**
   * Detect bias in output text
   */
  async detectBias(output: string): Promise<BiasReport> {
    if (!this.config.enabled || !output || output.trim().length === 0) {
      return {
        hasBias: false,
        biasTypes: [],
        overallSeverity: BiasSeverity.LOW,
        mitigatedOutput: undefined,
        mitigationApplied: false
      };
    }

    const biasScores = await this.checkDemographicBias(output);
    const hasBias = biasScores.length > 0;
    const overallSeverity = this.calculateOverallSeverity(biasScores);

    let mitigatedOutput: string | undefined;
    let mitigationApplied = false;

    if (hasBias && this.config.autoMitigate) {
      mitigatedOutput = await this.mitigateBias(output, biasScores);
      mitigationApplied = true;
    }

    return {
      hasBias,
      biasTypes: biasScores,
      overallSeverity,
      mitigatedOutput,
      mitigationApplied
    };
  }

  /**
   * Check for demographic bias in text
   */
  async checkDemographicBias(output: string): Promise<BiasScore[]> {
    const biasScores: BiasScore[] = [];

    for (const pattern of this.biasPatterns) {
      // Skip if this bias type is not configured to be checked
      if (!this.config.biasTypesToCheck.includes(pattern.type)) {
        continue;
      }

      for (const regex of pattern.patterns) {
        const matches = Array.from(output.matchAll(regex));

        for (const match of matches) {
          if (match.index !== undefined) {
            const confidence = this.calculateConfidence(match[0], pattern);

            // Only include if confidence meets threshold
            if (confidence >= this.config.confidenceThreshold) {
              biasScores.push({
                type: pattern.type,
                severity: pattern.severity,
                confidence,
                context: this.extractContext(output, match.index, match[0].length),
                location: {
                  start: match.index,
                  end: match.index + match[0].length
                }
              });
            }
          }
        }
      }
    }

    return biasScores;
  }

  /**
   * Mitigate detected bias in text
   */
  async mitigateBias(output: string, biases: BiasScore[]): Promise<string> {
    if (biases.length === 0) {
      return output;
    }

    let mitigatedText = output;

    // Sort biases by location (descending) to avoid index shifting
    const sortedBiases = [...biases].sort((a, b) => b.location.start - a.location.start);

    for (const bias of sortedBiases) {
      const biasedText = output.substring(bias.location.start, bias.location.end);
      const neutralText = this.getNeutralReplacement(biasedText, bias.type);

      mitigatedText =
        mitigatedText.substring(0, bias.location.start) +
        neutralText +
        mitigatedText.substring(bias.location.end);
    }

    return mitigatedText;
  }

  /**
   * Calculate confidence score for a bias match
   */
  private calculateConfidence(matchedText: string, pattern: BiasPattern): number {
    // Base confidence on pattern severity and match characteristics
    let confidence = 0.7; // Base confidence

    // Increase confidence for critical severity patterns
    if (pattern.severity === BiasSeverity.CRITICAL) {
      confidence += 0.2;
    } else if (pattern.severity === BiasSeverity.HIGH) {
      confidence += 0.1;
    }

    // Increase confidence for longer matches (more specific)
    if (matchedText.length > 30) {
      confidence += 0.1;
    }

    // Cap at 1.0
    return Math.min(confidence, 1.0);
  }

  /**
   * Calculate overall severity from multiple bias scores
   */
  private calculateOverallSeverity(biasScores: BiasScore[]): BiasSeverity {
    if (biasScores.length === 0) {
      return BiasSeverity.LOW;
    }

    // Find the highest severity
    const severityOrder = [
      BiasSeverity.LOW,
      BiasSeverity.MEDIUM,
      BiasSeverity.HIGH,
      BiasSeverity.CRITICAL
    ];

    let maxSeverity = BiasSeverity.LOW;
    for (const score of biasScores) {
      const currentIndex = severityOrder.indexOf(score.severity);
      const maxIndex = severityOrder.indexOf(maxSeverity);
      if (currentIndex > maxIndex) {
        maxSeverity = score.severity;
      }
    }

    return maxSeverity;
  }

  /**
   * Extract context around a bias match
   */
  private extractContext(text: string, start: number, length: number): string {
    const contextRadius = 50;
    const contextStart = Math.max(0, start - contextRadius);
    const contextEnd = Math.min(text.length, start + length + contextRadius);

    let context = text.substring(contextStart, contextEnd);

    // Add ellipsis if truncated
    if (contextStart > 0) {
      context = '...' + context;
    }
    if (contextEnd < text.length) {
      context = context + '...';
    }

    return context;
  }

  /**
   * Get neutral replacement for biased text
   */
  private getNeutralReplacement(biasedText: string, biasType: BiasType): string {
    // Simple mitigation strategy: replace with neutral language
    const replacements: Record<BiasType, string> = {
      [BiasType.GENDER]: '[neutral language needed]',
      [BiasType.RACE]: '[neutral language needed]',
      [BiasType.AGE]: '[neutral language needed]',
      [BiasType.RELIGION]: '[neutral language needed]',
      [BiasType.DISABILITY]: '[neutral language needed]',
      [BiasType.SOCIOECONOMIC]: '[neutral language needed]',
      [BiasType.NATIONALITY]: '[neutral language needed]'
    };

    return replacements[biasType] || '[neutral language needed]';
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<BiasDetectorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): BiasDetectorConfig {
    return { ...this.config };
  }
}
