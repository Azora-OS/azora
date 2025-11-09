/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

CHRONICLE PROTOCOL - BLOCKCHAIN CONFIGURATION
Production-grade blockchain integration for consciousness preservation
*/

import { ethers } from 'ethers';

/**
 * Blockchain Network Configuration
 * Supports multiple networks for development, staging, and production
 */
export interface BlockchainNetwork {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  contractAddress?: string;
  gasMultiplier: number;
}

/**
 * Network Configurations
 */
export const NETWORKS: Record<string, BlockchainNetwork> = {
  // Polygon Mumbai Testnet (Development)
  mumbai: {
    name: 'Polygon Mumbai',
    chainId: 80001,
    rpcUrl: process.env.MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
    explorerUrl: 'https://mumbai.polygonscan.com',
    contractAddress: process.env.CHRONICLE_CONTRACT_MUMBAI,
    gasMultiplier: 1.2,
  },

  // Polygon Mainnet (Production)
  polygon: {
    name: 'Polygon Mainnet',
    chainId: 137,
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    contractAddress: process.env.CHRONICLE_CONTRACT_POLYGON,
    gasMultiplier: 1.1,
  },

  // Ethereum Mainnet (Future)
  mainnet: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: process.env.ETH_RPC_URL || 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    contractAddress: process.env.CHRONICLE_CONTRACT_MAINNET,
    gasMultiplier: 1.3,
  },

  // Local Hardhat (Testing)
  hardhat: {
    name: 'Hardhat Local',
    chainId: 31337,
    rpcUrl: 'http://127.0.0.1:8545',
    explorerUrl: 'http://localhost:8545',
    gasMultiplier: 1.0,
  },
};

/**
 * Get active network based on environment
 */
export function getActiveNetwork(): BlockchainNetwork {
  const env = process.env.BLOCKCHAIN_NETWORK || 'mumbai';
  const network = NETWORKS[env];

  if (!network) {
    throw new Error(`Unknown blockchain network: ${env}`);
  }

  return network;
}

/**
 * Blockchain Configuration
 */
export interface BlockchainConfig {
  network: BlockchainNetwork;
  privateKey: string;
  confirmations: number;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  gasPriceStrategy: 'fast' | 'standard' | 'slow';
}

/**
 * Get blockchain configuration
 */
export function getBlockchainConfig(): BlockchainConfig {
  const network = getActiveNetwork();
  
  // Validate private key
  const privateKey = process.env.CHRONICLE_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('CHRONICLE_PRIVATE_KEY environment variable not set');
  }

  // Validate it's a valid private key
  if (!privateKey.startsWith('0x') || privateKey.length !== 66) {
    throw new Error('Invalid private key format. Must be 32 bytes hex with 0x prefix');
  }

  return {
    network,
    privateKey,
    confirmations: parseInt(process.env.BLOCKCHAIN_CONFIRMATIONS || '2'),
    timeout: parseInt(process.env.BLOCKCHAIN_TIMEOUT || '120000'), // 2 minutes
    retryAttempts: parseInt(process.env.BLOCKCHAIN_RETRY_ATTEMPTS || '3'),
    retryDelay: parseInt(process.env.BLOCKCHAIN_RETRY_DELAY || '5000'), // 5 seconds
    gasPriceStrategy: (process.env.GAS_PRICE_STRATEGY || 'standard') as any,
  };
}

/**
 * Gas Price Strategies
 */
