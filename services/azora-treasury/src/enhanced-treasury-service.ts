import { ethers, providers, Contract, Wallet } from 'ethers';
import dotenv from 'dotenv';
import winston from 'winston';
import Redis from 'ioredis';
import axios from 'axios';

dotenv.config();

// Enhanced ABI definitions for comprehensive asset tracking
const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function name() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)"
];

const ERC721_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)"
];

const VAULT_ABI = [
    "function getBalance() view returns (uint256)",
    "function getAssets() view returns (address[])",
    "function getAssetBalance(address asset) view returns (uint256)",
    "function deposit(address asset, uint256 amount)",
    "function withdraw(address asset, uint256 amount)",
    "function owner() view returns (address)"
];

export interface Asset {
    symbol: string;
    name: string;
    balance: string;
    decimals: number;
    valueUsd: number;
    valueEth: number;
    contractAddress?: string;
    type: 'native' | 'erc20' | 'erc721' | 'vault';
    priceSource: 'coingecko' | 'chainlink' | 'uniswap' | 'manual';
    lastUpdated: string;
    metadata?: Record<string, any>;
}

export interface Transaction {
    hash: string;
    type: 'deposit' | 'withdrawal' | 'transfer' | 'stake' | 'unstake';
    asset: string;
    amount: string;
    from: string;
    to: string;
    timestamp: string;
    blockNumber: number;
    gasUsed: string;
    gasPrice: string;
    status: 'pending' | 'confirmed' | 'failed';
    metadata?: Record<string, any>;
}

export interface TreasuryMetrics {
    totalValueUsd: number;
    totalValueEth: number;
    assetCount: number;
    transactionCount: number;
    dailyVolume: number;
    weeklyVolume: number;
    monthlyVolume: number;
    yieldRate: number;
    riskScore: number;
    diversificationScore: number;
}

export interface PriceFeed {
    symbol: string;
    price: number;
    timestamp: string;
    source: string;
    confidence: number;
}

export class EnhancedTreasuryService {
    private provider: providers.JsonRpcProvider;
    private wallet?: Wallet;
    private treasuryAddress: string;
    private redis: Redis;
    private logger: winston.Logger;
    private trackedAssets: Map<string, Asset> = new Map();
    private transactions: Map<string, Transaction> = new Map();
    private priceFeeds: Map<string, PriceFeed> = new Map();
    private vaultContracts: Map<string, Contract> = new Map();

