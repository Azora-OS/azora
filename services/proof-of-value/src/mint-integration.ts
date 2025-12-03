/**
 * Mint Integration for Proof-of-Value Mining
 * Ubuntu Philosophy: "My security ensures our freedom"
 */

import { ethers } from 'ethers';
import { getLogger } from '../../../shared/monitoring/logger';
import { metrics } from '../../../shared/monitoring/metrics';

export interface MintRequest {
  userId: string;
  amount: number;
  reason: string;
  proofId: string;
  metadata: Record<string, any>;
}

export interface MintResult {
  success: boolean;
  txHash?: string;
  blockNumber?: number;
  error?: string;
  mintedAmount: number;
  timestamp: Date;
}

export interface MintServiceConfig {
  rpcUrl: string;
  contractAddress: string;
  privateKey: string;
  gasLimit: number;
  gasPrice: string;
  confirmations: number;
}

export class MintIntegration {
  private logger = getLogger('mint-integration');
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;
  private config: MintServiceConfig;

  constructor(config: MintServiceConfig) {
    this.config = config;
    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    
    // AZR Token ABI (minimal)
    const abi = [
      "function mint(address to, uint256 amount) external returns (bool)",
      "function balanceOf(address account) external view returns (uint256)",
      "function transfer(address to, uint256 amount) external returns (bool)",
      "function totalSupply() external view returns (uint256)",
      "event Transfer(address indexed from, address indexed to, uint256 value)"
    ];

    this.contract = new ethers.Contract(config.contractAddress, abi, this.wallet);
  }

  async mintTokens(request: MintRequest): Promise<MintResult> {
    const startTime = Date.now();
    let result: MintResult = {
      success: false,
      mintedAmount: request.amount,
      timestamp: new Date()
    };

    try {
      // Validate request
      this.validateMintRequest(request);

      // Get user wallet address
      const userAddress = await this.getUserWalletAddress(request.userId);
      if (!userAddress) {
        throw new Error(`No wallet address found for user ${request.userId}`);
      }

      // Convert amount to wei (18 decimals)
      const amountWei = ethers.utils.parseUnits(request.amount.toString(), 18);

      // Check contract balance and gas
      await this.preFlightChecks(userAddress, amountWei);

      // Execute mint transaction
      const tx = await this.contract.mint(userAddress, amountWei, {
        gasLimit: this.config.gasLimit,
        gasPrice: ethers.utils.parseUnits(this.config.gasPrice, 'gwei')
      });

      this.logger.info('Mint transaction submitted', {
        txHash: tx.hash,
        userId: request.userId,
        amount: request.amount,
        userAddress
      });

      // Wait for confirmations
      const receipt = await tx.wait(this.config.confirmations);

      if (receipt.status === 1) {
        result = {
          success: true,
          txHash: tx.hash,
          blockNumber: receipt.blockNumber,
          mintedAmount: request.amount,
          timestamp: new Date()
        };

        this.logger.info('Mint successful', {
          txHash: tx.hash,
          blockNumber: receipt.blockNumber,
          userId: request.userId,
          amount: request.amount
        });

        // Record metrics
        metrics.incrementCounter('tokens_minted_total', request.amount, {
          reason: request.reason,
          userId: request.userId
        });

        metrics.histogram('mint_transaction_duration', Date.now() - startTime, {
          success: 'true'
        });

      } else {
        throw new Error('Transaction failed');
      }

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
      
      this.logger.error('Mint failed', {
        error: result.error,
        userId: request.userId,
        amount: request.amount
      });

      metrics.incrementCounter('mint_failures_total', 1, {
        reason: result.error?.split(':')[0] || 'unknown'
      });

      metrics.histogram('mint_transaction_duration', Date.now() - startTime, {
        success: 'false'
      });
    }

    return result;
  }

