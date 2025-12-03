/**
 * KYC/AML Compliance Service
 * Know Your Customer and Anti-Money Laundering compliance
 */

import { v4 as uuidv4 } from 'uuid';

export interface KYCProfile {
  userId: string;
  kycId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  ssn: string; // Last 4 digits only
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phoneNumber: string;
  email: string;
  status: 'pending' | 'verified' | 'rejected' | 'suspended';
  verificationMethod: 'document' | 'selfie' | 'manual';
  documentType?: 'passport' | 'drivers_license' | 'national_id';
  documentNumber?: string;
  verifiedAt?: Date;
  rejectionReason?: string;
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

export interface AMLCheck {
  checkId: string;
  userId: string;
  kycId: string;
  checkType: 'sanctions' | 'pep' | 'adverse_media' | 'transaction_monitoring';
  status: 'pending' | 'passed' | 'failed' | 'review_required';
  result?: {
    matched: boolean;
    matchedLists: string[];
    riskScore: number;
    details: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionMonitoring {
  transactionId: string;
  userId: string;
  amount: number;
  currency: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  status: 'normal' | 'flagged' | 'blocked';
  riskScore: number;
  flags: string[];
  createdAt: Date;
}

/**
 * In-memory storage (use database in production)
 */
const kycProfiles = new Map<string, KYCProfile>();
const amlChecks = new Map<string, AMLCheck>();
const transactionMonitoring = new Map<string, TransactionMonitoring>();

/**
 * Create KYC profile
 */
export async function createKYCProfile(
  userId: string,
  profileData: Omit<KYCProfile, 'kycId' | 'status' | 'verifiedAt' | 'riskLevel' | 'createdAt' | 'updatedAt'>
): Promise<KYCProfile> {
  // Check if profile already exists
  const existing = Array.from(kycProfiles.values()).find((p) => p.userId === userId);
  if (existing) {
    throw new Error('KYC profile already exists for this user');
  }

  // Validate required fields
  if (!profileData.firstName || !profileData.lastName) {
    throw new Error('First and last name are required');
  }

  if (!profileData.dateOfBirth) {
    throw new Error('Date of birth is required');
  }

  // Validate age (must be 18+)
  const age = new Date().getFullYear() - new Date(profileData.dateOfBirth).getFullYear();
  if (age < 18) {
    throw new Error('Must be 18 years or older');
  }

  // Create profile
  const profile: KYCProfile = {
    ...profileData,
    userId,
    kycId: uuidv4(),
    status: 'pending',
    riskLevel: 'medium',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  kycProfiles.set(profile.kycId, profile);

  // Trigger AML checks
  await runAMLChecks(profile);

  return profile;
}

/**
 * Get KYC profile
 */
export function getKYCProfile(userId: string): KYCProfile | null {
  const profiles = Array.from(kycProfiles.values());
  return profiles.find((p) => p.userId === userId) || null;
}

/**
 * Verify KYC profile
 */
export async function verifyKYCProfile(
  userId: string,
  verificationMethod: 'document' | 'selfie' | 'manual'
): Promise<KYCProfile> {
  const profile = getKYCProfile(userId);
  if (!profile) {
    throw new Error('KYC profile not found');
  }

  if (profile.status === 'verified') {
    throw new Error('Profile is already verified');
  }

  // In production, verify against government databases or third-party services
  // For now, simulate verification
  profile.status = 'verified';
  profile.verificationMethod = verificationMethod;
  profile.verifiedAt = new Date();
  profile.riskLevel = 'low';
  profile.updatedAt = new Date();

  return profile;
}

/**
 * Reject KYC profile
 */
export async function rejectKYCProfile(userId: string, reason: string): Promise<KYCProfile> {
  const profile = getKYCProfile(userId);
  if (!profile) {
    throw new Error('KYC profile not found');
  }

  profile.status = 'rejected';
  profile.rejectionReason = reason;
  profile.updatedAt = new Date();

  return profile;
}

/**
 * Run AML checks
 */
export async function runAMLChecks(profile: KYCProfile): Promise<AMLCheck[]> {
  const checks: AMLCheck[] = [];

  // Sanctions check
  const sanctionsCheck = await runSanctionsCheck(profile);
  checks.push(sanctionsCheck);

  // PEP check
  const pepCheck = await runPEPCheck(profile);
  checks.push(pepCheck);

  // Adverse media check
  const adverseMediaCheck = await runAdverseMediaCheck(profile);
  checks.push(adverseMediaCheck);

  return checks;
}

/**
 * Run sanctions check
 */
export async function runSanctionsCheck(profile: KYCProfile): Promise<AMLCheck> {
  const check: AMLCheck = {
    checkId: uuidv4(),
    userId: profile.userId,
    kycId: profile.kycId,
    checkType: 'sanctions',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // In production, check against OFAC, UN, EU sanctions lists
  // For now, simulate check
  const isSanctioned = false; // Simulate no match

  check.status = isSanctioned ? 'failed' : 'passed';
  check.result = {
    matched: isSanctioned,
    matchedLists: isSanctioned ? ['OFAC'] : [],
    riskScore: isSanctioned ? 100 : 0,
    details: isSanctioned ? 'Match found on OFAC list' : 'No matches found',
  };

  amlChecks.set(check.checkId, check);
  return check;
}

/**
 * Run PEP check (Politically Exposed Persons)
 */
export async function runPEPCheck(profile: KYCProfile): Promise<AMLCheck> {
  const check: AMLCheck = {
    checkId: uuidv4(),
    userId: profile.userId,
    kycId: profile.kycId,
    checkType: 'pep',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // In production, check against PEP databases
  // For now, simulate check
  const isPEP = false; // Simulate not a PEP

  check.status = isPEP ? 'review_required' : 'passed';
  check.result = {
    matched: isPEP,
    matchedLists: isPEP ? ['PEP_DATABASE'] : [],
    riskScore: isPEP ? 75 : 0,
    details: isPEP ? 'Potential PEP match - requires review' : 'No PEP matches found',
  };

  amlChecks.set(check.checkId, check);
  return check;
}

/**
 * Run adverse media check
 */
export async function runAdverseMediaCheck(profile: KYCProfile): Promise<AMLCheck> {
  const check: AMLCheck = {
    checkId: uuidv4(),
    userId: profile.userId,
    kycId: profile.kycId,
    checkType: 'adverse_media',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // In production, check news sources and media databases
  // For now, simulate check
  const hasAdverseMedia = false; // Simulate no adverse media

  check.status = hasAdverseMedia ? 'review_required' : 'passed';
  check.result = {
    matched: hasAdverseMedia,
    matchedLists: hasAdverseMedia ? ['NEWS_SOURCES'] : [],
    riskScore: hasAdverseMedia ? 50 : 0,
    details: hasAdverseMedia ? 'Adverse media found - requires review' : 'No adverse media found',
  };

  amlChecks.set(check.checkId, check);
  return check;
}

/**
 * Monitor transaction for AML
 */
export async function monitorTransaction(
  userId: string,
  amount: number,
  currency: string,
  type: 'deposit' | 'withdrawal' | 'transfer'
): Promise<TransactionMonitoring> {
  const profile = getKYCProfile(userId);
  if (!profile) {
    throw new Error('KYC profile not found');
  }

  const monitoring: TransactionMonitoring = {
    transactionId: uuidv4(),
    userId,
    amount,
    currency,
    type,
    status: 'normal',
    riskScore: 0,
    flags: [],
    createdAt: new Date(),
  };

  // Check for suspicious patterns
  const flags: string[] = [];
  let riskScore = 0;

  // Large transaction flag
  if (amount > 10000) {
    flags.push('large_transaction');
    riskScore += 20;
  }

  // Rapid transactions flag
  const recentTransactions = Array.from(transactionMonitoring.values()).filter(
    (t) => t.userId === userId && new Date().getTime() - t.createdAt.getTime() < 60000 // Last minute
  );

  if (recentTransactions.length > 5) {
    flags.push('rapid_transactions');
    riskScore += 30;
  }

  // High-risk country flag (simulate)
  if (currency !== 'USD') {
    flags.push('non_usd_currency');
    riskScore += 10;
  }

  monitoring.flags = flags;
  monitoring.riskScore = riskScore;
  monitoring.status = riskScore > 50 ? 'flagged' : riskScore > 75 ? 'blocked' : 'normal';

  transactionMonitoring.set(monitoring.transactionId, monitoring);
  return monitoring;
}

/**
 * Get AML checks for user
 */
export function getAMLChecks(userId: string): AMLCheck[] {
  return Array.from(amlChecks.values()).filter((c) => c.userId === userId);
}

/**
 * Get compliance status
 */
export function getComplianceStatus(userId: string) {
  const profile = getKYCProfile(userId);
  const amlChecks = getAMLChecks(userId);

  if (!profile) {
    return {
      status: 'not_started',
      kycStatus: 'not_started',
      amlStatus: 'not_started',
    };
  }

  const allChecksPassed = amlChecks.every((c) => c.status === 'passed');

  return {
    status: profile.status === 'verified' && allChecksPassed ? 'compliant' : 'non_compliant',
    kycStatus: profile.status,
    amlStatus: allChecksPassed ? 'passed' : 'failed',
    riskLevel: profile.riskLevel,
    amlChecks: amlChecks.map((c) => ({
      type: c.checkType,
      status: c.status,
    })),
  };
}

export default {
  createKYCProfile,
  getKYCProfile,
  verifyKYCProfile,
  rejectKYCProfile,
  runAMLChecks,
  runSanctionsCheck,
  runPEPCheck,
  runAdverseMediaCheck,
  monitorTransaction,
  getAMLChecks,
  getComplianceStatus,
};
