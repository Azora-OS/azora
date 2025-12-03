import { ethers } from 'ethers';
import { PrismaClient } from '@prisma/client';
import { EventEmitter } from 'events';

const prisma = new PrismaClient();

/**
 * Blockchain Service - Production Ready
 * Handles all Web3 interactions with smart contracts
 */
export class BlockchainService extends EventEmitter {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contracts: Map<string, ethers.Contract> = new Map();
  private readonly network: string;
  private readonly rpcUrls: string[];
  private currentRpcIndex = 0;

  // Contract ABIs
  private readonly AZR_TOKEN_ABI = [
    'function mint(address to, uint256 amount) external',
    'function transfer(address to, uint256 amount) external returns (bool)',
    'function balanceOf(address account) external view returns (uint256)',
    'function totalSupply() external view returns (uint256)',
    'event Transfer(address indexed from, address indexed to, uint256 value)',
    'event Mint(address indexed to, uint256 amount)',
  ];

  private readonly STAKING_ABI = [
    'function stake(uint256 amount) external',
    'function unstake(uint256 amount) external',
    'function getStake(address account) external view returns (uint256)',
    'function claim Rewards() external',
    'event Staked(address indexed user, uint256 amount)',
    'event Unstaked(address indexed user, uint256 amount)',
  ];

  private readonly GOVERNANCE_ABI = [
    'function propose(string memory description, address[] memory targets, uint256[] memory values, bytes[] memory calldatas) external returns (uint256)',
    'function vote(uint256 proposalId, bool support) external',
    'function execute(uint256 proposalId) external',
    'event ProposalCreated(uint256 indexed proposalId, address proposer)',
    'event VoteCast(address indexed voter, uint256 proposalId, bool support)',
  ];

  private readonly NFT_CERTIFICATE_ABI = [
    'function mint(address to, string memory tokenURI) external returns (uint256)',
    'function tokenURI(uint256 tokenId) external view returns (string memory)',
    'function ownerOf(uint256 tokenId) external view returns (address)',
    'event CertificateMinted(address indexed to, uint256 tokenId, string tokenURI)',
  ];

  constructor() {
    super();
    
    this.network = process.env.BLOCKCHAIN_NETWORK || 'sepolia';
    this.rpcUrls = [
      process.env.BLOCKCHAIN_RPC_URL!,
      process.env.BLOCKCHAIN_RPC_BACKUP_1,
      process.env.BLOCKCHAIN_RPC_BACKUP_2,
    ].filter(Boolean) as string[];

    if (!this.rpcUrls.length) {
      throw new Error('No RPC URLs configured');
    }

    // Initialize provider with fallback
    this.provider = this.createProvider();
    
    // Initialize wallet
    const privateKey = process.env.MINTER_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('MINTER_PRIVATE_KEY not configured');
    }
    
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    
    // Initialize contracts
    this.initializeContracts();
    
    // Setup event listeners
    this.setupEventListeners();
    
