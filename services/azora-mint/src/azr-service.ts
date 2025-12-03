import { ethers, Contract, Wallet, providers } from 'ethers';
import dotenv from 'dotenv';
import AZRTokenABI from './abis/AZRToken.json';

dotenv.config();

export class AzrService {
    private provider: providers.JsonRpcProvider;
    private wallet: Wallet;
    private contract: Contract;

    constructor() {
        const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545';
        this.provider = new providers.JsonRpcProvider(rpcUrl);

        const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
        if (!privateKey) {
            console.warn('⚠️ No private key provided. AzrService will be read-only.');
            this.wallet = Wallet.createRandom().connect(this.provider);
        } else {
            this.wallet = new Wallet(privateKey, this.provider);
        }

        const contractAddress = process.env.AZR_TOKEN_ADDRESS;
        if (!contractAddress) {
            console.error('❌ AZR_TOKEN_ADDRESS not found in environment variables');
            // Use a dummy address to prevent crash on startup, but calls will fail
            this.contract = new Contract(ethers.constants.AddressZero, AZRTokenABI, this.wallet);
        } else {
            this.contract = new Contract(contractAddress, AZRTokenABI, this.wallet);
        }
    }

    async getBalance(address: string): Promise<string> {
        const balance = await this.contract.balanceOf(address);
        return ethers.utils.formatEther(balance);
    }

    async transfer(to: string, amount: string): Promise<any> {
        const tx = await this.contract.transfer(to, ethers.utils.parseEther(amount));
        return await tx.wait();
    }

    async burn(amount: string): Promise<any> {
        const tx = await this.contract.burn(ethers.utils.parseEther(amount));
        return await tx.wait();
    }

    async ubuntuMine(to: string, knowledgeProof: string, knowledgeLevel: number): Promise<any> {
        const tx = await this.contract.ubuntuMine(to, knowledgeProof, knowledgeLevel);
        return await tx.wait();
    }

    async rewardContribution(contributor: string, amount: string, action: string): Promise<any> {
        const tx = await this.contract.rewardUbuntuContribution(contributor, ethers.utils.parseEther(amount), action);
        return await tx.wait();
    }
}

export const azrService = new AzrService();
