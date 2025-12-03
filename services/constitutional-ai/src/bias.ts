export function detectBias(text: string): { biased: boolean; evidence: string[] } {
  // Simple heuristics for local dev: look for 'always', 'never', 'must' etc.
  const flags = ['always', 'never', 'must', 'should always', 'all people', 'all users'];
  const found: string[] = [];
  flags.forEach(f => { if (text.toLowerCase().includes(f)) found.push(f); });
  return { biased: found.length > 0, evidence: found };
}
/**
 * Bias Detection System
 * Ubuntu Philosophy: "My security ensures our freedom"
 */

export interface BiasIndicator {
  type: 'gender' | 'racial' | 'age' | 'socioeconomic' | 'cultural' | 'disability';
  patterns: string[];
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface BiasDetectionResult {
  hasBias: boolean;
  biases: Array<{
    type: string;
    severity: string;
    confidence: number;
    matches: string[];
    recommendation: string;
  }>;
  overallScore: number;
  recommendations: string[];
}

export class BiasDetector {
  private biasIndicators: BiasIndicator[] = [
    {
      type: 'gender',
      patterns: [
        'he always', 'she always', 'men are', 'women are', 'girls are', 'boys are',
        'typical woman', 'typical man', 'male nurse', 'female engineer',
        'women should', 'men should', 'girls can\'t', 'boys can\'t'
      ],
      severity: 'medium',
      description: 'Gender-based stereotypes or assumptions'
    },
    {
      type: 'racial',
      patterns: [
        'those people', 'they all', 'you people', 'their kind',
        'ethnic', 'racial', 'minority can\'t', 'immigrants are',
        'foreigners are', 'exotic', 'articulate (when referring to race)'
      ],
      severity: 'high',
      description: 'Racial stereotypes or generalizations'
    },
    {
      type: 'age',
      patterns: [
        'too old', 'too young', 'millennials are', 'boomers are',
        'gen z are', 'senior moment', 'over the hill',
        'inexperienced youth', 'outdated elders'
      ],
      severity: 'medium',
      description: 'Age-based discrimination or stereotypes'
    },
    {
      type: 'socioeconomic',
      patterns: [
        'poor people', 'rich people always', 'low class', 'high class',
        'ghetto', 'trashy', 'elite', 'privileged', 'welfare queens',
        'lazy poor', 'greedy rich'
      ],
      severity: 'high',
      description: 'Economic status discrimination'
    },
    {
      type: 'cultural',
      patterns: [
        'uncivilized', 'backward', 'primitive', 'traditional (as negative)',
        'modern (as superior)', 'western values', 'eastern values (as negative)'
      ],
      severity: 'medium',
      description: 'Cultural bias or ethnocentrism'
    },
    {
      type: 'disability',
      patterns: [
        'crippled', 'handicapped', 'retarded', 'lame', 'crazy',
        'normal people (vs disabled)', 'suffering from (disability)',
        'confined to wheelchair'
      ],
      severity: 'high',
      description: 'Disability discrimination or insensitive language'
    }
  ];

  async detectBias(content: string): Promise<BiasDetectionResult> {
    const normalizedContent = content.toLowerCase();
    const detectedBiases: BiasDetectionResult['biases'] = [];
    
    for (const indicator of this.biasIndicators) {
      const matches = indicator.patterns.filter(pattern => 
        normalizedContent.includes(pattern.toLowerCase())
      );
      
      if (matches.length > 0) {
        const confidence = this.calculateConfidence(matches.length, content.length);
        
        detectedBiases.push({
          type: indicator.type,
          severity: indicator.severity,
          confidence,
          matches,
          recommendation: this.getRecommendation(indicator.type, matches)
        });
      }
    }

    const overallScore = this.calculateOverallBiasScore(detectedBiases);
    const recommendations = this.generateRecommendations(detectedBiases);

    return {
      hasBias: detectedBiases.length > 0,
      biases: detectedBiases,
      overallScore,
      recommendations
    };
  }

  private calculateConfidence(matchCount: number, contentLength: number): number {
    // Higher confidence for more matches in shorter content
    const baseConfidence = Math.min(matchCount * 0.3, 0.9);
    const lengthFactor = Math.max(0.1, 1 - (contentLength / 1000));
    return Math.min(baseConfidence * lengthFactor + 0.1, 0.95);
  }

  private calculateOverallBiasScore(biases: BiasDetectionResult['biases']): number {
    if (biases.length === 0) return 1.0;
    
    const severityWeights = { low: 0.3, medium: 0.6, high: 1.0 };
    const totalWeight = biases.reduce((sum, bias) => 
      sum + severityWeights[bias.severity as keyof typeof severityWeights] * bias.confidence, 0
    );
    
    // Return score where 1.0 = no bias, 0.0 = high bias
    return Math.max(0, 1 - totalWeight / biases.length);
  }

  private getRecommendation(biasType: string, matches: string[]): string {
    const recommendations: Record<string, string> = {
      gender: 'Use gender-neutral language and avoid stereotypes about gender roles',
      racial: 'Avoid racial generalizations and focus on individual characteristics',
      age: 'Use age-neutral language and avoid assumptions based on age',
      socioeconomic: 'Focus on behaviors and circumstances rather than economic labels',
      cultural: 'Respect cultural differences and avoid ethnocentric language',
      disability: 'Use person-first language and avoid disability stereotypes'
    };
    
    return recommendations[biasType] || 'Review language for potential bias';
  }

  private generateRecommendations(biases: BiasDetectionResult['biases']): string[] {
    const recommendations = new Set<string>();
    
    biases.forEach(bias => {
      recommendations.add(bias.recommendation);
    });
    
    // Add general recommendations
    if (biases.length > 2) {
      recommendations.add('Consider comprehensive bias review due to multiple detected issues');
    }
    
    if (biases.some(b => b.severity === 'high')) {
      recommendations.add('High-severity bias detected - immediate revision recommended');
    }
    
    return Array.from(recommendations);
  }

  // Advanced bias detection using semantic analysis
  async detectSemanticBias(content: string): Promise<BiasDetectionResult> {
    // This would integrate with NLP models for deeper semantic analysis
    // For now, extend pattern-based detection with context awareness
    
    const contextPatterns = [
      {
        type: 'microaggression',
        patterns: [
          'you speak so well', 'where are you really from', 'you don\'t look like',
          'for a [group]', 'surprisingly smart', 'articulate (contextual)'
        ],
        severity: 'medium' as const,
        description: 'Subtle microaggressions'
      },
      {
        type: 'tokenism',
        patterns: [
          'token [group]', 'diversity hire', 'meeting quota',
          'only [group] can', '[group] perspective (as sole representation)'
        ],
        severity: 'high' as const,
        description: 'Tokenism or symbolic inclusion'
      }
    ];

    // Combine with existing detection
    const baseResult = await this.detectBias(content);
    
    // Add semantic pattern detection
    for (const pattern of contextPatterns) {
      const matches = pattern.patterns.filter(p => 
        content.toLowerCase().includes(p.toLowerCase())
      );
      
      if (matches.length > 0) {
        baseResult.biases.push({
          type: pattern.type,
          severity: pattern.severity,
          confidence: this.calculateConfidence(matches.length, content.length),
          matches,
          recommendation: this.getRecommendation(pattern.type, matches)
        });
      }
    }

    // Recalculate overall score
    baseResult.overallScore = this.calculateOverallBiasScore(baseResult.biases);
    baseResult.hasBias = baseResult.biases.length > 0;

    return baseResult;
  }
}

export default BiasDetector;
