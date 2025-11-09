/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import { EventEmitter } from 'events';
import crypto from 'crypto';
import axios from 'axios';

interface KYCData {
  userId: string;
  name: string;
  idNumber: string;
  dateOfBirth: string;
  address: string;
  country: string;
  documentType: 'passport' | 'id' | 'drivers_license';
  documentNumber: string;
}

interface AMLTransaction {
  userId: string;
  amount: number;
  currency: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  ip: string;
  destination?: string;
}

interface KYCResult {
  approved: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  reason?: string;
  verificationId: string;
}

interface AMLResult {
  flagged: boolean;
  riskScore: number;
  reason?: string;
  requiresReview: boolean;
}

export class KYCAMLService extends EventEmitter {
  private kycRecords = new Map<string, KYCResult>();
  private amlChecks = new Map<string, AMLResult[]>();
  private sanctionedCountries = ['North Korea', 'Iran', 'Syria', 'Cuba'];
  private highRiskCountries = ['Afghanistan', 'Yemen', 'Somalia'];

  constructor() {
    super();
    console.log('🛡️ KYC/AML Service initialized');
  }

  // KYC Verification
  async verifyKYC(data: KYCData): Promise<KYCResult> {
    const verificationId = crypto.randomUUID();

    // Name validation
    if (!/^[a-zA-Z\s'-]+$/.test(data.name)) {
      return this.createKYCResult(false, 'high', 'Invalid name format', verificationId);
    }

    // ID validation (South African ID example: 13 digits)
    if (data.country === 'South Africa' && !/^\d{13}$/.test(data.idNumber)) {
      return this.createKYCResult(false, 'high', 'Invalid ID number', verificationId);
    }

    // Age verification (must be 18+)
    const age = this.calculateAge(data.dateOfBirth);
    if (age < 18) {
      return this.createKYCResult(false, 'high', 'Must be 18 or older', verificationId);
    }

    // Country sanctions check
    if (this.sanctionedCountries.includes(data.country)) {
      return this.createKYCResult(false, 'high', 'Sanctioned country', verificationId);
    }

    // Risk assessment
    const riskLevel = this.highRiskCountries.includes(data.country) ? 'medium' : 'low';

    const result = this.createKYCResult(true, riskLevel, undefined, verificationId);
    this.kycRecords.set(data.userId, result);

    this.emit('kyc-verified', { userId: data.userId, result });
    console.log(`✅ KYC verified: ${data.userId} (${riskLevel} risk)`);

    return result;
  }

  // AML Transaction Check
  async checkTransaction(transaction: AMLTransaction): Promise<AMLResult> {
    let riskScore = 0;
    const reasons: string[] = [];

    // Amount-based risk
    if (transaction.amount > 10000) {
      riskScore += 30;
      reasons.push('Large transaction amount');
    }
    if (transaction.amount > 50000) {
      riskScore += 40;
      reasons.push('Very large transaction');
    }

    // Frequency check
    const userChecks = this.amlChecks.get(transaction.userId) || [];
    const recentChecks = userChecks.filter(
      c => Date.now() - new Date(c.timestamp || 0).getTime() < 86400000
    );
    if (recentChecks.length > 10) {
      riskScore += 25;
      reasons.push('High transaction frequency');
    }

    // IP geolocation check
    try {
      const geoData = await this.checkIPLocation(transaction.ip);
      if (this.sanctionedCountries.includes(geoData.country)) {
        riskScore += 50;
        reasons.push('Sanctioned country IP');
      }
      if (this.highRiskCountries.includes(geoData.country)) {
        riskScore += 20;
        reasons.push('High-risk country IP');
      }
    } catch (error) {
      riskScore += 10;
      reasons.push('Unable to verify IP location');
    }

    // Withdrawal to high-risk destination
    if (transaction.type === 'withdrawal' && transaction.destination) {
      if (this.isHighRiskDestination(transaction.destination)) {
        riskScore += 30;
        reasons.push('High-risk destination');
      }
    }

    const flagged = riskScore >= 50;
    const requiresReview = riskScore >= 30;

    const result: AMLResult = {
      flagged,
      riskScore,
      reason: reasons.join('; '),
      requiresReview,
      timestamp: new Date().toISOString()
    } as AMLResult;

    // Store check
    if (!this.amlChecks.has(transaction.userId)) {
      this.amlChecks.set(transaction.userId, []);
    }
    this.amlChecks.get(transaction.userId)!.push(result);

    this.emit('aml-check', { transaction, result });
    
    if (flagged) {
      console.log(`🚨 AML flagged: ${transaction.userId} - Score: ${riskScore}`);
      this.emit('aml-flagged', { transaction, result });
    }

    return result;
  }

  // Enhanced Due Diligence (EDD)
  async performEDD(userId: string): Promise<any> {
    const kycResult = this.kycRecords.get(userId);
    const amlHistory = this.amlChecks.get(userId) || [];

    const totalTransactions = amlHistory.length;
    const flaggedTransactions = amlHistory.filter(c => c.flagged).length;
    const averageRiskScore = amlHistory.reduce((sum, c) => sum + c.riskScore, 0) / totalTransactions || 0;

    const eddResult = {
      userId,
      kycStatus: kycResult?.approved ? 'approved' : 'pending',
      kycRiskLevel: kycResult?.riskLevel || 'unknown',
      totalTransactions,
      flaggedTransactions,
      averageRiskScore,
      recommendation: this.getEDDRecommendation(averageRiskScore, flaggedTransactions),
      timestamp: new Date().toISOString()
    };

    this.emit('edd-completed', eddResult);
    return eddResult;
  }

  // Sanctions Screening
  async screenSanctions(name: string, country: string): Promise<boolean> {
    // Check against sanctioned countries
    if (this.sanctionedCountries.includes(country)) {
      this.emit('sanctions-hit', { name, country });
      return true;
    }

    // In production, integrate with OFAC, UN, EU sanctions lists
    // For now, simple name matching
    const sanctionedNames = ['test sanctioned person'];
    const isSanctioned = sanctionedNames.some(sn => 
      name.toLowerCase().includes(sn.toLowerCase())
    );

    if (isSanctioned) {
      this.emit('sanctions-hit', { name, country });
    }

    return isSanctioned;
  }

  // PEP (Politically Exposed Person) Check
  async checkPEP(name: string, country: string): Promise<boolean> {
    // In production, integrate with PEP databases
    // For now, return false (not a PEP)
    return false;
  }

  // Helper Methods
  private createKYCResult(approved: boolean, riskLevel: 'low' | 'medium' | 'high', reason: string | undefined, verificationId: string): KYCResult {
    return { approved, riskLevel, reason, verificationId };
  }

  private calculateAge(dateOfBirth: string): number {
    const dob = new Date(dateOfBirth);
    const diff = Date.now() - dob.getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  }

  private async checkIPLocation(ip: string): Promise<any> {
    try {
      // In production, use ipgeolocation.io or similar
      // For now, return mock data
      return { country: 'South Africa', city: 'Cape Town' };
    } catch (error) {
      throw new Error('IP location check failed');
    }
  }

  private isHighRiskDestination(destination: string): boolean {
    // Check if destination is in high-risk country
    return this.highRiskCountries.some(country => 
      destination.toLowerCase().includes(country.toLowerCase())
    );
  }

  private getEDDRecommendation(avgRiskScore: number, flaggedCount: number): string {
    if (avgRiskScore > 60 || flaggedCount > 3) {
      return 'REJECT - High risk profile';
    }
    if (avgRiskScore > 40 || flaggedCount > 1) {
      return 'REVIEW - Manual review required';
    }
    return 'APPROVE - Low risk profile';
  }

  // Get user compliance status
  getComplianceStatus(userId: string): any {
    const kyc = this.kycRecords.get(userId);
    const aml = this.amlChecks.get(userId) || [];

    return {
      userId,
      kycVerified: kyc?.approved || false,
      kycRiskLevel: kyc?.riskLevel || 'unknown',
      totalTransactions: aml.length,
      flaggedTransactions: aml.filter(c => c.flagged).length,
      lastCheck: aml[aml.length - 1]?.timestamp || null,
      compliant: kyc?.approved && aml.filter(c => c.flagged).length === 0
    };
  }
}

export const kycAmlService = new KYCAMLService();
export default kycAmlService;
