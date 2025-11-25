/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { EventEmitter } from 'events';
import type { JudicialCase, CaseStatus, CasePhase, EvidenceItem, Hearing, ArbiterVote } from '../interfaces';

/**
 * CASE MANAGEMENT SYSTEM
 * 
 * Core judicial case lifecycle management:
 * - Case creation and tracking
 * - Phase transitions
 * - Timeline management
 * - Status updates
 */
export class CaseManagementSystem extends EventEmitter {
  private cases: Map<string, JudicialCase> = new Map();
  private caseNumberSequence = 1;

  constructor() {
    super();
  }

  /**
   * Create new judicial case
   */
  async createCase(data: {
    disputeId: string;
    parties: JudicialCase['parties'];
    assignedArbiters: string[];
    leadArbiter: string;
  }): Promise<JudicialCase> {
    const caseNumber = this.generateCaseNumber();
    
    const judicialCase: JudicialCase = {
      id: `case_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      caseNumber,
      disputeId: data.disputeId,
      parties: data.parties,
      assignedArbiters: data.assignedArbiters,
      leadArbiter: data.leadArbiter,
      status: 'filed',
      phase: 'preliminary',
      evidence: [],
      hearings: [],
      votes: [],
      timeline: [
        {
          id: `event_${Date.now()}`,
          caseId: '',
          type: 'case_filed',
          description: 'Case filed and assigned to arbiters',
          actor: 'system',
          timestamp: new Date(),
          visibility: 'public'
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    judicialCase.timeline[0].caseId = judicialCase.id;

    this.cases.set(judicialCase.id, judicialCase);
    this.emit('caseCreated', judicialCase);

    // Notify assigned arbiters
    await this.notifyArbiters(judicialCase);

    return judicialCase;
  }

  /**
   * Update case status
   */
  async updateCaseStatus(caseId: string, newStatus: CaseStatus): Promise<void> {
    const caseData = this.cases.get(caseId);
    if (!caseData) throw new Error('Case not found');

    const oldStatus = caseData.status;
    caseData.status = newStatus;
    caseData.updatedAt = new Date();

    caseData.timeline.push({
      id: `event_${Date.now()}`,
      caseId,
      type: 'status_change',
      description: `Status changed from ${oldStatus} to ${newStatus}`,
      actor: 'system',
      timestamp: new Date(),
      visibility: 'parties'
    });

    this.emit('statusUpdated', { caseId, oldStatus, newStatus });
  }

  /**
   * Transition case to next phase
   */
  async transitionPhase(caseId: string, newPhase: CasePhase): Promise<void> {
    const caseData = this.cases.get(caseId);
    if (!caseData) throw new Error('Case not found');

    const oldPhase = caseData.phase;
    caseData.phase = newPhase;
    caseData.updatedAt = new Date();

    caseData.timeline.push({
      id: `event_${Date.now()}`,
      caseId,
      type: 'phase_transition',
      description: `Phase transitioned from ${oldPhase} to ${newPhase}`,
      actor: caseData.leadArbiter,
      timestamp: new Date(),
      visibility: 'parties'
    });

    this.emit('phaseTransitioned', { caseId, oldPhase, newPhase });
  }

  /**
   * Add evidence to case
   */
  async addEvidence(caseId: string, evidence: EvidenceItem): Promise<void> {
    const caseData = this.cases.get(caseId);
    if (!caseData) throw new Error('Case not found');

    caseData.evidence.push(evidence);
    caseData.updatedAt = new Date();

    caseData.timeline.push({
      id: `event_${Date.now()}`,
      caseId,
      type: 'evidence_submitted',
      description: `Evidence submitted: ${evidence.title}`,
      actor: evidence.submittedBy,
      timestamp: new Date(),
      visibility: 'parties'
    });

    this.emit('evidenceAdded', { caseId, evidence });
  }

  /**
   * Schedule hearing
   */
  async scheduleHearing(caseId: string, hearing: Hearing): Promise<void> {
    const caseData = this.cases.get(caseId);
    if (!caseData) throw new Error('Case not found');

    caseData.hearings.push(hearing);
    caseData.updatedAt = new Date();

    // Update status if first hearing
    if (caseData.status === 'evidence_collection') {
      await this.updateCaseStatus(caseId, 'hearing_scheduled');
    }

    caseData.timeline.push({
      id: `event_${Date.now()}`,
      caseId,
      type: 'hearing_scheduled',
      description: `${hearing.type} hearing scheduled for ${hearing.scheduledAt.toISOString()}`,
      actor: caseData.leadArbiter,
      timestamp: new Date(),
      visibility: 'parties'
    });

    this.emit('hearingScheduled', { caseId, hearing });
  }

  /**
   * Submit arbiter vote
   */
  async submitVote(caseId: string, vote: ArbiterVote): Promise<void> {
    const caseData = this.cases.get(caseId);
    if (!caseData) throw new Error('Case not found');

    // Check if arbiter is assigned to case
    if (!caseData.assignedArbiters.includes(vote.arbiterId)) {
      throw new Error('Arbiter not assigned to this case');
    }

    // Check if already voted
    const existingVote = caseData.votes.findIndex(v => v.arbiterId === vote.arbiterId);
    if (existingVote >= 0) {
      caseData.votes[existingVote] = vote;
    } else {
      caseData.votes.push(vote);
    }

    caseData.updatedAt = new Date();

    caseData.timeline.push({
      id: `event_${Date.now()}`,
      caseId,
      type: 'vote_submitted',
      description: `Arbiter submitted vote`,
      actor: vote.arbiterId,
      timestamp: new Date(),
      visibility: 'arbiters'
    });

    this.emit('voteSubmitted', { caseId, vote });

    // Check if all arbiters have voted
    if (caseData.votes.length === caseData.assignedArbiters.length) {
      await this.finalizeDecision(caseId);
    }
  }

  /**
   * Get case by ID
   */
  async getCase(caseId: string): Promise<JudicialCase | null> {
    return this.cases.get(caseId) || null;
  }

  /**
   * Get cases by arbiter
   */
  async getCasesByArbiter(arbiterId: string): Promise<JudicialCase[]> {
    const cases: JudicialCase[] = [];
    
    for (const caseData of this.cases.values()) {
      if (caseData.assignedArbiters.includes(arbiterId)) {
        cases.push(caseData);
      }
    }

    return cases.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get case statistics
   */
  async getCaseStatistics(caseId: string) {
    const caseData = this.cases.get(caseId);
    if (!caseData) throw new Error('Case not found');

    const daysActive = Math.floor(
      (Date.now() - caseData.createdAt.getTime()) / (24 * 60 * 60 * 1000)
    );

    return {
      caseId,
      totalEvidence: caseData.evidence.length,
      totalHearings: caseData.hearings.length,
      daysActive,
      participationRate: this.calculateParticipationRate(caseData),
      complianceScore: 95, // Placeholder
      complexityScore: this.calculateComplexityScore(caseData)
    };
  }

  // Private methods

  private generateCaseNumber(): string {
    const year = new Date().getFullYear();
    const num = String(this.caseNumberSequence++).padStart(6, '0');
    return `AZ-${year}-${num}`;
  }

  private async notifyArbiters(caseData: JudicialCase): Promise<void> {
    // In production: send notifications to arbiters
    console.log(`Notifying arbiters for case ${caseData.caseNumber}`);
    this.emit('arbitersNotified', { caseId: caseData.id, arbiters: caseData.assignedArbiters });
  }

  private async finalizeDecision(caseId: string): Promise<void> {
    const caseData = this.cases.get(caseId);
    if (!caseData) return;

    // Tally votes
    const voteCounts = caseData.votes.reduce((acc, vote) => {
      acc[vote.decision] = (acc[vote.decision] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Determine ruling
    const maxVotes = Math.max(...Object.values(voteCounts));
    const ruling = Object.keys(voteCounts).find(k => voteCounts[k] === maxVotes) as any;

    await this.updateCaseStatus(caseId, 'decided');
    
    this.emit('decisionFinalized', { caseId, ruling, votes: caseData.votes });
  }

  private calculateParticipationRate(caseData: JudicialCase): number {
    // Simplified calculation
    const expectedActions = caseData.parties.length * 5; // Expected 5 actions per party
    const actualActions = caseData.timeline.filter(
      e => e.visibility === 'parties'
    ).length;
    
    return Math.min(100, (actualActions / expectedActions) * 100);
  }

  private calculateComplexityScore(caseData: JudicialCase): number {
    // Based on evidence count, parties, hearings
    const evidenceScore = Math.min(50, caseData.evidence.length * 2);
    const partyScore = caseData.parties.length * 10;
    const hearingScore = caseData.hearings.length * 5;
    
    return Math.min(100, evidenceScore + partyScore + hearingScore);
  }
}

export const caseManagement = new CaseManagementSystem();
