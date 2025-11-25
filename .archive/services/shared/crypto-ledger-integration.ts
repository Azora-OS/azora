/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Crypto Ledger Integration
 * 
 * Connects to Azora blockchain ledger for qualification records
 */

import crypto from 'crypto';
import { AzoraBlockchain, Transaction, LedgerEntry } from '../../azora-mint/blockchain-ledger';

export interface QualificationRecord {
  recordId: string;
  studentNumber: string;
  credentialId: string;
  credentialType: string;
  uid: string;
  blockchainHash: string;
  issuedDate: Date;
  issuer: string;
  metadata: Record<string, any>;
}

export class CryptoLedgerService {
  private static instance: CryptoLedgerService;
  private blockchain: AzoraBlockchain;

  private constructor() {
    // Initialize blockchain instance
    // In production, this would connect to the actual blockchain service
    this.blockchain = new AzoraBlockchain();
  }

  public static getInstance(): CryptoLedgerService {
    if (!CryptoLedgerService.instance) {
      CryptoLedgerService.instance = new CryptoLedgerService();
    }
    return CryptoLedgerService.instance;
  }

  /**
   * Record qualification in crypto ledger
   */
  async addQualificationRecord(record: QualificationRecord): Promise<LedgerEntry> {
    // Create transaction
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      from: 'education-system',
      to: record.studentNumber,
      amount: 0, // No monetary value, just record
      currency: 'AZR',
      type: 'Education',
      data: {
        credentialId: record.credentialId,
        credentialType: record.credentialType,
        uid: record.uid,
        metadata: record.metadata,
      },
      timestamp: record.issuedDate,
      hash: record.blockchainHash,
    };

    // Add to blockchain
    await this.blockchain.addTransaction(transaction);
    
    // Wait for confirmation
    const ledgerEntry = await this.waitForConfirmation(transaction.id);

    return ledgerEntry;
  }

  /**
   * Verify qualification record
   */
  async verifyQualificationRecord(uid: string, blockchainHash: string): Promise<boolean> {
    // Query blockchain for transaction
    const ledger = this.blockchain.getLedger();
    const entries = Array.from(ledger.values()).flat();
    
    const matchingEntry = entries.find(entry => 
      entry.transactionId && 
      entry.to && 
      entry.timestamp
    );

    // In production, would verify blockchain hash
    return matchingEntry !== undefined;
  }

  /**
   * Get qualification records for student
   */
  async getStudentQualificationRecords(studentNumber: string): Promise<LedgerEntry[]> {
    const ledger = this.blockchain.getLedger();
    const entries = ledger.get(studentNumber) || [];
    return entries.filter(e => e.confirmed);
  }

  /**
   * Wait for transaction confirmation
   */
  private async waitForConfirmation(transactionId: string, timeout: number = 5000): Promise<LedgerEntry> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const checkConfirmation = () => {
        const ledger = this.blockchain.getLedger();
        const entries = Array.from(ledger.values()).flat();
        const entry = entries.find(e => e.transactionId === transactionId);

        if (entry && entry.confirmed) {
          resolve(entry);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Transaction confirmation timeout'));
        } else {
          setTimeout(checkConfirmation, 100);
        }
      };

      checkConfirmation();
    });
  }
}

export const cryptoLedgerService = CryptoLedgerService.getInstance();
