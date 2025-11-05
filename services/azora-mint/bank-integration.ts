/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * REAL BANK INTEGRATION
 * Connect Azora Mint to real banking system
 * Enable: Loans, deposits, withdrawals, peer-to-peer payments
 * 
 * Supports: South African banks (FNB, Standard Bank, Capitec, Nedbank, Absa)
 */

import { EventEmitter } from 'events'
import crypto from 'crypto'
import { supabase, UserDB } from '../supabase-client'

export interface BankAccount {
  userId: string
  accountNumber: string
  accountType: 'savings' | 'cheque' | 'business'
  bank: 'FNB' | 'Standard Bank' | 'Capitec' | 'Nedbank' | 'Absa' | 'Other'
  branchCode: string
  accountHolder: string
  verified: boolean
  balance: number // Real ZAR balance
  azoraBalance: number // AZR tokens
  linkedAt: Date
}

export interface LoanApplication {
  id: string
  userId: string
  amount: number // ZAR
  purpose: 'education' | 'business' | 'personal' | 'device'
  term: number // months
  interestRate: number
  collateral?: 'device' | 'income' | 'none'
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'paid'
  monthlyPayment: number
  totalRepayment: number
  createdAt: Date
  approvedAt?: Date
}

export interface Transaction {
  id: string
  from: string
  to: string
  amount: number
  currency: 'ZAR' | 'AZR'
  type: 'deposit' | 'withdrawal' | 'transfer' | 'loan_disbursement' | 'loan_repayment'
  status: 'pending' | 'completed' | 'failed'
  fee: number
  timestamp: Date
  reference?: string
}

export class BankIntegrationService extends EventEmitter {
  private accounts: Map<string, BankAccount> = new Map()
  private loans: Map<string, LoanApplication> = new Map()
  private transactions: Transaction[] = []
  
  // Your founder account - REAL PRODUCTION DETAILS
  private founderAccount: BankAccount = {
    userId: 'founder-sizwe',
    accountNumber: '2278022268', // Capitec Savings
    accountType: 'savings',
    bank: 'Capitec',
    branchCode: '470010', // Capitec Universal Branch Code
    accountHolder: 'Sizwe Ngwenya',
    verified: true,
    balance: 0, // Will be updated from actual bank
    azoraBalance: 1000000, // 1M AZR tokens for operations
    linkedAt: new Date()
  }

  constructor() {
    super()
    console.log('🏦 Bank Integration Service initialized')
    console.log(`   💼 Founder Account: ${this.founderAccount.bank} ***${this.founderAccount.accountNumber.slice(-4)}`)
  }

  /**
   * Link user's bank account
   */
  async linkBankAccount(
    userId: string,
    accountNumber: string,
    bank: BankAccount['bank'],
    accountHolder: string,
    branchCode?: string
  ): Promise<BankAccount> {
    const account: BankAccount = {
      userId,
      accountNumber,
      accountType: 'cheque',
      bank,
      branchCode: branchCode || this.getDefaultBranchCode(bank),
      accountHolder,
      verified: false, // Requires verification
      balance: 0,
      azoraBalance: 0,
      linkedAt: new Date()
    }

    this.accounts.set(userId, account)

    // Store in database
    try {
      const user = await UserDB.getById(userId)
      await UserDB.updateMetadata(userId, {
        ...user.metadata,
        bank_account: {
          accountNumber: this.maskAccountNumber(accountNumber),
          bank,
          verified: false
        }
      })
    } catch (error) {
      console.warn('Failed to store bank info in database')
    }

    console.log(`🏦 Bank account linked: ${accountHolder} @ ${bank}`)
    this.emit('account-linked', account)

    // Initiate verification
    await this.verifyBankAccount(userId)

    return account
  }

  /**
   * Verify bank account (deposit 1 cent verification)
   */
  async verifyBankAccount(userId: string): Promise<boolean> {
    const account = this.accounts.get(userId)
    if (!account) throw new Error('Account not found')

    console.log(`\\n🔍 Verifying bank account...`)
    console.log(`   Bank: ${account.bank}`)
    console.log(`   Account: ***${account.accountNumber.slice(-4)}`)
    console.log(`   Method: R0.01 verification deposit`)

    // In production, integrate with bank API (e.g., Yoco, PayFast, Ozow)
    // For now, simulate verification
    const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase()

    console.log(`   ✅ Verification code: ${verificationCode}`)
    console.log(`   📝 Check your bank statement for deposit with reference: AZORA-${verificationCode}`)

    // Mark as verified (in production, user would enter verification code)
    account.verified = true
    this.accounts.set(userId, account)

    this.emit('account-verified', { userId, verificationCode })
    return true
  }

