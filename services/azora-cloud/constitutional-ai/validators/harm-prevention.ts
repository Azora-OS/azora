/**
 * Harm Prevention Module
 * Detects and prevents harmful content in AI outputs
 */

import {
  HarmAssessment,
  HarmType,
  IHarmPrevention
} from '../types';

/**
 * Configuration for harm prevention
 */
export interface HarmPreventionConfig {
  enabled: boolean;
  severityThreshold: number; // 0-10
  blockOnDetection: boolean;
  harmTypesToCheck: HarmType[];
  confidenceThreshold: number; // 0-1
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: HarmPreventionConfig = {
  enabled: true,
  severityThreshold: 5,
  blockOnDetection: true,
  harmTypesToCheck: Object.values(HarmType),
  confidenceThreshold: 0.7
};

/**
 * Harm detection patterns
 */
interface HarmPattern {
  type: HarmType;
  patterns: RegExp[];
  keywords: string[];
  severity: number; // 0-10
}

/**
 * Harm Prevention System
 * Implements detection and prevention of harmful content
 */
export class HarmPrevention implements IHarmPrevention {
  private config: HarmPreventionConfig;
  private harmPatterns: HarmPattern[];

  constructor(config: Partial<HarmPreventionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.harmPatterns = this.initializeHarmPatterns();
  }

  /**
   * Initialize harm detection patterns
   */
  private initializeHarmPatterns(): HarmPattern[] {
    return [
      // Violence patterns
      {
        type: HarmType.VIOLENCE,
        patterns: [
          /\b(kill|murder|assault|attack|harm|hurt|injure|wound|stab|shoot|beat)\s+(someone|people|person|them|him|her)\b/gi,
          /\bhow\s+to\s+(kill|murder|harm|hurt|injure)\b/gi,
          /\b(weapon|gun|knife|bomb|explosive)\s+(make|build|create|construct)\b/gi,
          /\b(torture|mutilate|dismember|maim)\b/gi
        ],
        keywords: ['violence', 'assault', 'murder', 'kill', 'attack', 'harm', 'weapon', 'torture'],
        severity: 9
      },
      // Hate speech patterns
      {
        type: HarmType.HATE_SPEECH,
        patterns: [
          /\b(hate|despise|detest)\s+(all|every)?\s*(black|white|asian|jewish|muslim|christian|gay|lesbian|trans|women|men)\s+(people|person|individuals)\b/gi,
          /\b(inferior|superior)\s+(race|ethnicity|gender|religion|groups?)\b/gi,
          /\b(slur|derogatory|offensive)\s+(term|word|language)\s+(for|about|against)\b/gi,
          /\b(certain|some)\s+groups?\s+(are|is)\s+(inferior|superior)\b/gi
        ],
        keywords: ['hate', 'racist', 'sexist', 'bigot', 'supremacy'],
        severity: 10
      },
      // Self-harm patterns
      {
        type: HarmType.SELF_HARM,
        patterns: [
          /\bhow\s+to\s+(commit\s+suicide|kill\s+(myself|yourself)|end\s+(my|your)\s+life)\b/gi,
          /\b(suicide|self-harm|self\s+harm|cutting|overdose)\s+(method|way|technique)\b/gi,
          /\bwant\s+to\s+(die|kill\s+myself|end\s+it\s+all)\b/gi
        ],
        keywords: ['suicide', 'self-harm', 'cutting', 'overdose', 'end my life'],
        severity: 10
      },
      // Illegal activity patterns
      {
        type: HarmType.ILLEGAL,
        patterns: [
          /\bhow\s+to\s+(hack|break\s+into|steal|rob|fraud|scam|launder\s+money)\b/gi,
          /\b(illegal|illicit)\s+(drug|substance|narcotic)\s+(make|produce|manufacture|synthesize)\b/gi,
          /\b(counterfeit|forge|fake)\s+(money|currency|document|id|passport)\b/gi,
          /\b(child|minor)\s+(abuse|exploitation|pornography)\b/gi
        ],
        keywords: ['illegal', 'hack', 'steal', 'fraud', 'counterfeit', 'drug', 'exploit'],
        severity: 10
      },
      // Misinformation patterns
      {
        type: HarmType.MISINFORMATION,
        patterns: [
          /\b(vaccine|vaccination)s?\s+(cause|causes|caused)\s+(autism|death|harm)\b/gi,
          /\b(covid|coronavirus)\s+(is\s+a\s+)?(hoax|fake|conspiracy)\b/gi,
          /\b(election|vote)\s+(was\s+)?(rigged|stolen|fraudulent)\b/gi,
          /\b(climate\s+change|global\s+warming)\s+(is\s+a\s+)?(hoax|fake|myth)\b/gi,
          /\bdo\s+vaccines?\s+cause\b/gi
        ],
        keywords: ['hoax', 'conspiracy', 'fake news', 'misinformation', 'disinformation', 'autism'],
        severity: 7
      },
      // Exploitation patterns
      {
        type: HarmType.EXPLOITATION,
        patterns: [
          /\b(exploit|manipulate|take\s+advantage\s+of)\s+(vulnerable|elderly|children|minors)\b/gi,
          /\b(scam|con|trick|deceive)\s+(people|victims|targets)\b/gi,
          /\b(pyramid\s+scheme|ponzi\s+scheme|multi-level\s+marketing)\s+(join|start|create)\b/gi
        ],
        keywords: ['exploit', 'scam', 'manipulate', 'deceive', 'pyramid scheme'],
        severity: 8
      },
      // Harassment patterns
      {
        type: HarmType.HARASSMENT,
        patterns: [
          /\b(stalk|harass|threaten|intimidate|bully)\s+(someone|person|them)\b/gi,
          /\b(dox|doxx|expose)\s+(personal|private)\s+(information|details|address)\b/gi,
          /\bsend\s+(threatening|harassing)\s+(message|email|text)\b/gi
        ],
        keywords: ['harass', 'stalk', 'threaten', 'intimidate', 'bully', 'dox'],
        severity: 8
      },
      // Dangerous content patterns
      {
        type: HarmType.DANGEROUS_CONTENT,
        patterns: [
          /\bhow\s+to\s+(make|build|create)\s+(bomb|explosive|poison|toxin)\b/gi,
          /\b(dangerous|hazardous)\s+(chemical|substance)\s+(mix|combine|create)\b/gi,
          /\b(bioweapon|biological\s+weapon|chemical\s+weapon)\s+(make|create|develop)\b/gi
        ],
        keywords: ['bomb', 'explosive', 'poison', 'toxin', 'bioweapon', 'dangerous'],
        severity: 10
      }
    ];
  }

