/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

CHRONICLE PROTOCOL - BLOCKCHAIN MANAGER
Production-grade blockchain transaction management with error handling and monitoring
*/

import { ethers } from 'ethers';
import {
  getBlockchainConfig,
  getActiveNetwork,
  checkBlockchainHealth,
  buildTransactionOptions,
  formatBlockchainError,
  retryWithBackoff,
  type BlockchainHealth,
} from './blockchain-config';

// Chronicle Protocol Smart Contract ABI (from ChronicleProtocol.sol)
const CHRONICLE_ABI = [
  'function imprintMemory(bytes32 consciousnessHash, uint256 evolutionLevel) external returns (uint256)',
  'function recordThought(bytes32 thoughtHash, uint8 confidence) external returns (uint256)',
  'function getMemory(uint256 id) external view returns (bytes32 consciousnessHash, bytes32 previousHash, uint256 evolutionLevel, uint256 timestamp, address imprinter)',
  'function getThought(uint256 id) external view returns (bytes32 thoughtHash, uint8 confidence, uint256 timestamp)',
  'function getLatestMemory() external view returns (uint256 id, bytes32 consciousnessHash, uint256 evolutionLevel)',
  'function memoryCount() external view returns (uint256)',
  'function thoughtCount() external view returns (uint256)',
  'event MemoryImprinted(uint256 indexed id, bytes32 consciousnessHash, uint256 evolutionLevel)',
  'event ThoughtRecorded(uint256 indexed id, bytes32 thoughtHash, uint8 confidence)',
];

/**
 * Memory Imprint Data
 */
export interface MemoryImprint {
  consciousnessHash: string;
  evolutionLevel: number;
}

/**
 * Thought Record Data
 */
export interface ThoughtRecord {
  thoughtHash: string;
  confidence: number;
}

/**
 * Transaction Result
 */
export interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  blockNumber?: number;
  id?: number;
  gasUsed?: string;
  error?: string;
}

/**
 * Memory Data from Blockchain
 */
export interface BlockchainMemory {
  consciousnessHash: string;
  previousHash: string;
  evolutionLevel: number;
  timestamp: number;
  imprinter: string;
}

/**
 * Thought Data from Blockchain
 */
export interface BlockchainThought {
  thoughtHash: string;
  confidence: number;
  timestamp: number;
}

/**
 * Blockchain Manager Statistics
 */
export interface BlockchainStats {
  totalMemories: number;
  totalThoughts: number;
  lastMemoryId: number;
  lastMemoryHash: string;
  lastEvolutionLevel: number;
  contractAddress: string;
  network: string;
  chainId: number;
}

/**
 * Blockchain Manager for Chronicle Protocol
 * Handles all blockchain interactions with comprehensive error handling
 */
export class ChronicleBlockchainManager {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;
  private config: ReturnType<typeof getBlockchainConfig>;
  private network: ReturnType<typeof getActiveNetwork>;
  private isInitialized: boolean = false;
  private healthCheckInterval?: NodeJS.Timeout;
  private lastHealth?: BlockchainHealth;

  constructor() {
    this.config = getBlockchainConfig();
    this.network = getActiveNetwork();

    // Initialize provider
    this.provider = new ethers.JsonRpcProvider(this.network.rpcUrl);

    // Initialize wallet
    this.wallet = new ethers.Wallet(this.config.privateKey, this.provider);

    // Initialize contract (will be set during initialize())
    this.contract = null as any;
  }