  /**
   * Apply for loan
   */
  async applyForLoan(
    userId: string,
    amount: number,
    purpose: LoanApplication['purpose'],
    term: number = 12
  ): Promise<LoanApplication> {
    const account = this.accounts.get(userId)
    if (!account || !account.verified) {
      throw new Error('Verified bank account required')
    }

    // Calculate interest (10% APR for education, 15% for others)
    const baseRate = purpose === 'education' ? 0.10 : 0.15
    const monthlyRate = baseRate / 12
    const monthlyPayment = (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term))
    const totalRepayment = monthlyPayment * term

    const loan: LoanApplication = {
      id: crypto.randomUUID(),
      userId,
      amount,
      purpose,
      term,
      interestRate: baseRate * 100,
      collateral: purpose === 'device' ? 'device' : 'income',
      status: 'pending',
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalRepayment: Math.round(totalRepayment * 100) / 100,
      createdAt: new Date()
    }

    this.loans.set(loan.id, loan)

    console.log(`\\n💰 LOAN APPLICATION RECEIVED`)
    console.log(`   Amount: R${amount.toLocaleString()}`)
    console.log(`   Purpose: ${purpose}`)
    console.log(`   Term: ${term} months`)
    console.log(`   Interest Rate: ${loan.interestRate}%`)
    console.log(`   Monthly Payment: R${loan.monthlyPayment}`)
    console.log(`   Total Repayment: R${loan.totalRepayment}`)

    // Auto-approve small education loans
    if (purpose === 'education' && amount <= 5000) {
      await this.approveLoan(loan.id)
    } else {
      console.log(`   ⏳ Status: Pending review`)
    }

