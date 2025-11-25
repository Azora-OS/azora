/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * Marketplace Integration Connector
 * Connects Careers (Freelance), Forge (P2P Services), and Nexus (Blockchain)
 * Creates unified marketplace experience across all three platforms
 */

import { EventEmitter } from 'events';

// ===== INTERFACES =====

export interface UnifiedListing {
  id: string;
  source: 'careers' | 'forge' | 'nexus';
  type: 'gig' | 'service' | 'nft' | 'token' | 'product';
  title: string;
  description: string;
  provider: Provider;
  pricing: Pricing;
  category: string;
  tags: string[];
  featured: boolean;
  status: 'active' | 'sold' | 'completed' | 'inactive';
  createdAt: Date;
  expiresAt?: Date;
}

export interface Provider {
  id: string;
  name: string;
  type: 'student' | 'graduate' | 'professional' | 'company';
  rating: number;
  verified: boolean;
  profileUrl: string;
  avatarUrl?: string;
}

export interface Pricing {
  amount: number;
  currency: 'ZAR' | 'USD' | 'AZR' | 'LEARN';
  type: 'fixed' | 'hourly' | 'negotiable' | 'auction';
  escrowEnabled: boolean;
}

export interface CrossPlatformTransaction {
  id: string;
  transactionNumber: string;
  sourcePlatform: 'careers' | 'forge' | 'nexus';
  destinationPlatform: 'mint' | 'wallet' | 'bank';
  type: 'payment' | 'payout' | 'escrow' | 'refund' | 'token-exchange';
  amount: number;
  sourceCurrency: string;
  destinationCurrency: string;
  exchangeRate?: number;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  blockchainTxHash?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  completedAt?: Date;
}

export interface UnifiedSearch {
  query: string;
  filters: {
    sources?: ('careers' | 'forge' | 'nexus')[];
    types?: UnifiedListing['type'][];
    categories?: string[];
    priceMin?: number;
    priceMax?: number;
    currencies?: Pricing['currency'][];
    verifiedOnly?: boolean;
    location?: string;
    remote?: boolean;
  };
  sort: 'relevance' | 'price-asc' | 'price-desc' | 'recent' | 'popular' | 'rating';
  page: number;
  limit: number;
}

export interface UnifiedSearchResult {
  listings: UnifiedListing[];
  total: number;
  pages: number;
  aggregations: {
    bySource: Record<string, number>;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
    priceRange: { min: number; max: number };
  };
}

export interface UserPortfolio {
  userId: string;
  userType: 'student' | 'graduate' | 'professional';
  earnings: {
    careers: number;
    forge: number;
    nexus: number;
    total: number;
  };
  projects: {
    careersCompleted: number;
    forgeCompleted: number;
    nexusCompleted: number;
    totalCompleted: number;
  };
  ratings: {
    careersRating: number;
    forgeRating: number;
    nexusRating: number;
    overallRating: number;
  };
  tokens: {
    azr: number;
    learn: number;
  };
  nfts: NFTAsset[];
  badges: Badge[];
}

export interface NFTAsset {
  id: string;
  tokenId: string;
  contractAddress: string;
  name: string;
  description: string;
  imageUrl: string;
  attributes: Record<string, any>;
  source: 'credential' | 'achievement' | 'marketplace';
  blockchain: 'ethereum' | 'polygon' | 'binance' | 'solana';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedFrom: 'careers' | 'forge' | 'nexus' | 'education';
  earnedDate: Date;
}

export interface MarketplaceSync {
  id: string;
  listingId: string;
  sourcePlatform: 'careers' | 'forge' | 'nexus';
  syncedTo: ('careers' | 'forge' | 'nexus')[];
  status: 'synced' | 'out-of-sync' | 'error';
  lastSyncedAt: Date;
  errors?: string[];
}

// ===== MARKETPLACE CONNECTOR =====

export class MarketplaceConnector extends EventEmitter {
  private activeListings: Map<string, UnifiedListing> = new Map();
  private transactions: Map<string, CrossPlatformTransaction> = new Map();
  private portfolios: Map<string, UserPortfolio> = new Map();
  private syncStatus: Map<string, MarketplaceSync> = new Map();

  constructor(
    private config: {
      careersApiUrl: string;
      forgeApiUrl: string;
      nexusApiUrl: string;
      mintApiUrl: string;
      enableCrossSync: boolean;
      enableAutoConversion: boolean;
    }
  ) {
    super();
    this.initializeConnector();
  }

