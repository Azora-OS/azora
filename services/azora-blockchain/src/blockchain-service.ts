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
}
