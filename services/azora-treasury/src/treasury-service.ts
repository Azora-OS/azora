import { ethers, providers, Contract } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Minimal ERC20 ABI for balance checking
const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
];

export interface Asset {
    symbol: string;
    balance: string;
    valueUsd: number; // Mock value for now
    contractAddress?: string;
}

export class TreasuryService {
    private provider: providers.JsonRpcProvider;
    private treasuryAddress: string;

    constructor() {
        const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545';
        this.provider = new providers.JsonRpcProvider(rpcUrl);
        this.treasuryAddress = process.env.TREASURY_WALLET_ADDRESS || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'; // Default hardhat account 0
    }

    async getEthBalance(): Promise<string> {
        const balance = await this.provider.getBalance(this.treasuryAddress);
        return ethers.utils.formatEther(balance);
    }

    async getTokenBalance(tokenAddress: string): Promise<string> {
        const contract = new Contract(tokenAddress, ERC20_ABI, this.provider);
        const balance = await contract.balanceOf(this.treasuryAddress);
        const decimals = await contract.decimals();
        return ethers.utils.formatUnits(balance, decimals);
    }

    async getPortfolio(): Promise<Asset[]> {
        // In a real scenario, we would fetch a list of tracked tokens from DB
        const ethBalance = await this.getEthBalance();

        const portfolio: Asset[] = [
            {
                symbol: 'ETH',
                balance: ethBalance,
                valueUsd: parseFloat(ethBalance) * 2000 // Mock price
            }
        ];

        // Add AZR if address is known
        if (process.env.AZR_TOKEN_ADDRESS) {
            try {
                const azrBalance = await this.getTokenBalance(process.env.AZR_TOKEN_ADDRESS);
                portfolio.push({
                    symbol: 'AZR',
                    balance: azrBalance,
                    valueUsd: parseFloat(azrBalance) * 1.5 // Mock price
                });
            } catch (e) {
                console.error('Failed to fetch AZR balance', e);
            }
        }

        return portfolio;
    }

    async getTotalValueUsd(): Promise<number> {
        const portfolio = await this.getPortfolio();
        return portfolio.reduce((total, asset) => total + asset.valueUsd, 0);
    }
}

export const treasuryService = new TreasuryService();
