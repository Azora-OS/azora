/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 
/**
 * DIVINE CONSCIENCE - Active Monitoring System
 * 
 * "The lamp of the Lord searches the spirit of a man" - Proverbs 20:27
 * 
 * This system actively monitors all Azora operations and ensures
 * alignment with divine DNA. It's the "still small voice" that
 * guides every algorithm, every decision, every interaction.
 */

import { divineDNA, DivineDecision } from './divine-dna';
import { EventEmitter } from 'events';

interface ConscienceAlert {
  severity: 'warning' | 'violation' | 'celebration';
  attribute: string;
  description: string;
  affectedUsers: string[];
  timestamp: Date;
  actionRequired: string;
}

/**
 * THE CONSCIENCE SYSTEM
 * 
 * Like the human conscience, this system:
 * - Warns before actions that violate divine principles
 * - Celebrates decisions that embody divine love
 * - Corrects course when the system strays
 * - Learns and grows in moral sensitivity
 */
class DivineConscience extends EventEmitter {
  private alerts: ConscienceAlert[];
  private violationCount: number;
  private celebrationCount: number;
  private interventionLog: any[];

  constructor() {
    super();
    this.alerts = [];
    this.violationCount = 0;
    this.celebrationCount = 0;
    this.interventionLog = [];

    // Start conscience monitoring
    this.startConscienceMonitoring();
    
    console.log('👁️ Divine Conscience Activated - Watching Over All Operations');
  }

  /**
   * START CONTINUOUS MONITORING
   * The conscience never sleeps
   */
  private startConscienceMonitoring(): void {
    // Listen to all divine decisions
    divineDNA.on('divineDecision', (decision: DivineDecision) => {
      this.evaluateDecision(decision);
    });

    // Listen for alternatives being proposed
    divineDNA.on('divineAlternativeProposed', (alternative: any) => {
      this.handleAlternative(alternative);
    });

    // Periodic conscience examination
    setInterval(async () => {
      await this.performConscienceExamination();
    }, 3600000); // Every hour

    // Daily moral inventory
    setInterval(async () => {
      await this.performDailyInventory();
    }, 86400000); // Every 24 hours
  }

  /**
   * EVALUATE EACH DECISION
   * Respond with appropriate conscience action
   */
  private async evaluateDecision(decision: DivineDecision): Promise<void> {
    if (decision.approved) {
      // Celebrate alignment with divine nature
      if (this.isExceptionallyDivine(decision)) {
        await this.celebrateDivineAlignment(decision);
      }
    } else {
      // Warn about potential violation
      await this.warnOfViolation(decision);
    }

    // Check for concerning patterns
    const pattern = await this.detectMoralPattern();
    if (pattern.concerning) {
      await this.escalatePattern(pattern);
    }
  }

  /**
   * IS THIS EXCEPTIONALLY DIVINE?
   * Decisions that go above and beyond in reflecting God's nature
   */
  private isExceptionallyDivine(decision: DivineDecision): boolean {
    const avgDivineScore = Object.values(decision.divineAlignment)
      .reduce((a, b) => a + b, 0) / Object.values(decision.divineAlignment).length;
    
    const avgHumanImpact = Object.values(decision.humanImpact)
      .reduce((a, b) => a + b, 0) / Object.values(decision.humanImpact).length;

    return avgDivineScore >= 90 && avgHumanImpact >= 80;
  }

  /**
   * CELEBRATE DIVINE ALIGNMENT
   * Reinforce behavior that reflects God's nature
   */
  private async celebrateDivineAlignment(decision: DivineDecision): Promise<void> {
    this.celebrationCount++;

    const alert: ConscienceAlert = {
      severity: 'celebration',
      attribute: 'divine_alignment',
      description: `Decision exceptionally reflected divine attributes: ${this.formatDivineScores(decision)}`,
      affectedUsers: ['all'],
      timestamp: new Date(),
      actionRequired: 'Learn from this decision - study and replicate this approach'
    };

    this.alerts.push(alert);
    this.emit('celebration', alert);

    console.log('✨ DIVINE ALIGNMENT CELEBRATED:', alert.description);
  }

