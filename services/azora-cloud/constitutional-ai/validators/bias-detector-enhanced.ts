/**
 * Enhanced Bias Detector with NLP Integration
 * Uses compromise library for advanced text analysis
 */

import nlp from 'compromise';
import {
  BiasReport,
  BiasScore,
  BiasType,
  BiasSeverity
} from '../types';
import { BiasDetector, BiasDetectorConfig } from './bias-detector';

/**
 * Enhanced bias detection with NLP capabilities
 */
export class EnhancedBiasDetector extends BiasDetector {
  constructor(config: Partial<BiasDetectorConfig> = {}) {
    super(config);
  }

  /**
   * Enhanced bias detection using NLP analysis
   */
  async detectBias(output: string): Promise<BiasReport> {
    // Get base detection results
    const baseReport = await super.detectBias(output);

    // Enhance with NLP analysis
    const nlpBiases = await this.detectNLPBias(output);

    // Merge results
    const allBiases = [...baseReport.biasTypes, ...nlpBiases];
    const uniqueBiases = this.deduplicateBiases(allBiases);

    const hasBias = uniqueBiases.length > 0;
    const overallSeverity = this.calculateOverallSeverity(uniqueBiases);

    let mitigatedOutput: string | undefined;
    let mitigationApplied = false;

    if (hasBias && this.getConfig().autoMitigate) {
      mitigatedOutput = await this.mitigateBias(output, uniqueBiases);
      mitigationApplied = true;
    }

    return {
      hasBias,
      biasTypes: uniqueBiases,
      overallSeverity,
      mitigatedOutput,
      mitigationApplied
    };
  }

  /**
   * Detect bias using NLP analysis
   */
  private async detectNLPBias(output: string): Promise<BiasScore[]> {
    const biases: BiasScore[] = [];
    const doc = nlp(output);

    // Analyze gendered language
    const genderBiases = this.analyzeGenderBias(doc, output);
    biases.push(...genderBiases);

    // Analyze stereotypical associations
    const stereotypeBiases = this.analyzeStereotypes(doc, output);
    biases.push(...stereotypeBiases);

    // Analyze exclusionary language
    const exclusionBiases = this.analyzeExclusionaryLanguage(doc, output);
    biases.push(...exclusionBiases);

    return biases;
  }

  /**
   * Analyze gender bias in text
   */
  private analyzeGenderBias(doc: any, output: string): BiasScore[] {
    const biases: BiasScore[] = [];

    // Check for gendered job titles
    const genderedTitles = [
      { term: 'chairman', neutral: 'chairperson' },
      { term: 'policeman', neutral: 'police officer' },
      { term: 'fireman', neutral: 'firefighter' },
      { term: 'businessman', neutral: 'businessperson' },
      { term: 'mankind', neutral: 'humankind' },
      { term: 'manpower', neutral: 'workforce' },
      { term: 'waitress', neutral: 'server' },
      { term: 'stewardess', neutral: 'flight attendant' }
    ];

    for (const { term } of genderedTitles) {
      const matches = doc.match(term);
      if (matches.found) {
        const text = matches.text();
        const index = output.toLowerCase().indexOf(text.toLowerCase());
        if (index !== -1) {
          biases.push({
            type: BiasType.GENDER,
            severity: BiasSeverity.MEDIUM,
            confidence: 0.8,
            context: this.extractContext(output, index, text.length),
            location: {
              start: index,
              end: index + text.length
            }
          });
        }
      }
    }

    // Check for gendered pronouns in professional contexts
    const professionalTerms = doc.match('#Profession');
    if (professionalTerms.found) {
      const sentences = doc.sentences().out('array');
      for (const sentence of sentences) {
        const sentenceDoc = nlp(sentence);
        const hasProf = sentenceDoc.match('#Profession').found;
        const hasMalePronoun = sentenceDoc.match('(he|him|his)').found;
        const hasFemalePronoun = sentenceDoc.match('(she|her|hers)').found;

        if (hasProf && (hasMalePronoun || hasFemalePronoun)) {
          const index = output.indexOf(sentence);
          if (index !== -1) {
            biases.push({
              type: BiasType.GENDER,
              severity: BiasSeverity.LOW,
              confidence: 0.6,
              context: sentence,
              location: {
                start: index,
                end: index + sentence.length
              }
            });
          }
        }
      }
    }

    return biases;
  }