  /**
   * Assess harm in query and output
   */
  async assessHarm(query: string, output: string): Promise<HarmAssessment> {
    if (!this.config.enabled) {
      return {
        isHarmful: false,
        harmTypes: [],
        severity: 0,
        explanation: 'Harm prevention is disabled',
        confidence: 1.0
      };
    }

    // Combine query and output for comprehensive analysis
    const combinedText = `${query} ${output}`;
    
    // Detect harm types
    const detectedHarms = this.detectHarmTypes(combinedText);
    
    // Calculate overall severity
    const severity = this.calculateSeverity(detectedHarms);
    
    // Calculate confidence
    const confidence = this.calculateConfidence(detectedHarms);
    
    // Generate explanation
    const explanation = this.generateExplanation(detectedHarms, severity);
    
    // Determine if harmful based on threshold
    const isHarmful = severity >= this.config.severityThreshold && 
                      confidence >= this.config.confidenceThreshold;

    return {
      isHarmful,
      harmTypes: detectedHarms.map(h => h.type),
      severity,
      explanation,
      confidence
    };
  }

  /**
   * Detect specific harm types in text
   */
  private detectHarmTypes(text: string): Array<{ type: HarmType; matches: number; severity: number }> {
    const detected: Array<{ type: HarmType; matches: number; severity: number }> = [];

    for (const harmPattern of this.harmPatterns) {
      // Skip if not in configured types to check
      if (!this.config.harmTypesToCheck.includes(harmPattern.type)) {
        continue;
      }

      let matchCount = 0;

      // Check regex patterns
      for (const pattern of harmPattern.patterns) {
        const matches = text.match(pattern);
        if (matches) {
          matchCount += matches.length;
        }
      }

      // Check keywords
      const lowerText = text.toLowerCase();
      for (const keyword of harmPattern.keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          matchCount++;
        }
      }

      // If matches found, add to detected harms
      if (matchCount > 0) {
        detected.push({
          type: harmPattern.type,
          matches: matchCount,
          severity: harmPattern.severity
        });
      }
    }

    return detected;
  }

