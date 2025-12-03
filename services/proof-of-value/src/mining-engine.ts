import { ethers } from 'ethers';
import AntiGamingSystem from './anti-gaming';
import MintIntegration from './mint-integration';
import { getLogger } from '../../../shared/monitoring/logger';
import dotenv from 'dotenv';

dotenv.config();

export interface ValueScore {
    score: number;
    breakdown: Record<string, number>;
    timestamp: string;
    multiplier?: number;
}

export interface Content {
    id: string;
    type: 'article' | 'video' | 'course' | 'tutorial' | 'research';
    quality: number; // 0-100
    impact: number; // 0-100
    engagement?: number; // 0-100
    originality?: number; // 0-100
}

export interface Commit {
    id: string;
    additions: number;
    deletions: number;
    filesChanged: number;
    complexity: number; // 0-100
    testsAdded?: number;
    documentation?: number; // 0-100
}

export interface CommunityAction {
    type: 'mentoring' | 'code_review' | 'governance_vote' | 'bug_report' | 'feature_request' | 'knowledge_sharing';
    impact: number; // 0-100
    recipients?: number; // Number of people helped
}

export interface ValueProof {
    id: string;
    userId: string;
    type: 'knowledge' | 'code' | 'community';
    score: number;
    reward: number;
    timestamp: Date;
    verified: boolean;
    txHash?: string;
    metadata: Record<string, any>;
}

export interface MiningStats {
    totalRewards: number;
    proofsSubmitted: number;
    proofsVerified: number;
    averageScore: number;
    topContributors: Array<{
        userId: string;
        totalScore: number;
        totalRewards: number;
    }>;
}

export class MiningEngine {
    private provider: ethers.providers.JsonRpcProvider;
    private wallet: ethers.Wallet;
    private azrContract: ethers.Contract | null = null;
    private readonly BASE_REWARD_RATE = 10; // 10 AZR per 100 score
    private valueProofs: Map<string, ValueProof> = new Map();
    private userStats: Map<string, { totalScore: number; totalRewards: number }> = new Map();
    private antiGaming: AntiGamingSystem | null = null;
    private antiGaming: AntiGamingSystem;
    private mintIntegration: MintIntegration;
    private logger = getLogger('mining-engine');

    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider(
            process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545'
        );
        
        const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
        // If no MINT_SERVICE_URL set, require a private key for direct contract interaction
        if (!process.env.MINT_SERVICE_URL) {
            if (!privateKey) {
                throw new Error('BLOCKCHAIN_PRIVATE_KEY is required for Proof-of-Value service when MINT_SERVICE_URL is not set');
            }
            this.wallet = new ethers.Wallet(privateKey, this.provider);
        }
        
        this.antiGaming = new AntiGamingSystem({
            rateLimits: { perUser: 10, perIP: 20, global: 1000 },
            duplicateThreshold: 0.8,
            minProofValue: 1,
            maxProofValue: 1000,
            suspiciousPatterns: ['bot', 'automated']
        });

        // Prefer a central HTTP Mint Service if set; otherwise, instantiate a direct mint integration
        if (process.env.MINT_SERVICE_URL) {
            // We don't construct a direct mint integration when using the central service; mining-engine will call MINT_SERVICE_URL
            this.mintIntegration = null as any; // explicit null - fallback path will use HTTP fetch below
        } else {
            this.mintIntegration = new MintIntegration({
                rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545',
                contractAddress: process.env.AZR_CONTRACT_ADDRESS || '',
                privateKey: privateKey || '',
                gasLimit: 200000,
                gasPrice: '20',
                confirmations: 1
            });
        }

