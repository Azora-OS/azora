/**
 * Collective Benefit Metrics
 * Tracks Ubuntu philosophy metrics for community impact and shared prosperity
 */

import { Counter, Gauge, Histogram, register } from 'prom-client';

/**
 * Community Engagement Metrics
 */
export const communityContributions = new Counter({
  name: 'community_contributions_total',
  help: 'Total community contributions (knowledge sharing, mentoring, etc.)',
  labelNames: ['contribution_type', 'user_id', 'status'],
});

export const communityEngagementScore = new Gauge({
  name: 'community_engagement_score',
  help: 'Overall community engagement score (0-100)',
  labelNames: ['community_id'],
});

export const knowledgeSharingEvents = new Counter({
  name: 'knowledge_sharing_events_total',
  help: 'Total knowledge sharing events (tutorials, discussions, etc.)',
  labelNames: ['event_type', 'category'],
});

export const mentorshipRelationships = new Gauge({
  name: 'mentorship_relationships_active',
  help: 'Number of active mentorship relationships',
  labelNames: ['community_id'],
});

/**
 * Prosperity Distribution Metrics
 */
export const wealthDistributionIndex = new Gauge({
  name: 'wealth_distribution_index',
  help: 'Gini coefficient for wealth distribution (0=equal, 1=unequal)',
  labelNames: ['community_id'],
});

export const universalBasicIncomeDistributed = new Counter({
  name: 'universal_basic_income_distributed_total',
  help: 'Total UBI distributed to community members',
  labelNames: ['community_id', 'currency'],
});

export const creatorRevenueShared = new Counter({
  name: 'creator_revenue_shared_total',
  help: 'Total revenue shared with content creators',
  labelNames: ['creator_id', 'content_type'],
});

export const averageIncomePerUser = new Gauge({
  name: 'average_income_per_user',
  help: 'Average income per user in community',
  labelNames: ['community_id', 'currency'],
});

export const incomeEqualityRatio = new Gauge({
  name: 'income_equality_ratio',
  help: 'Ratio of highest to lowest income (lower is more equal)',
  labelNames: ['community_id'],
});

/**
 * Collective Action Metrics
 */
export const collaborativeProjects = new Counter({
  name: 'collaborative_projects_total',
  help: 'Total collaborative projects initiated',
  labelNames: ['project_type', 'status'],
});

export const activeCollaborators = new Gauge({
  name: 'active_collaborators',
  help: 'Number of active collaborators on projects',
  labelNames: ['project_id'],
});

export const skillSharingHours = new Counter({
  name: 'skill_sharing_hours_total',
  help: 'Total hours of skill sharing and peer learning',
  labelNames: ['skill_category'],
});

export const collectiveActionImpact = new Gauge({
  name: 'collective_action_impact_score',
  help: 'Score measuring impact of collective actions (0-100)',
  labelNames: ['community_id'],
});

/**
 * Constitutional Protection Metrics
 */
export const rightsEnforced = new Counter({
  name: 'rights_enforced_total',
  help: 'Total instances of rights enforcement',
  labelNames: ['right_type', 'outcome'],
});

export const transparencyScore = new Gauge({
  name: 'transparency_score',
  help: 'Transparency score for decision-making (0-100)',
  labelNames: ['community_id'],
});

export const democraticParticipation = new Gauge({
  name: 'democratic_participation_rate',
  help: 'Percentage of community members participating in decisions',
  labelNames: ['community_id'],
});

export const governanceDecisions = new Counter({
  name: 'governance_decisions_total',
  help: 'Total governance decisions made',
  labelNames: ['decision_type', 'approval_method'],
});

/**
 * Overall Collective Benefit Score
 */
export const collectiveBenefitScore = new Gauge({
  name: 'collective_benefit_score',
  help: 'Overall collective benefit score (0-100)',
  labelNames: ['community_id'],
});

/**
 * Accessibility & Inclusion Metrics
 */
export const accessibilityCompliance = new Gauge({
  name: 'accessibility_compliance_percentage',
  help: 'Percentage of features meeting WCAG 2.1 Level AA',
  labelNames: ['community_id'],
});

export const inclusiveDesignFeatures = new Counter({
  name: 'inclusive_design_features_total',
  help: 'Total features with inclusive design',
  labelNames: ['feature_type'],
});

