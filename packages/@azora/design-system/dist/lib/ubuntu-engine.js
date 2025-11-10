/**
 * Ubuntu Economics Engine
 * Individual Success = f(Collective Success)
 * Collective Success = Σ(Individual Contributions × Network Effects)
 *
 * Integrated from v0's gift - enhanced with @azora/core principles
 */
import { UBUNTU_PRINCIPLES } from '@azora/core';
export class UbuntuEngine {
    /**
     * Calculate individual earning based on Ubuntu principles
     * "Ngiyakwazi ngoba sikwazi" - I can because we can
     */
    static calculateIndividualEarning(baseContribution, collectiveImpactPercentage, collaboratorCount, networkEffectExponent = 1.3) {
        // Base earning from individual contribution
        let earning = baseContribution;
        // Multiply by collective impact (everyone benefits when community succeeds)
        earning *= 1 + collectiveImpactPercentage / 100;
        // Apply network effect multiplier (Metcalfe's Law)
        const networkMultiplier = Math.pow(collaboratorCount, networkEffectExponent) / collaboratorCount;
        earning *= networkMultiplier;
        return earning;
    }
    /**
     * Calculate collective success multiplier
     */
    static calculateCollectiveMultiplier(individualContributions, collaborationIntensity, // 0-100
    trustScore) {
        const sumContributions = individualContributions.reduce((a, b) => a + b, 0);
        const avgContribution = sumContributions / individualContributions.length;
        // Collaboration bonus
        const collaborationBonus = 1 + (collaborationIntensity / 100) * 0.5;
        // Trust amplification
        const trustAmplification = 1 + (trustScore / 100) * 0.3;
        // Network value (n choose 2 connections)
        const networkConnections = (individualContributions.length * (individualContributions.length - 1)) / 2;
        return (avgContribution * networkConnections * collaborationBonus * trustAmplification) / 100;
    }
    /**
     * Distribute collective rewards back to individuals
     * Ensures everyone benefits from collaboration
     */
    static distributeCollectiveRewards(totalReward, contributors) {
        const distribution = {};
        const totalUbuntuScore = contributors.reduce((sum, c) => sum + c.ubuntuScore, 0);
        for (const contributor of contributors) {
            // Base distribution proportional to contribution
            const baseShare = contributor.contribution / contributors.length;
            // Ubuntu bonus: those who contributed to collective get extra
            const ubuntuBonus = (contributor.ubuntuScore / totalUbuntuScore) * 0.3; // 30% bonus pool
            // Final allocation
            distribution[contributor.userId] = totalReward * (baseShare + ubuntuBonus);
        }
        return distribution;
    }
    /**
     * Create or update network cluster for collaborative learning
     */
    static createNetworkCluster(clusterId, name, members) {
        const totalIndividualValue = members.reduce((sum, m) => sum + m.contribution, 0);
        const avgCollaboration = members.reduce((sum, m) => sum + m.collaborationCount, 0) / members.length;
        // Network multiplier grows exponentially with cluster size
        const networkMultiplier = 1 + Math.log(members.length + 1) * 0.5;
        const collectiveSuccess = totalIndividualValue * networkMultiplier;
        return {
            clusterId,
            name,
            members,
            totalValue: totalIndividualValue,
            networkMultiplier,
            collectiveSuccess,
        };
    }
    /**
     * Calculate Ubuntu trust score for a user
     * Based on collaboration history and reciprocal benefits
     */
    static calculateTrustScore(collaborationsCount, successfulCollaborations, reciprocalBenefit, // 0-100
    timeInNetwork) {
        const successRate = collaborationsCount > 0 ? successfulCollaborations / collaborationsCount : 0;
        const timeBonus = Math.min(1, timeInNetwork / 365); // Max bonus after 1 year
        return Math.min(100, successRate * 70 + reciprocalBenefit * 0.2 + timeBonus * 10);
    }
    /**
     * Get Ubuntu principle for display
     */
    static getUbuntuPrinciple(key) {
        return UBUNTU_PRINCIPLES[key];
    }
}
export default UbuntuEngine;