  private initializeConnector(): void {
    this.startSyncJobs();
    console.log('✅ Marketplace Connector initialized');
    console.log(`Cross-sync: ${this.config.enableCrossSync ? 'Enabled' : 'Disabled'}`);
    console.log(`Auto-conversion: ${this.config.enableAutoConversion ? 'Enabled' : 'Disabled'}`);
  }

  private startSyncJobs(): void {
    // Sync listings every 5 minutes
    setInterval(() => this.syncAllListings(), 5 * 60 * 1000);

    // Update exchange rates every minute
    setInterval(() => this.updateExchangeRates(), 60 * 1000);

    // Sync portfolios every hour
    setInterval(() => this.syncUserPortfolios(), 60 * 60 * 1000);
  }

  // ===== UNIFIED SEARCH =====

  async search(search: UnifiedSearch): Promise<UnifiedSearchResult> {
    const results: UnifiedListing[] = [];
    const sources = search.filters.sources || ['careers', 'forge', 'nexus'];

    // Search across all platforms
    for (const source of sources) {
      const platformResults = await this.searchPlatform(source, search);
      results.push(...platformResults);
    }

    // Apply filters
    let filtered = this.applyFilters(results, search.filters);

    // Sort results
    filtered = this.sortResults(filtered, search.sort);

    // Pagination
    const total = filtered.length;
    const pages = Math.ceil(total / search.limit);
    const start = (search.page - 1) * search.limit;
    const paginatedResults = filtered.slice(start, start + search.limit);

    // Calculate aggregations
    const aggregations = this.calculateAggregations(filtered);

    return {
      listings: paginatedResults,
      total,
      pages,
      aggregations,
    };
  }