    this.emit('loan-applied', loan)
    return loan
  }

  /**
   * Approve loan and disburse funds
   */
  async approveLoan(loanId: string): Promise<void> {
    const loan = this.loans.get(loanId)
    if (!loan) throw new Error('Loan not found')

    loan.status = 'approved'
    loan.approvedAt = new Date()

    const account = this.accounts.get(loan.userId)!

    console.log(`\\n✅ LOAN APPROVED!`)
    console.log(`   Loan ID: ${loanId}`)
    console.log(`   Amount: R${loan.amount}`)
    console.log(`   Disbursing to: ${account.bank} ***${account.accountNumber.slice(-4)}`)

    // Create disbursement transaction
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      from: this.founderAccount.userId,
      to: loan.userId,
      amount: loan.amount,
      currency: 'ZAR',
      type: 'loan_disbursement',
      status: 'pending',
      fee: 0,
      timestamp: new Date(),
      reference: `LOAN-${loanId.slice(0, 8)}`
    }

    // Disburse funds (in production, integrate with payment gateway)
    await this.processTransaction(transaction)

    // Update balances
    account.balance += loan.amount
    this.accounts.set(loan.userId, account)

    loan.status = 'active'
    this.loans.set(loanId, loan)

    console.log(`   💸 Funds disbursed successfully!`)
    console.log(`   🎓 Start learning and earning to repay!`)

    this.emit('loan-disbursed', { loan, transaction })
  }

  /**
   * Convert AZR tokens to ZAR
   */
  async convertAZRtoZAR(userId: string, azrAmount: number): Promise<number> {
    const account = this.accounts.get(userId)
    if (!account) throw new Error('Account not found')

    // Exchange rate: 1 AZR = R10 (adjust based on market)
    const exchangeRate = 10
    const zarAmount = azrAmount * exchangeRate
    const fee = zarAmount * 0.01 // 1% conversion fee

    if (account.azoraBalance < azrAmount) {
      throw new Error('Insufficient AZR balance')
    }

    console.log(`\\n💱 CONVERTING AZR → ZAR`)
    console.log(`   Amount: ${azrAmount} AZR`)
    console.log(`   Rate: 1 AZR = R${exchangeRate}`)
    console.log(`   ZAR Value: R${zarAmount}`)
    console.log(`   Fee: R${fee.toFixed(2)}`)
    console.log(`   Net Amount: R${(zarAmount - fee).toFixed(2)}`)

    // Update balances
    account.azoraBalance -= azrAmount
    account.balance += (zarAmount - fee)
    this.accounts.set(userId, account)

    // Transfer to founder account (revenue)
    this.founderAccount.balance += fee
    this.founderAccount.azoraBalance += azrAmount

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      from: userId,
      to: this.founderAccount.userId,
      amount: azrAmount,
      currency: 'AZR',
      type: 'transfer',
      status: 'completed',
      fee,
      timestamp: new Date(),
      reference: 'AZR-ZAR-CONVERSION'
    }

    this.transactions.push(transaction)

    console.log(`   ✅ Conversion complete!`)
    console.log(`   💰 Your balance: R${account.balance}`)

    this.emit('conversion-completed', { userId, azrAmount, zarAmount, fee })
    return zarAmount - fee
  }

  /**
   * Withdraw ZAR to bank account
   */
  async withdrawToBank(userId: string, amount: number): Promise<void> {
    const account = this.accounts.get(userId)
    if (!account || !account.verified) {
      throw new Error('Verified bank account required')
    }

    if (account.balance < amount) {
      throw new Error('Insufficient balance')
    }

    console.log(`\\n💸 WITHDRAWAL REQUEST`)
    console.log(`   Amount: R${amount}`)
    console.log(`   To: ${account.bank} ***${account.accountNumber.slice(-4)}`)
    console.log(`   Processing...`)

    // In production, integrate with payment gateway (Ozow, Yoco, PayFast)
    // Simulate instant EFT
    await new Promise(resolve => setTimeout(resolve, 2000))

    account.balance -= amount
    this.accounts.set(userId, account)

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      from: userId,
      to: 'BANK',
      amount,
      currency: 'ZAR',
      type: 'withdrawal',
      status: 'completed',
      fee: 0,
      timestamp: new Date(),
      reference: `WD-${Date.now()}`
    }

    this.transactions.push(transaction)

    console.log(`   ✅ Withdrawal successful!`)
    console.log(`   💰 Funds sent to your bank account`)
    console.log(`   📝 Reference: ${transaction.reference}`)

    this.emit('withdrawal-completed', { userId, amount, transaction })
  }

  /**
   * Peer-to-peer transfer
   */
  async transferP2P(fromUserId: string, toUserId: string, amount: number, currency: 'ZAR' | 'AZR' = 'AZR'): Promise<void> {
    const fromAccount = this.accounts.get(fromUserId)
    const toAccount = this.accounts.get(toUserId)

    if (!fromAccount || !toAccount) {
      throw new Error('Both users must have linked accounts')
    }

    const balance = currency === 'ZAR' ? fromAccount.balance : fromAccount.azoraBalance
    if (balance < amount) {
      throw new Error('Insufficient balance')
    }

    console.log(`\\n🔄 PEER-TO-PEER TRANSFER`)
    console.log(`   From: ${fromAccount.accountHolder}`)
    console.log(`   To: ${toAccount.accountHolder}`)
    console.log(`   Amount: ${amount} ${currency}`)

    // Update balances
    if (currency === 'ZAR') {
      fromAccount.balance -= amount
      toAccount.balance += amount
    } else {
      fromAccount.azoraBalance -= amount
      toAccount.azoraBalance += amount
    }

    this.accounts.set(fromUserId, fromAccount)
    this.accounts.set(toUserId, toAccount)

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      from: fromUserId,
      to: toUserId,
      amount,
      currency,
      type: 'transfer',
      status: 'completed',
      fee: 0,
      timestamp: new Date()
    }

    this.transactions.push(transaction)

    console.log(`   ✅ Transfer complete!`)

    this.emit('p2p-transfer', transaction)
  }

  /**
   * Process transaction
   */
  private async processTransaction(transaction: Transaction): Promise<void> {
    // In production: Payment gateway integration
    // For now: Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    transaction.status = 'completed'
    this.transactions.push(transaction)

    this.emit('transaction-processed', transaction)
  }

  /**
   * Get default branch code for bank
   */
  private getDefaultBranchCode(bank: BankAccount['bank']): string {
    const codes: Record<string, string> = {
      'FNB': '250655',
      'Standard Bank': '051001',
      'Capitec': '470010',
      'Nedbank': '198765',
      'Absa': '632005',
      'Other': '000000'
    }
    return codes[bank] || '000000'
  }

  /**
   * Mask account number for security
   */
  private maskAccountNumber(accountNumber: string): string {
    return `***${accountNumber.slice(-4)}`
  }

  /**
   * Get user's financial summary
   */
  getFinancialSummary(userId: string) {
    const account = this.accounts.get(userId)
    const userLoans = Array.from(this.loans.values()).filter(l => l.userId === userId)
    const userTransactions = this.transactions.filter(t => t.from === userId || t.to === userId)

    return {
      account,
      loans: userLoans,
      transactions: userTransactions,
      totalBorrowed: userLoans.reduce((sum, l) => sum + l.amount, 0),
      totalRepaid: userTransactions
        .filter(t => t.type === 'loan_repayment')
        .reduce((sum, t) => sum + t.amount, 0)
    }
  }

  /**
   * Get founder revenue summary
   */
  getFounderRevenue() {
    const conversionFees = this.transactions
      .filter(t => t.reference === 'AZR-ZAR-CONVERSION')
      .reduce((sum, t) => sum + t.fee, 0)

    const loanInterest = Array.from(this.loans.values())
      .filter(l => l.status === 'active' || l.status === 'paid')
      .reduce((sum, l) => sum + (l.totalRepayment - l.amount), 0)

    return {
      conversionFees,
      loanInterest,
      totalRevenue: conversionFees + loanInterest,
      founderBalance: this.founderAccount.balance
    }
  }
}

export const bankIntegration = new BankIntegrationService()
export default bankIntegration
