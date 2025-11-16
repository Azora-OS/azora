/**
 * Bank Verification Service
 * Verifies bank accounts and validates banking information
 */

import { v4 as uuidv4 } from 'uuid';

export interface BankAccount {
  id: string;
  userId: string;
  accountHolderName: string;
  accountNumber: string;
  routingNumber: string;
  bankName: string;
  accountType: 'checking' | 'savings';
  verified: boolean;
  verificationStatus: 'pending' | 'verified' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  lastVerifiedAt?: Date;
}

export interface VerificationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * In-memory bank account storage (use database in production)
 */
const bankAccounts = new Map<string, BankAccount>();
const userBankAccounts = new Map<string, BankAccount[]>();

/**
 * Validate bank account format
 */
export function validateBankAccount(account: Partial<BankAccount>): VerificationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate account holder name
  if (!account.accountHolderName || account.accountHolderName.trim().length < 2) {
    errors.push('Account holder name must be at least 2 characters');
  }

  // Validate account number (US: 8-17 digits)
  if (!account.accountNumber || !/^\d{8,17}$/.test(account.accountNumber)) {
    errors.push('Account number must be 8-17 digits');
  }

  // Validate routing number (US: 9 digits)
  if (!account.routingNumber || !/^\d{9}$/.test(account.routingNumber)) {
    errors.push('Routing number must be 9 digits');
  }

  // Validate bank name
  if (!account.bankName || account.bankName.trim().length < 2) {
    errors.push('Bank name is required');
  }

  // Validate account type
  if (!account.accountType || !['checking', 'savings'].includes(account.accountType)) {
    errors.push('Account type must be checking or savings');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Register a bank account
 */
export async function registerBankAccount(
  userId: string,
  accountData: Omit<BankAccount, 'id' | 'userId' | 'verified' | 'verificationStatus' | 'createdAt' | 'updatedAt' | 'lastVerifiedAt'>
): Promise<BankAccount> {
  // Validate account
  const validation = validateBankAccount(accountData);
  if (!validation.valid) {
    throw new Error(`Bank account validation failed: ${validation.errors.join(', ')}`);
  }

  // Check if account already exists
  const existing = getUserBankAccounts(userId).find(
    (a) => a.accountNumber === accountData.accountNumber && a.routingNumber === accountData.routingNumber
  );

  if (existing) {
    throw new Error('This bank account is already registered');
  }

  // Create bank account
  const bankAccount: BankAccount = {
    id: uuidv4(),
    userId,
    accountHolderName: accountData.accountHolderName,
    accountNumber: accountData.accountNumber,
    routingNumber: accountData.routingNumber,
    bankName: accountData.bankName,
    accountType: accountData.accountType,
    verified: false,
    verificationStatus: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  bankAccounts.set(bankAccount.id, bankAccount);

  // Add to user's accounts
  if (!userBankAccounts.has(userId)) {
    userBankAccounts.set(userId, []);
  }
  userBankAccounts.get(userId)!.push(bankAccount);

  return bankAccount;
}

/**
 * Get bank account by ID
 */
export function getBankAccount(accountId: string): BankAccount | null {
  return bankAccounts.get(accountId) || null;
}

/**
 * Get user's bank accounts
 */
export function getUserBankAccounts(userId: string): BankAccount[] {
  return userBankAccounts.get(userId) || [];
}

/**
 * Get verified bank accounts for a user
 */
export function getVerifiedBankAccounts(userId: string): BankAccount[] {
  return getUserBankAccounts(userId).filter((a) => a.verified);
}

/**
 * Verify bank account (micro-deposit verification)
 */
export async function verifyBankAccount(
  accountId: string,
  microDepositAmounts: [number, number]
): Promise<BankAccount> {
  const account = getBankAccount(accountId);
  if (!account) {
    throw new Error('Bank account not found');
  }

  if (account.verified) {
    throw new Error('Bank account is already verified');
  }

  // In production, verify against actual micro-deposits
  // For now, simulate verification
  const isValid = microDepositAmounts[0] > 0 && microDepositAmounts[1] > 0;

  if (!isValid) {
    account.verificationStatus = 'failed';
    account.updatedAt = new Date();
    return account;
  }

  account.verified = true;
  account.verificationStatus = 'verified';
  account.lastVerifiedAt = new Date();
  account.updatedAt = new Date();

  return account;
}

/**
 * Remove a bank account
 */
export async function removeBankAccount(accountId: string): Promise<boolean> {
  const account = getBankAccount(accountId);
  if (!account) {
    throw new Error('Bank account not found');
  }

  // Remove from user's accounts
  const userAccounts = userBankAccounts.get(account.userId);
  if (userAccounts) {
    const index = userAccounts.findIndex((a) => a.id === accountId);
    if (index > -1) {
      userAccounts.splice(index, 1);
    }
  }

  // Remove from main storage
  bankAccounts.delete(accountId);

  return true;
}

/**
 * Mask bank account number for display
 */
export function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length < 4) return '****';
  return '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4);
}

/**
 * Get bank account summary
 */
export function getBankAccountSummary(account: BankAccount) {
  return {
    id: account.id,
    accountHolderName: account.accountHolderName,
    accountNumber: maskAccountNumber(account.accountNumber),
    bankName: account.bankName,
    accountType: account.accountType,
    verified: account.verified,
    verificationStatus: account.verificationStatus,
    createdAt: account.createdAt,
    lastVerifiedAt: account.lastVerifiedAt,
  };
}

/**
 * Validate routing number against known banks
 */
export async function validateRoutingNumber(routingNumber: string): Promise<{
  valid: boolean;
  bankName?: string;
}> {
  // In production, check against Federal Reserve routing number database
  // For now, just validate format
  if (!/^\d{9}$/.test(routingNumber)) {
    return { valid: false };
  }

  // Simulate bank lookup
  const knownBanks: Record<string, string> = {
    '021000021': 'Chase Bank',
    '011000015': 'Bank of America',
    '026009593': 'Wells Fargo',
    '031000503': 'Citibank',
  };

  return {
    valid: true,
    bankName: knownBanks[routingNumber],
  };
}

/**
 * Get bank account statistics
 */
export function getBankAccountStats(userId: string) {
  const accounts = getUserBankAccounts(userId);

  return {
    totalAccounts: accounts.length,
    verifiedAccounts: accounts.filter((a) => a.verified).length,
    pendingAccounts: accounts.filter((a) => a.verificationStatus === 'pending').length,
    failedAccounts: accounts.filter((a) => a.verificationStatus === 'failed').length,
    checkingAccounts: accounts.filter((a) => a.accountType === 'checking').length,
    savingsAccounts: accounts.filter((a) => a.accountType === 'savings').length,
  };
}

export default {
  validateBankAccount,
  registerBankAccount,
  getBankAccount,
  getUserBankAccounts,
  getVerifiedBankAccounts,
  verifyBankAccount,
  removeBankAccount,
  maskAccountNumber,
  getBankAccountSummary,
  validateRoutingNumber,
  getBankAccountStats,
};