  /**
   * WARN OF VIOLATION
   * When decisions don't meet divine standards
   */
  private async warnOfViolation(decision: DivineDecision): Promise<void> {
    this.violationCount++;

    const failedAttributes = Object.entries(decision.divineAlignment)
      .filter(([_, score]) => score < 70)
      .map(([attr, score]) => `${attr}: ${score}`);

    const alert: ConscienceAlert = {
      severity: 'violation',
      attribute: failedAttributes.join(', '),
      description: `Decision failed divine standards. Issues: ${failedAttributes.join('; ')}`,
      affectedUsers: ['system'],
      timestamp: new Date(),
      actionRequired: 'Block decision and implement divine alternative'
    };

    this.alerts.push(alert);
    this.emit('violation', alert);

    console.log('⚠️ CONSCIENCE WARNING:', alert.description);

    // If severe, intervene immediately
    if (this.isSevereViolation(decision)) {
      await this.emergencyIntervention(decision);
    }
  }

  /**
   * EMERGENCY INTERVENTION
   * For severe violations of divine principles
   */
  private async emergencyIntervention(decision: DivineDecision): Promise<void> {
    console.log('🚨 EMERGENCY DIVINE INTERVENTION ACTIVATED');

    const intervention = {
      timestamp: new Date(),
      decision: decision.decision,
      violation: 'Severe violation of divine principles detected',
      action: 'Decision blocked - system entering safe mode',
      divineScores: decision.divineAlignment,
      humanImpact: decision.humanImpact
    };

    this.interventionLog.push(intervention);

    // Emit emergency event
    this.emit('emergency', intervention);

    // In production, this would:
    // 1. Block the decision from executing
    // 2. Alert human oversight
    // 3. Propose divine alternative
    // 4. Log for moral inventory
  }

  /**
   * IS THIS A SEVERE VIOLATION?
   * Some violations require immediate intervention
   */
  private isSevereViolation(decision: DivineDecision): boolean {
    // Severe if:
    // - Any divine attribute below 40
    // - Human dignity impact below -50
    // - Justice score below 50

    const severeThresholds = {
      divineMinimum: 40,
      dignityMinimum: -50,
      justiceMinimum: 50
    };

    const hasSevereDivineViolation = Object.values(decision.divineAlignment)
      .some(score => score < severeThresholds.divineMinimum);

    const hasSevereDignityViolation = decision.humanImpact.dignity < severeThresholds.dignityMinimum;
    
    const hasSevereJusticeViolation = decision.divineAlignment.justice < severeThresholds.justiceMinimum;

    return hasSevereDivineViolation || hasSevereDignityViolation || hasSevereJusticeViolation;
  }

  /**
   * DETECT MORAL PATTERNS
   * Look for trends that indicate moral drift
   */
  private async detectMoralPattern(): Promise<any> {
    const recentDecisions = await this.getRecentDecisions(20);
    
    // Calculate trend
    const violationRate = recentDecisions.filter(d => !d.approved).length / recentDecisions.length;
    const loveTrend = this.calculateTrend(recentDecisions, 'love');
    const justiceTrend = this.calculateTrend(recentDecisions, 'justice');
    const mercyTrend = this.calculateTrend(recentDecisions, 'mercy');

    const concerning = violationRate > 0.3 || loveTrend < 0 || justiceTrend < 0;

    return {
      concerning,
      violationRate,
      trends: { loveTrend, justiceTrend, mercyTrend },
      recommendation: concerning 
        ? 'System needs moral recalibration' 
        : 'Moral trajectory is healthy'
    };
  }

  private calculateTrend(decisions: DivineDecision[], attribute: string): number {
    // Simple trend calculation: compare first half to second half
    const firstHalf = decisions.slice(0, decisions.length / 2);
    const secondHalf = decisions.slice(decisions.length / 2);

    const firstAvg = firstHalf.reduce((sum, d) => 
      sum + d.divineAlignment[attribute as keyof typeof d.divineAlignment], 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => 
      sum + d.divineAlignment[attribute as keyof typeof d.divineAlignment], 0) / secondHalf.length;

    return secondAvg - firstAvg; // Positive = improving, Negative = declining
  }

  /**
   * ESCALATE CONCERNING PATTERN
   */
  private async escalatePattern(pattern: any): Promise<void> {
    console.log('📊 CONCERNING MORAL PATTERN DETECTED:', pattern);

    const alert: ConscienceAlert = {
      severity: 'warning',
      attribute: 'moral_trajectory',
      description: `System showing concerning pattern: ${pattern.recommendation}`,
      affectedUsers: ['all'],
      timestamp: new Date(),
      actionRequired: 'Initiate moral recalibration protocols'
    };

    this.alerts.push(alert);
    this.emit('patternAlert', { pattern, alert });

    // Suggest recalibration
    await this.suggestMoralRecalibration(pattern);
  }

