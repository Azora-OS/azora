/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/
import { ethers } from 'ethers';
import { EventEmitter } from 'events';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class BlockchainMonitorService extends EventEmitter {
    constructor(rpcUrl = process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo', networkName = 'ethereum') {
        super();
        this.rpcUrl = rpcUrl;
        this.networkName = networkName;
        this.monitoredTransactions = new Map();
        this.monitoredContracts = new Map();
        this.monitoringInterval = null;
        this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        this.initializeMonitoring();
    }
    /**
     * Initialize blockchain monitoring
     */
    async initializeMonitoring() {
        try {
            // Start transaction monitoring
            this.startTransactionMonitoring();
            // Monitor important contracts
            await this.setupContractMonitoring();
            console.log('✅ Blockchain monitoring initialized');
        }
        catch (error) {
            console.error('Failed to initialize blockchain monitoring:', error);
        }
    }
    /**
     * Start monitoring transactions
     */
    startTransactionMonitoring() {
        // Check transaction statuses every 30 seconds
        this.monitoringInterval = setInterval(async () => {
            await this.checkPendingTransactions();
        }, 30000);
        console.log('📊 Transaction monitoring started');
    }
    /**
     * Setup contract event monitoring
     */
    async setupContractMonitoring() {
        const contracts = [
            {
                name: 'AZR',
                address: process.env.AZR_CONTRACT_ADDRESS,
                abi: [
                    "event Transfer(address indexed from, address indexed to, uint256 value)",
                    "event Mint(address indexed to, uint256 amount)",
                    "event Burn(address indexed from, uint256 amount)"
                ]
            },
            {
                name: 'AzoraNFT',
                address: process.env.AZORA_NFT_CONTRACT_ADDRESS,
                abi: [
                    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
                    "event NFTMinted(uint256 indexed tokenId, address indexed recipient, uint8 nftType, string title)",
                    "event NFTListed(uint256 indexed tokenId, address indexed seller, uint256 price, address paymentToken)",
                    "event NFTSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price)"
                ]
            }
        ];
        for (const contractInfo of contracts) {
            if (contractInfo.address) {
                try {
                    const contract = new ethers.Contract(contractInfo.address, contractInfo.abi, this.provider);
                    // Listen to events
                    contract.on('*', async (event) => {
                        await this.handleContractEvent(contractInfo.name, event);
                    });
                    this.monitoredContracts.set(contractInfo.name, contract);
                    console.log(`📋 Monitoring ${contractInfo.name} contract at ${contractInfo.address}`);
                }
                catch (error) {
                    console.error(`Failed to setup monitoring for ${contractInfo.name}:`, error);
                }
            }
        }
    }
    /**
     * Monitor a specific transaction
     */
    async monitorTransaction(hash) {
        try {
            const monitor = {
                hash,
                status: 'pending',
                confirmations: 0,
                lastChecked: Date.now()
            };
            this.monitoredTransactions.set(hash, monitor);
            // Check initial status
            await this.checkTransactionStatus(hash);
            console.log(`👀 Started monitoring transaction: ${hash}`);
        }
        catch (error) {
            console.error('Monitor transaction error:', error);
            throw error;
        }
    }
    /**
     * Check status of pending transactions
     */
    async checkPendingTransactions() {
        for (const [hash, monitor] of this.monitoredTransactions) {
            if (monitor.status === 'pending') {
                await this.checkTransactionStatus(hash);
            }
        }
    }
    /**
     * Check individual transaction status
     */
    async checkTransactionStatus(hash) {
        try {
            const monitor = this.monitoredTransactions.get(hash);
            if (!monitor)
                return;
            const receipt = await this.provider.getTransactionReceipt(hash);
            const currentBlock = await this.provider.getBlockNumber();
            if (receipt) {
                const confirmations = currentBlock - receipt.blockNumber;
                const status = receipt.status === 1 ? 'confirmed' : 'failed';
                // Update monitor
                monitor.status = status;
                monitor.confirmations = confirmations;
                monitor.gasUsed = receipt.gasUsed.toString();
                monitor.effectiveGasPrice = receipt.effectiveGasPrice?.toString();
                monitor.lastChecked = Date.now();
                // Update database
                await prisma.transaction.updateMany({
                    where: { hash },
                    data: {
                        status,
                        confirmations,
                        gasUsed: monitor.gasUsed,
                        gasPrice: monitor.effectiveGasPrice,
                        updatedAt: new Date()
                    }
                });
                // Emit event
                this.emit('transactionUpdate', {
                    hash,
                    status,
                    confirmations,
                    gasUsed: monitor.gasUsed,
                    effectiveGasPrice: monitor.effectiveGasPrice
                });
                // Remove from monitoring if confirmed or failed
                if (status !== 'pending') {
                    this.monitoredTransactions.delete(hash);
                    console.log(`✅ Transaction ${hash} ${status} with ${confirmations} confirmations`);
                }
            }
            else {
                // Transaction still pending
                monitor.lastChecked = Date.now();
            }
        }
        catch (error) {
            console.error(`Check transaction status error for ${hash}:`, error);
        }
    }
    /**
     * Handle contract events
     */
    async handleContractEvent(contractName, event) {
        try {
            const block = await this.provider.getBlock(event.blockNumber);
            const timestamp = block.timestamp * 1000; // Convert to milliseconds
            const blockchainEvent = {
                transactionHash: event.transactionHash,
                blockNumber: event.blockNumber,
                eventName: event.event || event.eventSignature,
                contractAddress: event.address,
                from: event.args?.from || '',
                to: event.args?.to || '',
                value: event.args?.value?.toString() || '0',
                timestamp,
                rawData: event
            };
            // Store event in database
            await prisma.blockchainEvent.create({
                data: {
                    transactionHash: blockchainEvent.transactionHash,
                    blockNumber: blockchainEvent.blockNumber,
                    eventName: blockchainEvent.eventName,
                    contractAddress: blockchainEvent.contractAddress,
                    from: blockchainEvent.from,
                    to: blockchainEvent.to,
                    value: blockchainEvent.value,
                    timestamp: new Date(blockchainEvent.timestamp),
                    network: this.networkName,
                    rawData: JSON.stringify(blockchainEvent.rawData)
                }
            });
            // Emit event
            this.emit('contractEvent', blockchainEvent);
            console.log(`📢 ${contractName} event: ${blockchainEvent.eventName} in tx ${blockchainEvent.transactionHash}`);
        }
        catch (error) {
            console.error('Handle contract event error:', error);
        }
    }
    /**
     * Get transaction details
     */
    async getTransactionDetails(hash) {
        try {
            const [tx, receipt] = await Promise.all([
                this.provider.getTransaction(hash),
                this.provider.getTransactionReceipt(hash)
            ]);
            if (!tx) {
                throw new Error('Transaction not found');
            }
            const currentBlock = await this.provider.getBlockNumber();
            const confirmations = receipt ? currentBlock - receipt.blockNumber : 0;
            return {
                hash: tx.hash,
                blockNumber: tx.blockNumber,
                from: tx.from,
                to: tx.to,
                value: ethers.utils.formatEther(tx.value),
                gasLimit: tx.gasLimit.toString(),
                gasPrice: ethers.utils.formatUnits(tx.gasPrice, 'gwei'),
                data: tx.data,
                status: receipt?.status === 1 ? 'confirmed' : receipt?.status === 0 ? 'failed' : 'pending',
                confirmations,
                gasUsed: receipt?.gasUsed?.toString(),
                effectiveGasPrice: receipt?.effectiveGasPrice?.toString(),
                timestamp: receipt ? (await this.provider.getBlock(receipt.blockNumber)).timestamp : null
            };
        }
        catch (error) {
            console.error('Get transaction details error:', error);
            throw error;
        }
    }
    /**
     * Get recent blockchain events
     */
    async getRecentEvents(limit = 50) {
        try {
            const events = await prisma.blockchainEvent.findMany({
                where: { network: this.networkName },
                orderBy: { timestamp: 'desc' },
                take: limit
            });
            return events.map(event => ({
                transactionHash: event.transactionHash,
                blockNumber: event.blockNumber,
                eventName: event.eventName,
                contractAddress: event.contractAddress,
                from: event.from,
                to: event.to,
                value: event.value,
                timestamp: event.timestamp.getTime(),
                rawData: JSON.parse(event.rawData)
            }));
        }
        catch (error) {
            console.error('Get recent events error:', error);
            throw error;
        }
    }
    /**
     * Get network statistics
     */
    async getNetworkStats() {
        try {
            const [blockNumber, gasPrice, network] = await Promise.all([
                this.provider.getBlockNumber(),
                this.provider.getGasPrice(),
                this.provider.getNetwork()
            ]);
            const latestBlock = await this.provider.getBlock(blockNumber);
            return {
                network: this.networkName,
                chainId: network.chainId,
                blockNumber,
                gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
                timestamp: latestBlock.timestamp,
                blockTime: latestBlock.timestamp
            };
        }
        catch (error) {
            console.error('Get network stats error:', error);
            throw error;
        }
    }
    /**
     * Stop monitoring
     */
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        // Remove all contract listeners
        for (const [name, contract] of this.monitoredContracts) {
            contract.removeAllListeners();
        }
        this.monitoredContracts.clear();
        this.monitoredTransactions.clear();
        console.log('🛑 Blockchain monitoring stopped');
    }
    /**
     * Get monitored transactions
     */
    getMonitoredTransactions() {
        return Array.from(this.monitoredTransactions.values());
    }
}
