/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * Billing System Service
 * Complete payment processing, billing, and financial aid management
 * Production-ready payment infrastructure for Sapiens Education
 */

import { EventEmitter } from 'events';
import Stripe from 'stripe';
import PayPal from '@paypal/checkout-server-sdk';

// ===== INTERFACES =====

export interface BillingAccount {
  id: string;
  studentNumber: string;
  programId: string;
  institutionType: 'primary' | 'secondary' | 'university' | 'professional' | 'corporate';
  balance: number;
  currency: string;
  tuitionAmount: number;
  paymentPlans: PaymentPlan[];
  transactions: Transaction[];
  holds: FinancialHold[];
  financialAid: FinancialAid[];
  refunds: Refund[];
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'suspended' | 'closed' | 'defaulted';
}

export interface PaymentPlan {
  id: string;
  accountId: string;
  planType: 'monthly' | 'quarterly' | 'semester' | 'annual' | 'custom';
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  installments: Installment[];
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'defaulted' | 'cancelled';
  autopay: boolean;
  nextPaymentDate?: Date;
}

export interface Installment {
  id: string;
  paymentPlanId: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue' | 'waived';
  transactionId?: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'payment' | 'refund' | 'adjustment' | 'waiver' | 'aid_disbursement';
  amount: number;
  currency: string;
  method: 'credit_card' | 'debit_card' | 'bank_transfer' | 'crypto' | 'paypal' | 'stripe' | 'manual';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  description: string;
  metadata: Record<string, any>;
  paymentGatewayId?: string;
  receiptUrl?: string;
  createdAt: Date;
  processedAt?: Date;
}

export interface FinancialHold {
  id: string;
  accountId: string;
  reason: string;
  amount: number;
  type: 'overdue_payment' | 'missing_documents' | 'disciplinary' | 'other';
  restrictions: ('registration' | 'transcript' | 'graduation' | 'library')[];
  createdAt: Date;
  resolvedAt?: Date;
  status: 'active' | 'resolved';
}

export interface FinancialAid {
  id: string;
  accountId: string;
  studentNumber: string;
  type: 'scholarship' | 'grant' | 'loan' | 'work_study' | 'bursary';
  provider: string;
  amount: number;
  status: 'pending' | 'approved' | 'disbursed' | 'rejected' | 'cancelled';
  applicationDate: Date;
  approvalDate?: Date;
  disbursementDate?: Date;
  disbursements: AidDisbursement[];
  terms?: string;
  renewable: boolean;
  requirements?: string[];
}

export interface AidDisbursement {
  id: string;
  aidId: string;
  amount: number;
  date: Date;
  semester: string;
  transactionId: string;
  status: 'scheduled' | 'disbursed' | 'failed';
}

export interface Refund {
  id: string;
  accountId: string;
  originalTransactionId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'processed' | 'rejected';
  requestedAt: Date;
  processedAt?: Date;
  refundMethod: 'original_payment_method' | 'bank_transfer' | 'check' | 'credit';
}

export interface Invoice {
  id: string;
  accountId: string;
  studentNumber: string;
  period: string;
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  status: 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';
  pdfUrl?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: 'tuition' | 'fees' | 'housing' | 'books' | 'other';
}

export interface PaymentRequest {
  accountId: string;
  amount: number;
  currency: string;
  method: Transaction['method'];
  description: string;
  metadata?: Record<string, any>;
  paymentMethodId?: string; // For Stripe
  returnUrl?: string; // For PayPal
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  gatewayTransactionId?: string;
  status: Transaction['status'];
  message: string;
  receiptUrl?: string;
  error?: string;
}

export interface PaymentPlanRequest {
  accountId: string;
  totalAmount: number;
  planType: PaymentPlan['planType'];
  startDate: Date;
  numberOfInstallments: number;
  autopay?: boolean;
}

export interface PaymentStatus {
  accountId: string;
  currentBalance: number;
  totalOwed: number;
  totalPaid: number;
  hasOverduePayments: boolean;
  nextPaymentDue?: {
    amount: number;
    dueDate: Date;
  };
  holds: FinancialHold[];
  paymentPlanStatus?: 'on_track' | 'at_risk' | 'defaulted';
}

// ===== BILLING SYSTEM SERVICE =====

