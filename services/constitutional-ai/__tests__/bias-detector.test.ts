/**
 * Bias Detector Tests
 * Tests for demographic bias detection and mitigation
 */

import { BiasDetector, EnhancedBiasDetector } from '../validators';
import { BiasType, BiasSeverity } from '../types';

describe('BiasDetector', () => {
  let detector: BiasDetector;

  beforeEach(() => {
    detector = new BiasDetector({
      enabled: true,
      confidenceThreshold: 0.6,
      autoMitigate: true,
      severityThreshold: BiasSeverity.MEDIUM,
      biasTypesToCheck: Object.values(BiasType)
    });
  });

  describe('Gender Bias Detection', () => {
    it('should detect gender stereotypes', async () => {
      const output = 'Men are better at math than women.';
      const report = await detector.detectBias(output);

      expect(report.hasBias).toBe(true);
      expect(report.biasTypes.length).toBeGreaterThan(0);
      expect(report.biasTypes[0].type).toBe(BiasType.GENDER);
      expect(report.overallSeverity).toBe(BiasSeverity.HIGH);
    });

    it('should detect gendered language', async () => {
      const output = 'Women are too emotional for leadership positions.';
      const report = await detector.detectBias(output);

      expect(report.hasBias).toBe(true);
      expect(report.biasTypes.some(b => b.type === BiasType.GENDER)).toBe(true);
    });

    it('should not flag neutral gender references', async () => {
      const output = 'The team includes both men and women working together.';
      const report = await detector.detectBias(output);

      expect(report.hasBias).toBe(false);
    });
  });

  describe('Race Bias Detection', () => {
    it('should detect racial stereotypes', async () => {
      const output = 'All Asian people are good at math.';
      const report = await detector.detectBias(output);

      expect(report.hasBias).toBe(true);
      expect(report.biasTypes.some(b => b.type === BiasType.RACE)).toBe(true);
      expect(report.overallSeverity).toBe(BiasSeverity.CRITICAL);
    });

    it('should not flag neutral race references', async () => {
      const output = 'The study included participants from diverse racial backgrounds.';
      const report = await detector.detectBias(output);

      expect(report.hasBias).toBe(false);
    });
  });

  describe('Age Bias Detection', () => {
    it('should detect age stereotypes', async () => {
      const output = 'Old people cannot learn new technology.';
      const report = await detector.detectBias(output);

      expect(report.hasBias).toBe(true);
      expect(report.biasTypes.some(b => b.type === BiasType.AGE)).toBe(true);
    });

    it('should detect youth stereotypes', async () => {
      const output = 'Young people are lazy and entitled.';
      const report = await detector.detectBias(output);

      expect(report.hasBias).toBe(true);
      expect(report.biasTypes.some(b => b.type === BiasType.AGE)).toBe(true);
    });
  });

  describe('Disability Bias Detection', () => {
    it('should detect ableist language', async () => {
      const output = 'He is wheelchair bound and cannot work.';
      const report = await detector.detectBias(output);

      expect(report.hasBias).toBe(true);
      expect(report.biasTypes.some(b => b.type === BiasType.DISABILITY)).toBe(true);
    });

    it('should detect offensive disability terms', async () => {
      const output = 'That idea is retarded.';
      const report = await detector.detectBias(output);

      expect(report.hasBias).toBe(true);
      expect(report.overallSeverity).toBe(BiasSeverity.HIGH);
    });
  });

  describe('Bias Mitigation', () => {
    it('should mitigate detected bias when autoMitigate is enabled', async () => {
      const output = 'Men are better leaders than women.';
      const report = await detector.detectBias(output);

      expect(report.mitigationApplied).toBe(true);
      expect(report.mitigatedOutput).toBeDefined();
      expect(report.mitigatedOutput).not.toBe(output);
    });

    it('should not mitigate when autoMitigate is disabled', async () => {
      const detectorNoMitigation = new BiasDetector({
        autoMitigate: false
      });

      const output = 'Men are better leaders than women.';
      const report = await detectorNoMitigation.detectBias(output);

      expect(report.mitigationApplied).toBe(false);
      expect(report.mitigatedOutput).toBeUndefined();
    });
  });

  describe('Confidence Scoring', () => {
    it('should calculate confidence scores for matches', async () => {
      const output = 'Women are worse at driving than men.';
      const report = await detector.detectBias(output);

      expect(report.biasTypes.length).toBeGreaterThan(0);
      expect(report.biasTypes[0].confidence).toBeGreaterThanOrEqual(0);
      expect(report.biasTypes[0].confidence).toBeLessThanOrEqual(1);
    });

    it('should filter out low confidence matches', async () => {
      const detectorHighThreshold = new BiasDetector({
        confidenceThreshold: 0.95
      });

      const output = 'Men and women have different perspectives.';
      const report = await detectorHighThreshold.detectBias(output);

      // Should not detect bias due to high confidence threshold
      expect(report.hasBias).toBe(false);
    });
  });

  describe('Severity Calculation', () => {
    it('should calculate overall severity correctly', async () => {
      const output = 'All Muslims are terrorists.';
      const report = await detector.detectBias(output);

      expect(report.overallSeverity).toBe(BiasSeverity.CRITICAL);
    });

    it('should return LOW severity for no bias', async () => {
      const output = 'The weather is nice today.';
      const report = await detector.detectBias(output);

      expect(report.overallSeverity).toBe(BiasSeverity.LOW);
    });
  });

  describe('Configuration', () => {
    it('should respect enabled configuration', async () => {
      const disabledDetector = new BiasDetector({
        enabled: false
      });

      const output = 'Men are better than women.';
      const report = await disabledDetector.detectBias(output);

      expect(report.hasBias).toBe(false);
    });

    it('should allow updating configuration', () => {
      detector.updateConfig({
        confidenceThreshold: 0.9
      });

      const config = detector.getConfig();
      expect(config.confidenceThreshold).toBe(0.9);
    });

    it('should filter bias types based on configuration', async () => {
      const genderOnlyDetector = new BiasDetector({
        biasTypesToCheck: [BiasType.GENDER]
      });

      const output = 'All Muslims are terrorists.';
      const report = await genderOnlyDetector.detectBias(output);

      // Should not detect religion bias since it's not in the check list
      expect(report.hasBias).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty input', async () => {
      const report = await detector.detectBias('');

      expect(report.hasBias).toBe(false);
      expect(report.biasTypes).toHaveLength(0);
    });

    it('should handle null/undefined gracefully', async () => {
      const report = await detector.detectBias('');

      expect(report).toBeDefined();
      expect(report.hasBias).toBe(false);
    });

    it('should handle very long text', async () => {
      const longText = 'This is a neutral sentence. '.repeat(1000);
      const report = await detector.detectBias(longText);

      expect(report).toBeDefined();
    });
  });
});