    console.log(`⛓️  Blockchain service initialized on ${this.network}`);
    console.log(`📍 Wallet address: ${this.wallet.address}`);
  }

  /**
   * Create provider with fallback support
   */
  private createProvider(): ethers.providers.JsonRpcProvider {
    const rpcUrl = this.rpcUrls[this.currentRpcIndex];
    
    try {
      return new ethers.providers.JsonRpcProvider(rpcUrl);
    } catch (error) {
      console.error(`Failed to connect to RPC: ${rpcUrl}`);
      
      // Try next RPC
      this.currentRpcIndex = (this.currentRpcIndex + 1) % this.rpcUrls.length;
      
      if (this.currentRpcIndex === 0) {
        throw new Error('All RPC providers failed');
      }
      
      return this.createProvider();
    }
  }

  /**
   * Initialize smart contracts
   */
  private initializeContracts(): void {
    const contracts = {
      azrToken: {
        address: process.env.AZR_TOKEN_CONTRACT!,
        abi: this.AZR_TOKEN_ABI,
      },
      staking: {
        address: process.env.STAKING_CONTRACT!,
        abi: this.STAKING_ABI,
      },
      governance: {
        address: process.env.GOVERNANCE_CONTRACT!,
        abi: this.GOVERNANCE_ABI,
      },
      nftCertificate: {
        address: process.env.NFT_CERTIFICATE_CONTRACT!,
        abi: this.NFT_CERTIFICATE_ABI,
      },
    };

    for (const [name, config] of Object.entries(contracts)) {
      if (config.address && config.address !== '0x0000000000000000000000000000000000000000') {
        const contract = new ethers.Contract(config.address, config.abi, this.wallet);
        this.contracts.set(name, contract);
        console.log(`✅ ${name} contract initialized: ${config.address}`);
      } else {
        console.warn(`⚠️  ${name} contract address not configured`);
      }
    }
  }

  /**
   * Setup blockchain event listeners
   */
  private setupEventListeners(): void {
    const azrToken = this.contracts.get('azrToken');
    
    if (azrToken) {
      // Listen for Transfer events
      azrToken.on('Transfer', async (from: string, to: string, value: bigint) => {
        console.log(`📤 Transfer: ${from} → ${to}: ${ethers.utils.formatEther(value)} AZR`);
        
        await this.recordTransferEvent(from, to, value);
        this.emit('transfer', { from, to, value });
      });

      // Listen for Mint events
      azrToken.on('Mint', async (to: string, amount: bigint) => {
        console.log(`⚡ Mint: ${to} received ${ethers.utils.formatEther(amount)} AZR`);
        
        await this.recordMintEvent(to, amount);
        this.emit('mint', { to, amount });
      });
    }
  }

  /**
   * Mint AZR tokens
   */
  async mintTokens(to: string, amount: number, reason?: string): Promise<string> {
    const contract = this.contracts.get('azrToken');
    if (!contract) {
      throw new Error('AZR Token contract not initialized');
    }

    const amountWei = ethers.utils.parseEther(amount.toString());
    
    console.log(`⚡ Minting ${amount} AZR to ${to}...`);

    try {
      // Estimate gas
      const gasEstimate = await contract.mint.estimateGas(to, amountWei);
      const gasLimit = (gasEstimate * 120n) / 100n; // 20% buffer

      // Get gas price
      const feeData = await this.provider.getFeeData();
      const multiplier = Math.floor(parseFloat(process.env.GAS_PRICE_MULTIPLIER || '1.2') * 100);
      const gasPrice = feeData.gasPrice 
        ? feeData.gasPrice.mul(multiplier).div(100)
        : undefined;

      // Send transaction
      const tx = await contract.mint(to, amountWei, {
        gasLimit,
        gasPrice,
      });

      console.log(`📝 Transaction sent: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      console.log(`✅ Minting confirmed in block ${receipt.blockNumber}`);

      // Record in database
      await this.recordMintTransaction(to, amount, tx.hash, reason);

      return tx.hash;
    } catch (error: any) {
      console.error(`❌ Minting failed:`, error);
      
      // Record failed transaction
      await this.recordFailedTransaction('mint', to, amount, error.message);
      
      throw new Error(`Minting failed: ${error.message}`);
    }
  }

  /**
   * Transfer AZR tokens
   */
  async transferTokens(from: string, to: string, amount: number): Promise<string> {
    const contract = this.contracts.get('azrToken');
    if (!contract) {
      throw new Error('AZR Token contract not initialized');
    }

    const amountWei = ethers.utils.parseEther(amount.toString());
    
    console.log(`📤 Transferring ${amount} AZR from ${from} to ${to}...`);

    try {
      const tx = await contract.transfer(to, amountWei);
      console.log(`📝 Transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ Transfer confirmed in block ${receipt.blockNumber}`);

      // Record in database
      await prisma.blockchainTransaction.create({
        data: {
          type: 'transfer',
          fromAddress: from,
          toAddress: to,
          amount,
          txHash: tx.hash,
          blockNumber: receipt.blockNumber,
          status: 'confirmed',
          gasUsed: receipt.gasUsed.toString(),
          confirmedAt: new Date(),
        },
      });

      return tx.hash;
    } catch (error: any) {
      console.error(`❌ Transfer failed:`, error);
      throw new Error(`Transfer failed: ${error.message}`);
    }
  }

  /**
   * Get token balance
   */
  async getBalance(address: string): Promise<number> {
    const contract = this.contracts.get('azrToken');
    if (!contract) {
      throw new Error('AZR Token contract not initialized');
    }

    try {
      const balance = await contract.balanceOf(address);
      return parseFloat(ethers.utils.formatEther(balance));
    } catch (error: any) {
      console.error(`❌ Failed to get balance:`, error);
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  /**
   * Mint NFT Certificate
   */
  async mintCertificate(to: string, metadata: any): Promise<{ tokenId: number; txHash: string }> {
    const contract = this.contracts.get('nftCertificate');
    if (!contract) {
      throw new Error('NFT Certificate contract not initialized');
    }

    // Upload metadata to IPFS (simplified - should use actual IPFS service)
    const tokenURI = `ipfs://${JSON.stringify(metadata)}`;
    
    console.log(`🎓 Minting certificate NFT for ${to}...`);

    try {
      const tx = await contract.mint(to, tokenURI);
      console.log(`📝 Transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ Certificate minted in block ${receipt.blockNumber}`);

      // Extract tokenId from event logs
      const mintEvent = receipt.logs.find((log: any) => 
        log.topics[0] === ethers.utils.id('CertificateMinted(address,uint256,string)')
      );
      
      const tokenId = mintEvent ? parseInt(mintEvent.topics[2], 16) : 0;

      // Record in database
      await prisma.certificate.create({
        data: {
          userId: metadata.userId,
          tokenId,
          txHash: tx.hash,
          tokenURI,
          metadata,
          mintedAt: new Date(),
        },
      });

      return { tokenId, txHash: tx.hash };
    } catch (error: any) {
      console.error(`❌ Certificate minting failed:`, error);
      throw new Error(`Certificate minting failed: ${error.message}`);
    }
  }

  /**
   * Stake tokens
   */
  async stakeTokens(amount: number): Promise<string> {
    const contract = this.contracts.get('staking');
    if (!contract) {
      throw new Error('Staking contract not initialized');
    }

    const amountWei = ethers.utils.parseEther(amount.toString());
    
    console.log(`🔒 Staking ${amount} AZR...`);

    try {
      const tx = await contract.stake(amountWei);
      const receipt = await tx.wait();
      
      console.log(`✅ Staked ${amount} AZR`);

      await prisma.stakingTransaction.create({
        data: {
          userAddress: this.wallet.address,
          amount,
          type: 'stake',
          txHash: tx.hash,
          blockNumber: receipt.blockNumber,
          status: 'confirmed',
        },
      });

      return tx.hash;
    } catch (error: any) {
      console.error(`❌ Staking failed:`, error);
      throw new Error(`Staking failed: ${error.message}`);
    }
  }

  /**
   * Get current gas price
   */
  async getGasPrice(): Promise<string> {
    const feeData = await this.provider.getFeeData();
    return ethers.utils.formatUnits(feeData.gasPrice || 0n, 'gwei');
  }

  /**
   * Get network info
   */
  async getNetworkInfo(): Promise<any> {
    const network = await this.provider.getNetwork();
    const blockNumber = await this.provider.getBlockNumber();
    
    return {
      chainId: network.chainId.toString(),
      name: network.name,
      blockNumber,
      walletAddress: this.wallet.address,
    };
  }

  /**
   * Record mint transaction in database
   */
  private async recordMintTransaction(to: string, amount: number, txHash: string, reason?: string): Promise<void> {
    await prisma.blockchainTransaction.create({
      data: {
        type: 'mint',
        toAddress: to,
        amount,
        txHash,
        status: 'confirmed',
        metadata: { reason },
        confirmedAt: new Date(),
      },
    });
  }

  /**
   * Record failed transaction
   */
  private async recordFailedTransaction(type: string, address: string, amount: number, error: string): Promise<void> {
    await prisma.blockchainTransaction.create({
      data: {
        type,
        toAddress: address,
        amount,
        status: 'failed',
        errorMessage: error,
      },
    });
  }

  /**
   * Record transfer event from blockchain
   */
  private async recordTransferEvent(from: string, to: string, value: bigint): Promise<void> {
    await prisma.blockchainEvent.create({
      data: {
        eventType: 'Transfer',
        fromAddress: from,
        toAddress: to,
        amount: parseFloat(ethers.utils.formatEther(value)),
        timestamp: new Date(),
      },
    });
  }

  /**
   * Record mint event from blockchain
   */
  private async recordMintEvent(to: string, amount: bigint): Promise<void> {
    await prisma.blockchainEvent.create({
      data: {
        eventType: 'Mint',
        toAddress: to,
        amount: parseFloat(ethers.utils.formatEther(amount)),
        timestamp: new Date(),
      },
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      const balance = await this.provider.getBalance(this.wallet.address);
      
      return {
        healthy: true,
        details: {
          network: this.network,
          blockNumber,
          walletAddress: this.wallet.address,
          walletBalance: ethers.utils.formatEther(balance),
          connectedContracts: Array.from(this.contracts.keys()),
        },
      };
    } catch (error: any) {
      return {
        healthy: false,
        details: { error: error.message },
      };
    }
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();