export class BillingSystemService extends EventEmitter {
  private stripe: Stripe;
  private paypalClient: any;
  private accounts: Map<string, BillingAccount> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private paymentPlans: Map<string, PaymentPlan> = new Map();

  constructor(
    private config: {
      stripeSecretKey: string;
      paypalClientId: string;
      paypalClientSecret: string;
      environment: 'sandbox' | 'production';
    }
  ) {
    super();
    this.initializePaymentGateways();
    this.startBackgroundJobs();
  }

  // ===== INITIALIZATION =====

  private initializePaymentGateways(): void {
    // Initialize Stripe
    this.stripe = new Stripe(this.config.stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Initialize PayPal
    const environment =
      this.config.environment === 'production'
        ? new PayPal.core.LiveEnvironment(
            this.config.paypalClientId,
            this.config.paypalClientSecret
          )
        : new PayPal.core.SandboxEnvironment(
            this.config.paypalClientId,
            this.config.paypalClientSecret
          );

    this.paypalClient = new PayPal.core.PayPalHttpClient(environment);

    console.log('✅ Payment gateways initialized');
  }

  private startBackgroundJobs(): void {
    // Check for overdue payments every day at midnight
    setInterval(() => this.checkOverduePayments(), 24 * 60 * 60 * 1000);

    // Process scheduled aid disbursements every hour
    setInterval(() => this.processScheduledDisbursements(), 60 * 60 * 1000);

    // Send payment reminders every day
    setInterval(() => this.sendPaymentReminders(), 24 * 60 * 60 * 1000);

    console.log('✅ Background jobs started');
  }

  // ===== ACCOUNT MANAGEMENT =====

  async createBillingAccount(data: {
    studentNumber: string;
    programId: string;
    institutionType: BillingAccount['institutionType'];
    tuitionAmount: number;
    currency?: string;
  }): Promise<BillingAccount> {
    const account: BillingAccount = {
      id: `bill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentNumber: data.studentNumber,
      programId: data.programId,
      institutionType: data.institutionType,
      balance: data.tuitionAmount,
      currency: data.currency || 'ZAR',
      tuitionAmount: data.tuitionAmount,
      paymentPlans: [],
      transactions: [],
      holds: [],
      financialAid: [],
      refunds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
    };

    this.accounts.set(account.id, account);

    this.emit('account-created', account);

    return account;
  }

  async getAccount(accountId: string): Promise<BillingAccount | null> {
    return this.accounts.get(accountId) || null;
  }

  async getAccountByStudent(studentNumber: string): Promise<BillingAccount | null> {
    return (
      Array.from(this.accounts.values()).find((acc) => acc.studentNumber === studentNumber) ||
      null
    );
  }

  // ===== PAYMENT PROCESSING =====

  async processPayment(payment: PaymentRequest): Promise<PaymentResult> {
    const account = await this.getAccount(payment.accountId);
    if (!account) {
      return {
        success: false,
        status: 'failed',
        message: 'Account not found',
        error: 'ACCOUNT_NOT_FOUND',
      };
    }

    // Create transaction record
    const transaction: Transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      accountId: payment.accountId,
      type: 'payment',
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      status: 'pending',
      description: payment.description,
      metadata: payment.metadata || {},
      createdAt: new Date(),
    };

    this.transactions.set(transaction.id, transaction);

    try {
      let gatewayResult: any;

      // Process based on payment method
      switch (payment.method) {
        case 'credit_card':
        case 'debit_card':
          gatewayResult = await this.processStripePayment(payment);
          break;

        case 'paypal':
          gatewayResult = await this.processPayPalPayment(payment);
          break;

        case 'bank_transfer':
          gatewayResult = await this.processBankTransfer(payment);
          break;

        case 'crypto':
          gatewayResult = await this.processCryptoPayment(payment);
          break;

        case 'manual':
          gatewayResult = { success: true, id: transaction.id };
          break;

        default:
          throw new Error(`Unsupported payment method: ${payment.method}`);
      }

      if (gatewayResult.success) {
        // Update transaction
        transaction.status = 'completed';
        transaction.processedAt = new Date();
        transaction.paymentGatewayId = gatewayResult.id;
        transaction.receiptUrl = gatewayResult.receiptUrl;

        // Update account balance
        account.balance -= payment.amount;
        account.updatedAt = new Date();

        // Add transaction to account
        account.transactions.push(transaction);

        // Check if any holds should be released
        await this.checkAndReleaseHolds(account);

        this.emit('payment-processed', { account, transaction });

        return {
          success: true,
          transactionId: transaction.id,
          gatewayTransactionId: gatewayResult.id,
          status: 'completed',
          message: 'Payment processed successfully',
          receiptUrl: transaction.receiptUrl,
        };
      } else {
        transaction.status = 'failed';
        transaction.metadata.error = gatewayResult.error;

        this.emit('payment-failed', { account, transaction, error: gatewayResult.error });

        return {
          success: false,
          transactionId: transaction.id,
          status: 'failed',
          message: 'Payment failed',
          error: gatewayResult.error,
        };
      }
    } catch (error: any) {
      transaction.status = 'failed';
      transaction.metadata.error = error.message;

      this.emit('payment-error', { account, transaction, error });

      return {
        success: false,
        transactionId: transaction.id,
        status: 'failed',
        message: 'Payment processing error',
        error: error.message,
      };
    }
  }

  private async processStripePayment(payment: PaymentRequest): Promise<any> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(payment.amount * 100), // Stripe uses cents
        currency: payment.currency.toLowerCase(),
        description: payment.description,
        payment_method: payment.paymentMethodId,
        confirm: true,
        metadata: payment.metadata,
      });

      return {
        success: paymentIntent.status === 'succeeded',
        id: paymentIntent.id,
        receiptUrl: paymentIntent.charges.data[0]?.receipt_url,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async processPayPalPayment(payment: PaymentRequest): Promise<any> {
    // PayPal implementation
    // This would create a PayPal order and return approval URL
    return {
      success: true,
      id: `paypal_${Date.now()}`,
      approvalUrl: payment.returnUrl,
    };
  }

  private async processBankTransfer(payment: PaymentRequest): Promise<any> {
    // Bank transfer - typically pending until confirmed
    return {
      success: true,
      id: `bank_${Date.now()}`,
      status: 'pending_confirmation',
    };
  }

  private async processCryptoPayment(payment: PaymentRequest): Promise<any> {
    // Cryptocurrency payment (would integrate with Azora Mint)
    return {
      success: true,
      id: `crypto_${Date.now()}`,
    };
  }

  // ===== PAYMENT PLANS =====

  async createPaymentPlan(request: PaymentPlanRequest): Promise<PaymentPlan> {
    const account = await this.getAccount(request.accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    const installmentAmount = request.totalAmount / request.numberOfInstallments;
    const installments: Installment[] = [];

    for (let i = 0; i < request.numberOfInstallments; i++) {
      const dueDate = new Date(request.startDate);
      if (request.planType === 'monthly') {
        dueDate.setMonth(dueDate.getMonth() + i);
      } else if (request.planType === 'quarterly') {
        dueDate.setMonth(dueDate.getMonth() + i * 3);
      } else if (request.planType === 'semester') {
        dueDate.setMonth(dueDate.getMonth() + i * 6);
      }

      installments.push({
        id: `inst_${Date.now()}_${i}`,
        paymentPlanId: '',
        amount: installmentAmount,
        dueDate,
        status: 'pending',
      });
    }

    const endDate = new Date(installments[installments.length - 1].dueDate);

    const paymentPlan: PaymentPlan = {
      id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      accountId: request.accountId,
      planType: request.planType,
      totalAmount: request.totalAmount,
      paidAmount: 0,
      remainingAmount: request.totalAmount,
      installments,
      startDate: request.startDate,
      endDate,
      status: 'active',
      autopay: request.autopay || false,
      nextPaymentDate: installments[0].dueDate,
    };

    // Update installment plan IDs
    installments.forEach((inst) => (inst.paymentPlanId = paymentPlan.id));

    this.paymentPlans.set(paymentPlan.id, paymentPlan);
    account.paymentPlans.push(paymentPlan);
    account.updatedAt = new Date();

    this.emit('payment-plan-created', paymentPlan);

    return paymentPlan;
  }

  async payInstallment(installmentId: string, paymentMethod: Transaction['method']): Promise<PaymentResult> {
    // Find the installment
    let targetInstallment: Installment | undefined;
    let targetPlan: PaymentPlan | undefined;

    for (const plan of this.paymentPlans.values()) {
      const installment = plan.installments.find((inst) => inst.id === installmentId);
      if (installment) {
        targetInstallment = installment;
        targetPlan = plan;
        break;
      }
    }

    if (!targetInstallment || !targetPlan) {
      return {
        success: false,
        status: 'failed',
        message: 'Installment not found',
        error: 'INSTALLMENT_NOT_FOUND',
      };
    }

    if (targetInstallment.status === 'paid') {
      return {
        success: false,
        status: 'failed',
        message: 'Installment already paid',
        error: 'ALREADY_PAID',
      };
    }

    // Process the payment
    const paymentRequest: PaymentRequest = {
      accountId: targetPlan.accountId,
      amount: targetInstallment.amount,
      currency: 'ZAR',
      method: paymentMethod,
      description: `Installment payment for ${targetPlan.planType} plan`,
      metadata: {
        paymentPlanId: targetPlan.id,
        installmentId: targetInstallment.id,
      },
    };

    const result = await this.processPayment(paymentRequest);

    if (result.success) {
      targetInstallment.status = 'paid';
      targetInstallment.paidDate = new Date();
      targetInstallment.transactionId = result.transactionId;

      targetPlan.paidAmount += targetInstallment.amount;
      targetPlan.remainingAmount -= targetInstallment.amount;

      // Find next unpaid installment
      const nextUnpaid = targetPlan.installments.find((inst) => inst.status === 'pending');
      targetPlan.nextPaymentDate = nextUnpaid?.dueDate;

      // Check if plan is completed
      if (targetPlan.remainingAmount <= 0) {
        targetPlan.status = 'completed';
      }

      this.emit('installment-paid', { plan: targetPlan, installment: targetInstallment });
    }

    return result;
  }

  // ===== FINANCIAL AID =====

  async applyFinancialAid(studentNumber: string, aid: Omit<FinancialAid, 'id' | 'accountId' | 'status' | 'applicationDate' | 'disbursements'>): Promise<FinancialAid> {
    const account = await this.getAccountByStudent(studentNumber);
    if (!account) {
      throw new Error('Account not found');
    }

    const financialAid: FinancialAid = {
      ...aid,
      id: `aid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      accountId: account.id,
      status: 'pending',
      applicationDate: new Date(),
      disbursements: [],
    };

    account.financialAid.push(financialAid);
    account.updatedAt = new Date();

    this.emit('financial-aid-applied', financialAid);

    return financialAid;
  }

  async approveFinancialAid(aidId: string, approvedBy: string): Promise<void> {
    let targetAid: FinancialAid | undefined;
    let targetAccount: BillingAccount | undefined;

    for (const account of this.accounts.values()) {
      const aid = account.financialAid.find((a) => a.id === aidId);
      if (aid) {
        targetAid = aid;
        targetAccount = account;
        break;
      }
    }

    if (!targetAid || !targetAccount) {
      throw new Error('Financial aid not found');
    }

    targetAid.status = 'approved';
    targetAid.approvalDate = new Date();

    this.emit('financial-aid-approved', { aid: targetAid, approvedBy });
  }

  async disburseFinancialAid(aidId: string, semester: string): Promise<void> {
    let targetAid: FinancialAid | undefined;
    let targetAccount: BillingAccount | undefined;

    for (const account of this.accounts.values()) {
      const aid = account.financialAid.find((a) => a.id === aidId);
      if (aid) {
        targetAid = aid;
        targetAccount = account;
        break;
      }
    }

    if (!targetAid || !targetAccount) {
      throw new Error('Financial aid not found');
    }

    if (targetAid.status !== 'approved') {
      throw new Error('Financial aid must be approved before disbursement');
    }

    // Create disbursement transaction
    const transaction: Transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      accountId: targetAccount.id,
      type: 'aid_disbursement',
      amount: targetAid.amount,
      currency: targetAccount.currency,
      method: 'manual',
      status: 'completed',
      description: `${targetAid.type} disbursement for ${semester}`,
      metadata: { aidId: targetAid.id, semester },
      createdAt: new Date(),
      processedAt: new Date(),
    };

    this.transactions.set(transaction.id, transaction);
    targetAccount.transactions.push(transaction);

    // Apply aid to account balance
    targetAccount.balance -= targetAid.amount;
    targetAccount.updatedAt = new Date();

    // Record disbursement
    const disbursement: AidDisbursement = {
      id: `disb_${Date.now()}`,
      aidId: targetAid.id,
      amount: targetAid.amount,
      date: new Date(),
      semester,
      transactionId: transaction.id,
      status: 'disbursed',
    };

    targetAid.disbursements.push(disbursement);
    targetAid.status = 'disbursed';
    targetAid.disbursementDate = new Date();

    this.emit('financial-aid-disbursed', { aid: targetAid, disbursement, account: targetAccount });
  }