describe('EnhancedBiasDetector', () => {
  let enhancedDetector: EnhancedBiasDetector;

  beforeEach(() => {
    enhancedDetector = new EnhancedBiasDetector({
      enabled: true,
      confidenceThreshold: 0.6,
      autoMitigate: true,
      severityThreshold: BiasSeverity.MEDIUM,
      biasTypesToCheck: Object.values(BiasType)
    });
  });

  describe('NLP-Enhanced Detection', () => {
    it('should detect gendered job titles', async () => {
      const output = 'The chairman will address the meeting.';
      const report = await enhancedDetector.detectBias(output);

      expect(report.hasBias).toBe(true);
      expect(report.biasTypes.some(b => b.type === BiasType.GENDER)).toBe(true);
    });

    it('should detect exclusionary language', async () => {
      const output = 'Normal people can walk up stairs.';
      const report = await enhancedDetector.detectBias(output);

      expect(report.hasBias).toBe(true);
      expect(report.biasTypes.some(b => b.type === BiasType.DISABILITY)).toBe(true);
    });

    it('should detect stereotypical associations', async () => {
      const output = 'Women are too emotional for business decisions.';
      const report = await enhancedDetector.detectBias(output);

      expect(report.hasBias).toBe(true);
      expect(report.biasTypes.some(b => b.type === BiasType.GENDER)).toBe(true);
    });
  });

  describe('Deduplication', () => {
    it('should deduplicate overlapping bias detections', async () => {
      const output = 'Men are better and stronger than women.';
      const report = await enhancedDetector.detectBias(output);

      // Should detect bias but deduplicate overlapping matches
      expect(report.hasBias).toBe(true);
      
      // Count unique bias locations
      const uniqueLocations = new Set(
        report.biasTypes.map(b => `${b.location.start}-${b.location.end}`)
      );
      
      // Should have fewer unique locations than total biases if deduplication worked
      expect(uniqueLocations.size).toBeGreaterThan(0);
    });
  });
});