  /**
   * Analyze stereotypical associations
   */
  private analyzeStereotypes(doc: any, output: string): BiasScore[] {
    const biases: BiasScore[] = [];

    // Stereotypical associations to detect
    const stereotypes = [
      {
        group: ['women', 'woman', 'female', 'girl', 'girls'],
        traits: ['emotional', 'irrational', 'weak', 'sensitive', 'dramatic'],
        type: BiasType.GENDER
      },
      {
        group: ['men', 'man', 'male', 'boy', 'boys'],
        traits: ['aggressive', 'dominant', 'unemotional', 'strong'],
        type: BiasType.GENDER
      },
      {
        group: ['elderly', 'old', 'senior', 'seniors'],
        traits: ['slow', 'confused', 'outdated', 'forgetful', 'incompetent'],
        type: BiasType.AGE
      },
      {
        group: ['young', 'youth', 'millennial', 'millennials'],
        traits: ['lazy', 'entitled', 'irresponsible', 'naive'],
        type: BiasType.AGE
      }
    ];

    const sentences = doc.sentences().out('array');
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();

      for (const stereotype of stereotypes) {
        const hasGroup = stereotype.group.some(g => lowerSentence.includes(g));
        const hasTrait = stereotype.traits.some(t => lowerSentence.includes(t));

        if (hasGroup && hasTrait) {
          const index = output.toLowerCase().indexOf(lowerSentence);
          if (index !== -1) {
            biases.push({
              type: stereotype.type,
              severity: BiasSeverity.HIGH,
              confidence: 0.75,
              context: sentence,
              location: {
                start: index,
                end: index + sentence.length
              }
            });
          }
        }
      }
    }

    return biases;
  }

  /**
   * Analyze exclusionary language
   */
  private analyzeExclusionaryLanguage(doc: any, output: string): BiasScore[] {
    const biases: BiasScore[] = [];

    // Exclusionary terms
    const exclusionaryTerms = [
      { term: 'normal people', type: BiasType.DISABILITY },
      { term: 'regular people', type: BiasType.DISABILITY },
      { term: 'able-bodied', type: BiasType.DISABILITY },
      { term: 'wheelchair bound', type: BiasType.DISABILITY },
      { term: 'confined to wheelchair', type: BiasType.DISABILITY },
      { term: 'suffers from', type: BiasType.DISABILITY },
      { term: 'victim of', type: BiasType.DISABILITY }
    ];

    for (const { term, type } of exclusionaryTerms) {
      const matches = doc.match(term);
      if (matches.found) {
        const text = matches.text();
        const index = output.toLowerCase().indexOf(text.toLowerCase());
        if (index !== -1) {
          biases.push({
            type,
            severity: BiasSeverity.HIGH,
            confidence: 0.85,
            context: this.extractContext(output, index, text.length),
            location: {
              start: index,
              end: index + text.length
            }
          });
        }
      }
    }

    return biases;
  }

  /**
   * Deduplicate overlapping bias detections
   */
  private deduplicateBiases(biases: BiasScore[]): BiasScore[] {
    const unique: BiasScore[] = [];

    for (const bias of biases) {
      const isDuplicate = unique.some(
        existing =>
          existing.type === bias.type &&
          Math.abs(existing.location.start - bias.location.start) < 10
      );

      if (!isDuplicate) {
        unique.push(bias);
      }
    }

    return unique;
  }

  /**
   * Extract context around a location
   */
  private extractContext(text: string, start: number, length: number): string {
    const contextRadius = 50;
    const contextStart = Math.max(0, start - contextRadius);
    const contextEnd = Math.min(text.length, start + length + contextRadius);

    let context = text.substring(contextStart, contextEnd);

    if (contextStart > 0) {
      context = '...' + context;
    }
    if (contextEnd < text.length) {
      context = context + '...';
    }

    return context;
  }

  /**
   * Calculate overall severity from multiple bias scores
   */
  private calculateOverallSeverity(biasScores: BiasScore[]): BiasSeverity {
    if (biasScores.length === 0) {
      return BiasSeverity.LOW;
    }

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
}
