import { ethers } from 'ethers';
import { config } from './config';
import AZRTokenABI from './abis/AZRToken.json';
import NFTCertificateABI from './abis/NFTCertificate.json';

export class BlockchainService {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
  }

  async getBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  async getBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  }

  getContract(address: string, abi: any): ethers.Contract {
    return new ethers.Contract(address, abi, this.wallet);
  }

  // AZR Token Contract
  getAZRContract(): ethers.Contract {
    return this.getContract(config.contracts.azrToken, AZRTokenABI);
  }

  // NFT Certificate Contract
  getNFTContract(): ethers.Contract {
    return this.getContract(config.contracts.nftCertificate, NFTCertificateABI);
  }

  // Listen to contract events
  async listenToTransfers(contractAddress: string, callback: (from: string, to: string, amount: string) => void) {
    const contract = this.getAZRContract();
    contract.on('Transfer', (from, to, amount) => {
      callback(from, to, ethers.utils.formatEther(amount));
    });
  }

  // --- Reputation System (Simulated for now) ---

  async getReputationScore(address: string): Promise<{ score: number; level: string }> {
    // In a real app, this would call a Reputation Registry smart contract
    // For now, we simulate a score based on the address hash
    const hash = ethers.utils.keccak256(address);
    const score = parseInt(hash.slice(-2), 16) % 100; // Random score 0-99

    let level = 'Novice';
    if (score > 80) level = 'Expert';
    else if (score > 50) level = 'Intermediate';

    return { score, level };
  }

  async updateReputation(address: string, change: number): Promise<boolean> {
    // This would be an admin-only transaction to the smart contract
    console.log(`[Blockchain] Updating reputation for ${address} by ${change}`);
    return true;
  }
}
