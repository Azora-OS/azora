/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * JUDICIARY SERVICE - Core Interfaces
 *
 * Manages the judicial process for dispute resolution:
 * - Case lifecycle management
 * - Evidence handling and verification
 * - Arbiter voting system
 * - Decision enforcement
 * - Appeal processing
 */

export interface JudicialCase {
  id: string;
  caseNumber: string;
  disputeId: string;
  parties: CaseParty[];
  assignedArbiters: string[];
  leadArbiter: string;
  status: CaseStatus;
  phase: CasePhase;
  evidence: EvidenceItem[];
  hearings: Hearing[];
  votes: ArbiterVote[];
  decision?: CaseDecision;
  timeline: CaseEvent[];
  createdAt: Date;
  updatedAt: Date;
}

export type CaseStatus =
  | 'filed'
  | 'evidence_collection'
  | 'hearing_scheduled'
  | 'in_hearing'
  | 'voting'
  | 'decided'
  | 'enforcing'
  | 'closed'
  | 'appealed';

export type CasePhase =
  | 'preliminary'
  | 'discovery'
  | 'hearing'
  | 'deliberation'
  | 'decision'
  | 'enforcement';

export interface CaseParty {
  id: string;
  role: 'claimant' | 'respondent' | 'third_party';
  userId: string;
  representation: PartyRepresentation;
  claims: Claim[];
  evidenceSubmitted: string[];
  lastActive: Date;
}

export interface PartyRepresentation {
  type: 'self' | 'legal_counsel' | 'advocate';
  representativeId?: string;
  representativeName?: string;
  contactInfo?: string;
}

export interface Claim {
  id: string;
  type: 'monetary' | 'specific_performance' | 'declaratory' | 'injunctive';
  description: string;
  amount?: number;
  currency?: string;
  supportingEvidence: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'partially_accepted';
}

export interface EvidenceItem {
  id: string;
  caseId: string;
  submittedBy: string;
  type: 'document' | 'photo' | 'video' | 'audio' | 'blockchain_record' | 'testimony';
  title: string;
  description: string;
  fileUrl?: string;
  fileHash: string;
  metadata: EvidenceMetadata;
  verification: EvidenceVerification;
  submittedAt: Date;
  admissible: boolean;
  objections: Objection[];
}

export interface EvidenceMetadata {
  fileSize?: number;
  mimeType?: string;
  dimensions?: { width: number; height: number };
  duration?: number;
  createdDate?: Date;
  source?: string;
  chainOfCustody: CustodyRecord[];
}

export interface CustodyRecord {
  transferredFrom: string;
  transferredTo: string;
  timestamp: Date;
  reason: string;
  hash: string;
}

export interface EvidenceVerification {
  status: 'pending' | 'verified' | 'disputed' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: Date;
  method: 'hash_check' | 'expert_review' | 'blockchain' | 'digital_signature';
  confidence: number;
  issues?: string[];
}

export interface Objection {
  id: string;
  raisedBy: string;
  type: 'relevance' | 'authenticity' | 'hearsay' | 'prejudicial' | 'privilege';
  reason: string;
  raisedAt: Date;
  ruling?: ObjectionRuling;
}

export interface ObjectionRuling {
  decision: 'sustained' | 'overruled';
  decidedBy: string;
  reasoning: string;
  decidedAt: Date;
}

export interface Hearing {
  id: string;
  caseId: string;
  type: 'preliminary' | 'evidence' | 'oral_argument' | 'final';
  scheduledAt: Date;
  duration: number;
  location: string;
  mode: 'in_person' | 'virtual' | 'hybrid';
  participants: HearingParticipant[];
  agenda: string[];
  transcript?: string;
  recording?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'postponed' | 'cancelled';
  minutes?: HearingMinutes;
}

export interface HearingParticipant {
  userId: string;
  role: 'arbiter' | 'party' | 'witness' | 'expert' | 'observer';
  attendance: 'present' | 'absent' | 'remote';
  joinedAt?: Date;
  leftAt?: Date;
}

export interface HearingMinutes {
  summary: string;
  keyPoints: string[];
  decisionsמade: string[];
  actionItems: ActionItem[];
  recordedBy: string;
}

export interface ActionItem {
  description: string;
  assignedTo: string;
  dueDate: Date;
  status: 'pending' | 'completed';
}

export interface ArbiterVote {
  arbiterId: string;
  caseId: string;
  decision: 'claimant' | 'respondent' | 'partial' | 'dismiss';
  reasoning: string;
  confidence: number;
  votedAt: Date;
  claimsSupported: string[];
  claimsDenied: string[];
  recommendedOrders: DecisionOrder[];
}

export interface CaseDecision {
  id: string;
  caseId: string;
  ruling: 'claimant_favor' | 'respondent_favor' | 'partial' | 'dismissed';
  votingSummary: VotingSummary;
  reasoning: string;
  findings: Finding[];
  orders: DecisionOrder[];
  enforcement: EnforcementPlan;
  issuedAt: Date;
  issuedBy: string;
  publicationStatus: 'draft' | 'published' | 'sealed';
  appealDeadline: Date;
}

export interface VotingSummary {
  totalArbiters: number;
  votesFor: number;
  votesAgainst: number;
  abstentions: number;
  consensus: boolean;
  majorityPercentage: number;
}

export interface Finding {
  id: string;
  category: 'fact' | 'law' | 'credibility' | 'damages';
  description: string;
  supportingEvidence: string[];
  conclusion: string;
}

export interface DecisionOrder {
  id: string;
  type: 'payment' | 'specific_performance' | 'restraint' | 'declaratory' | 'costs';
  description: string;
  obligatedParty: string;
  beneficiary: string;
  amount?: number;
  currency?: string;
  deadline?: Date;
  conditions?: string[];
  enforceable: boolean;
  status: 'pending' | 'complied' | 'non_compliant' | 'enforcing';
}

export interface EnforcementPlan {
  method: 'voluntary' | 'smart_contract' | 'court_enforcement' | 'asset_seizure';
  timeline: Date;
  responsibleParty: string;
  monitoring: boolean;
  escalationPath: string[];
  status: 'planned' | 'active' | 'completed';
}

export interface CaseEvent {
  id: string;
  caseId: string;
  type: string;
  description: string;
  actor: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  visibility: 'public' | 'parties' | 'arbiters' | 'private';
}

export interface CaseStatistics {
  caseId: string;
  totalEvidence: number;
  totalHearings: number;
  daysActive: number;
  participationRate: number;
  complianceScore: number;
  complexityScore: number;
}

export interface EnforcementAction {
  id: string;
  orderId: string;
  type: 'reminder' | 'warning' | 'penalty' | 'execution';
  description: string;
  executedBy: string;
  executedAt: Date;
  result: 'successful' | 'partial' | 'failed';
  notes?: string;
}
