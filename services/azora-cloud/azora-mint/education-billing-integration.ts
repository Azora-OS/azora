/**
 * Azora Mint - Education Billing Integration
 * Connects Sapiens University tuition payments to Azora Mint financial system
 * 
 * Features:
 * - Tuition invoice generation
 * - Payment plan management (monthly, quarterly, annual)
 * - Financial aid integration
 * - Scholarship management
 * - Parent wallet linking
 * - Auto-payment from Mint wallets
 * - Crypto payment acceptance (AZR, BTC, ETH, USDC)
 * - Mining earnings auto-apply to tuition
 * - Family education savings accounts
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

// ==================== INTERFACES ====================

export interface EducationAccount {
  id: string;
  studentNumber: string;
  studentName: string;
  institution: string; // 'primary', 'secondary', 'university', 'skills', etc.
  program: string;
  academicYear: string;
  
  // Financial
  totalTuitionFees: number; // Annual tuition
  additionalFees: {
    registration: number;
    technology: number;
    library: number;
    sports: number;
    insurance: number;
    other: number;
  };
  totalDue: number; // Total for year
  totalPaid: number;
  balance: number; // Outstanding
  
  // Payment methods
  preferredPaymentMethod: 'mint-wallet' | 'bank-transfer' | 'crypto' | 'card';
  autoPayEnabled: boolean;
  autoPaySource: 'student-wallet' | 'parent-wallet' | 'family-savings';
  
  // Mining integration
  miningEarningsAutoApply: boolean; // Auto-apply mining earnings to balance
  miningEarningsApplied: number; // Total mining earnings applied
  
  // Financial aid
  financialAid: FinancialAid[];
  scholarships: Scholarship[];
  
  // Payment plan
  paymentPlan?: PaymentPlan;
  
  // Linked accounts
  linkedWallets: {
    studentWallet?: string; // Mint wallet ID
    parentWallets: string[]; // Parent Mint wallet IDs
    familySavingsAccount?: string;
  };
  
  // Status
  accountStatus: 'active' | 'hold' | 'suspended' | 'graduated';
  holds: FinancialHold[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialAid {
  id: string;
  type: 'bursary' | 'loan' | 'work-study' | 'grant';
  provider: string; // 'azora-fund' | 'nsfas' | 'government' | 'private'
  amount: number;
  status: 'applied' | 'approved' | 'disbursed' | 'rejected';
  disbursementSchedule: {
    date: Date;
    amount: number;
    status: 'pending' | 'disbursed';
  }[];
  conditions?: string; // e.g., "Maintain 65% average"
  applicationDate: Date;
  approvalDate?: Date;
}

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: number; // Can be partial or full
  coverageType: 'full-tuition' | 'partial-tuition' | 'living-expenses' | 'books';
  percentage?: number; // If partial, e.g., 50% = half tuition
  duration: string; // 'semester' | 'year' | 'degree'
  renewable: boolean;
  renewalConditions?: string;
  awardedDate: Date;
}

export interface PaymentPlan {
  id: string;
  accountId: string;
  type: 'monthly' | 'quarterly' | 'semesterly' | 'annual';
  totalAmount: number;
  installments: Installment[];
  depositRequired: number; // Upfront deposit
  depositPaid: boolean;
  status: 'active' | 'completed' | 'defaulted';
  createdAt: Date;
}

export interface Installment {
  id: string;
  installmentNumber: number;
  dueDate: Date;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'waived';
  paidDate?: Date;
  paidAmount?: number;
  paymentMethod?: string;
  transactionId?: string;
}

export interface FinancialHold {
  id: string;
  accountId: string;
  type: 'registration' | 'transcript' | 'certificate' | 'graduation';
  reason: string;
  amountOwed: number;
  appliedDate: Date;
  status: 'active' | 'released';
  releasedDate?: Date;
}

export interface TuitionPayment {
  id: string;
  paymentNumber: string;
  accountId: string;
  studentNumber: string;
  
  amount: number;
  currency: 'ZAR' | 'USD' | 'AZR' | 'BTC' | 'ETH' | 'USDC';
  
  method: 'mint-wallet' | 'bank-transfer' | 'crypto' | 'card' | 'mining-earnings';
  source: string; // Wallet ID or bank account
  
  appliedTo: 'tuition' | 'registration' | 'library' | 'technology' | 'installment';
  installmentId?: string;
  
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  
  // Mining integration
  fromMiningEarnings: boolean;
  miningSessionId?: string;
  
  // Transaction details
  transactionHash?: string; // If crypto
  receiptUrl?: string;
  
  processedAt?: Date;
  createdAt: Date;
}

export interface FamilyEducationSavings {
  id: string;
  familyId: string;
  accountName: string;
  
  // Linked accounts
  parentWallets: string[];
  studentAccounts: string[]; // Multiple kids
  
  // Balance
  balance: number;
  currency: 'ZAR' | 'USD' | 'AZR';
  
  // Contributions
  monthlyContribution?: number;
  autoContribute: boolean;
  
  // Investment
  investInDefi: boolean; // Earn yield on savings
  currentAPY?: number;
  totalEarnings: number;
  
  // Mining integration
  familyMiningEnabled: boolean; // All family devices mine together
  miningEarnings: number;
  
  // Disbursement rules
  disbursementRules: {
    studentId: string;
    maxPerSemester: number;
    requiresApproval: boolean;
  }[];
  
  createdAt: Date;
  updatedAt: Date;
}

// ==================== SERVICE ====================

export class EducationBillingIntegration extends EventEmitter {
  private accounts: Map<string, EducationAccount> = new Map();
  private payments: Map<string, TuitionPayment> = new Map();
  private familySavings: Map<string, FamilyEducationSavings> = new Map();
  private paymentPlans: Map<string, PaymentPlan> = new Map();
  
  private paymentCounter: number = 100000;

  constructor(
    private config: {
      mintWalletService: any; // MintWalletService
      miningService: any; // MiningService
      defiService: any; // DefiService
      notificationService: any;
    }
  ) {
    super();
    this.initializeService();
  }

  private initializeService(): void {
    console.log('🎓💰 Education Billing Integration initialized');
    this.startBackgroundJobs();
  }

  private startBackgroundJobs(): void {
    // Check overdue payments daily
    setInterval(() => this.checkOverduePayments(), 24 * 60 * 60 * 1000);
    
    // Process auto-payments daily
    setInterval(() => this.processAutoPayments(), 24 * 60 * 60 * 1000);
    
    // Apply mining earnings hourly
    setInterval(() => this.applyMiningEarnings(), 60 * 60 * 1000);
    
    // Disburse financial aid monthly
    setInterval(() => this.disburseFinancialAid(), 30 * 24 * 60 * 60 * 1000);
  }

  // ==================== ACCOUNT MANAGEMENT ====================

  async createEducationAccount(data: {
    studentNumber: string;
    studentName: string;
    institution: string;
    program: string;
    academicYear: string;
    tuitionFees: number;
    additionalFees?: Partial<EducationAccount['additionalFees']>;
  }): Promise<EducationAccount> {
    const accountId = uuidv4();
    
    const additionalFees = {
      registration: data.additionalFees?.registration || 0,
      technology: data.additionalFees?.technology || 0,
      library: data.additionalFees?.library || 0,
      sports: data.additionalFees?.sports || 0,
      insurance: data.additionalFees?.insurance || 0,
      other: data.additionalFees?.other || 0,
    };
    
    const totalAdditional = Object.values(additionalFees).reduce((a, b) => a + b, 0);
    const totalDue = data.tuitionFees + totalAdditional;
    
    const account: EducationAccount = {
      id: accountId,
      studentNumber: data.studentNumber,
      studentName: data.studentName,
      institution: data.institution,
      program: data.program,
      academicYear: data.academicYear,
      totalTuitionFees: data.tuitionFees,
      additionalFees,
      totalDue,
      totalPaid: 0,
      balance: totalDue,
      preferredPaymentMethod: 'mint-wallet',
      autoPayEnabled: false,
      autoPaySource: 'student-wallet',
      miningEarningsAutoApply: true,
      miningEarningsApplied: 0,
      financialAid: [],
      scholarships: [],
      linkedWallets: {
        parentWallets: [],
      },
      accountStatus: 'active',
      holds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.accounts.set(accountId, account);
    
    // Auto-create student Mint wallet if not exists
    await this.createStudentWallet(data.studentNumber, data.studentName);
    
    this.emit('account-created', account);
    return account;
  }

  async linkWallet(
    accountId: string,
    walletId: string,
    walletType: 'student' | 'parent'
  ): Promise<void> {
    const account = this.accounts.get(accountId);
    if (!account) {throw new Error('Account not found');}
    
    if (walletType === 'student') {
      account.linkedWallets.studentWallet = walletId;
    } else {
      account.linkedWallets.parentWallets.push(walletId);
    }
    
    account.updatedAt = new Date();
    this.emit('wallet-linked', { accountId, walletId, walletType });
  }

  private async createStudentWallet(
    studentNumber: string,
    studentName: string
  ): Promise<string> {
    // Create Mint wallet via MintWalletService
    const wallet = await this.config.mintWalletService.createWallet({
      userId: studentNumber,
      userName: studentName,
      walletType: 'student',
      autoStakingEnabled: true,
      miningEnabled: true,
    });
    
    return wallet.id;
  }

  // ==================== PAYMENT PROCESSING ====================

  async processPayment(payment: {
    accountId: string;
    amount: number;
    currency: 'ZAR' | 'USD' | 'AZR' | 'BTC' | 'ETH' | 'USDC';
    method: TuitionPayment['method'];
    source: string;
    appliedTo: TuitionPayment['appliedTo'];
  }): Promise<TuitionPayment> {
    const account = this.accounts.get(payment.accountId);
    if (!account) {throw new Error('Account not found');}
    
    const paymentId = uuidv4();
    const paymentNumber = `PAY-EDU-${this.paymentCounter++}`;
    
    const tuitionPayment: TuitionPayment = {
      id: paymentId,
      paymentNumber,
      accountId: payment.accountId,
      studentNumber: account.studentNumber,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      source: payment.source,
      appliedTo: payment.appliedTo,
      status: 'pending',
      fromMiningEarnings: false,
      createdAt: new Date(),
    };
    
    this.payments.set(paymentId, tuitionPayment);
    
    // Process payment based on method
    try {
      if (payment.method === 'mint-wallet') {
        await this.processWalletPayment(tuitionPayment);
      } else if (payment.method === 'crypto') {
        await this.processCryptoPayment(tuitionPayment);
      } else if (payment.method === 'bank-transfer') {
        await this.processBankTransfer(tuitionPayment);
      }
      
      // Update account balance
      account.totalPaid += payment.amount;
      account.balance -= payment.amount;
      account.updatedAt = new Date();
      
      // Check if balance is cleared, release holds
      if (account.balance <= 0) {
        await this.releaseAllHolds(payment.accountId);
      }
      
      tuitionPayment.status = 'completed';
      tuitionPayment.processedAt = new Date();
      
      this.emit('payment-completed', tuitionPayment);
      
      // Send receipt
      await this.sendPaymentReceipt(tuitionPayment, account);
      
    } catch (error) {
      tuitionPayment.status = 'failed';
      this.emit('payment-failed', { payment: tuitionPayment, error });
      throw error;
    }
    
    return tuitionPayment;
  }

  private async processWalletPayment(payment: TuitionPayment): Promise<void> {
    // Deduct from Mint wallet
    await this.config.mintWalletService.deductFunds({
      walletId: payment.source,
      amount: payment.amount,
      currency: payment.currency,
      purpose: 'tuition-payment',
      reference: payment.paymentNumber,
    });
  }

  private async processCryptoPayment(payment: TuitionPayment): Promise<void> {
    // Process crypto payment (already handled by Mint crypto service)
    const tx = await this.config.mintWalletService.processCryptoPayment({
      fromAddress: payment.source,
      amount: payment.amount,
      currency: payment.currency,
      purpose: 'tuition',
    });
    
    payment.transactionHash = tx.hash;
  }

  private async processBankTransfer(payment: TuitionPayment): Promise<void> {
    // Process bank transfer (via Luno integration)
    await this.config.mintWalletService.processBankDeposit({
      accountNumber: payment.source,
      amount: payment.amount,
      reference: payment.paymentNumber,
    });
  }

  // ==================== MINING INTEGRATION ====================

  async applyMiningEarnings(): Promise<void> {
    console.log('⛏️ Applying mining earnings to tuition balances...');
    
    for (const [accountId, account] of this.accounts) {
      if (!account.miningEarningsAutoApply) {continue;}
      if (account.balance <= 0) {continue;}
      if (!account.linkedWallets.studentWallet) {continue;}
      
      try {
        // Get student's mining earnings
        const earnings = await this.config.miningService.getUnclaimedEarnings(
          account.studentNumber
        );
        
        if (earnings.totalAZR > 0) {
          // Convert to ZAR
          const zarAmount = earnings.totalAZR * 50; // Assume 1 AZR = R50
          
          // Apply to tuition
          const paymentId = uuidv4();
          const payment: TuitionPayment = {
            id: paymentId,
            paymentNumber: `MINING-${this.paymentCounter++}`,
            accountId,
            studentNumber: account.studentNumber,
            amount: Math.min(zarAmount, account.balance),
            currency: 'AZR',
            method: 'mining-earnings',
            source: account.linkedWallets.studentWallet,
            appliedTo: 'tuition',
            status: 'completed',
            fromMiningEarnings: true,
            miningSessionId: earnings.sessionId,
            processedAt: new Date(),
            createdAt: new Date(),
          };
          
          this.payments.set(paymentId, payment);
          
          // Update account
          account.totalPaid += payment.amount;
          account.balance -= payment.amount;
          account.miningEarningsApplied += payment.amount;
          account.updatedAt = new Date();
          
          this.emit('mining-earnings-applied', { account, payment });
          
          // Notify student
          await this.config.notificationService.send({
            to: account.studentNumber,
            type: 'mining-earnings-applied',
            title: '⛏️ Mining Earnings Applied to Tuition!',
            message: `R${payment.amount.toFixed(2)} from mining has been applied to your tuition. New balance: R${account.balance.toFixed(2)}`,
          });
        }
      } catch (error) {
        console.error(`Failed to apply mining earnings for ${account.studentNumber}:`, error);
      }
    }
  }

  // ==================== PAYMENT PLANS ====================

  async createPaymentPlan(request: {
    accountId: string;
    type: PaymentPlan['type'];
    depositAmount: number;
  }): Promise<PaymentPlan> {
    const account = this.accounts.get(request.accountId);
    if (!account) {throw new Error('Account not found');}
    
    const planId = uuidv4();
    const remainingBalance = account.balance - request.depositAmount;
    
    const installmentCount = this.getInstallmentCount(request.type);
    const installmentAmount = remainingBalance / installmentCount;
    
    const installments: Installment[] = [];
    const startDate = new Date();
    
    for (let i = 0; i < installmentCount; i++) {
      const dueDate = this.calculateDueDate(startDate, request.type, i + 1);
      
      installments.push({
        id: uuidv4(),
        installmentNumber: i + 1,
        dueDate,
        amount: installmentAmount,
        status: 'pending',
      });
    }
    
    const plan: PaymentPlan = {
      id: planId,
      accountId: request.accountId,
      type: request.type,
      totalAmount: account.balance,
      installments,
      depositRequired: request.depositAmount,
      depositPaid: false,
      status: 'active',
      createdAt: new Date(),
    };
    
    this.paymentPlans.set(planId, plan);
    account.paymentPlan = plan;
    
    this.emit('payment-plan-created', plan);
    return plan;
  }

  private getInstallmentCount(type: PaymentPlan['type']): number {
    switch (type) {
      case 'monthly': return 10; // 10 months
      case 'quarterly': return 4;
      case 'semesterly': return 2;
      case 'annual': return 1;
    }
  }

  private calculateDueDate(
    startDate: Date,
    type: PaymentPlan['type'],
    installmentNumber: number
  ): Date {
    const due = new Date(startDate);
    
    switch (type) {
      case 'monthly':
        due.setMonth(due.getMonth() + installmentNumber);
        break;
      case 'quarterly':
        due.setMonth(due.getMonth() + (installmentNumber * 3));
        break;
      case 'semesterly':
        due.setMonth(due.getMonth() + (installmentNumber * 6));
        break;
      case 'annual':
        due.setFullYear(due.getFullYear() + installmentNumber);
        break;
    }
    
    return due;
  }

  // ==================== AUTO-PAYMENTS ====================

  private async processAutoPayments(): Promise<void> {
    console.log('🤖 Processing auto-payments...');
    
    for (const [accountId, account] of this.accounts) {
      if (!account.autoPayEnabled) {continue;}
      if (account.balance <= 0) {continue;}
      if (!account.paymentPlan) {continue;}
      
      const plan = account.paymentPlan;
      const nextInstallment = plan.installments.find(i => i.status === 'pending');
      
      if (!nextInstallment) {continue;}
      
      // Check if due today
      const today = new Date();
      if (nextInstallment.dueDate.toDateString() === today.toDateString()) {
        try {
          let sourceWallet: string | undefined;
          
          if (account.autoPaySource === 'student-wallet') {
            sourceWallet = account.linkedWallets.studentWallet;
          } else if (account.autoPaySource === 'parent-wallet') {
            sourceWallet = account.linkedWallets.parentWallets[0];
          } else if (account.autoPaySource === 'family-savings') {
            sourceWallet = account.linkedWallets.familySavingsAccount;
          }
          
          if (!sourceWallet) {
            console.warn(`No source wallet for auto-payment: ${accountId}`);
            continue;
          }
          
          await this.processPayment({
            accountId,
            amount: nextInstallment.amount,
            currency: 'ZAR',
            method: 'mint-wallet',
            source: sourceWallet,
            appliedTo: 'installment',
          });
          
          nextInstallment.status = 'paid';
          nextInstallment.paidDate = new Date();
          
        } catch (error) {
          console.error(`Auto-payment failed for ${accountId}:`, error);
          
          // Notify student
          await this.config.notificationService.send({
            to: account.studentNumber,
            type: 'auto-payment-failed',
            title: '⚠️ Auto-Payment Failed',
            message: `Your auto-payment of R${nextInstallment.amount.toFixed(2)} failed. Please check your wallet balance.`,
          });
        }
      }
    }
  }

  // ==================== FINANCIAL HOLDS ====================

  async applyHold(
    accountId: string,
    hold: Omit<FinancialHold, 'id' | 'accountId' | 'appliedDate' | 'status'>
  ): Promise<void> {
    const account = this.accounts.get(accountId);
    if (!account) {throw new Error('Account not found');}
    
    const newHold: FinancialHold = {
      id: uuidv4(),
      accountId,
      ...hold,
      appliedDate: new Date(),
      status: 'active',
    };
    
    account.holds.push(newHold);
    account.accountStatus = 'hold';
    account.updatedAt = new Date();
    
    this.emit('hold-applied', newHold);
  }

  async releaseAllHolds(accountId: string): Promise<void> {
    const account = this.accounts.get(accountId);
    if (!account) {throw new Error('Account not found');}
    
    for (const hold of account.holds) {
      if (hold.status === 'active') {
        hold.status = 'released';
        hold.releasedDate = new Date();
      }
    }
    
    account.accountStatus = 'active';
    account.updatedAt = new Date();
    
    this.emit('holds-released', accountId);
  }

  // ==================== UTILITIES ====================

  private async checkOverduePayments(): Promise<void> {
    const today = new Date();
    
    for (const [accountId, account] of this.accounts) {
      if (!account.paymentPlan) {continue;}
      
      const overdueInstallments = account.paymentPlan.installments.filter(
        i => i.status === 'pending' && i.dueDate < today
      );
      
      if (overdueInstallments.length > 0) {
        for (const installment of overdueInstallments) {
          installment.status = 'overdue';
        }
        
        // Apply hold
        await this.applyHold(accountId, {
          type: 'registration',
          reason: 'Overdue payment',
          amountOwed: account.balance,
        });
        
        // Notify student
        await this.config.notificationService.send({
          to: account.studentNumber,
          type: 'payment-overdue',
          title: '🚨 Payment Overdue',
          message: `You have ${overdueInstallments.length} overdue payment(s). Total owed: R${account.balance.toFixed(2)}`,
        });
      }
    }
  }

  private async disburseFinancialAid(): Promise<void> {
    console.log('💰 Disbursing financial aid...');
    
    const today = new Date();
    
    for (const [accountId, account] of this.accounts) {
      for (const aid of account.financialAid) {
        if (aid.status !== 'approved') {continue;}
        
        for (const disbursement of aid.disbursementSchedule) {
          if (disbursement.status !== 'pending') {continue;}
          if (disbursement.date > today) {continue;}
          
          try {
            // Apply to account balance
            account.totalPaid += disbursement.amount;
            account.balance -= disbursement.amount;
            
            disbursement.status = 'disbursed';
            
            this.emit('financial-aid-disbursed', { account, aid, disbursement });
            
          } catch (error) {
            console.error(`Failed to disburse aid for ${account.studentNumber}:`, error);
          }
        }
      }
    }
  }

  private async sendPaymentReceipt(
    payment: TuitionPayment,
    account: EducationAccount
  ): Promise<void> {
    // Generate PDF receipt and email to student
    await this.config.notificationService.send({
      to: account.studentNumber,
      type: 'payment-receipt',
      title: '✅ Payment Received',
      message: `Your payment of R${payment.amount.toFixed(2)} has been received. New balance: R${account.balance.toFixed(2)}`,
      attachments: [
        {
          filename: `receipt-${payment.paymentNumber}.pdf`,
          content: await this.generateReceiptPDF(payment, account),
        },
      ],
    });
  }

  private async generateReceiptPDF(
    payment: TuitionPayment,
    account: EducationAccount
  ): Promise<Buffer> {
    // Generate PDF receipt (mock for now)
    return Buffer.from('PDF receipt');
  }

  // ==================== ANALYTICS ====================

  async getAccountSummary(accountId: string): Promise<any> {
    const account = this.accounts.get(accountId);
    if (!account) {throw new Error('Account not found');}
    
    const payments = Array.from(this.payments.values())
      .filter(p => p.accountId === accountId);
    
    return {
      account,
      payments,
      statistics: {
        totalPaid: account.totalPaid,
        balance: account.balance,
        percentagePaid: (account.totalPaid / account.totalDue) * 100,
        miningEarningsApplied: account.miningEarningsApplied,
        activeHolds: account.holds.filter(h => h.status === 'active').length,
      },
    };
  }
}

// ==================== EXPORT ====================

export default EducationBillingIntegration;