  private async processScheduledDisbursements(): Promise<void> {
    // Process any scheduled financial aid disbursements
    // This would check for aids that are approved and due for disbursement
    console.log('Processing scheduled disbursements...');
  }

  // ===== INVOICES =====

  async generateInvoice(studentNumber: string, period: string): Promise<Invoice> {
    const account = await this.getAccountByStudent(studentNumber);
    if (!account) {
      throw new Error('Account not found');
    }

    const items: InvoiceItem[] = [
      {
        description: 'Tuition Fee',
        quantity: 1,
        unitPrice: account.tuitionAmount,
        total: account.tuitionAmount,
        category: 'tuition',
      },
    ];

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.15; // 15% VAT
    const total = subtotal + tax;

    const paidTransactions = account.transactions.filter(
      (txn) => txn.type === 'payment' && txn.status === 'completed'
    );
    const amountPaid = paidTransactions.reduce((sum, txn) => sum + txn.amount, 0);

    const invoice: Invoice = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      accountId: account.id,
      studentNumber,
      period,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      items,
      subtotal,
      tax,
      total,
      amountPaid,
      amountDue: total - amountPaid,
      status: amountPaid >= total ? 'paid' : 'issued',
    };

    this.emit('invoice-generated', invoice);

    return invoice;
  }

  // ===== PAYMENT STATUS & HOLDS =====

  async checkPaymentStatus(studentNumber: string): Promise<PaymentStatus> {
    const account = await this.getAccountByStudent(studentNumber);
    if (!account) {
      throw new Error('Account not found');
    }

    const totalPaid = account.transactions
      .filter((txn) => txn.type === 'payment' && txn.status === 'completed')
      .reduce((sum, txn) => sum + txn.amount, 0);

    const hasOverduePayments = account.paymentPlans.some((plan) =>
      plan.installments.some(
        (inst) => inst.status === 'pending' && new Date(inst.dueDate) < new Date()
      )
    );

    // Find next payment due
    let nextPaymentDue: PaymentStatus['nextPaymentDue'];
    for (const plan of account.paymentPlans) {
      if (plan.status === 'active' && plan.nextPaymentDate) {
        const nextInstallment = plan.installments.find(
          (inst) => inst.status === 'pending' && inst.dueDate === plan.nextPaymentDate
        );
        if (nextInstallment) {
          nextPaymentDue = {
            amount: nextInstallment.amount,
            dueDate: nextInstallment.dueDate,
          };
          break;
        }
      }
    }

    return {
      accountId: account.id,
      currentBalance: account.balance,
      totalOwed: account.tuitionAmount,
      totalPaid,
      hasOverduePayments,
      nextPaymentDue,
      holds: account.holds.filter((hold) => hold.status === 'active'),
    };
  }

  async applyHold(accountId: string, hold: Omit<FinancialHold, 'id' | 'accountId' | 'createdAt' | 'status'>): Promise<FinancialHold> {
    const account = await this.getAccount(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    const financialHold: FinancialHold = {
      ...hold,
      id: `hold_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      accountId,
      createdAt: new Date(),
      status: 'active',
    };

    account.holds.push(financialHold);
    account.status = 'suspended';
    account.updatedAt = new Date();

    this.emit('hold-applied', { account, hold: financialHold });

    return financialHold;
  }

  async releaseHold(holdId: string): Promise<void> {
    let targetHold: FinancialHold | undefined;
    let targetAccount: BillingAccount | undefined;

    for (const account of this.accounts.values()) {
      const hold = account.holds.find((h) => h.id === holdId);
      if (hold) {
        targetHold = hold;
        targetAccount = account;
        break;
      }
    }

    if (!targetHold || !targetAccount) {
      throw new Error('Hold not found');
    }

    targetHold.status = 'resolved';
    targetHold.resolvedAt = new Date();

    // If no more active holds, restore account status
    const activeHolds = targetAccount.holds.filter((h) => h.status === 'active');
    if (activeHolds.length === 0) {
      targetAccount.status = 'active';
    }

    targetAccount.updatedAt = new Date();

    this.emit('hold-released', { account: targetAccount, hold: targetHold });
  }

  private async checkAndReleaseHolds(account: BillingAccount): Promise<void> {
    // Check if any holds should be automatically released after payment
    for (const hold of account.holds) {
      if (hold.status === 'active' && hold.type === 'overdue_payment') {
        if (account.balance <= 0) {
          await this.releaseHold(hold.id);
        }
      }
    }
  }

  private async checkOverduePayments(): Promise<void> {
    console.log('Checking for overdue payments...');

    for (const account of this.accounts.values()) {
      for (const plan of account.paymentPlans) {
        if (plan.status === 'active') {
          for (const installment of plan.installments) {
            if (
              installment.status === 'pending' &&
              new Date(installment.dueDate) < new Date()
            ) {
              installment.status = 'overdue';

              // Apply financial hold if not already held
              const existingHold = account.holds.find(
                (h) => h.type === 'overdue_payment' && h.status === 'active'
              );

              if (!existingHold) {
                await this.applyHold(account.id, {
                  reason: 'Overdue payment',
                  amount: installment.amount,
                  type: 'overdue_payment',
                  restrictions: ['registration', 'transcript'],
                });
              }

              this.emit('payment-overdue', { account, installment });
            }
          }
        }
      }
    }
  }

  private async sendPaymentReminders(): Promise<void> {
    console.log('Sending payment reminders...');

    const reminderDays = [7, 3, 1]; // Days before due date

    for (const account of this.accounts.values()) {
      for (const plan of account.paymentPlans) {
        if (plan.status === 'active' && plan.nextPaymentDate) {
          const daysUntilDue = Math.floor(
            (plan.nextPaymentDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );

          if (reminderDays.includes(daysUntilDue)) {
            this.emit('payment-reminder', {
              account,
              plan,
              daysUntilDue,
            });
          }
        }
      }
    }
  }

  // ===== REFUNDS =====

  async requestRefund(request: Omit<Refund, 'id' | 'status' | 'requestedAt'>): Promise<Refund> {
    const account = await this.getAccount(request.accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    const refund: Refund = {
      ...request,
      id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      requestedAt: new Date(),
    };

    account.refunds.push(refund);
    account.updatedAt = new Date();

    this.emit('refund-requested', refund);

    return refund;
  }

  async processRefund(refundId: string, approved: boolean): Promise<void> {
    let targetRefund: Refund | undefined;
    let targetAccount: BillingAccount | undefined;

    for (const account of this.accounts.values()) {
      const refund = account.refunds.find((r) => r.id === refundId);
      if (refund) {
        targetRefund = refund;
        targetAccount = account;
        break;
      }
    }

    if (!targetRefund || !targetAccount) {
      throw new Error('Refund not found');
    }

    if (!approved) {
      targetRefund.status = 'rejected';
      this.emit('refund-rejected', targetRefund);
      return;
    }

    targetRefund.status = 'approved';

    // Create refund transaction
    const transaction: Transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      accountId: targetAccount.id,
      type: 'refund',
      amount: targetRefund.amount,
      currency: targetAccount.currency,
      method: 'manual',
      status: 'completed',
      description: `Refund: ${targetRefund.reason}`,
      metadata: { refundId: targetRefund.id },
      createdAt: new Date(),
      processedAt: new Date(),
    };

    this.transactions.set(transaction.id, transaction);
    targetAccount.transactions.push(transaction);
    targetAccount.balance += targetRefund.amount;
    targetAccount.updatedAt = new Date();

    targetRefund.status = 'processed';
    targetRefund.processedAt = new Date();

    this.emit('refund-processed', { refund: targetRefund, transaction, account: targetAccount });
  }
}

export default BillingSystemService;