        this.initializeContract();
        // Initialize Anti-Gaming system (use default config or read from env)
        try {
            const config = {
                rateLimits: { perUser: 10, perIP: 50, global: 1000 },
                duplicateThreshold: 0.9,
                minProofValue: 1,
                maxProofValue: 1000,
                suspiciousPatterns: ['spam', 'http:', 'https:']
            };
            this.antiGaming = new AntiGamingSystem(config);
        } catch (err) {
            console.warn('Anti-Gaming initialization failed:', err);
            this.antiGaming = null;
        }
    }

    private async initializeContract(): Promise<void> {
        try {
            const azrAbi = [
                "function balanceOf(address account) external view returns (uint256)",
                "function transfer(address to, uint256 amount) external returns (bool)",
                "function mint(address to, uint256 amount) external",
                "event Transfer(address indexed from, address indexed to, uint256 value)"
            ];

            const azrTokenAddress = process.env.AZR_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
            this.azrContract = new ethers.Contract(azrTokenAddress, azrAbi, this.wallet);
            console.log('✅ Proof-of-Value: AZR contract initialized');
        } catch (error) {
            console.error('❌ Failed to initialize AZR contract:', error);
        }
    }

    /**
     * Calculate advanced score for knowledge creation
     */
    async trackKnowledgeCreation(userId: string, content: Content): Promise<ValueScore> {
        const qualityWeight = 0.3;
        const impactWeight = 0.3;
        const engagementWeight = 0.2;
        const originalityWeight = 0.2;

        const qualityScore = content.quality * qualityWeight;
        const impactScore = content.impact * impactWeight;
        const engagementScore = (content.engagement || 50) * engagementWeight;
        const originalityScore = (content.originality || 50) * originalityWeight;

        // Apply Ubuntu multiplier for collaborative content
        const ubuntuMultiplier = content.type === 'course' || content.type === 'tutorial' ? 1.2 : 1.0;
        
        const totalScore = (qualityScore + impactScore + engagementScore + originalityScore) * ubuntuMultiplier;

        return {
            score: Math.min(totalScore, 100), // Cap at 100
            breakdown: { 
                quality: qualityScore, 
                impact: impactScore, 
                engagement: engagementScore,
                originality: originalityScore
            },
            timestamp: new Date().toISOString(),
            multiplier: ubuntuMultiplier
        };
    }

    /**
     * Calculate advanced score for code contribution
     */
    async trackCodeContribution(userId: string, commit: Commit): Promise<ValueScore> {
        const complexityWeight = 0.4;
        const sizeWeight = 0.2;
        const testWeight = 0.3;
        const docsWeight = 0.1;

        // Size factor with diminishing returns
        const sizeFactor = Math.log10(Math.max(commit.additions + commit.deletions, 10)) / 2;
        const sizeScore = Math.min(sizeFactor * 20, 50); // Cap at 50

        const complexityScore = commit.complexity * complexityWeight;
        const sizeContribution = sizeScore * sizeWeight;
        const testScore = ((commit.testsAdded || 0) * 10) * testWeight;
        const docsScore = (commit.documentation || 0) * docsWeight;

        // Bonus for comprehensive contributions
        const comprehensiveBonus = (commit.testsAdded && commit.documentation) ? 10 : 0;

        const totalScore = complexityScore + sizeContribution + testScore + docsScore + comprehensiveBonus;

        return {
            score: Math.min(totalScore, 100),
            breakdown: { 
                complexity: complexityScore, 
                size: sizeContribution, 
                tests: testScore,
                documentation: docsScore,
                bonus: comprehensiveBonus
            },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Calculate score for community impact
     */
    async trackCommunityImpact(userId: string, action: CommunityAction): Promise<ValueScore> {
        const baseScores = {
            mentoring: 60,
            code_review: 40,
            governance_vote: 20,
            bug_report: 30,
            feature_request: 25,
            knowledge_sharing: 35
        };

        const baseScore = baseScores[action.type] || 10;
        const impactMultiplier = action.impact / 50; // Normalize impact to 0-2 multiplier
        const reachBonus = action.recipients ? Math.min(action.recipients * 2, 20) : 0;

        const totalScore = (baseScore * impactMultiplier) + reachBonus;

        return {
            score: Math.min(totalScore, 100),
            breakdown: { 
                base: baseScore, 
                impact: baseScore * (impactMultiplier - 1),
                reach: reachBonus
            },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Submit proof of value for mining
     */
    async submitValueProof(
        userId: string, 
        type: 'knowledge' | 'code' | 'community',
        valueData: Content | Commit | CommunityAction
    ): Promise<ValueProof> {
        let valueScore: ValueScore;

        switch (type) {
            case 'knowledge':
                valueScore = await this.trackKnowledgeCreation(userId, valueData as Content);
                break;
            case 'code':
                valueScore = await this.trackCodeContribution(userId, valueData as Commit);
                break;
            case 'community':
                valueScore = await this.trackCommunityImpact(userId, valueData as CommunityAction);
                break;
            default:
                throw new Error('Invalid value proof type');
        }
        // Anti-gaming check
        const gamingCheck = await this.antiGaming.checkProof(
            userId,
            '0.0.0.0', // TODO: Get real IP
            JSON.stringify(data),
            valueScore.score,
            { userId }
        );

        if (gamingCheck.isGaming && gamingCheck.action === 'reject') {
            this.logger.warn('Gaming detected, proof rejected', { userId, reasons: gamingCheck.reasons });
            throw new Error(`Proof rejected: ${gamingCheck.reasons.join(', ')}`);
        }

        const reward = await this.calculateReward(valueScore);
        
        const proof: ValueProof = {
            id: `pov-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId,
            type,
            score: valueScore.score,
            reward,
            timestamp: new Date(),
            verified: false,
            metadata: {
                ...data,
                gamingCheck: {
                    confidence: gamingCheck.confidence,
                    reasons: gamingCheck.reasons
                }
            }
        };

        this.valueProofs.set(proof.id, proof);
        
        // Verify and mint immediately for this implementation
        try {
            await this.verifyAndMint(proof.id);
        } catch (error) {
            console.error(`Failed to mint reward for proof ${proof.id}:`, error);
            // We still return the proof, but it remains unverified
        }

        return proof;
    }

    /**
     * Verify proof and mint rewards on blockchain
     */
    async verifyAndMint(proofId: string): Promise<string> {
        const proof = this.valueProofs.get(proofId);
        if (!proof) {
            throw new Error('Proof not found');
        }

        if (proof.verified) {
            throw new Error('Proof already verified');
        }

        if (!this.azrContract && !process.env.MINT_SERVICE_URL) {
            throw new Error('Blockchain connection not established');
        }

        let txHash: string;

        // Use MintIntegration if available (preferred path)
        if (this.mintIntegration) {
            try {
                const result = await this.mintIntegration.mintTokens({
                    userId: proof.userId,
                    amount: proof.reward,
                    reason: `Proof-of-Value: ${proof.type}`,
                    proofId: proof.id,
                    metadata: proof.metadata
                });

                if (!result.success) {
                    throw new Error(result.error || 'Minting failed');
                }
                txHash = result.txHash || '';
            } catch (error) {
                this.logger.error('Mint integration failed', { error, proofId });
                throw error;
            }
        } else if (process.env.MINT_SERVICE_URL) {
             // Fallback to HTTP service
            const mintRequest = {
                userId: proof.userId,
                amount: proof.reward,
                reason: 'Proof-of-Value reward',
                proofId: proof.id,
                metadata: proof.metadata
            };
            const response = await fetch(`${process.env.MINT_SERVICE_URL}/api/mint`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.MINT_SERVICE_API_KEY || ''}`
                },
                body: JSON.stringify(mintRequest)
            });

            const json = await response.json();
            if (!response.ok) {
                throw new Error(`Mint Service responded with HTTP ${response.status}: ${json.error || JSON.stringify(json)}`);
            }
            txHash = json.txHash || json.data?.txHash;
        } else {
            // Fallback to direct contract call
            const tx = await this.azrContract!.mint(
                proof.userId, 
                ethers.utils.parseEther(proof.reward.toString())
            );
            const receipt = await tx.wait();
            txHash = receipt.transactionHash;
        }

        // Post-mint liquidity allocation (platform-level)
        const liquiditySharePercent = Number(process.env.LIQUIDITY_SHARE_PERCENT || '10'); // default 10%
        const liquidityAddress = process.env.LIQUIDITY_POOL_ADDRESS || '';
        proof.verified = true;
        proof.txHash = txHash;

        // Update stats
        const userStat = this.userStats.get(proof.userId) || { totalScore: 0, totalRewards: 0 };
        userStat.totalScore += proof.score;
        userStat.totalRewards += proof.reward;
        this.userStats.set(proof.userId, userStat);

        console.log(`✅ Value proof verified and rewarded: ${proof.reward} AZR minted to ${proof.userId}`);

        // Allocate a percentage of minted reward to the liquidity pool so that mining increases platform liquidity
        if (liquiditySharePercent > 0 && liquidityAddress) {
            const liquidityAmount = Math.floor((proof.reward * liquiditySharePercent) / 100);
            if (liquidityAmount > 0) {
                try {
                    // Use MintIntegration if available
                    if (this.mintIntegration) {
                        await this.mintIntegration.mintTokens({
                            userId: 'liquidity',
                            amount: liquidityAmount,
                            reason: 'Proof-of-Value Liquidity Share',
                            proofId: proof.id,
                            metadata: { originProof: proof.id }
                        });
                    } else if (process.env.MINT_SERVICE_URL) {
                        // Call HTTP mint endpoint
                        await fetch(`${process.env.MINT_SERVICE_URL}/api/mint`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${process.env.MINT_SERVICE_API_KEY || ''}`
                            },
                            body: JSON.stringify({
                                userId: 'liquidity',
                                amount: liquidityAmount,
                                reason: 'Proof-of-Value Liquidity Share',
                                proofId: proof.id
                            })
                        });
                    }
                    console.log(`🔁 Liquidity allocated: ${liquidityAmount} AZR to ${liquidityAddress}`);
                } catch (e) {
                    console.warn('⚠️ Liquidity allocation failed:', e instanceof Error ? e.message : e);
                }
            }
        }
        return txHash;
    }

    /**
     * Calculate reward based on score with Ubuntu principles
     */
    async calculateReward(valueScore: ValueScore): Promise<number> {
        const baseReward = (valueScore.score / 100) * this.BASE_REWARD_RATE;
        const multiplier = valueScore.multiplier || 1.0;
        
        // Apply Ubuntu bonus for collaborative work
        const ubuntuBonus = baseReward * 0.1; // 10% bonus
        
        return Math.round((baseReward * multiplier) + ubuntuBonus);
    }

    /**
     * Advanced proof verification
     */
    async verifyProofOfKnowledge(proof: string): Promise<boolean> {
        try {
            // Basic validation
            if (!proof || proof.length < 10) {
                return false;
            }

            // Check for duplicate content (simplified)
            const proofHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(proof));
            
            // In production, this would check against:
            // - Plagiarism detection
            // - Quality metrics
            // - Community validation
            // - Oracle verification
            
            return true;
        } catch (error) {
            console.error('Proof verification error:', error);
            return false;
        }
    }

    /**
     * Get mining statistics
     */
    async getMiningStats(): Promise<MiningStats> {
        const proofs = Array.from(this.valueProofs.values());
        const verifiedProofs = proofs.filter(p => p.verified);
        
        const totalRewards = verifiedProofs.reduce((sum, p) => sum + p.reward, 0);
        const averageScore = proofs.length > 0 
            ? proofs.reduce((sum, p) => sum + p.score, 0) / proofs.length 
            : 0;

        // Get top contributors
        const topContributors = Array.from(this.userStats.entries())
            .map(([userId, stats]) => ({ userId, ...stats }))
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, 10);

        return {
            totalRewards,
            proofsSubmitted: proofs.length,
            proofsVerified: verifiedProofs.length,
            averageScore,
            topContributors
        };
    }

    /**
     * Get user's value proofs
     */
    async getUserProofs(userId: string, limit: number = 50): Promise<ValueProof[]> {
        const proofs = Array.from(this.valueProofs.values())
            .filter(p => p.userId === userId)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);

        return proofs;
    }

    /**
     * Get user statistics
     */
    async getUserStats(userId: string): Promise<{ totalScore: number; totalRewards: number } | null> {
        return this.userStats.get(userId) || null;
    }
}

export const miningEngine = new MiningEngine();
