import { ethers } from 'ethers';
import { BlockchainService } from './blockchain-service';
import { config } from './config';

export interface MiningResult {
    success: boolean;
    transactionHash?: string;
    amount?: string;
    knowledgeProof?: string;
    ubuntu: string;
    error?: string;
}

export interface TokenBalance {
    balance: string;
    knowledgeScore: string;
    ubuntu: string;
    error?: string;
}

export interface ProposalResult {
    success: boolean;
    transactionHash?: string;
    proposalId?: number;
    ubuntu: string;
    error?: string;
}

export interface VoteResult {
    success: boolean;
    transactionHash?: string;
    proposalId?: number;
    support?: boolean;
    ubuntu: string;
    error?: string;
}

export interface StakingResult {
    success: boolean;
    transactionHash?: string;
    amount?: number;
    duration?: number;
    expectedRewards?: string;
    ubuntu: string;
    error?: string;
}

export class UbuntuService {
    private blockchainService: BlockchainService;

    constructor() {
        this.blockchainService = new BlockchainService();
    }

    // Mint AZR tokens for Proof-of-Knowledge mining
    async mintKnowledgeTokens(userAddress: string, knowledgeProof: string, contributionAmount: number): Promise<MiningResult> {
        try {
            const contract = this.blockchainService.getAZRContract();
            const baseAmount = ethers.utils.parseEther('10'); // 10 AZR base reward

            // 1.5x bonus for high contribution
            const ubuntuBonus = contributionAmount > 5
                ? baseAmount.mul(150).div(100)
                : baseAmount;

            // Note: In a real scenario, this method would need to be called by a wallet with Minter role
            // For now, we assume the service wallet has this role
            const tx = await contract.ubuntuMining(userAddress, ubuntuBonus, knowledgeProof);
            await tx.wait();

            return {
                success: true,
                transactionHash: tx.hash,
                amount: ethers.utils.formatEther(ubuntuBonus),
                knowledgeProof,
                ubuntu: 'Ubuntu knowledge rewarded - I learn because we grow'
            };
        } catch (error: any) {
            return {
                success: false,
                ubuntu: 'Ubuntu handles challenges with collective wisdom',
                error: error.message
            };
        }
    }

    // Get user's token balance
    async getTokenBalance(userAddress: string): Promise<TokenBalance> {
        try {
            const contract = this.blockchainService.getAZRContract();
            const balance = await contract.balanceOf(userAddress);

            // Try to get knowledge score, default to 0 if method doesn't exist yet
            let knowledgeScore = '0';
            try {
                const score = await contract.knowledgeScore(userAddress);
                knowledgeScore = score.toString();
            } catch (e) {
                // Method might not exist in ABI yet
            }

            return {
                balance: ethers.utils.formatEther(balance),
                knowledgeScore,
                ubuntu: 'Ubuntu prosperity measured in collective knowledge'
            };
        } catch (error: any) {
            return {
                balance: '0',
                knowledgeScore: '0',
                ubuntu: 'Error fetching balance',
                error: error.message
            };
        }
    }

    // Transfer tokens with Ubuntu purpose
    async transferTokens(fromAddress: string, toAddress: string, amount: number, purpose: string): Promise<any> {
        try {
            const contract = this.blockchainService.getAZRContract();
            const transferAmount = ethers.utils.parseEther(amount.toString());

            const tx = await contract.transfer(toAddress, transferAmount);
            await tx.wait();

            // Log Ubuntu contribution if method exists
            try {
                await contract.ubuntuContribution(fromAddress, transferAmount, purpose || 'Ubuntu sharing');
            } catch (e) {
                // Method might not exist
            }

            return {
                success: true,
                transactionHash: tx.hash,
                amount,
                purpose,
                ubuntu: 'Ubuntu sharing strengthens our collective'
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                ubuntu: 'Ubuntu transfers require collective harmony'
            };
        }
    }

    // Create governance proposal
    async createProposal(title: string, description: string, votingPeriod: number = 7): Promise<ProposalResult> {
        // Placeholder for Governance contract interaction
        // In a real implementation, we would add getGovernanceContract() to BlockchainService
        return {
            success: false,
            ubuntu: 'Governance contract not yet connected',
            error: 'Governance contract not implemented'
        };
    }

    // Health check
    async healthCheck(): Promise<any> {
        try {
            const blockNumber = await this.blockchainService.getBlockNumber();
            return {
                status: 'healthy',
                blockNumber,
                ubuntu: 'Ubuntu blockchain integration operational'
            };
        } catch (error: any) {
            return {
                status: 'unhealthy',
                error: error.message,
                ubuntu: 'Ubuntu blockchain facing temporary challenges'
            };
        }
    }
}
