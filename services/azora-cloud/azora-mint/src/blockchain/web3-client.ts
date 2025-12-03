/**
 * Web3 Client
 * Handles blockchain interactions with Polygon network
 */

import { ethers } from 'ethers';

export interface BlockchainConfig {
  rpcUrl: string;
  chainId: number;
  contractAddress: string;
  privateKey: string;
  gasLimit?: number;
  gasPrice?: string;
}

export interface TransactionResult {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed?: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  timestamp?: Date;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

/**
 * Web3 Client for blockchain interactions
 */
export class Web3Client {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private contract: ethers.Contract;
  private config: BlockchainConfig;

  constructor(config: BlockchainConfig, contractABI: any[]) {
    this.config = config;

    // Initialize provider
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl, config.chainId);

    // Initialize signer
    this.signer = new ethers.Wallet(config.privateKey, this.provider);

    // Initialize contract
    this.contract = new ethers.Contract(config.contractAddress, contractABI, this.signer);
  }

  /**
   * Get account balance
   */
  async getBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  /**
   * Get signer address
   */
  getSignerAddress(): string {
    return this.signer.address;
  }

  /**
   * Get network info
   */
  async getNetworkInfo() {
    const network = await this.provider.getNetwork();
    const blockNumber = await this.provider.getBlockNumber();

    return {
      chainId: network.chainId,
      name: network.name,
      blockNumber,
    };
  }

  /**
   * Send transaction
   */
  async sendTransaction(
    to: string,
    value: string,
    data?: string
  ): Promise<TransactionResult> {
    try {
      const tx = await this.signer.sendTransaction({
        to,
        value: ethers.parseEther(value),
        data,
        gasLimit: this.config.gasLimit || 100000,
      });

      const receipt = await tx.wait();

      return {
        hash: tx.hash,
        from: tx.from || '',
        to: tx.to || '',
        value,
        gasUsed: receipt?.gasUsed?.toString(),
        status: receipt?.status === 1 ? 'confirmed' : 'failed',
        blockNumber: receipt?.blockNumber,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new Error(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Call contract function
   */
  async callContractFunction(
    functionName: string,
    args: any[] = [],
    options?: { value?: string; gasLimit?: number }
  ): Promise<any> {
    try {
      const func = this.contract[functionName];
      if (!func) {
        throw new Error(`Function ${functionName} not found in contract`);
      }

      const txOptions: any = {};
      if (options?.value) {
        txOptions.value = ethers.parseEther(options.value);
      }
      if (options?.gasLimit) {
        txOptions.gasLimit = options.gasLimit;
      }

      const result = await func(...args, txOptions);
      return result;
    } catch (error) {
      throw new Error(`Contract call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mint NFT
   */
  async mintNFT(
    to: string,
    tokenURI: string,
    metadata: NFTMetadata
  ): Promise<TransactionResult> {
    try {
      const tx = await this.contract.mint(to, tokenURI);
      const receipt = await tx.wait();

      return {
        hash: tx.hash,
        from: this.signer.address,
        to,
        value: '0',
        gasUsed: receipt?.gasUsed?.toString(),
        status: receipt?.status === 1 ? 'confirmed' : 'failed',
        blockNumber: receipt?.blockNumber,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new Error(`NFT minting failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Transfer token
   */
  async transferToken(to: string, amount: string): Promise<TransactionResult> {
    try {
      const tx = await this.contract.transfer(to, ethers.parseEther(amount));
      const receipt = await tx.wait();

      return {
        hash: tx.hash,
        from: this.signer.address,
        to,
        value: amount,
        gasUsed: receipt?.gasUsed?.toString(),
        status: receipt?.status === 1 ? 'confirmed' : 'failed',
        blockNumber: receipt?.blockNumber,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new Error(`Token transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(hash: string) {
    return await this.provider.getTransactionReceipt(hash);
  }

  /**
   * Estimate gas
   */
  async estimateGas(to: string, value: string, data?: string): Promise<string> {
    try {
      const gasEstimate = await this.provider.estimateGas({
        to,
        value: ethers.parseEther(value),
        data,
      });

      return gasEstimate.toString();
    } catch (error) {
      throw new Error(`Gas estimation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get gas price
   */
  async getGasPrice(): Promise<string> {
    const gasPrice = await this.provider.getGasPrice();
    return ethers.formatUnits(gasPrice, 'gwei');
  }

  /**
   * Calculate transaction cost
   */
  async calculateTransactionCost(
    to: string,
    value: string,
    data?: string
  ): Promise<{ gasEstimate: string; gasPrice: string; totalCost: string }> {
    const gasEstimate = await this.estimateGas(to, value, data);
    const gasPrice = await this.getGasPrice();

    const totalCost = (
      parseFloat(gasEstimate) *
      parseFloat(gasPrice) *
      1e-9
    ).toString();

    return {
      gasEstimate,
      gasPrice,
      totalCost,
    };
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForConfirmation(hash: string, confirmations: number = 1): Promise<TransactionResult> {
    try {
      const receipt = await this.provider.waitForTransaction(hash, confirmations);

      if (!receipt) {
        throw new Error('Transaction not found');
      }

      return {
        hash,
        from: receipt.from,
        to: receipt.to || '',
        value: '0',
        gasUsed: receipt.gasUsed?.toString(),
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        blockNumber: receipt.blockNumber,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new Error(`Confirmation wait failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sign message
   */
  async signMessage(message: string): Promise<string> {
    return await this.signer.signMessage(message);
  }

  /**
   * Verify signature
   */
  async verifySignature(message: string, signature: string, address: string): Promise<boolean> {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  }

  /**
   * Get contract balance
   */
  async getContractBalance(): Promise<string> {
    const balance = await this.provider.getBalance(this.config.contractAddress);
    return ethers.formatEther(balance);
  }

  /**
   * Get token balance
   */
  async getTokenBalance(address: string): Promise<string> {
    try {
      const balance = await this.contract.balanceOf(address);
      return ethers.formatEther(balance);
    } catch (error) {
      throw new Error(`Failed to get token balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default Web3Client;
