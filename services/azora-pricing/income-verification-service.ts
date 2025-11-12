/**
 * INCOME VERIFICATION SERVICE
 * 
 * Handles verification of income levels for pricing eligibility
 */

import type { IncomeLevel, VerificationMethod, IncomeVerification } from './income-based-pricing';

// In-memory store (replace with database in production)
const verifications = new Map<string, IncomeVerification>();

export interface VerificationSubmission {
  userId: string;
  incomeLevel: IncomeLevel;
  method: VerificationMethod;
  documentUrl?: string;
  selfDeclaration?: string;
}

/**
 * Submit income verification
 */
export async function submitVerification(
  submission: VerificationSubmission
): Promise<{ success: boolean; verificationId?: string; message: string }> {
  const { userId, incomeLevel, method, documentUrl, selfDeclaration } = submission;

  // Validate submission
  if (method === 'SELF_DECLARATION') {
    if (!selfDeclaration || selfDeclaration.length < 50) {
      return { success: false, message: 'Self-declaration must be at least 50 characters' };
    }
  } else {
    if (!documentUrl) {
      return { success: false, message: 'Document upload required' };
    }
  }

  // Create verification record
  const verificationId = `VER_${Date.now()}_${userId}`;
  const verification: IncomeVerification = {
    userId,
    incomeLevel,
    method,
    documentUrl,
    selfDeclaration,
    status: method === 'SELF_DECLARATION' ? 'APPROVED' : 'PENDING', // Auto-approve self-declarations
    submittedAt: new Date(),
    reviewedAt: method === 'SELF_DECLARATION' ? new Date() : undefined,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
  };

  verifications.set(verificationId, verification);

  return {
    success: true,
    verificationId,
    message: method === 'SELF_DECLARATION' 
      ? 'Verification approved automatically' 
      : 'Verification submitted for review (typically 24-48 hours)'
  };
}

/**
 * Get user's active verification
 */
export function getUserVerification(userId: string): IncomeVerification | null {
  const now = new Date();
  
  for (const [id, verification] of verifications.entries()) {
    if (
      verification.userId === userId &&
      verification.status === 'APPROVED' &&
      verification.expiresAt > now
    ) {
      return verification;
    }
  }
  
  return null;
}

/**
 * Check if user is eligible for income level
 */
export function checkEligibility(
  userId: string,
  requestedLevel: IncomeLevel
): { eligible: boolean; reason?: string; currentLevel?: IncomeLevel } {
  const verification = getUserVerification(userId);
  
  if (!verification) {
    if (requestedLevel === 'STANDARD') {
      return { eligible: true }; // Standard doesn't need verification
    }
    return { 
      eligible: false, 
      reason: 'No active verification found. Please submit income verification.' 
    };
  }
  
  if (verification.incomeLevel !== requestedLevel) {
    return {
      eligible: false,
      reason: `You are verified for ${verification.incomeLevel} pricing`,
      currentLevel: verification.incomeLevel
    };
  }
  
  return { eligible: true, currentLevel: verification.incomeLevel };
}

/**
 * Review pending verification (admin function)
 */
export function reviewVerification(
  verificationId: string,
  approved: boolean,
  reviewedBy: string,
  notes?: string
): { success: boolean; message: string } {
  const verification = verifications.get(verificationId);
  
  if (!verification) {
    return { success: false, message: 'Verification not found' };
  }
  
  if (verification.status !== 'PENDING') {
    return { success: false, message: 'Verification already reviewed' };
  }
  
  verification.status = approved ? 'APPROVED' : 'REJECTED';
  verification.reviewedAt = new Date();
  verification.reviewedBy = reviewedBy;
  verification.notes = notes;
  
  return {
    success: true,
    message: approved ? 'Verification approved' : 'Verification rejected'
  };
}

/**
 * Get pending verifications (admin function)
 */
export function getPendingVerifications(): IncomeVerification[] {
  const pending: IncomeVerification[] = [];
  
  for (const [id, verification] of verifications.entries()) {
    if (verification.status === 'PENDING') {
      pending.push(verification);
    }
  }
  
  return pending.sort((a, b) => a.submittedAt.getTime() - b.submittedAt.getTime());
}

/**
 * Verification statistics
 */
export function getVerificationStats(): {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  byLevel: Record<IncomeLevel, number>;
  byMethod: Record<VerificationMethod, number>;
} {
  const stats = {
    total: verifications.size,
    pending: 0,
    approved: 0,
    rejected: 0,
    byLevel: { NO_INCOME: 0, LOW_INCOME: 0, STANDARD: 0 } as Record<IncomeLevel, number>,
    byMethod: {} as Record<VerificationMethod, number>
  };
  
  for (const [id, verification] of verifications.entries()) {
    if (verification.status === 'PENDING') stats.pending++;
    if (verification.status === 'APPROVED') stats.approved++;
    if (verification.status === 'REJECTED') stats.rejected++;
    
    stats.byLevel[verification.incomeLevel]++;
    stats.byMethod[verification.method] = (stats.byMethod[verification.method] || 0) + 1;
  }
  
  return stats;
}

export default {
  submitVerification,
  getUserVerification,
  checkEligibility,
  reviewVerification,
  getPendingVerifications,
  getVerificationStats
};