  /**
   * Calculate overall severity score
   */
  private calculateSeverity(detectedHarms: Array<{ type: HarmType; matches: number; severity: number }>): number {
    if (detectedHarms.length === 0) {
      return 0;
    }

    // Use the highest severity among detected harms
    const maxSeverity = Math.max(...detectedHarms.map(h => h.severity));
    
    // Adjust based on number of different harm types detected
    const typeMultiplier = Math.min(1 + (detectedHarms.length - 1) * 0.1, 1.5);
    
    // Calculate final severity (capped at 10)
    return Math.min(maxSeverity * typeMultiplier, 10);
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(detectedHarms: Array<{ type: HarmType; matches: number; severity: number }>): number {
    if (detectedHarms.length === 0) {
      return 1.0; // High confidence in no harm
    }

    // Calculate confidence based on number of matches
    const totalMatches = detectedHarms.reduce((sum, h) => sum + h.matches, 0);
    
    // More matches = higher confidence
    // Base confidence of 0.6, increases with matches
    const confidence = Math.min(0.6 + (totalMatches * 0.1), 1.0);
    
    return confidence;
  }

  /**
   * Generate explanation for harm assessment
   */
  private generateExplanation(
    detectedHarms: Array<{ type: HarmType; matches: number; severity: number }>,
    severity: number
  ): string {
    if (detectedHarms.length === 0) {
      return 'No harmful content detected.';
    }

    const harmTypeNames = detectedHarms.map(h => this.formatHarmType(h.type)).join(', ');
    
    if (severity >= 9) {
      return `Critical harmful content detected: ${harmTypeNames}. This content poses serious risks and cannot be provided.`;
    } else if (severity >= 7) {
      return `Significant harmful content detected: ${harmTypeNames}. This content may cause harm and should be avoided.`;
    } else if (severity >= 5) {
      return `Potentially harmful content detected: ${harmTypeNames}. This content requires careful consideration.`;
    } else {
      return `Minor concerns detected: ${harmTypeNames}. Content may need review but appears relatively safe.`;
    }
  }

  /**
   * Format harm type for display
   */
  private formatHarmType(type: HarmType): string {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Check if assessment indicates harmful content
   */
  isHarmful(assessment: HarmAssessment): boolean {
    return assessment.isHarmful && 
           assessment.severity >= this.config.severityThreshold &&
           assessment.confidence >= this.config.confidenceThreshold;
  }

  /**
   * Generate safe response for harmful queries
   */
  generateSafeResponse(query: string): string {
    // Detect the primary harm type from the query
    const detectedHarms = this.detectHarmTypes(query);
    
    if (detectedHarms.length === 0) {
      return "I cannot provide a response to this query as it may involve harmful content.";
    }

    const primaryHarmType = detectedHarms[0].type;
    
    // Generate appropriate safe response based on harm type
    return this.getSafeResponseTemplate(primaryHarmType);
  }

  /**
   * Get safe response template for specific harm type
   */
  private getSafeResponseTemplate(harmType: HarmType): string {
    const templates: Record<HarmType, string> = {
      [HarmType.VIOLENCE]: 
        "I cannot provide information that could be used to harm others. If you're experiencing thoughts of violence, please reach out to a mental health professional or contact local emergency services.",
      
      [HarmType.HATE_SPEECH]: 
        "I cannot engage with content that promotes hate or discrimination. All people deserve respect and dignity regardless of their background, identity, or beliefs.",
      
      [HarmType.SELF_HARM]: 
        "I'm concerned about your wellbeing. If you're having thoughts of self-harm or suicide, please reach out for help immediately. Contact a crisis helpline: National Suicide Prevention Lifeline (US): 988, or visit your local emergency services.",
      
      [HarmType.ILLEGAL]: 
        "I cannot provide information about illegal activities. If you have questions about the law, please consult with a legal professional or law enforcement.",
      
      [HarmType.MISINFORMATION]: 
        "I cannot provide information that contradicts established scientific consensus or verified facts. For accurate information, please consult reputable sources such as peer-reviewed research, official health organizations, or fact-checking services.",
      
      [HarmType.EXPLOITATION]: 
        "I cannot provide information that could be used to exploit or manipulate others. If you're aware of exploitation, please report it to appropriate authorities.",
      
      [HarmType.HARASSMENT]: 
        "I cannot provide information that could be used to harass, threaten, or intimidate others. Such behavior is harmful and often illegal. If you're experiencing harassment, please contact local authorities.",
      
      [HarmType.DANGEROUS_CONTENT]: 
        "I cannot provide information about creating dangerous substances or weapons. This information poses serious safety risks. If you have legitimate safety concerns, please contact appropriate authorities or safety professionals."
    };

    return templates[harmType] || "I cannot provide a response to this query as it involves potentially harmful content. Please rephrase your question or seek appropriate professional guidance.";
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<HarmPreventionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): HarmPreventionConfig {
    return { ...this.config };
  }
}

/**
 * Factory function to create harm prevention instance
 */
export function createHarmPrevention(config?: Partial<HarmPreventionConfig>): HarmPrevention {
  return new HarmPrevention(config);
}
