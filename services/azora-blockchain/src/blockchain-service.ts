import { ethers, providers, Wallet, Contract, BigNumber } from 'ethers';
import { txQueue } from './transaction-queue';
import { recordBlockchainEvent } from './blockchain-repository';
import dotenv from 'dotenv';

dotenv.config();

// Contract ABIs
const AZR_ABI = [
  "function mint(address to, uint256 amount) external",
  "function burn(address from, uint256 amount) external", 
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function mintLoan(address to, uint256 amount) external",
  "function repayLoan(uint256 amount) external",
  "function getLoanDetails(address user) external view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

const NFT_CERTIFICATE_ABI = [
  "function mint(address to, string memory metadata) external returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function balanceOf(address owner) external view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

export interface NetworkConfig {
  name: string;
  rpcUrl: string;
  chainId: number;
}

export interface TransactionRequest {
  to: string;
  value?: string; // in wei
  data?: string;
}

export interface ContractAddresses {
  AZR: string;
  NFTCertificate: string;
  Staking?: string;
  CitadelFund?: string;
}

export class BlockchainService {
  private provider: providers.JsonRpcProvider;
  private wallet: Wallet;
  private network: NetworkConfig;
  private contracts: Map<string, Contract> = new Map();
  private addresses: ContractAddresses;

  constructor(networkConfig?: NetworkConfig, privateKey?: string, contractAddresses?: ContractAddresses) {
    this.network = networkConfig || {
      name: process.env.BLOCKCHAIN_NETWORK || 'localhost',
      rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545',
      chainId: parseInt(process.env.BLOCKCHAIN_CHAIN_ID || '31337', 10)
    };

    this.provider = new providers.JsonRpcProvider(this.network.rpcUrl);

    const key = privateKey || process.env.BLOCKCHAIN_PRIVATE_KEY;
    if (!key) {
      console.warn('⚠️ No private key provided. BlockchainService will be read-only.');
      this.wallet = Wallet.createRandom().connect(this.provider);
    } else {
      this.wallet = new Wallet(key, this.provider);
    }

    // Default contract addresses (can be overridden)
    this.addresses = contractAddresses || {
      AZR: process.env.AZR_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      NFTCertificate: process.env.NFT_CERTIFICATE_CONTRACT_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
    };

    this.initializeContracts();
    // Subscribe to 'submit' events from the tx queue to execute transactions
    txQueue.on('submit', async (queuedTx) => {
      try {
        const tx = {
          to: queuedTx.to,
          data: queuedTx.data
        } as any;

        // estimate gas with fallback to safe default
        let gasLimit = BigNumber.from(21000);
        try {
          const estimate = await this.wallet.estimateGas(tx);
          gasLimit = estimate.mul(120).div(100);
        } catch (err) {
          // Fallback gas limit
          gasLimit = BigNumber.from(200000);
        }

        const response = await this.wallet.sendTransaction({ ...tx, gasLimit });
        const receipt = await response.wait();
        console.log(`Queue submit: Tx ${receipt.transactionHash}`);

        // Log event for queue submission
        await recordBlockchainEvent({ type: 'tx_submitted', source: 'tx_queue', payload: receipt });
      } catch (error) {
        console.error('Failed to submit queued tx', error);
        txQueue.emit('failed', queuedTx, error);
      }
    });
  }

  private initializeContracts(): void {
    try {
      // Initialize AZR Token contract
      if (this.addresses.AZR) {
        this.contracts.set('AZR', new Contract(this.addresses.AZR, AZR_ABI, this.wallet));
        console.log('✅ AZR Token contract initialized');
      }

      // Initialize NFT Certificate contract
      if (this.addresses.NFTCertificate) {
        this.contracts.set('NFTCertificate', new Contract(this.addresses.NFTCertificate, NFT_CERTIFICATE_ABI, this.wallet));
        console.log('✅ NFT Certificate contract initialized');
      }
    } catch (error) {
      console.error('❌ Failed to initialize contracts:', error);
    }
  }

  /**
   * Initialize the service and verify contracts are accessible
   */
  async initialize(): Promise<void> {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      console.log(`🔗 Connected to blockchain at block ${blockNumber}`);

      // Verify contracts
      for (const [name, contract] of this.contracts) {
        try {
          const code = await this.provider.getCode(contract.address);
          if (code === '0x') {
            console.warn(`⚠️ Contract ${name} at ${contract.address} has no code`);
          } else {
            console.log(`✅ Contract ${name} verified at ${contract.address}`);
          }
        } catch (error) {
          console.error(`❌ Failed to verify contract ${name}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Failed to initialize blockchain service:', error);
      throw error;
    }
  }

  /**
   * Get the current block number
   */
  async getBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  /**
   * Get balance of an address
   */
  async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('❌ Failed to get balance:', error);
      throw error;
    }
  }

  /**
   * Get AZR token balance
   */
  async getAZRBalance(address: string): Promise<string> {
    try {
      const azrContract = this.contracts.get('AZR');
      if (!azrContract) {
        throw new Error('AZR contract not initialized');
      }
      
      const balance = await azrContract.balanceOf(address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('❌ Failed to get AZR balance:', error);
      throw error;
    }
  }

  /**
   * Mint AZR tokens (owner only)
   */
  async mintAZR(to: string, knowledgeProof?: string, knowledgeLevel?: number): Promise<string> {
    try {
      const azrContract = this.contracts.get('AZR');
      if (!azrContract) {
        throw new Error('AZR contract not initialized');
      }

      // Calculate amount based on knowledge level if provided
      let amount = ethers.utils.parseEther('100'); // Default 100 AZR
      if (knowledgeLevel && knowledgeLevel > 0) {
        amount = ethers.utils.parseEther((knowledgeLevel * 50).toString()); // 50 AZR per level
      }

      // Build raw data payload and use sendTransaction for gas fallback and queueing
      const data = azrContract.interface.encodeFunctionData('mint', [to, amount]);
      const receipt = await this.sendTransaction({ to: azrContract.address, data });
      console.log(`✅ AZR minted successfully: ${receipt.transactionHash}`);
      
      return receipt.transactionHash;
    } catch (error) {
      console.error('❌ Failed to mint AZR:', error);
      throw error;
    }
  }

  /**
   * Transfer AZR tokens
   */
  async transferAZR(to: string, amount: string): Promise<string> {
    try {
      const azrContract = this.contracts.get('AZR');
      if (!azrContract) {
        throw new Error('AZR contract not initialized');
      }

      const amountWei = ethers.utils.parseEther(amount);
      const data = azrContract.interface.encodeFunctionData('transfer', [to, amountWei]);
      const receipt = await this.sendTransaction({ to: azrContract.address, data });
      console.log(`✅ AZR transferred successfully: ${receipt.transactionHash}`);
      
      return receipt.transactionHash;
    } catch (error) {
      console.error('❌ Failed to transfer AZR:', error);
      throw error;
    }
  }

  /**
   * Burn AZR tokens (owner only)
   */
  async burnAZR(from: string, amount: string): Promise<string> {
    try {
      const azrContract = this.contracts.get('AZR');
      if (!azrContract) {
        throw new Error('AZR contract not initialized');
      }

      const amountWei = ethers.utils.parseEther(amount);
      const tx = await azrContract.burn(from, amountWei);
      console.log(`🚀 AZR burn transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ AZR burned successfully: ${receipt.transactionHash}`);
      
      return receipt.transactionHash;
    } catch (error) {
      console.error('❌ Failed to burn AZR:', error);
      throw error;
    }
  }

  /**
   * Mint NFT Certificate
   */
  async mintCertificate(student: string, courseId: string, studentId: string, score: number, metadataUri?: string): Promise<{ tokenId: string; txHash: string }> {
    try {
      const nftContract = this.contracts.get('NFTCertificate');
      if (!nftContract) {
        throw new Error('NFT Certificate contract not initialized');
      }

      // Create metadata if not provided
      const metadata = metadataUri || JSON.stringify({
        courseId,
        studentId,
        score,
        issuedAt: new Date().toISOString(),
        issuer: 'Azora Education Platform'
      });

      const tx = await nftContract.mint(student, metadata);
      console.log(`🚀 NFT Certificate mint transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      
      // Get token ID from the event
      const event = receipt.events?.find((e: any) => e.event === 'Transfer');
      const tokenId = event?.args?.tokenId?.toString() || '0';
      
      console.log(`✅ NFT Certificate minted successfully: Token ${tokenId}, TX: ${receipt.transactionHash}`);
      
      return {
        tokenId,
        txHash: receipt.transactionHash
      };
    } catch (error) {
      console.error('❌ Failed to mint NFT Certificate:', error);
      throw error;
    }
  }

  /**
   * Get certificate owner
   */
  async getCertificateOwner(tokenId: string): Promise<string> {
    try {
      const nftContract = this.contracts.get('NFTCertificate');
      if (!nftContract) {
        throw new Error('NFT Certificate contract not initialized');
      }

      const owner = await nftContract.ownerOf(tokenId);
      return owner;
    } catch (error) {
      console.error('❌ Failed to get certificate owner:', error);
      throw error;
    }
  }

  /**
   * Get certificate metadata
   */
  async getCertificateMetadata(tokenId: string): Promise<string> {
    try {
      const nftContract = this.contracts.get('NFTCertificate');
      if (!nftContract) {
        throw new Error('NFT Certificate contract not initialized');
      }

      const metadata = await nftContract.tokenURI(tokenId);
      return metadata;
    } catch (error) {
      console.error('❌ Failed to get certificate metadata:', error);
      throw error;
    }
  }

  /**
   * Get AZR total supply
   */
  async getAZRTotalSupply(): Promise<string> {
    try {
      const azrContract = this.contracts.get('AZR');
      if (!azrContract) {
        throw new Error('AZR contract not initialized');
      }

      const totalSupply = await azrContract.totalSupply();
      return ethers.utils.formatEther(totalSupply);
    } catch (error) {
      console.error('❌ Failed to get AZR total supply:', error);
      throw error;
    }
  }

  /**
   * Send a transaction
   */
  async sendTransaction(tx: TransactionRequest): Promise<providers.TransactionReceipt> {
    try {
      const transaction = {
        to: tx.to,
        value: tx.value ? BigNumber.from(tx.value) : undefined,
        data: tx.data
      };

      // Estimate gas
      // Try to estimate and set gas limit; if it fails, push to queue for asynchronous retry
      try {
        const gasEstimate = await this.wallet.estimateGas(transaction);
        const gasLimit = gasEstimate.mul(120).div(100);
        const response = await this.wallet.sendTransaction({ ...transaction, gasLimit });
        console.log(`🚀 Transaction sent: ${response.hash}`);
        const receipt = await response.wait();
        // Persist a blockchain event for the transaction
        await recordBlockchainEvent({ type: 'transaction', source: 'onchain', payload: receipt });
        return receipt;
      } catch (err) {
        // If estimation fails (e.g., RPC error or gas too high), enqueue for retry
        const qtx = {
          id: `tx_${Date.now()}`,
          to: tx.to,
          data: tx.data,
          retries: 0,
          maxRetries: 5,
          backoff: 1000
        };
        txQueue.enqueue(qtx as any);
        throw new Error('Transaction queued for retry due to gas estimation failure');
      }
    } catch (error) {
      console.error('❌ Transaction failed:', error);
      throw error;
    }
  }

  /**
   * Gas price & limit fallback helper (returns numeric gwei string)
   */
  async safeGasPriceFallback(): Promise<string> {
    try {
      const gasPrice = await this.provider.getGasPrice();
      // Apply a cap if user provided a fallback
      const capGwei = process.env.GAS_PRICE_CAP_GWEI ? parseFloat(process.env.GAS_PRICE_CAP_GWEI) : undefined;
      const gwei = parseFloat(ethers.utils.formatUnits(gasPrice, 'gwei'));
      if (capGwei && gwei > capGwei) {
        return capGwei.toString();
      }
      return gwei.toString();
    } catch (err) {
      // Default fallback gas price
      return process.env.DEFAULT_GAS_PRICE_GWEI || '10';
    }
  }

  /**
   * Get a contract instance
   */
  getContract(address: string, abi: any): Contract {
    return new Contract(address, abi, this.wallet);
  }

  /**
   * Listen for events on a contract
   */
  listenToEvent(contractAddress: string, abi: any, eventName: string, callback: (...args: any[]) => void) {
    const contract = this.getContract(contractAddress, abi);
    contract.on(eventName, callback);
    console.log(`👂 Listening for ${eventName} on ${contractAddress}`);

    return () => {
      contract.off(eventName, callback);
      console.log(`Stopped listening for ${eventName} on ${contractAddress}`);
    };
  }

  /**
   * Get gas price
   */
  async getGasPrice(): Promise<string> {
    const gasPrice = await this.provider.getGasPrice();
    return ethers.utils.formatUnits(gasPrice, 'gwei');
  }
}

// Singleton instance for default usage
export const blockchainService = new BlockchainService();