export const diverseRepresentation = new Gauge({
  name: 'diverse_representation_score',
  help: 'Score for diverse representation in content (0-100)',
  labelNames: ['community_id'],
});

/**
 * Record community contribution
 */
export function recordCommunityContribution(
  contributionType: 'mentoring' | 'knowledge_sharing' | 'content_creation' | 'community_support',
  userId: string,
  status: 'completed' | 'in_progress' | 'failed' = 'completed'
) {
  communityContributions.labels(contributionType, userId, status).inc();
}

/**
 * Update community engagement score
 */
export function updateCommunityEngagementScore(communityId: string, score: number) {
  // Ensure score is between 0-100
  const normalizedScore = Math.max(0, Math.min(100, score));
  communityEngagementScore.labels(communityId).set(normalizedScore);
}

/**
 * Record knowledge sharing event
 */
export function recordKnowledgeSharingEvent(
  eventType: 'tutorial' | 'discussion' | 'workshop' | 'webinar',
  category: string
) {
  knowledgeSharingEvents.labels(eventType, category).inc();
}

/**
 * Update mentorship relationships
 */
export function updateMentorshipRelationships(communityId: string, count: number) {
  mentorshipRelationships.labels(communityId).set(count);
}

/**
 * Update wealth distribution index (Gini coefficient)
 */
export function updateWealthDistributionIndex(communityId: string, giniCoefficient: number) {
  // Gini coefficient: 0 = perfect equality, 1 = perfect inequality
  const normalizedGini = Math.max(0, Math.min(1, giniCoefficient));
  wealthDistributionIndex.labels(communityId).set(normalizedGini);
}

/**
 * Record UBI distribution
 */
export function recordUBIDistribution(communityId: string, amount: number, currency: string = 'USD') {
  universalBasicIncomeDistributed.labels(communityId, currency).inc(amount);
}

/**
 * Record creator revenue sharing
 */
export function recordCreatorRevenueSharing(creatorId: string, amount: number, contentType: string) {
  creatorRevenueShared.labels(creatorId, contentType).inc(amount);
}

/**
 * Update average income per user
 */
export function updateAverageIncomePerUser(communityId: string, averageIncome: number, currency: string = 'USD') {
  averageIncomePerUser.labels(communityId, currency).set(averageIncome);
}

/**
 * Update income equality ratio
 */
export function updateIncomeEqualityRatio(communityId: string, ratio: number) {
  // Ratio of highest to lowest income (lower is more equal)
  incomeEqualityRatio.labels(communityId).set(ratio);
}

/**
 * Record collaborative project
 */
export function recordCollaborativeProject(
  projectType: 'education' | 'marketplace' | 'research' | 'community',
  status: 'active' | 'completed' | 'failed' = 'active'
) {
  collaborativeProjects.labels(projectType, status).inc();
}

/**
 * Update active collaborators
 */
export function updateActiveCollaborators(projectId: string, count: number) {
  activeCollaborators.labels(projectId).set(count);
}

/**
 * Record skill sharing hours
 */
export function recordSkillSharingHours(skillCategory: string, hours: number) {
  skillSharingHours.labels(skillCategory).inc(hours);
}

/**
 * Update collective action impact score
 */
export function updateCollectiveActionImpactScore(communityId: string, score: number) {
  const normalizedScore = Math.max(0, Math.min(100, score));
  collectiveActionImpact.labels(communityId).set(normalizedScore);
}

/**
 * Record rights enforcement
 */
export function recordRightsEnforcement(
  rightType: 'privacy' | 'freedom_of_speech' | 'fair_compensation' | 'data_protection',
  outcome: 'upheld' | 'violated' | 'remedied'
) {
  rightsEnforced.labels(rightType, outcome).inc();
}

/**
 * Update transparency score
 */
export function updateTransparencyScore(communityId: string, score: number) {
  const normalizedScore = Math.max(0, Math.min(100, score));
  transparencyScore.labels(communityId).set(normalizedScore);
}

/**
 * Update democratic participation rate
 */
export function updateDemocraticParticipationRate(communityId: string, participationRate: number) {
  // Percentage of community members participating (0-100)
  const normalizedRate = Math.max(0, Math.min(100, participationRate));
  democraticParticipation.labels(communityId).set(normalizedRate);
}

/**
 * Record governance decision
 */