  private validateMintRequest(request: MintRequest): void {
    if (!request.userId || request.userId.trim() === '') {
      throw new Error('User ID is required');
    }

    if (request.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (request.amount > 1000000) { // 1M tokens max
      throw new Error('Amount exceeds maximum limit');
    }

    if (!request.reason || request.reason.trim() === '') {
      throw new Error('Reason is required');
    }

    if (!request.proofId || request.proofId.trim() === '') {
      throw new Error('Proof ID is required');
    }
  }

  private async getUserWalletAddress(userId: string): Promise<string | null> {
    try {
      // This would typically query your user database
      // For now, we'll use a simple mapping or call user service
      const response = await fetch(`${process.env.USER_SERVICE_URL}/api/users/${userId}/wallet`);
      
      if (response.ok) {
        const data = await response.json();
        return data.walletAddress;
      }
      
      return null;
    } catch (error) {
      this.logger.error('Failed to get user wallet address', { error, userId });
      return null;
    }
  }

  private async preFlightChecks(userAddress: string, amountWei: ethers.BigNumber): Promise<void> {
    try {
      // Check if contract exists
      const code = await this.provider.getCode(this.config.contractAddress);
      if (code === '0x') {
        throw new Error('Contract not found at specified address');
      }

      // Check current gas price
      const gasPrice = await this.provider.getGasPrice();
      const maxGasPrice = ethers.utils.parseUnits(this.config.gasPrice, 'gwei');
      
      if (gasPrice.gt(maxGasPrice)) {
        throw new Error(`Gas price too high: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`);
      }

      // Check user balance after mint (optional)
      const currentBalance = await this.contract.balanceOf(userAddress);
      this.logger.debug('Current user balance', {
        userId: userAddress,
        balance: ethers.utils.formatUnits(currentBalance, 18)
      });

    } catch (error) {
      this.logger.error('Pre-flight checks failed', { error });
      throw error;
    }
  }

  async getTokenBalance(userId: string): Promise<number> {
    try {
      const userAddress = await this.getUserWalletAddress(userId);
      if (!userAddress) {
        throw new Error(`No wallet address found for user ${userId}`);
      }

      const balance = await this.contract.balanceOf(userAddress);
      return parseFloat(ethers.utils.formatUnits(balance, 18));
    } catch (error) {
      this.logger.error('Failed to get token balance', { error, userId });
      throw error;
    }
  }

  async getTotalSupply(): Promise<number> {
    try {
      const totalSupply = await this.contract.totalSupply();
      return parseFloat(ethers.utils.formatUnits(totalSupply, 18));
    } catch (error) {
      this.logger.error('Failed to get total supply', { error });
      throw error;
    }
  }

  async getTransactionStatus(txHash: string): Promise<{
    confirmed: boolean;
    blockNumber?: number;
    gasUsed?: string;
    effectiveGasPrice?: string;
  }> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return { confirmed: false };
      }

      return {
        confirmed: receipt.status === 1,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString(),
        effectiveGasPrice: receipt.effectiveGasPrice?.toString()
      };
    } catch (error) {
      this.logger.error('Failed to get transaction status', { error, txHash });
      throw error;
    }
  }

  async simulateMint(userId: string, amount: number): Promise<{
    success: boolean;
    estimatedGas: string;
    estimatedCost: string;
    error?: string;
  }> {
    try {
      const userAddress = await this.getUserWalletAddress(userId);
      if (!userAddress) {
        throw new Error(`No wallet address found for user ${userId}`);
      }

      const amountWei = ethers.utils.parseUnits(amount.toString(), 18);
      
      // Estimate gas
      const estimatedGas = await this.contract.estimateGas.mint(userAddress, amountWei);
      const gasPrice = await this.provider.getGasPrice();
      const estimatedCost = estimatedGas.mul(gasPrice);

      return {
        success: true,
        estimatedGas: estimatedGas.toString(),
        estimatedCost: ethers.utils.formatEther(estimatedCost)
      };
    } catch (error) {
      return {
        success: false,
        estimatedGas: '0',
        estimatedCost: '0',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Health check for mint service
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    contractExists: boolean;
    providerConnected: boolean;
    walletBalance: string;
    lastBlock: number;
  }> {
    try {
      const [
        contractCode,
        providerBlock,
        walletBalance
      ] = await Promise.all([
        this.provider.getCode(this.config.contractAddress),
        this.provider.getBlockNumber(),
        this.wallet.getBalance()
      ]);

      const contractExists = contractCode !== '0x';
      const providerConnected = providerBlock > 0;

      return {
        status: contractExists && providerConnected ? 'healthy' : 'unhealthy',
        contractExists,
        providerConnected,
        walletBalance: ethers.utils.formatEther(walletBalance),
        lastBlock: providerBlock
      };
    } catch (error) {
      this.logger.error('Health check failed', { error });
      return {
        status: 'unhealthy',
        contractExists: false,
        providerConnected: false,
        walletBalance: '0',
        lastBlock: 0
      };
    }
  }

  // Mint multiple users in batch (for efficiency)
  async batchMint(requests: MintRequest[]): Promise<MintResult[]> {
    const results: MintResult[] = [];
    
    for (const request of requests) {
      const result = await this.mintTokens(request);
      results.push(result);
      
      // Add delay between transactions to avoid nonce conflicts
      if (requests.indexOf(request) < requests.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }
}

export default MintIntegration;