  private async searchPlatform(
    platform: 'careers' | 'forge' | 'nexus',
    search: UnifiedSearch
  ): Promise<UnifiedListing[]> {
    // In production, this would call actual APIs
    const listings = Array.from(this.activeListings.values()).filter(
      (listing) => listing.source === platform
    );

    if (search.query) {
      const query = search.query.toLowerCase();
      return listings.filter(
        (listing) =>
          listing.title.toLowerCase().includes(query) ||
          listing.description.toLowerCase().includes(query) ||
          listing.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return listings;
  }

  private applyFilters(
    listings: UnifiedListing[],
    filters: UnifiedSearch['filters']
  ): UnifiedListing[] {
    let results = [...listings];

    if (filters.types && filters.types.length > 0) {
      results = results.filter((listing) => filters.types!.includes(listing.type));
    }

    if (filters.categories && filters.categories.length > 0) {
      results = results.filter((listing) => filters.categories!.includes(listing.category));
    }

    if (filters.priceMin !== undefined) {
      results = results.filter((listing) => listing.pricing.amount >= filters.priceMin!);
    }

    if (filters.priceMax !== undefined) {
      results = results.filter((listing) => listing.pricing.amount <= filters.priceMax!);
    }

    if (filters.currencies && filters.currencies.length > 0) {
      results = results.filter((listing) => filters.currencies!.includes(listing.pricing.currency));
    }

    if (filters.verifiedOnly) {
      results = results.filter((listing) => listing.provider.verified);
    }

    return results;
  }

  private sortResults(listings: UnifiedListing[], sort: UnifiedSearch['sort']): UnifiedListing[] {
    const sorted = [...listings];

    switch (sort) {
      case 'price-asc':
        return sorted.sort((a, b) => a.pricing.amount - b.pricing.amount);
      case 'price-desc':
        return sorted.sort((a, b) => b.pricing.amount - a.pricing.amount);
      case 'recent':
        return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      case 'rating':
        return sorted.sort((a, b) => b.provider.rating - a.provider.rating);
      case 'popular':
        return sorted; // Would sort by views/sales
      case 'relevance':
      default:
        return sorted;
    }
  }

  private calculateAggregations(listings: UnifiedListing[]): UnifiedSearchResult['aggregations'] {
    const bySource: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    let minPrice = Infinity;
    let maxPrice = 0;

    for (const listing of listings) {
      // By source
      bySource[listing.source] = (bySource[listing.source] || 0) + 1;

      // By type
      byType[listing.type] = (byType[listing.type] || 0) + 1;

      // By category
      byCategory[listing.category] = (byCategory[listing.category] || 0) + 1;

      // Price range
      if (listing.pricing.amount < minPrice) minPrice = listing.pricing.amount;
      if (listing.pricing.amount > maxPrice) maxPrice = listing.pricing.amount;
    }

    return {
      bySource,
      byType,
      byCategory,
      priceRange: { min: minPrice === Infinity ? 0 : minPrice, max: maxPrice },
    };
  }

  // ===== CROSS-PLATFORM TRANSACTIONS =====

  async processTransaction(
    transaction: Omit<CrossPlatformTransaction, 'id' | 'transactionNumber' | 'status' | 'createdAt'>
  ): Promise<CrossPlatformTransaction> {
    const txId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newTransaction: CrossPlatformTransaction = {
      ...transaction,
      id: txId,
      transactionNumber: `TXN-${Date.now()}`,
      status: 'pending',
      createdAt: new Date(),
    };

    this.transactions.set(txId, newTransaction);

    // Auto-convert currency if needed
    if (
      this.config.enableAutoConversion &&
      transaction.sourceCurrency !== transaction.destinationCurrency
    ) {
      newTransaction.exchangeRate = await this.getExchangeRate(
        transaction.sourceCurrency,
        transaction.destinationCurrency
      );
    }

    // Process through appropriate platform
    newTransaction.status = 'processing';
    this.emit('transaction-processing', newTransaction);

    try {
      // Route to correct payment processor
      switch (transaction.destinationPlatform) {
        case 'mint':
          await this.processThroughMint(newTransaction);
          break;
        case 'wallet':
          await this.processThroughWallet(newTransaction);
          break;
        case 'bank':
          await this.processThroughBank(newTransaction);
          break;
      }

      newTransaction.status = 'completed';
      newTransaction.completedAt = new Date();

      this.emit('transaction-completed', newTransaction);
    } catch (error: any) {
      newTransaction.status = 'failed';
      this.emit('transaction-failed', { transaction: newTransaction, error: error.message });
    }

    return newTransaction;
  }

  private async processThroughMint(transaction: CrossPlatformTransaction): Promise<void> {
    // Integrate with Azora Mint for crypto/token transactions
    console.log(`Processing through Mint: ${transaction.transactionNumber}`);

    // Would call Mint API
    this.emit('mint-payment-request', {
      from: transaction.senderId,
      to: transaction.receiverId,
      amount: transaction.amount,
      currency: transaction.destinationCurrency,
      type: transaction.type,
      metadata: transaction.metadata,
    });

    // Simulate blockchain transaction
    transaction.blockchainTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
  }

  private async processThroughWallet(transaction: CrossPlatformTransaction): Promise<void> {
    console.log(`Processing through Wallet: ${transaction.transactionNumber}`);
    // Internal wallet transfer
  }

  private async processThroughBank(transaction: CrossPlatformTransaction): Promise<void> {
    console.log(`Processing through Bank: ${transaction.transactionNumber}`);
    // Bank transfer integration
  }

  private async getExchangeRate(from: string, to: string): Promise<number> {
    // In production, fetch real exchange rates
    const rates: Record<string, Record<string, number>> = {
      ZAR: { USD: 0.054, AZR: 100, LEARN: 1000 },
      USD: { ZAR: 18.5, AZR: 1850, LEARN: 18500 },
      AZR: { ZAR: 0.01, USD: 0.00054, LEARN: 10 },
      LEARN: { ZAR: 0.001, USD: 0.000054, AZR: 0.1 },
    };

    return rates[from]?.[to] || 1;
  }

  // ===== USER PORTFOLIO AGGREGATION =====

  async getUserPortfolio(userId: string): Promise<UserPortfolio> {
    let portfolio = this.portfolios.get(userId);

    if (!portfolio) {
      // Create new portfolio by aggregating from all platforms
      portfolio = await this.aggregatePortfolio(userId);
      this.portfolios.set(userId, portfolio);
    }

    return portfolio;
  }

  private async aggregatePortfolio(userId: string): Promise<UserPortfolio> {
    // Fetch data from all three platforms
    const careersData = await this.fetchCareersData(userId);
    const forgeData = await this.fetchForgeData(userId);
    const nexusData = await this.fetchNexusData(userId);

    const portfolio: UserPortfolio = {
      userId,
      userType: 'student', // Would determine from user data
      earnings: {
        careers: careersData.earnings || 0,
        forge: forgeData.earnings || 0,
        nexus: nexusData.earnings || 0,
        total: (careersData.earnings || 0) + (forgeData.earnings || 0) + (nexusData.earnings || 0),
      },
      projects: {
        careersCompleted: careersData.projectsCompleted || 0,
        forgeCompleted: forgeData.projectsCompleted || 0,
        nexusCompleted: nexusData.projectsCompleted || 0,
        totalCompleted:
          (careersData.projectsCompleted || 0) +
          (forgeData.projectsCompleted || 0) +
          (nexusData.projectsCompleted || 0),
      },
      ratings: {
        careersRating: careersData.rating || 0,
        forgeRating: forgeData.rating || 0,
        nexusRating: nexusData.rating || 0,
        overallRating: this.calculateOverallRating(
          careersData.rating || 0,
          forgeData.rating || 0,
          nexusData.rating || 0
        ),
      },
      tokens: {
        azr: nexusData.azrBalance || 0,
        learn: careersData.learnBalance || 0,
      },
      nfts: nexusData.nfts || [],
      badges: [
        ...(careersData.badges || []),
        ...(forgeData.badges || []),
        ...(nexusData.badges || []),
      ],
    };

    return portfolio;
  }

  private calculateOverallRating(careers: number, forge: number, nexus: number): number {
    const ratings = [careers, forge, nexus].filter((r) => r > 0);
    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  }

  private async fetchCareersData(userId: string): Promise<any> {
    // Would call Careers API
    return {
      earnings: 0,
      projectsCompleted: 0,
      rating: 0,
      learnBalance: 0,
      badges: [],
    };
  }

  private async fetchForgeData(userId: string): Promise<any> {
    // Would call Forge API
    return {
      earnings: 0,
      projectsCompleted: 0,
      rating: 0,
      badges: [],
    };
  }

  private async fetchNexusData(userId: string): Promise<any> {
    // Would call Nexus API
    return {
      earnings: 0,
      projectsCompleted: 0,
      rating: 0,
      azrBalance: 0,
      nfts: [],
      badges: [],
    };
  }

  // ===== CROSS-PLATFORM SYNC =====

  async syncListing(listingId: string, syncTo: ('careers' | 'forge' | 'nexus')[]): Promise<void> {
    const listing = this.activeListings.get(listingId);
    if (!listing) {
      throw new Error('Listing not found');
    }

    if (!this.config.enableCrossSync) {
      throw new Error('Cross-platform sync is disabled');
    }

    const sync: MarketplaceSync = {
      id: `sync_${Date.now()}`,
      listingId,
      sourcePlatform: listing.source,
      syncedTo: syncTo,
      status: 'synced',
      lastSyncedAt: new Date(),
    };

    this.syncStatus.set(listingId, sync);

    this.emit('listing-synced', { listing, sync });
  }

  private async syncAllListings(): Promise<void> {
    console.log('Syncing listings across platforms...');
    // Sync all active listings
  }

  private async updateExchangeRates(): Promise<void> {
    // Update currency exchange rates
    console.log('Updating exchange rates...');
  }

  private async syncUserPortfolios(): Promise<void> {
    console.log('Syncing user portfolios...');
    // Refresh all portfolio data
  }

  // ===== ANALYTICS =====

  async getMarketplaceAnalytics(): Promise<{
    totalListings: number;
    activeListings: number;
    totalTransactions: number;
    totalVolume: number;
    byPlatform: Record<string, any>;
  }> {
    const totalListings = this.activeListings.size;
    const activeListings = Array.from(this.activeListings.values()).filter(
      (l) => l.status === 'active'
    ).length;

    const totalTransactions = this.transactions.size;
    const completedTransactions = Array.from(this.transactions.values()).filter(
      (t) => t.status === 'completed'
    );

    const totalVolume = completedTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    const byPlatform = {
      careers: {
        listings: Array.from(this.activeListings.values()).filter((l) => l.source === 'careers')
          .length,
        transactions: completedTransactions.filter((t) => t.sourcePlatform === 'careers').length,
      },
      forge: {
        listings: Array.from(this.activeListings.values()).filter((l) => l.source === 'forge')
          .length,
        transactions: completedTransactions.filter((t) => t.sourcePlatform === 'forge').length,
      },
      nexus: {
        listings: Array.from(this.activeListings.values()).filter((l) => l.source === 'nexus')
          .length,
        transactions: completedTransactions.filter((t) => t.sourcePlatform === 'nexus').length,
      },
    };

    return {
      totalListings,
      activeListings,
      totalTransactions,
      totalVolume,
      byPlatform,
    };
  }
}

export default MarketplaceConnector;