export function recordGovernanceDecision(
  decisionType: 'policy' | 'budget' | 'feature' | 'community_rule',
  approvalMethod: 'consensus' | 'majority_vote' | 'delegation' | 'expert_review'
) {
  governanceDecisions.labels(decisionType, approvalMethod).inc();
}

/**
 * Calculate and update overall collective benefit score
 * Combines all metrics into a single score (0-100)
 */
export function updateCollectiveBenefitScore(
  communityId: string,
  engagementScore: number,
  wealthDistribution: number,
  collectiveActionScore: number,
  transparencyScore: number,
  participationRate: number,
  accessibilityScore: number
) {
  // Weighted average of all metrics
  const weights = {
    engagement: 0.2,
    wealth: 0.2,
    action: 0.2,
    transparency: 0.15,
    participation: 0.15,
    accessibility: 0.1,
  };

  // Invert wealth distribution (lower Gini = higher score)
  const wealthScore = (1 - wealthDistribution) * 100;

  const overallScore =
    engagementScore * weights.engagement +
    wealthScore * weights.wealth +
    collectiveActionScore * weights.action +
    transparencyScore * weights.transparency +
    participationRate * weights.participation +
    accessibilityScore * weights.accessibility;

  const normalizedScore = Math.max(0, Math.min(100, overallScore));
  collectiveBenefitScore.labels(communityId).set(normalizedScore);

  return normalizedScore;
}

/**
 * Update accessibility compliance
 */
export function updateAccessibilityCompliance(communityId: string, compliancePercentage: number) {
  const normalized = Math.max(0, Math.min(100, compliancePercentage));
  accessibilityCompliance.labels(communityId).set(normalized);
}

/**
 * Record inclusive design feature
 */
export function recordInclusiveDesignFeature(featureType: 'accessibility' | 'localization' | 'diversity' | 'equity') {
  inclusiveDesignFeatures.labels(featureType).inc();
}

/**
 * Update diverse representation score
 */
export function updateDiverseRepresentationScore(communityId: string, score: number) {
  const normalized = Math.max(0, Math.min(100, score));
  diverseRepresentation.labels(communityId).set(normalized);
}

/**
 * Get all collective benefit metrics
 */
export function getCollectiveBenefitMetrics() {
  return {
    communityContributions,
    communityEngagementScore,
    knowledgeSharingEvents,
    mentorshipRelationships,
    wealthDistributionIndex,
    universalBasicIncomeDistributed,
    creatorRevenueShared,
    averageIncomePerUser,
    incomeEqualityRatio,
    collaborativeProjects,
    activeCollaborators,
    skillSharingHours,
    collectiveActionImpact,
    rightsEnforced,
    transparencyScore,
    democraticParticipation,
    governanceDecisions,
    collectiveBenefitScore,
    accessibilityCompliance,
    inclusiveDesignFeatures,
    diverseRepresentation,
  };
}

export default {
  // Metrics
  communityContributions,
  communityEngagementScore,
  knowledgeSharingEvents,
  mentorshipRelationships,
  wealthDistributionIndex,
  universalBasicIncomeDistributed,
  creatorRevenueShared,
  averageIncomePerUser,
  incomeEqualityRatio,
  collaborativeProjects,
  activeCollaborators,
  skillSharingHours,
  collectiveActionImpact,
  rightsEnforced,
  transparencyScore,
  democraticParticipation,
  governanceDecisions,
  collectiveBenefitScore,
  accessibilityCompliance,
  inclusiveDesignFeatures,
  diverseRepresentation,
  // Functions
  recordCommunityContribution,
  updateCommunityEngagementScore,
  recordKnowledgeSharingEvent,
  updateMentorshipRelationships,
  updateWealthDistributionIndex,
  recordUBIDistribution,
  recordCreatorRevenueSharing,
  updateAverageIncomePerUser,
  updateIncomeEqualityRatio,
  recordCollaborativeProject,
  updateActiveCollaborators,
  recordSkillSharingHours,
  updateCollectiveActionImpactScore,
  recordRightsEnforcement,
  updateTransparencyScore,
  updateDemocraticParticipationRate,
  recordGovernanceDecision,
  updateCollectiveBenefitScore,
  updateAccessibilityCompliance,
  recordInclusiveDesignFeature,
  updateDiverseRepresentationScore,
  getCollectiveBenefitMetrics,
};

