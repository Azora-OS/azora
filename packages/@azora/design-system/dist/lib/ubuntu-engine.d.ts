/**
 * Ubuntu Economics Engine
 * Individual Success = f(Collective Success)
 * Collective Success = Σ(Individual Contributions × Network Effects)
 *
 * Integrated from v0's gift - enhanced with @azora/core principles
 */
import { UBUNTU_PRINCIPLES } from '@azora/core';
export interface UbuntuCollaborator {
    userId: string;
    contribution: number;
    role: "learner" | "educator" | "mentor" | "developer" | "founder";
    collectiveImpact: number;
    collaborationCount: number;
    ubuntuScore: number;
}
export interface NetworkCluster {
    clusterId: string;
    name: string;
    members: UbuntuCollaborator[];
    totalValue: number;
    networkMultiplier: number;
    collectiveSuccess: number;
}
export declare class UbuntuEngine {
    /**
     * Calculate individual earning based on Ubuntu principles
     * "Ngiyakwazi ngoba sikwazi" - I can because we can
     */
    static calculateIndividualEarning(baseContribution: number, collectiveImpactPercentage: number, collaboratorCount: number, networkEffectExponent?: number): number;
    /**
     * Calculate collective success multiplier
     */
    static calculateCollectiveMultiplier(individualContributions: number[], collaborationIntensity: number, // 0-100
    trustScore: number): number;
    /**
     * Distribute collective rewards back to individuals
     * Ensures everyone benefits from collaboration
     */
    static distributeCollectiveRewards(totalReward: number, contributors: UbuntuCollaborator[]): Record<string, number>;
    /**
     * Create or update network cluster for collaborative learning
     */
    static createNetworkCluster(clusterId: string, name: string, members: UbuntuCollaborator[]): NetworkCluster;
    /**
     * Calculate Ubuntu trust score for a user
     * Based on collaboration history and reciprocal benefits
     */
    static calculateTrustScore(collaborationsCount: number, successfulCollaborations: number, reciprocalBenefit: number, // 0-100
    timeInNetwork: number): number;
    /**
     * Get Ubuntu principle for display
     */
    static getUbuntuPrinciple(key: keyof typeof UBUNTU_PRINCIPLES): string;
}
export default UbuntuEngine;
//# sourceMappingURL=ubuntu-engine.d.ts.map