    constructor() {
        // Initialize blockchain provider
        const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545';
        this.provider = new providers.JsonRpcProvider(rpcUrl);
        
        // Initialize wallet if private key provided
        const privateKey = process.env.TREASURY_PRIVATE_KEY;
        if (privateKey) {
            this.wallet = new Wallet(privateKey, this.provider);
        }
        
        this.treasuryAddress = process.env.TREASURY_WALLET_ADDRESS || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

        // Initialize Redis for caching
        this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

        // Initialize logger
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'treasury.log' })
            ]
        });

        this.initializeTrackedAssets();
        this.loadPersistedData();
        this.startPriceFeedUpdates();
        this.startTransactionMonitoring();
    }

    // ========== ASSET TRACKING ==========

    async getNativeBalance(): Promise<string> {
        try {
            const balance = await this.provider.getBalance(this.treasuryAddress);
            return ethers.utils.formatEther(balance);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('Failed to get native balance', { error: errorMessage });
            throw new Error(`Failed to get native balance: ${errorMessage}`);
        }
    }

    async getTokenBalance(tokenAddress: string): Promise<string> {
        try {
            const contract = new Contract(tokenAddress, ERC20_ABI, this.provider);
            const balance = await contract.balanceOf(this.treasuryAddress);
            const decimals = await contract.decimals();
            return ethers.utils.formatUnits(balance, decimals);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('Failed to get token balance', { tokenAddress, error: errorMessage });
            throw new Error(`Failed to get token balance: ${errorMessage}`);
        }
    }

    async getNFTBalance(nftAddress: string): Promise<number> {
        try {
            const contract = new Contract(nftAddress, ERC721_ABI, this.provider);
            const balance = await contract.balanceOf(this.treasuryAddress);
            return balance.toNumber();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('Failed to get NFT balance', { nftAddress, error: errorMessage });
            throw new Error(`Failed to get NFT balance: ${errorMessage}`);
        }
    }

    async getVaultBalance(vaultAddress: string): Promise<{ asset: string; balance: string }[]> {
        try {
            const vault = this.getVaultContract(vaultAddress);
            const assets = await vault.getAssets();
            const balances: { asset: string; balance: string }[] = [];

            for (const assetAddress of assets) {
                const balance = await vault.getAssetBalance(assetAddress);
                balances.push({
                    asset: assetAddress,
                    balance: ethers.utils.formatEther(balance)
                });
            }

            return balances;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('Failed to get vault balance', { vaultAddress, error: errorMessage });
            throw new Error(`Failed to get vault balance: ${errorMessage}`);
        }
    }

    async getPortfolio(): Promise<Asset[]> {
        const portfolio: Asset[] = [];

        // Get native ETH balance
        const ethBalance = await this.getNativeBalance();
        const ethPrice = await this.getPrice('ETH');
        portfolio.push({
            symbol: 'ETH',
            name: 'Ethereum',
            balance: ethBalance,
            decimals: 18,
            valueUsd: parseFloat(ethBalance) * ethPrice,
            valueEth: parseFloat(ethBalance),
            type: 'native',
            priceSource: 'coingecko',
            lastUpdated: new Date().toISOString()
        });

        // Get tracked ERC20 tokens
        for (const [address, asset] of this.trackedAssets) {
            if (asset.type === 'erc20') {
                try {
                    const balance = await this.getTokenBalance(address);
                    const price = await this.getPrice(asset.symbol);
                    
                    portfolio.push({
                        ...asset,
                        balance,
                        valueUsd: parseFloat(balance) * price,
                        valueEth: (parseFloat(balance) * price) / ethPrice,
                        lastUpdated: new Date().toISOString()
                    });
                } catch (error) {
                    this.logger.warn(`Failed to get balance for ${asset.symbol}`, { address });
                }
            }
        }

        // Get vault assets
        for (const [vaultAddress, vault] of this.vaultContracts) {
            try {
                const vaultBalances = await this.getVaultBalance(vaultAddress);
                for (const vaultAsset of vaultBalances) {
                    const asset = this.trackedAssets.get(vaultAsset.asset);
                    if (asset) {
                        const price = await this.getPrice(asset.symbol);
                        portfolio.push({
                            ...asset,
                            balance: vaultAsset.balance,
                            valueUsd: parseFloat(vaultAsset.balance) * price,
                            valueEth: (parseFloat(vaultAsset.balance) * price) / ethPrice,
                            type: 'vault',
                            lastUpdated: new Date().toISOString(),
                            metadata: { vaultAddress }
                        });
                    }
                }
            } catch (error) {
                this.logger.warn(`Failed to get vault balances`, { vaultAddress });
            }
        }

        return portfolio;
    }

    async getTotalValueUsd(): Promise<number> {
        const portfolio = await this.getPortfolio();
        return portfolio.reduce((total, asset) => total + asset.valueUsd, 0);
    }

    async getTotalValueEth(): Promise<number> {
        const portfolio = await this.getPortfolio();
        return portfolio.reduce((total, asset) => total + asset.valueEth, 0);
    }

    // ========== PRICE FEEDS ==========

    async getPrice(symbol: string): Promise<number> {
        // Check cache first
        const cached = this.priceFeeds.get(symbol);
        if (cached && Date.now() - new Date(cached.timestamp).getTime() < 60000) { // 1 minute cache
            return cached.price;
        }

        // Fetch from CoinGecko
        try {
            const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd`);
            const price = response.data[symbol.toLowerCase()]?.usd;
            
            if (price) {
                this.priceFeeds.set(symbol, {
                    symbol,
                    price,
                    timestamp: new Date().toISOString(),
                    source: 'coingecko',
                    confidence: 0.95
                });
                return price;
            }
        } catch (error) {
            this.logger.warn(`Failed to fetch price from CoinGecko for ${symbol}`);
        }

        // Fallback to manual price or 0
        const fallbackPrice = this.getFallbackPrice(symbol);
        this.priceFeeds.set(symbol, {
            symbol,
            price: fallbackPrice,
            timestamp: new Date().toISOString(),
            source: 'manual',
            confidence: 0.5
        });

        return fallbackPrice;
    }

    private getFallbackPrice(symbol: string): number {
        const fallbackPrices: Record<string, number> = {
            'ETH': 2000,
            'AZR': 1.5,
            'USDC': 1.0,
            'USDT': 1.0,
            'WBTC': 45000
        };
        return fallbackPrices[symbol] || 0;
    }

    // ========== TRANSACTION MONITORING ==========

    async getTransactionHistory(limit: number = 100): Promise<Transaction[]> {
        const transactions = Array.from(this.transactions.values())
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);
        
        return transactions;
    }

    async getTransactionsByType(type: string): Promise<Transaction[]> {
        return Array.from(this.transactions.values())
            .filter(tx => tx.type === type)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    private async startTransactionMonitoring(): void {
        // Monitor incoming transactions to treasury
        this.provider.on('block', async (blockNumber) => {
            try {
                const block = await this.provider.getBlock(blockNumber);
                
                for (const txHash of block.transactions) {
                    const tx = await this.provider.getTransaction(txHash);
                    
                    if (tx.to === this.treasuryAddress || tx.from === this.treasuryAddress) {
                        await this.processTransaction(tx, blockNumber);
                    }
                }
            } catch (error) {
                this.logger.error('Error monitoring transactions', { error });
            }
        });
    }

    private async processTransaction(tx: any, blockNumber: number): Promise<void> {
        try {
            const receipt = await this.provider.getTransactionReceipt(tx.hash);
            const asset = await this.identifyTransactionAsset(tx);
            
            const transaction: Transaction = {
                hash: tx.hash,
                type: tx.to === this.treasuryAddress ? 'deposit' : 'withdrawal',
                asset,
                amount: ethers.utils.formatEther(tx.value),
                from: tx.from,
                to: tx.to || '',
                timestamp: new Date().toISOString(),
                blockNumber,
                gasUsed: receipt.gasUsed.toString(),
                gasPrice: tx.gasPrice?.toString() || '0',
                status: receipt.status === 1 ? 'confirmed' : 'failed'
            };

            this.transactions.set(tx.hash, transaction);
            await this.persistTransaction(transaction);

            this.logger.info(`Processed treasury transaction`, {
                hash: tx.hash,
                type: transaction.type,
                amount: transaction.amount,
                asset
            });
        } catch (error) {
            this.logger.error('Error processing transaction', { txHash: tx.hash, error });
        }
    }

    private async identifyTransactionAsset(tx: any): Promise<string> {
        // For native ETH transfers
        if (tx.value.gt(0)) {
            return 'ETH';
        }

        // For token transfers, would need to decode transaction data
        // This is simplified - in production would decode the input data
        return 'UNKNOWN';
    }

    // ========== TREASURY OPERATIONS ==========

    async transferAsset(assetAddress: string, to: string, amount: string): Promise<string> {
        if (!this.wallet) {
            throw new Error('Treasury wallet not configured');
        }

        try {
            let tx;
            
            if (assetAddress === 'ETH') {
                tx = await this.wallet.sendTransaction({
                    to,
                    value: ethers.utils.parseEther(amount)
                });
            } else {
                const contract = new Contract(assetAddress, ERC20_ABI, this.wallet);
                const decimals = await contract.decimals();
                tx = await contract.transfer(to, ethers.utils.parseUnits(amount, decimals));
            }

            await tx.wait();
            
            this.logger.info(`Asset transferred`, {
                asset: assetAddress,
                to,
                amount,
                txHash: tx.hash
            });

            return tx.hash;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('Failed to transfer asset', { assetAddress, to, amount, error: errorMessage });
            throw new Error(`Failed to transfer asset: ${errorMessage}`);
        }
    }

    async stakeAsset(assetAddress: string, amount: string, stakingContract: string): Promise<string> {
        if (!this.wallet) {
            throw new Error('Treasury wallet not configured');
        }

        try {
            const contract = new Contract(stakingContract, [
                "function stake(address asset, uint256 amount)",
                "function unstake(address asset, uint256 amount)"
            ], this.wallet);

            const decimals = assetAddress === 'ETH' ? 18 : await new Contract(assetAddress, ERC20_ABI, this.provider).decimals();
            const tx = await contract.stake(assetAddress, ethers.utils.parseUnits(amount, decimals));
            
            await tx.wait();
            
            this.logger.info(`Asset staked`, {
                asset: assetAddress,
                amount,
                stakingContract,
                txHash: tx.hash
            });

            return tx.hash;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('Failed to stake asset', { assetAddress, amount, stakingContract, error: errorMessage });
            throw new Error(`Failed to stake asset: ${errorMessage}`);
        }
    }

    // ========== METRICS AND ANALYTICS ==========

    async getTreasuryMetrics(): Promise<TreasuryMetrics> {
        const portfolio = await this.getPortfolio();
        const transactions = Array.from(this.transactions.values());
        
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const dailyTransactions = transactions.filter(tx => new Date(tx.timestamp) > oneDayAgo);
        const weeklyTransactions = transactions.filter(tx => new Date(tx.timestamp) > oneWeekAgo);
        const monthlyTransactions = transactions.filter(tx => new Date(tx.timestamp) > oneMonthAgo);

        const dailyVolume = dailyTransactions.reduce((sum, tx) => sum + (parseFloat(tx.amount) * await this.getPrice(tx.asset)), 0);
        const weeklyVolume = weeklyTransactions.reduce((sum, tx) => sum + (parseFloat(tx.amount) * await this.getPrice(tx.asset)), 0);
        const monthlyVolume = monthlyTransactions.reduce((sum, tx) => sum + (parseFloat(tx.amount) * await this.getPrice(tx.asset)), 0);

        const totalValueUsd = await this.getTotalValueUsd();
        const totalValueEth = await this.getTotalValueEth();

        return {
            totalValueUsd,
            totalValueEth,
            assetCount: portfolio.length,
            transactionCount: transactions.length,
            dailyVolume,
            weeklyVolume,
            monthlyVolume,
            yieldRate: this.calculateYieldRate(portfolio, transactions),
            riskScore: this.calculateRiskScore(portfolio),
            diversificationScore: this.calculateDiversificationScore(portfolio)
        };
    }

    private calculateYieldRate(portfolio: Asset[], transactions: Transaction[]): number {
        // Simplified yield calculation - would be more sophisticated in production
        const monthlyTransactions = transactions.filter(tx => {
            const txDate = new Date(tx.timestamp);
            const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            return txDate > oneMonthAgo && tx.type === 'deposit';
        });

        if (monthlyTransactions.length === 0) return 0;

        const monthlyDeposits = monthlyTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
        const currentValue = portfolio.reduce((sum, asset) => sum + asset.valueUsd, 0);
        
        return ((currentValue - monthlyDeposits) / monthlyDeposits) * 100;
    }

    private calculateRiskScore(portfolio: Asset[]): number {
        // Simplified risk calculation based on asset volatility and concentration
        const ethWeight = portfolio.find(a => a.symbol === 'ETH')?.valueUsd || 0;
        const totalValue = portfolio.reduce((sum, asset) => sum + asset.valueUsd, 0);
        
        if (totalValue === 0) return 0;
        
        const concentration = ethWeight / totalValue;
        const volatility = 0.3; // Simplified volatility score
        
        return Math.min(100, concentration * 50 + volatility * 50);
    }

    private calculateDiversificationScore(portfolio: Asset[]): number {
        if (portfolio.length === 0) return 0;
        
        const uniqueTypes = new Set(portfolio.map(a => a.type)).size;
        const maxTypes = 4; // native, erc20, erc721, vault
        
        return (uniqueTypes / maxTypes) * 100;
    }

    // ========== UTILITY METHODS ==========

    private getVaultContract(vaultAddress: string): Contract {
        if (!this.vaultContracts.has(vaultAddress)) {
            this.vaultContracts.set(vaultAddress, new Contract(vaultAddress, VAULT_ABI, this.provider));
        }
        return this.vaultContracts.get(vaultAddress)!;
    }

    private initializeTrackedAssets(): void {
        // Initialize with known assets
        const knownAssets: Asset[] = [
            {
                symbol: 'AZR',
                name: 'Azora Token',
                balance: '0',
                decimals: 18,
                valueUsd: 0,
                valueEth: 0,
                contractAddress: process.env.AZR_TOKEN_ADDRESS,
                type: 'erc20',
                priceSource: 'coingecko',
                lastUpdated: new Date().toISOString()
            },
            {
                symbol: 'USDC',
                name: 'USD Coin',
                balance: '0',
                decimals: 6,
                valueUsd: 0,
                valueEth: 0,
                contractAddress: process.env.USDC_TOKEN_ADDRESS,
                type: 'erc20',
                priceSource: 'coingecko',
                lastUpdated: new Date().toISOString()
            }
        ];

        knownAssets.forEach(asset => {
            if (asset.contractAddress) {
                this.trackedAssets.set(asset.contractAddress, asset);
            }
        });

        this.logger.info(`Initialized ${this.trackedAssets.size} tracked assets`);
    }

    private startPriceFeedUpdates(): void {
        // Update prices every 5 minutes
        setInterval(async () => {
            try {
                for (const [address, asset] of this.trackedAssets) {
                    await this.getPrice(asset.symbol);
                }
                await this.getPrice('ETH');
            } catch (error) {
                this.logger.error('Error updating price feeds', { error });
            }
        }, 5 * 60 * 1000);
    }

    // ========== DATA PERSISTENCE ==========

    private async persistTransaction(transaction: Transaction): Promise<void> {
        try {
            await this.redis.setex(`tx:${transaction.hash}`, 86400 * 30, JSON.stringify(transaction)); // 30 days
        } catch (error) {
            this.logger.error('Failed to persist transaction', { txHash: transaction.hash, error });
        }
    }

    private async loadPersistedData(): Promise<void> {
        try {
            // Load transactions
            const txKeys = await this.redis.keys('tx:*');
            for (const key of txKeys) {
                const txData = await this.redis.get(key);
                if (txData) {
                    const transaction = JSON.parse(txData);
                    this.transactions.set(transaction.hash, transaction);
                }
            }

            this.logger.info(`Loaded ${this.transactions.size} transactions from Redis`);
        } catch (error) {
            this.logger.error('Failed to load persisted data', { error });
        }
    }

    async healthCheck(): Promise<{ healthy: boolean; details: any }> {
        try {
            await this.provider.getNetwork();
            await this.redis.ping();
            
            return {
                healthy: true,
                details: {
                    network: 'connected',
                    redis: 'connected',
                    trackedAssets: this.trackedAssets.size,
                    transactions: this.transactions.size,
                    ubuntu: 'Treasury operational with blockchain integration'
                }
            };
        } catch (error) {
            return {
                healthy: false,
                details: {
                    error: error instanceof Error ? error.message : String(error),
                    ubuntu: 'Treasury needs attention'
                }
            };
        }
    }

    async shutdown(): Promise<void> {
        this.logger.info('Shutting down Enhanced Treasury Service...');
        if (this.redis) {
            await this.redis.quit();
        }
        this.logger.info('Enhanced Treasury Service shutdown complete');
    }
}

export const enhancedTreasuryService = new EnhancedTreasuryService();