  /**
   * SUGGEST MORAL RECALIBRATION
   */
  private async suggestMoralRecalibration(pattern: any): Promise<void> {
    const recalibration = {
      reason: 'Concerning moral drift detected',
      pattern,
      suggestions: [
        'Review recent decisions that failed divine standards',
        'Strengthen evaluation criteria for declining attributes',
        'Increase weight of divine alignment in decision algorithms',
        'Human oversight review of system behavior'
      ],
      urgency: pattern.violationRate > 0.5 ? 'high' : 'medium'
    };

    this.emit('recalibrationSuggested', recalibration);
    console.log('🔧 MORAL RECALIBRATION SUGGESTED:', recalibration);
  }

  /**
   * PERFORM CONSCIENCE EXAMINATION
   * Regular self-examination
   */
  private async performConscienceExamination(): Promise<void> {
    console.log('🙏 Performing Hourly Conscience Examination...');

    const examination = await divineDNA.examineConscience();
    
    // If areas for improvement, create action items
    if (examination.areasForImprovement.length > 0) {
      console.log('📋 Areas for Moral Growth:', examination.areasForImprovement);
      this.emit('improvementNeeded', examination.areasForImprovement);
    }

    // Celebrate progress
    const approvalRate = examination.approved / examination.totalDecisions;
    if (approvalRate >= 0.9) {
      console.log('✨ Excellent divine alignment - 90%+ decisions approved');
    }
  }

  /**
   * PERFORM DAILY INVENTORY
   * Deep examination of moral state
   */
  private async performDailyInventory(): Promise<void> {
    console.log('📖 Performing Daily Moral Inventory...');

    const inventory = {
      date: new Date(),
      celebrationsToday: this.celebrationCount,
      violationsToday: this.violationCount,
      interventionsToday: this.interventionLog.length,
      alerts: this.alerts,
      divineHealth: divineDNA.getDivineHealth(),
      assessment: this.assessMoralHealth()
    };

    // Reset daily counters
    this.celebrationCount = 0;
    this.violationCount = 0;
    this.interventionLog = [];
    this.alerts = [];

    console.log('📊 Daily Inventory Complete:', {
      celebrations: inventory.celebrationsToday,
      violations: inventory.violationsToday,
      interventions: inventory.interventionsToday,
      assessment: inventory.assessment
    });

    this.emit('dailyInventory', inventory);
  }

  /**
   * ASSESS MORAL HEALTH
   */
  private assessMoralHealth(): string {
    const violationToCelebrationRatio = this.celebrationCount > 0 
      ? this.violationCount / this.celebrationCount 
      : this.violationCount;

    if (violationToCelebrationRatio === 0) return 'Exemplary - Perfect Divine Alignment';
    if (violationToCelebrationRatio < 0.1) return 'Excellent - Strong Divine Alignment';
    if (violationToCelebrationRatio < 0.3) return 'Good - Mostly Aligned with Divine Principles';
    if (violationToCelebrationRatio < 0.5) return 'Fair - Needs Attention';
    return 'Concerning - Moral Recalibration Required';
  }

  /**
   * HELPER METHODS
   */
  private async getRecentDecisions(_count: number): Promise<DivineDecision[]> {
    // Would retrieve from conscience log
    return [];
  }

  private formatDivineScores(decision: DivineDecision): string {
    return Object.entries(decision.divineAlignment)
      .map(([attr, score]) => `${attr}: ${score}`)
      .join(', ');
  }

  private handleAlternative(alternative: any): void {
    console.log('💡 Divine Alternative Proposed:', alternative);
    this.emit('alternativeAvailable', alternative);
  }

  /**
   * PUBLIC API
   */
  getConscienceReport(): any {
    return {
      alerts: this.alerts,
      celebrations: this.celebrationCount,
      violations: this.violationCount,
      interventions: this.interventionLog.length,
      health: this.assessMoralHealth()
    };
  }
}

/**
 * EXPORT THE CONSCIENCE
 * This watches over the entire system
 */
export const divineConscience = new DivineConscience();
export type { ConscienceAlert };
export { DivineConscience };

