/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * ARBITER SYSTEM - Core Interfaces
 * 
 * Decentralized dispute resolution and justice system:
 * - Staking-based arbiter selection
 * - Reputation-driven governance
 * - Transparent case management
 * - Smart contract enforcement
 */

export interface Arbiter {
  id: string;
  userId: string;
  walletAddress: string;
  expertise: ExpertiseArea[];
  reputation: ArbiterReputation;
  stake: StakeInfo;
  status: 'active' | 'inactive' | 'suspended' | 'penalized';
  cases: CaseStats;
  availableForCases: boolean;
  lastActiveAt: Date;
  registeredAt: Date;
}

export interface ExpertiseArea {
  domain: 'commercial' | 'consumer' | 'employment' | 'property' | 'intellectual_property' | 'technology' | 'general';
  level: 'junior' | 'intermediate' | 'senior' | 'expert';
  casesHandled: number;
  successRate: number;
}

export interface ArbiterReputation {
  overall: number; // 0-100
  casesCompleted: number;
  averageDecisionTime: number; // hours
  appealRate: number; // percentage
  satisfactionScore: number; // 0-5
  fairnessScore: number; // 0-100
  consistencyScore: number; // 0-100
  reviews: ArbiterReview[];
  badges: ReputationBadge[];
}

export interface ArbiterReview {
  id: string;
  caseId: string;
  rating: number; // 1-5
  comment: string;
  reviewerId: string;
  aspects: {
    fairness: number;
    speed: number;
    communication: number;
    expertise: number;
  };
  timestamp: Date;
}

export interface ReputationBadge {
  type: 'expert' | 'fast_resolver' | 'fair_judge' | 'trusted' | 'consistent';
  earnedAt: Date;
  criteria: string;
}

export interface StakeInfo {
  amount: number; // AZORA tokens
  currency: 'AZORA';
  lockedUntil: Date;
  slashedAmount: number;
  availableForWithdrawal: number;
  stakingRewards: number;
  history: StakeTransaction[];
}

export interface StakeTransaction {
  id: string;
  type: 'stake' | 'unstake' | 'slash' | 'reward';
  amount: number;
  reason?: string;
  caseId?: string;
  timestamp: Date;
  blockchainTxHash?: string;
}

export interface CaseStats {
  total: number;
  active: number;
  completed: number;
  won: number; // cases where arbiter's decision was upheld
  appealed: number;
  averageTime: number; // hours
  domains: Record<string, number>;
}

export interface DisputeCase {
  id: string;
  caseNumber: string;
  type: 'commercial' | 'consumer' | 'platform' | 'service';
  domain: ExpertiseArea['domain'];
  parties: CaseParty[];
  arbiters: AssignedArbiter[];
  status: CaseStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  value: CaseValue;
  filedAt: Date;
  assignedAt?: Date;
  hearingDate?: Date;
  decisionDate?: Date;
  evidence: Evidence[];
  timeline: CaseTimeline[];
  decision?: ArbiterDecision;
  appeal?: Appeal;
}

export interface CaseParty {
  role: 'claimant' | 'respondent' | 'third_party';
  userId: string;
  representation?: {
    type: 'self' | 'legal' | 'advocate';
    representativeId?: string;
  };
  claims: string[];
  evidenceSubmitted: number;
  lastActive: Date;
}

export interface AssignedArbiter {
  arbiterId: string;
  role: 'lead' | 'panel_member';
  assignedAt: Date;
  acceptedAt?: Date;
  status: 'assigned' | 'accepted' | 'declined' | 'recused';
  votingPower: number;
}

export type CaseStatus =
  | 'filed'
  | 'arbiter_selection'
  | 'evidence_submission'
  | 'hearing_scheduled'
  | 'in_hearing'
  | 'deliberation'
  | 'decision_pending'
  | 'decided'
  | 'under_appeal'
  | 'closed';

export interface CaseValue {
  amount: number;
  currency: string;
  disputed: boolean;
}

export interface Evidence {
  id: string;
  submittedBy: string;
  type: 'document' | 'photo' | 'video' | 'audio' | 'blockchain_proof' | 'testimony';
  title: string;
  description: string;
  fileUrl?: string;
  hash: string; // for integrity verification
  submittedAt: Date;
  verified: boolean;
  metadata: Record<string, any>;
}

export interface CaseTimeline {
  id: string;
  event: string;
  description: string;
  actor: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ArbiterDecision {
  id: string;
  caseId: string;
  arbiters: string[];
  ruling: 'claimant_favor' | 'respondent_favor' | 'partial' | 'dismissed';
  reasoning: string;
  orders: DecisionOrder[];
  votingRecord: VotingRecord[];
  issuedAt: Date;
  enforcementStatus: 'pending' | 'enforcing' | 'enforced' | 'appealed';
  blockchainRecordHash: string;
}

export interface DecisionOrder {
  type: 'payment' | 'action' | 'restraint' | 'specific_performance';
  description: string;
  responsibleParty: string;
  deadline?: Date;
  amount?: number;
  completed: boolean;
}

export interface VotingRecord {
  arbiterId: string;
  vote: 'claimant' | 'respondent' | 'dismiss' | 'abstain';
  reasoning?: string;
  timestamp: Date;
}

export interface Appeal {
  id: string;
  caseId: string;
  appellant: string;
  grounds: AppealGrounds[];
  filedAt: Date;
  status: 'filed' | 'under_review' | 'accepted' | 'rejected' | 'hearing' | 'decided';
  newArbiters?: string[];
  decision?: AppealDecision;
}

export interface AppealGrounds {
  type: 'procedural_error' | 'bias' | 'new_evidence' | 'manifest_injustice';
  description: string;
  evidence: string[];
}

export interface AppealDecision {
  ruling: 'upheld' | 'reversed' | 'remanded';
  reasoning: string;
  issuedAt: Date;
  final: boolean;
}

export interface StakingProtocol {
  minimumStake: number;
  stakingDuration: number; // days
  slashingRules: SlashingRule[];
  rewardStructure: RewardTier[];
}

export interface SlashingRule {
  violation: 'bias' | 'negligence' | 'fraud' | 'inactivity' | 'misconduct';
  severity: 'minor' | 'moderate' | 'severe';
  slashPercentage: number;
  appealable: boolean;
}

export interface RewardTier {
  casesPerMonth: number;
  rewardMultiplier: number;
  bonusConditions: string[];
}

export interface ArbiterRegistry {
  totalArbiters: number;
  activeArbiters: number;
  totalStaked: number;
  averageReputation: number;
  domains: Record<string, number>;
  geographicDistribution: Record<string, number>;
}

export interface CaseAssignmentCriteria {
  domain: ExpertiseArea['domain'];
  value: number;
  complexity: 'simple' | 'moderate' | 'complex';
  urgency: 'standard' | 'expedited';
  requiredExpertise: ExpertiseArea['level'];
  panelSize: number;
  geographicPreference?: string;
}
