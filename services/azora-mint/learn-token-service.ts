/**
 * Azora Mint - $LEARN Token Service
 * Mints and manages $LEARN tokens for educational activity
 * 
 * $LEARN Token Economics:
 * - Minted for educational activities (courses, assessments, engagement)
 * - Convertible to $AZR at 10:1 ratio (10 LEARN = 1 AZR)
 * - Staked for premium features (priority support, advanced courses)
 * - Burned when converted or used
 * - Deflationary supply (max 1 billion LEARN)
 * 
 * Earning Opportunities:
 * - Complete course: 100 LEARN
 * - Pass assessment (>70%): 50 LEARN
 * - Perfect score (100%): 100 LEARN bonus
 * - Daily streak: 10 LEARN/day
 * - Help other students: 25 LEARN per accepted answer
 * - Content creation: 200 LEARN per published article
 * - Research contribution: 500 LEARN
 * - Mining while learning: 2-5x multiplier on all earnings
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

// ==================== INTERFACES ====================

export interface LearnWallet {
  id: string;
  studentNumber: string;
  studentName: string;
  
  // Balance
  learnBalance: number; // Current LEARN tokens
  azrBalance: number; // Converted AZR
  
  // Total earned
  totalEarned: number; // All-time LEARN earned
  totalConverted: number; // LEARN converted to AZR
  totalSpent: number; // LEARN spent on premium features
  
  // Staking
  stakedAmount: number;
  stakingAPY: number; // Annual percentage yield
  stakingRewards: number;
  
  // Mining multiplier (from active mining)
  miningActive: boolean;
  currentMultiplier: number; // 1x, 2x, 3x, 4x, or 5x
  
  // Stats
  totalTransactions: number;
  dailyStreak: number;
  lastActiveDate: Date;
  
  // Premium features
  premiumTier: 'free' | 'bronze' | 'silver' | 'gold' | 'platinum';
  premiumExpiresAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface LearnTransaction {
  id: string;
  transactionNumber: string;
  walletId: string;
  studentNumber: string;
  
  type: 'earn' | 'convert' | 'spend' | 'stake' | 'unstake' | 'reward';
  amount: number; // LEARN tokens
  
  source: string; // What triggered this (e.g., 'course-completion', 'assessment-pass')
  sourceId?: string; // ID of course, assessment, etc.
  
  multiplier: number; // Mining multiplier applied
  baseAmount: number; // Amount before multiplier
  bonusAmount: number; // Extra from multiplier
  
  // If conversion
  convertedToAZR?: number;
  exchangeRate?: number;
  
  // If spending
  purchaseType?: 'premium-upgrade' | 'certificate' | 'priority-support' | 'advanced-course';
  purchaseId?: string;
  
  status: 'pending' | 'completed' | 'failed';
  
  metadata?: any;
  createdAt: Date;
}

export interface EarningRule {
  id: string;
  activity: string;
  baseAmount: number; // Base LEARN tokens
  condition?: string; // Optional condition (e.g., ">70% score")
  bonusConditions?: {
    condition: string;
    bonusAmount: number;
  }[];
  cooldown?: number; // Milliseconds between earning this activity
  maxPerDay?: number;
  requiresMiningActive?: boolean; // Extra multiplier if mining
}

export interface PremiumTier {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  stakingRequired: number; // LEARN tokens to stake
  benefits: string[];
  multiplier: number; // Earning multiplier
  price: number; // Monthly cost in LEARN
}

// ==================== SERVICE ====================

export class LearnTokenService extends EventEmitter {
  private wallets: Map<string, LearnWallet> = new Map();
  private transactions: Map<string, LearnTransaction> = new Map();
  private earningRules: Map<string, EarningRule> = new Map();
  private premiumTiers: Map<string, PremiumTier> = new Map();
  
  private transactionCounter: number = 100000;
  
  // Token economics
  private readonly MAX_SUPPLY = 1_000_000_000; // 1 billion LEARN
  private totalMinted: number = 0;
  private totalBurned: number = 0;
  private readonly LEARN_TO_AZR_RATE = 10; // 10 LEARN = 1 AZR

  constructor(
    private config: {
      miningService: any; // To check mining status
      notificationService: any;
    }
  ) {
    super();
    this.initializeService();
  }

  private initializeService(): void {
    console.log('🎓 $LEARN Token Service initialized');
    this.loadEarningRules();
    this.loadPremiumTiers();
    this.startBackgroundJobs();
  }

  private loadEarningRules(): void {
    // Course completion
    this.earningRules.set('course-completion', {
      id: 'course-completion',
      activity: 'Complete a course',
      baseAmount: 100,
      cooldown: 0, // No cooldown
    });
    
    // Assessment pass
    this.earningRules.set('assessment-pass', {
      id: 'assessment-pass',
      activity: 'Pass an assessment',
      baseAmount: 50,
      condition: 'Score >= 70%',
      bonusConditions: [
        { condition: 'Score >= 90%', bonusAmount: 25 },
        { condition: 'Score = 100%', bonusAmount: 100 },
      ],
    });
    
    // Daily streak
    this.earningRules.set('daily-streak', {
      id: 'daily-streak',
      activity: 'Daily learning streak',
      baseAmount: 10,
      maxPerDay: 1,
    });
    
    // Help others
    this.earningRules.set('help-others', {
      id: 'help-others',
      activity: 'Help other students',
      baseAmount: 25,
      maxPerDay: 10, // Max 10 answers per day
    });
    
    // Content creation
    this.earningRules.set('content-creation', {
      id: 'content-creation',
      activity: 'Create educational content',
      baseAmount: 200,
      cooldown: 24 * 60 * 60 * 1000, // 1 day cooldown
    });
    
    // Research contribution
    this.earningRules.set('research-contribution', {
      id: 'research-contribution',
      activity: 'Contribute to research',
      baseAmount: 500,
      cooldown: 7 * 24 * 60 * 60 * 1000, // 1 week cooldown
    });
    
    console.log(`✅ Loaded ${this.earningRules.size} earning rules`);
  }

  private loadPremiumTiers(): void {
    this.premiumTiers.set('bronze', {
      tier: 'bronze',
      stakingRequired: 1000,
      benefits: ['Priority support', '1.5x earnings', 'Early access'],
      multiplier: 1.5,
      price: 100,
    });
    
    this.premiumTiers.set('silver', {
      tier: 'silver',
      stakingRequired: 5000,
      benefits: ['All Bronze +', '2x earnings', 'Advanced courses', 'Mentor access'],
      multiplier: 2.0,
      price: 300,
    });
    
    this.premiumTiers.set('gold', {
      tier: 'gold',
      stakingRequired: 20000,
      benefits: ['All Silver +', '3x earnings', '1-on-1 tutoring', 'Career support'],
      multiplier: 3.0,
      price: 1000,
    });
    
    this.premiumTiers.set('platinum', {
      tier: 'platinum',
      stakingRequired: 100000,
      benefits: ['All Gold +', '5x earnings', 'VIP access', 'Job guarantee'],
      multiplier: 5.0,
      price: 5000,
    });
  }

  private startBackgroundJobs(): void {
    // Process staking rewards daily
    setInterval(() => this.processStakingRewards(), 24 * 60 * 60 * 1000);
    
    // Check premium tier expirations hourly
    setInterval(() => this.checkPremiumExpirations(), 60 * 60 * 1000);
    
    // Update daily streaks at midnight
    setInterval(() => this.updateDailyStreaks(), 24 * 60 * 60 * 1000);
  }

  // ==================== WALLET MANAGEMENT ====================

  async createWallet(studentNumber: string, studentName: string): Promise<LearnWallet> {
    const walletId = uuidv4();
    
    const wallet: LearnWallet = {
      id: walletId,
      studentNumber,
      studentName,
      learnBalance: 0,
      azrBalance: 0,
      totalEarned: 0,
      totalConverted: 0,
      totalSpent: 0,
      stakedAmount: 0,
      stakingAPY: 12.5, // 12.5% APY
      stakingRewards: 0,
      miningActive: false,
      currentMultiplier: 1.0,
      totalTransactions: 0,
      dailyStreak: 0,
      lastActiveDate: new Date(),
      premiumTier: 'free',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.wallets.set(studentNumber, wallet);
    this.emit('wallet-created', wallet);
    
    // Welcome bonus: 50 LEARN
    await this.awardTokens(studentNumber, 'welcome-bonus', 50, 'Welcome to Azora!');
    
    return wallet;
  }

  async getWallet(studentNumber: string): Promise<LearnWallet> {
    let wallet = this.wallets.get(studentNumber);
    
    if (!wallet) {
      // Auto-create wallet
      wallet = await this.createWallet(studentNumber, 'Student');
    }
    
    // Update mining status
    await this.updateMiningMultiplier(studentNumber);
    
    return wallet;
  }

  // ==================== EARNING TOKENS ====================

  async awardTokens(
    studentNumber: string,
    activity: string,
    amount: number,
    description: string,
    metadata?: any
  ): Promise<LearnTransaction> {
    const wallet = await this.getWallet(studentNumber);
    
    // Check if we've hit max supply
    if (this.totalMinted >= this.MAX_SUPPLY) {
      throw new Error('Max LEARN supply reached');
    }
    
    // Get earning rule
    const rule = this.earningRules.get(activity);
    let baseAmount = amount;
    
    if (rule) {
      baseAmount = rule.baseAmount;
      
      // Check cooldown
      if (rule.cooldown) {
        // TODO: Check last transaction of this type
      }
      
      // Check max per day
      if (rule.maxPerDay) {
        // TODO: Count today's transactions of this type
      }
    }
    
    // Apply mining multiplier
    const multiplier = wallet.currentMultiplier;
    const finalAmount = baseAmount * multiplier;
    const bonusAmount = finalAmount - baseAmount;
    
    // Check premium tier multiplier
    const premiumMultiplier = this.getPremiumMultiplier(wallet.premiumTier);
    const finalWithPremium = finalAmount * premiumMultiplier;
    
    // Create transaction
    const transactionId = uuidv4();
    const transaction: LearnTransaction = {
      id: transactionId,
      transactionNumber: `LEARN-${this.transactionCounter++}`,
      walletId: wallet.id,
      studentNumber,
      type: 'earn',
      amount: finalWithPremium,
      source: activity,
      multiplier,
      baseAmount,
      bonusAmount,
      status: 'completed',
      metadata,
      createdAt: new Date(),
    };
    
    this.transactions.set(transactionId, transaction);
    
    // Update wallet
    wallet.learnBalance += finalWithPremium;
    wallet.totalEarned += finalWithPremium;
    wallet.totalTransactions++;
    wallet.lastActiveDate = new Date();
    wallet.updatedAt = new Date();
    
    // Update global supply
    this.totalMinted += finalWithPremium;
    
    this.emit('tokens-awarded', transaction);
    
    // Notify student
    await this.config.notificationService.send({
      to: studentNumber,
      type: 'learn-tokens-earned',
      title: `🎉 ${finalWithPremium.toFixed(0)} LEARN Earned!`,
      message: `${description}\n${multiplier > 1 ? `🔥 ${multiplier}x Mining Multiplier Applied!` : ''}${premiumMultiplier > 1 ? `⭐ ${premiumMultiplier}x Premium Bonus!` : ''}`,
    });
    
    return transaction;
  }

  // Convenience methods for common activities
  async rewardCourseCompletion(studentNumber: string, courseId: string, courseName: string): Promise<void> {
    await this.awardTokens(
      studentNumber,
      'course-completion',
      100,
      `Completed: ${courseName}`,
      { courseId, courseName }
    );
  }

  async rewardAssessmentPass(
    studentNumber: string,
    assessmentId: string,
    score: number
  ): Promise<void> {
    let bonusAmount = 0;
    let bonusDescription = '';
    
    if (score >= 90) {
      bonusAmount = 25;
      bonusDescription = ' (+25 for 90%+)';
    }
    if (score === 100) {
      bonusAmount += 100;
      bonusDescription = ' (+125 for perfect score!)';
    }
    
    await this.awardTokens(
      studentNumber,
      'assessment-pass',
      50 + bonusAmount,
      `Passed assessment with ${score}%${bonusDescription}`,
      { assessmentId, score }
    );
  }

  async rewardDailyStreak(studentNumber: string): Promise<void> {
    const wallet = await this.getWallet(studentNumber);
    
    await this.awardTokens(
      studentNumber,
      'daily-streak',
      10,
      `${wallet.dailyStreak} day streak! Keep it up!`,
      { streak: wallet.dailyStreak }
    );
  }

  // ==================== CONVERSION ====================

  async convertToAZR(studentNumber: string, learnAmount: number): Promise<number> {
    const wallet = await this.getWallet(studentNumber);
    
    if (wallet.learnBalance < learnAmount) {
      throw new Error('Insufficient LEARN balance');
    }
    
    const azrAmount = learnAmount / this.LEARN_TO_AZR_RATE;
    
    // Create transaction
    const transactionId = uuidv4();
    const transaction: LearnTransaction = {
      id: transactionId,
      transactionNumber: `CONVERT-${this.transactionCounter++}`,
      walletId: wallet.id,
      studentNumber,
      type: 'convert',
      amount: learnAmount,
      source: 'conversion',
      multiplier: 1,
      baseAmount: learnAmount,
      bonusAmount: 0,
      convertedToAZR: azrAmount,
      exchangeRate: this.LEARN_TO_AZR_RATE,
      status: 'completed',
      createdAt: new Date(),
    };
    
    this.transactions.set(transactionId, transaction);
    
    // Update wallet
    wallet.learnBalance -= learnAmount;
    wallet.azrBalance += azrAmount;
    wallet.totalConverted += learnAmount;
    wallet.totalTransactions++;
    wallet.updatedAt = new Date();
    
    // Burn LEARN tokens
    this.totalBurned += learnAmount;
    
    this.emit('tokens-converted', transaction);
    
    return azrAmount;
  }

  // ==================== STAKING ====================

  async stakeTokens(studentNumber: string, amount: number): Promise<void> {
    const wallet = await this.getWallet(studentNumber);
    
    if (wallet.learnBalance < amount) {
      throw new Error('Insufficient LEARN balance');
    }
    
    wallet.learnBalance -= amount;
    wallet.stakedAmount += amount;
    wallet.updatedAt = new Date();
    
    // Check if eligible for premium tier
    await this.checkPremiumTierEligibility(studentNumber);
    
    this.emit('tokens-staked', { studentNumber, amount });
  }

  async unstakeTokens(studentNumber: string, amount: number): Promise<void> {
    const wallet = await this.getWallet(studentNumber);
    
    if (wallet.stakedAmount < amount) {
      throw new Error('Insufficient staked balance');
    }
    
    wallet.stakedAmount -= amount;
    wallet.learnBalance += amount;
    wallet.updatedAt = new Date();
    
    // Check if premium tier needs to be downgraded
    await this.checkPremiumTierEligibility(studentNumber);
    
    this.emit('tokens-unstaked', { studentNumber, amount });
  }

  private async processStakingRewards(): Promise<void> {
    console.log('💰 Processing staking rewards...');
    
    for (const [studentNumber, wallet] of this.wallets) {
      if (wallet.stakedAmount > 0) {
        // Calculate daily reward (APY / 365)
        const dailyRate = wallet.stakingAPY / 100 / 365;
        const reward = wallet.stakedAmount * dailyRate;
        
        wallet.stakingRewards += reward;
        wallet.learnBalance += reward;
        wallet.totalEarned += reward;
        
        // Create reward transaction
        const transactionId = uuidv4();
        const transaction: LearnTransaction = {
          id: transactionId,
          transactionNumber: `REWARD-${this.transactionCounter++}`,
          walletId: wallet.id,
          studentNumber,
          type: 'reward',
          amount: reward,
          source: 'staking',
          multiplier: 1,
          baseAmount: reward,
          bonusAmount: 0,
          status: 'completed',
          createdAt: new Date(),
        };
        
        this.transactions.set(transactionId, transaction);
        this.totalMinted += reward;
      }
    }
  }

  // ==================== PREMIUM TIERS ====================

  private async checkPremiumTierEligibility(studentNumber: string): Promise<void> {
    const wallet = await this.getWallet(studentNumber);
    
    let newTier: LearnWallet['premiumTier'] = 'free';
    
    if (wallet.stakedAmount >= 100000) {
      newTier = 'platinum';
    } else if (wallet.stakedAmount >= 20000) {
      newTier = 'gold';
    } else if (wallet.stakedAmount >= 5000) {
      newTier = 'silver';
    } else if (wallet.stakedAmount >= 1000) {
      newTier = 'bronze';
    }
    
    if (newTier !== wallet.premiumTier) {
      const oldTier = wallet.premiumTier;
      wallet.premiumTier = newTier;
      wallet.updatedAt = new Date();
      
      this.emit('premium-tier-changed', { studentNumber, oldTier, newTier });
      
      if (newTier !== 'free') {
        await this.config.notificationService.send({
          to: studentNumber,
          type: 'premium-upgraded',
          title: `🎉 Premium ${newTier.toUpperCase()} Unlocked!`,
          message: `You've unlocked ${newTier} tier! Enjoy ${this.getPremiumMultiplier(newTier)}x earnings!`,
        });
      }
    }
  }

  private getPremiumMultiplier(tier: LearnWallet['premiumTier']): number {
    if (tier === 'free') return 1.0;
    const tierData = this.premiumTiers.get(tier);
    return tierData?.multiplier || 1.0;
  }

  private async checkPremiumExpirations(): Promise<void> {
    // Check if monthly payment is due
    const today = new Date();
    
    for (const [studentNumber, wallet] of this.wallets) {
      if (wallet.premiumTier === 'free') continue;
      if (!wallet.premiumExpiresAt) continue;
      
      if (wallet.premiumExpiresAt < today) {
        // Charge monthly fee
        const tier = this.premiumTiers.get(wallet.premiumTier);
        if (!tier) continue;
        
        if (wallet.learnBalance >= tier.price) {
          wallet.learnBalance -= tier.price;
          wallet.totalSpent += tier.price;
          wallet.premiumExpiresAt = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
          
          // Burn paid tokens
          this.totalBurned += tier.price;
        } else {
          // Downgrade to free
          wallet.premiumTier = 'free';
          wallet.premiumExpiresAt = undefined;
          
          await this.config.notificationService.send({
            to: studentNumber,
            type: 'premium-expired',
            title: '⚠️ Premium Expired',
            message: 'Your premium subscription has expired due to insufficient balance.',
          });
        }
      }
    }
  }

  // ==================== MINING INTEGRATION ====================

  private async updateMiningMultiplier(studentNumber: string): Promise<void> {
    const wallet = await this.getWallet(studentNumber);
    
    try {
      const miningStatus = await this.config.miningService.getMiningStatus(studentNumber);
      
      wallet.miningActive = miningStatus.active;
      
      if (miningStatus.active && miningStatus.learningDetected) {
        // Apply learning multiplier (2x-5x based on learning intensity)
        wallet.currentMultiplier = miningStatus.learningMultiplier || 2.0;
      } else {
        wallet.currentMultiplier = 1.0;
      }
    } catch (error) {
      wallet.miningActive = false;
      wallet.currentMultiplier = 1.0;
    }
  }

  // ==================== DAILY STREAKS ====================

  private async updateDailyStreaks(): Promise<void> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    for (const [studentNumber, wallet] of this.wallets) {
      const lastActive = new Date(wallet.lastActiveDate);
      
      if (lastActive.toDateString() === yesterday.toDateString()) {
        // Active yesterday, increment streak
        wallet.dailyStreak++;
        
        // Reward streak
        await this.rewardDailyStreak(studentNumber);
      } else {
        // Missed a day, reset streak
        wallet.dailyStreak = 0;
      }
    }
  }

  // ==================== ANALYTICS ====================

  async getWalletAnalytics(studentNumber: string): Promise<any> {
    const wallet = await this.getWallet(studentNumber);
    const transactions = Array.from(this.transactions.values())
      .filter(t => t.studentNumber === studentNumber)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return {
      wallet,
      transactions: transactions.slice(0, 50), // Last 50 transactions
      statistics: {
        totalSupply: this.totalMinted - this.totalBurned,
        maxSupply: this.MAX_SUPPLY,
        supplyPercentage: ((this.totalMinted - this.totalBurned) / this.MAX_SUPPLY) * 100,
        circulatingSupply: this.totalMinted - this.totalBurned,
        learnToAZRRate: this.LEARN_TO_AZR_RATE,
        totalWallets: this.wallets.size,
      },
    };
  }
}

// ==================== EXPORT ====================

export default LearnTokenService;