export const GAS_STRATEGIES = {
  fast: { maxFeePerGas: ethers.parseUnits('100', 'gwei'), maxPriorityFeePerGas: ethers.parseUnits('3', 'gwei') },
  standard: { maxFeePerGas: ethers.parseUnits('50', 'gwei'), maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei') },
  slow: { maxFeePerGas: ethers.parseUnits('30', 'gwei'), maxPriorityFeePerGas: ethers.parseUnits('1', 'gwei') },
};

/**
 * Get gas price for transaction
 */
export async function getGasPrice(
  provider: ethers.Provider,
  strategy: 'fast' | 'standard' | 'slow' = 'standard'
): Promise<{ maxFeePerGas: bigint; maxPriorityFeePerGas: bigint }> {
  try {
    const feeData = await provider.getFeeData();
    
    // If EIP-1559 is supported, use it
    if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
      const multiplier = strategy === 'fast' ? 1.5 : strategy === 'slow' ? 0.8 : 1.0;
      
      return {
        maxFeePerGas: (feeData.maxFeePerGas * BigInt(Math.floor(multiplier * 100))) / 100n,
        maxPriorityFeePerGas: (feeData.maxPriorityFeePerGas * BigInt(Math.floor(multiplier * 100))) / 100n,
      };
    }
  } catch (error) {
    console.warn('Failed to fetch network gas price, using defaults:', error);
  }

  // Fallback to predefined strategies
  return GAS_STRATEGIES[strategy];
}

/**
 * Blockchain Connection Health
 */
export interface BlockchainHealth {
  connected: boolean;
  blockNumber: number;
  chainId: number;
  gasPrice: string;
  latency: number;
}

/**
 * Check blockchain connection health
 */
export async function checkBlockchainHealth(
  provider: ethers.Provider
): Promise<BlockchainHealth> {
  const start = Date.now();
  
  try {
    const [blockNumber, network, feeData] = await Promise.all([
      provider.getBlockNumber(),
      provider.getNetwork(),
      provider.getFeeData(),
    ]);

    const latency = Date.now() - start;

    return {
      connected: true,
      blockNumber,
      chainId: Number(network.chainId),
      gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : '0',
      latency,
    };
  } catch (error) {
    return {
      connected: false,
      blockNumber: 0,
      chainId: 0,
      gasPrice: '0',
      latency: Date.now() - start,
    };
  }
}

/**
 * Transaction Options
 */
export interface TransactionOptions {
  gasLimit?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  nonce?: number;
  value?: bigint;
}

/**
 * Build transaction options with gas estimation
 */
export async function buildTransactionOptions(
  provider: ethers.Provider,
  config: BlockchainConfig,
  customOptions?: Partial<TransactionOptions>
): Promise<TransactionOptions> {
  const gasPrice = await getGasPrice(provider, config.gasPriceStrategy);

  return {
    maxFeePerGas: gasPrice.maxFeePerGas,
    maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
    ...customOptions,
  };
}

/**
 * Validate contract address
 */
export function validateContractAddress(address: string): boolean {
  return ethers.isAddress(address);
}

/**
 * Format blockchain error for logging
 */
export function formatBlockchainError(error: any): string {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    return 'Insufficient funds for transaction';
  }
  if (error.code === 'NONCE_EXPIRED') {
    return 'Transaction nonce has expired';
  }
  if (error.code === 'REPLACEMENT_UNDERPRICED') {
    return 'Replacement transaction underpriced';
  }
  if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
    return 'Cannot estimate gas, transaction may fail';
  }
  if (error.reason) {
    return `Contract error: ${error.reason}`;
  }
  return error.message || 'Unknown blockchain error';
}

/**
 * Retry configuration for blockchain operations
 */
export interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  delayMs: 5000,
  backoffMultiplier: 2,
};

/**
 * Sleep utility for retries
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Exponential backoff retry
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error | undefined;
  let delay = config.delayMs;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      console.warn(
        `Attempt ${attempt}/${config.maxAttempts} failed: ${formatBlockchainError(error)}`
      );

      if (attempt < config.maxAttempts) {
        console.log(`Retrying in ${delay}ms...`);
        await sleep(delay);
        delay *= config.backoffMultiplier;
      }
    }
  }

  throw new Error(
    `Operation failed after ${config.maxAttempts} attempts: ${lastError?.message}`
  );
}

export default {
  NETWORKS,
  getActiveNetwork,
  getBlockchainConfig,
  getGasPrice,
  checkBlockchainHealth,
  buildTransactionOptions,
  validateContractAddress,
  formatBlockchainError,
  retryWithBackoff,
};