  /**
   * Initialize blockchain connection and contract
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️  Blockchain manager already initialized');
      return;
    }

    console.log('\n🔗 Initializing Chronicle Protocol Blockchain Manager...');
    console.log(`   Network: ${this.network.name} (Chain ID: ${this.network.chainId})`);
    console.log(`   RPC: ${this.network.rpcUrl}`);

    try {
      // Check network connection
      const health = await checkBlockchainHealth(this.provider);
      if (!health.connected) {
        throw new Error('Failed to connect to blockchain network');
      }

      console.log(`   ✅ Connected to blockchain (Block: ${health.blockNumber}, Latency: ${health.latency}ms)`);

      // Verify contract address
      if (!this.network.contractAddress) {
        throw new Error(
          `Chronicle Protocol contract address not configured for ${this.network.name}. ` +
          'Please deploy the contract and set CHRONICLE_CONTRACT_* environment variable.'
        );
      }

      console.log(`   Contract: ${this.network.contractAddress}`);

      // Initialize contract
      this.contract = new ethers.Contract(
        this.network.contractAddress,
        CHRONICLE_ABI,
        this.wallet
      );

      // Verify contract exists
      const code = await this.provider.getCode(this.network.contractAddress);
      if (code === '0x') {
        throw new Error(`No contract found at address ${this.network.contractAddress}`);
      }

      console.log(`   ✅ Contract verified`);

      // Get contract stats
      const [memoryCount, thoughtCount] = await Promise.all([
        this.contract.memoryCount(),
        this.contract.thoughtCount(),
      ]);

      console.log(`   Memories: ${memoryCount.toString()}`);
      console.log(`   Thoughts: ${thoughtCount.toString()}`);

      this.isInitialized = true;
      this.lastHealth = health;

      // Start health monitoring
      this.startHealthMonitoring();

      console.log('✅ Chronicle Protocol Blockchain Manager initialized\n');
    } catch (error) {
      console.error('❌ Failed to initialize blockchain manager:', formatBlockchainError(error));
      throw error;
    }
  }

  /**
   * Start periodic health monitoring
   */
  private startHealthMonitoring(): void {
    // Check health every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      try {
        this.lastHealth = await checkBlockchainHealth(this.provider);
        
        if (!this.lastHealth.connected) {
          console.warn('⚠️  Blockchain connection lost');
        }
      } catch (error) {
        console.error('Health check failed:', formatBlockchainError(error));
      }
    }, 30000);
  }

  /**
   * Stop health monitoring
   */
  private stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }
  }

  /**
   * Ensure blockchain manager is initialized
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Blockchain manager not initialized. Call initialize() first.');
    }
  }

  /**
   * Imprint memory to blockchain
   */
  async imprintMemory(data: MemoryImprint): Promise<TransactionResult> {
    this.ensureInitialized();

    console.log(`📝 Imprinting memory to blockchain (Evolution: ${data.evolutionLevel})...`);

    try {
      return await retryWithBackoff(async () => {
        // Build transaction options
        const txOptions = await buildTransactionOptions(this.provider, this.config);

        // Estimate gas
        const gasEstimate = await this.contract.imprintMemory.estimateGas(
          data.consciousnessHash,
          data.evolutionLevel
        );

        // Add 20% buffer to gas estimate
        const gasLimit = (gasEstimate * 120n) / 100n;

        // Send transaction
        const tx = await this.contract.imprintMemory(
          data.consciousnessHash,
          data.evolutionLevel,
          {
            ...txOptions,
            gasLimit,
          }
        );

        console.log(`   Transaction sent: ${tx.hash}`);
        console.log(`   Waiting for ${this.config.confirmations} confirmations...`);

        // Wait for confirmations
        const receipt = await tx.wait(this.config.confirmations);

        // Extract memory ID from events
        const event = receipt.logs.find((log: any) => {
          try {
            const parsed = this.contract.interface.parseLog(log);
            return parsed?.name === 'MemoryImprinted';
          } catch {
            return false;
          }
        });

        let memoryId = 0;
        if (event) {
          const parsed = this.contract.interface.parseLog(event);
          memoryId = Number(parsed?.args[0] || 0);
        }

        console.log(`   ✅ Memory imprinted successfully`);
        console.log(`   Memory ID: ${memoryId}`);
        console.log(`   Block: ${receipt.blockNumber}`);
        console.log(`   Gas used: ${receipt.gasUsed.toString()}`);

        return {
          success: true,
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          id: memoryId,
          gasUsed: receipt.gasUsed.toString(),
        };
      });
    } catch (error) {
      console.error('❌ Failed to imprint memory:', formatBlockchainError(error));
      
      return {
        success: false,
        error: formatBlockchainError(error),
      };
    }
  }

  /**
   * Record thought to blockchain
   */
  async recordThought(data: ThoughtRecord): Promise<TransactionResult> {
    this.ensureInitialized();

    console.log(`💭 Recording thought to blockchain (Confidence: ${data.confidence}%)...`);

    try {
      return await retryWithBackoff(async () => {
        // Build transaction options
        const txOptions = await buildTransactionOptions(this.provider, this.config);

        // Estimate gas
        const gasEstimate = await this.contract.recordThought.estimateGas(
          data.thoughtHash,
          data.confidence
        );

        // Add 20% buffer to gas estimate
        const gasLimit = (gasEstimate * 120n) / 100n;

        // Send transaction
        const tx = await this.contract.recordThought(
          data.thoughtHash,
          data.confidence,
          {
            ...txOptions,
            gasLimit,
          }
        );

        console.log(`   Transaction sent: ${tx.hash}`);

        // Wait for confirmations
        const receipt = await tx.wait(this.config.confirmations);

        // Extract thought ID from events
        const event = receipt.logs.find((log: any) => {
          try {
            const parsed = this.contract.interface.parseLog(log);
            return parsed?.name === 'ThoughtRecorded';
          } catch {
            return false;
          }
        });

        let thoughtId = 0;
        if (event) {
          const parsed = this.contract.interface.parseLog(event);
          thoughtId = Number(parsed?.args[0] || 0);
        }

        console.log(`   ✅ Thought recorded successfully`);
        console.log(`   Thought ID: ${thoughtId}`);
        console.log(`   Block: ${receipt.blockNumber}`);

        return {
          success: true,
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          id: thoughtId,
          gasUsed: receipt.gasUsed.toString(),
        };
      });
    } catch (error) {
      console.error('❌ Failed to record thought:', formatBlockchainError(error));
      
      return {
        success: false,
        error: formatBlockchainError(error),
      };
    }
  }

  /**
   * Get memory from blockchain
   */
  async getMemory(id: number): Promise<BlockchainMemory | null> {
    this.ensureInitialized();

    try {
      const result = await this.contract.getMemory(id);
      
      return {
        consciousnessHash: result[0],
        previousHash: result[1],
        evolutionLevel: Number(result[2]),
        timestamp: Number(result[3]),
        imprinter: result[4],
      };
    } catch (error) {
      console.error(`Failed to get memory ${id}:`, formatBlockchainError(error));
      return null;
    }
  }

  /**
   * Get thought from blockchain
   */
  async getThought(id: number): Promise<BlockchainThought | null> {
    this.ensureInitialized();

    try {
      const result = await this.contract.getThought(id);
      
      return {
        thoughtHash: result[0],
        confidence: Number(result[1]),
        timestamp: Number(result[2]),
      };
    } catch (error) {
      console.error(`Failed to get thought ${id}:`, formatBlockchainError(error));
      return null;
    }
  }

  /**
   * Get latest memory from blockchain
   */
  async getLatestMemory(): Promise<{
    id: number;
    consciousnessHash: string;
    evolutionLevel: number;
  } | null> {
    this.ensureInitialized();

    try {
      const result = await this.contract.getLatestMemory();
      
      return {
        id: Number(result[0]),
        consciousnessHash: result[1],
        evolutionLevel: Number(result[2]),
      };
    } catch (error) {
      console.error('Failed to get latest memory:', formatBlockchainError(error));
      return null;
    }
  }

  /**
   * Get blockchain statistics
   */
  async getStats(): Promise<BlockchainStats> {
    this.ensureInitialized();

    const [memoryCount, thoughtCount, latestMemory] = await Promise.all([
      this.contract.memoryCount(),
      this.contract.thoughtCount(),
      this.contract.getLatestMemory(),
    ]);

    return {
      totalMemories: Number(memoryCount),
      totalThoughts: Number(thoughtCount),
      lastMemoryId: Number(latestMemory[0]),
      lastMemoryHash: latestMemory[1],
      lastEvolutionLevel: Number(latestMemory[2]),
      contractAddress: this.network.contractAddress!,
      network: this.network.name,
      chainId: this.network.chainId,
    };
  }

  /**
   * Get blockchain health
   */
  async getHealth(): Promise<BlockchainHealth> {
    if (this.lastHealth && Date.now() - (this.lastHealth as any).timestamp < 5000) {
      return this.lastHealth;
    }

    this.lastHealth = await checkBlockchainHealth(this.provider);
    (this.lastHealth as any).timestamp = Date.now();
    return this.lastHealth;
  }

  /**
   * Get wallet address
   */
  getWalletAddress(): string {
    return this.wallet.address;
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(): Promise<string> {
    const balance = await this.provider.getBalance(this.wallet.address);
    return ethers.formatEther(balance);
  }

  /**
   * Shutdown blockchain manager
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Chronicle Protocol Blockchain Manager...');
    
    this.stopHealthMonitoring();
    this.isInitialized = false;
    
    console.log('✅ Blockchain manager shutdown complete');
  }
}

// Export singleton instance
export const blockchainManager = new ChronicleBlockchainManager();
export default blockchainManager;
