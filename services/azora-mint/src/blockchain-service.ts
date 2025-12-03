import { ethers } from 'ethers';
import { config } from './config';

export class BlockchainService {
    private provider: ethers.JsonRpcProvider;
    private wallet: ethers.Wallet | null = null;

    constructor() {
        this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
        if (config.privateKey) {
            this.wallet = new ethers.Wallet(config.privateKey, this.provider);
        }
    }

    async getBlockNumber(): Promise<number> {
        return await this.provider.getBlockNumber();
    }

    async getBalance(address: string): Promise<string> {
        const balance = await this.provider.getBalance(address);
        return ethers.formatEther(balance);
    }

    getWallet(): ethers.Wallet {
        if (!this.wallet) {
            throw new Error('Wallet not initialized. Provide BLOCKCHAIN_PRIVATE_KEY in .env');
        }
        return this.wallet;
    }

    getProvider(): ethers.JsonRpcProvider {
        return this.provider;
    }

    async getContract(address: string, abi: any): Promise<ethers.Contract> {
        if (this.wallet) {
            return new ethers.Contract(address, abi, this.wallet);
        }
        return new ethers.Contract(address, abi, this.provider);
    }
}
