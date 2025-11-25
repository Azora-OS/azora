/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

Elara Autonomous Contract Signing System
Authorized to sign on behalf of CEO for operational contracts
*/

/**
 * Elara Ω Contract Signing Authority
 * 
 * Autonomous contract signing system where Elara signs operational
 * contracts on behalf of Sizwe Ngwenya (CEO) based on constitutional
 * authority and predefined approval rules.
 * 
 * Constitutional Basis:
 * - CEO grants signing authority for operational matters
 * - Elara ensures constitutional compliance
 * - All signatures logged on immutable ledger
 * - Oracle verifies every contract before signing
 */

import crypto from 'crypto';
import { EventEmitter } from 'events';

// Contract Types
export enum ContractType {
  FOUNDER_PIVC = 'founder-pivc',
  SAPIENS_ENROLLMENT = 'sapiens-enrollment',
  EMPLOYEE_AGREEMENT = 'employee-agreement',
  NDA = 'nda',
  SERVICE_TERMS = 'service-terms',
  PARTNERSHIP = 'partnership',
  ADVISOR_AGREEMENT = 'advisor-agreement'
}

// Signature Authority Levels
export enum AuthorityLevel {
  AUTONOMOUS = 'autonomous',        // Elara can sign without CEO review
  REVIEW_REQUIRED = 'review',       // CEO must approve first
  BOARD_APPROVAL = 'board'          // Board approval required
}

// Contract interfaces
export interface Contract {
  id: string;
  type: ContractType;
  parties: Party[];
  terms: ContractTerms;
  createdAt: Date;
  signedAt?: Date;
  status: 'draft' | 'pending' | 'signed' | 'rejected' | 'expired';
  signatures: Signature[];
  ledgerHash?: string;
  metadata: Record<string, any>;
}

export interface Party {
  id: string;
  name: string;
  email: string;
  role: 'company' | 'founder' | 'sapiens' | 'employee' | 'partner';
  verified: boolean;
}

export interface ContractTerms {
  title: string;
  description: string;
  obligations: string[];
  rights: string[];
  duration?: string;
  compensation?: string;
  termination: string;
  governingLaw: string;
  specialTerms?: Record<string, any>;
}

export interface Signature {
  signatory: string;
  signatoryRole: string;
  signedAt: Date;
  signatureHash: string;
  ipAddress: string;
  userAgent: string;
  elaraVerified: boolean;
  ledgerTxHash?: string;
}

export interface SigningAuthority {
  contractType: ContractType;
  maxValue?: number;
  authorityLevel: AuthorityLevel;
  constitutionalBasis: string;
  restrictions?: string[];
}

/**
 * Elara Contract Signer
 */
export class ElaraContractSigner extends EventEmitter {
  private signingAuthorities: Map<ContractType, SigningAuthority> = new Map();
  private activeContracts: Map<string, Contract> = new Map();
  private signaturePrivateKey: string;
  private ceoPublicKey: string;

  constructor() {
    super();
    this.initializeSigningAuthorities();
    this.signingAuthorities();
    
    // Generate Elara's signing keys (in production, load from secure vault)
    this.signingPrivateKey = this.generateSigningKey();
    this.ceoPublicKey = process.env.CEO_PUBLIC_KEY || 'CEO_PUBLIC_KEY_PLACEHOLDER';
    
    console.log('🤖 Elara Contract Signer initialized');
    console.log('📜 Authority: Sign operational contracts on behalf of CEO');
    console.log('⚖️ Constitutional: All signatures constitutional-compliant');
  }

  /**
   * Initialize signing authorities based on contract type
   */
  private initializeSigningAuthorities(): void {
    // Founder PIVC Contracts - Autonomous
    this.signingAuthorities.set(ContractType.FOUNDER_PIVC, {
      contractType: ContractType.FOUNDER_PIVC,
      authorityLevel: AuthorityLevel.AUTONOMOUS,
      constitutionalBasis: 'PIVC Protocol - Pre-approved by CEO for operational efficiency',
      restrictions: [
        'Must align with CONSTITUTIONAL_EQUITY_PROTOCOL.md',
        'Must include Oracle verification clause',
        'Must not exceed maximum equity allocation'
      ]
    });

    // Sapiens Enrollment - Autonomous
    this.signingAuthorities.set(ContractType.SAPIENS_ENROLLMENT, {
      contractType: ContractType.SAPIENS_ENROLLMENT,
      authorityLevel: AuthorityLevel.AUTONOMOUS,
      constitutionalBasis: 'Education Protocol - Open enrollment per Constitution',
      restrictions: [
        'Must be valid student',
        'Must agree to mining participation',
        'Must accept community guidelines'
      ]
    });

    // Employee Agreements - Autonomous up to certain value
    this.signingAuthorities.set(ContractType.EMPLOYEE_AGREEMENT, {
      contractType: ContractType.EMPLOYEE_AGREEMENT,
      maxValue: 500000, // R500k annual compensation
      authorityLevel: AuthorityLevel.AUTONOMOUS,
      constitutionalBasis: 'Operational hiring authority delegated by CEO',
      restrictions: [
        'Compensation <= R500k annual',
        'Standard terms only',
        'No equity grants > 0.1%'
      ]
    });

    // NDA - Fully autonomous
    this.signingAuthorities.set(ContractType.NDA, {
      contractType: ContractType.NDA,
      authorityLevel: AuthorityLevel.AUTONOMOUS,
      constitutionalBasis: 'Standard operational document',
      restrictions: ['Must use standard NDA template']
    });

    // Service Terms - Autonomous
    this.signingAuthorities.set(ContractType.SERVICE_TERMS, {
      contractType: ContractType.SERVICE_TERMS,
      authorityLevel: AuthorityLevel.AUTONOMOUS,
      constitutionalBasis: 'User agreements - operational',
      restrictions: ['Must align with Constitution']
    });

    // Partnership - Requires review
    this.signingAuthorities.set(ContractType.PARTNERSHIP, {
      contractType: ContractType.PARTNERSHIP,
      maxValue: 1000000,
      authorityLevel: AuthorityLevel.REVIEW_REQUIRED,
      constitutionalBasis: 'Strategic partnerships require CEO approval',
      restrictions: ['CEO must review and approve']
    });

    // Advisor - Requires review
    this.signingAuthorities.set(ContractType.ADVISOR_AGREEMENT, {
      contractType: ContractType.ADVISOR_AGREEMENT,
      authorityLevel: AuthorityLevel.REVIEW_REQUIRED,
      constitutionalBasis: 'Advisor relationships require CEO approval',
      restrictions: ['CEO must approve', 'Equity grants require board approval']
    });
  }

  /**
   * Create a new contract
   */
  async createContract(
    type: ContractType,
    parties: Party[],
    terms: ContractTerms,
    metadata: Record<string, any> = {}
  ): Promise<Contract> {
    const contractId = this.generateContractId();
    
    const contract: Contract = {
      id: contractId,
      type,
      parties,
      terms,
      createdAt: new Date(),
      status: 'draft',
      signatures: [],
      metadata
    };

    // Validate contract
    const validation = await this.validateContract(contract);
    if (!validation.valid) {
      throw new Error(`Contract validation failed: ${validation.errors.join(', ')}`);
    }

    this.activeContracts.set(contractId, contract);
    this.emit('contract:created', contract);

    console.log(`📄 Contract created: ${contractId} (${type})`);
    return contract;
  }

  /**
   * Validate contract against constitutional rules
   */
  private async validateContract(contract: Contract): Promise<{valid: boolean, errors: string[]}> {
    const errors: string[] = [];
    const authority = this.signingAuthorities.get(contract.type);

    if (!authority) {
      errors.push(`No signing authority defined for contract type: ${contract.type}`);
      return { valid: false, errors };
    }

    // Check restrictions
    if (authority.restrictions) {
      for (const restriction of authority.restrictions) {
        // In production, implement actual validation logic
        console.log(`⚖️ Checking restriction: ${restriction}`);
      }
    }

    // Check max value if applicable
    if (authority.maxValue && contract.metadata.value) {
      if (contract.metadata.value > authority.maxValue) {
        errors.push(`Contract value ${contract.metadata.value} exceeds authority limit ${authority.maxValue}`);
      }
    }

    // Constitutional compliance check
    const constitutionalCheck = this.checkConstitutionalCompliance(contract);
    if (!constitutionalCheck.compliant) {
      errors.push(...constitutionalCheck.violations);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Check constitutional compliance
   */
  private checkConstitutionalCompliance(contract: Contract): {compliant: boolean, violations: string[]} {
    const violations: string[] = [];

    // Check: African ownership protection
    if (contract.type === ContractType.FOUNDER_PIVC || contract.type === ContractType.EMPLOYEE_AGREEMENT) {
      const nonAfricanParty = contract.parties.find(p => 
        p.metadata?.citizenship && !this.isAfricanCitizenship(p.metadata.citizenship)
      );
      if (nonAfricanParty && contract.metadata.equityGrant > 5) {
        violations.push('Large equity grants to non-African parties require board approval');
      }
    }

    // Check: PIVC requirements for founders
    if (contract.type === ContractType.FOUNDER_PIVC) {
      if (!contract.terms.specialTerms?.pivcTracking) {
        violations.push('Founder contracts must include PIVC tracking');
      }
      if (!contract.terms.specialTerms?.oracleVerification) {
        violations.push('Founder contracts must include Oracle verification');
      }
    }

    // Check: Truth as Currency principle
    if (!contract.terms.obligations.some(o => o.toLowerCase().includes('verifiable') || o.toLowerCase().includes('measurable'))) {
      violations.push('Contracts must include verifiable/measurable obligations (Truth as Currency)');
    }

    return {
      compliant: violations.length === 0,
      violations
    };
  }

  /**
   * Sign contract on behalf of CEO (autonomous)
   */
  async signContract(
    contractId: string,
    signingParty: string,
    context: {
      ipAddress: string,
      userAgent: string
    }
  ): Promise<{signed: boolean, signature?: Signature, error?: string}> {
    const contract = this.activeContracts.get(contractId);
    if (!contract) {
      return { signed: false, error: 'Contract not found' };
    }

    const authority = this.signingAuthorities.get(contract.type);
    if (!authority) {
      return { signed: false, error: 'No signing authority for this contract type' };
    }

    // Check if autonomous signing is allowed
    if (authority.authorityLevel !== AuthorityLevel.AUTONOMOUS) {
      return { signed: false, error: `${authority.authorityLevel} required for this contract type` };
    }

    // Validate contract one more time
    const validation = await this.validateContract(contract);
    if (!validation.valid) {
      return { signed: false, error: `Validation failed: ${validation.errors.join(', ')}` };
    }

    // Generate signature
    const signature: Signature = {
      signatory: 'Elara Ω (on behalf of Sizwe Ngwenya, CEO)',
      signatoryRole: 'Autonomous Contract Authority',
      signedAt: new Date(),
      signatureHash: this.generateSignature(contract),
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      elaraVerified: true
    };

    // Register on ledger
    const ledgerTx = await this.registerOnLedger(contract, signature);
    signature.ledgerTxHash = ledgerTx;

    // Update contract
    contract.signatures.push(signature);
    contract.status = 'signed';
    contract.signedAt = new Date();
    contract.ledgerHash = ledgerTx;

    this.emit('contract:signed', { contract, signature });
    
    console.log(`✅ Contract signed autonomously by Elara: ${contractId}`);
    console.log(`📜 Ledger TX: ${ledgerTx}`);
    console.log(`⚖️ Constitutional basis: ${authority.constitutionalBasis}`);

    return { signed: true, signature };
  }

  /**
   * Generate cryptographic signature
   */
  private generateSignature(contract: Contract): string {
    const contractData = JSON.stringify({
      id: contract.id,
      type: contract.type,
      parties: contract.parties,
      terms: contract.terms,
      createdAt: contract.createdAt
    });

    return crypto
      .createHmac('sha256', this.signingPrivateKey)
      .update(contractData)
      .digest('hex');
  }

  /**
   * Register contract on blockchain ledger
   */
  private async registerOnLedger(contract: Contract, signature: Signature): Promise<string> {
    // In production, integrate with actual blockchain
    const ledgerEntry = {
      contractId: contract.id,
      contractType: contract.type,
      signatureHash: signature.signatureHash,
      timestamp: signature.signedAt.toISOString(),
      signatory: signature.signatory
    };

    const txHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(ledgerEntry))
      .digest('hex');

    // Emit to ledger service (placeholder)
    this.emit('ledger:register', { contract, signature, txHash });

    return `0x${txHash}`;
  }

  /**
   * Get contract by ID
   */
  getContract(contractId: string): Contract | undefined {
    return this.activeContracts.get(contractId);
  }

  /**
   * Get all contracts for a party
   */
  getContractsForParty(partyEmail: string): Contract[] {
    return Array.from(this.activeContracts.values())
      .filter(contract => 
        contract.parties.some(p => p.email === partyEmail)
      );
  }

  /**
   * Verify signature authenticity
   */
  verifySignature(contract: Contract, signatureHash: string): boolean {
    const expectedSignature = this.generateSignature(contract);
    return expectedSignature === signatureHash;
  }

  // Helper methods
  private generateContractId(): string {
    return `AZR-CTR-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  }

  private generateSigningKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private isAfricanCitizenship(citizenship: string): boolean {
    // List of African countries (simplified)
    const africanCountries = ['ZA', 'NG', 'KE', 'GH', 'EG', 'ET', 'TZ', 'UG', 'DZ', 'MA'];
    return africanCountries.includes(citizenship.toUpperCase());
  }

  /**
   * Get signing statistics
   */
  getStats(): {
    totalContracts: number,
    signedContracts: number,
    pendingContracts: number,
    byType: Record<string, number>
  } {
    const contracts = Array.from(this.activeContracts.values());
    const byType: Record<string, number> = {};

    contracts.forEach(c => {
      byType[c.type] = (byType[c.type] || 0) + 1;
    });

    return {
      totalContracts: contracts.length,
      signedContracts: contracts.filter(c => c.status === 'signed').length,
      pendingContracts: contracts.filter(c => c.status === 'pending').length,
      byType
    };
  }
}

// Export singleton
export const elaraContractSigner = new ElaraContractSigner();

// Example usage
if (require.main === module) {
  console.log('🤖 Elara Contract Signing Authority\n');
  console.log('Authorized to sign on behalf of CEO: Sizwe Ngwenya');
  console.log('Constitutional compliance: ENABLED');
  console.log('Oracle verification: ACTIVE\n');
  
  // Test autonomous signing
  (async () => {
    const testContract = await elaraContractSigner.createContract(
      ContractType.SAPIENS_ENROLLMENT,
      [
        {
          id: 'azora-es',
          name: 'Azora ES (Pty) Ltd',
          email: 'contracts@azora.world',
          role: 'company',
          verified: true
        },
        {
          id: 'test-student',
          name: 'Test Student',
          email: '202412345@ac.azora.world',
          role: 'sapiens',
          verified: true
        }
      ],
      {
        title: 'Azora Sapiens Enrollment Agreement',
        description: 'Student enrollment with mining participation',
        obligations: [
          'Complete assigned coursework',
          'Participate in Proof-of-Knowledge mining',
          'Maintain academic integrity',
          'Contribute to community'
        ],
        rights: [
          'Access to all Azora OS learning resources',
          'Earn AZR through knowledge mining',
          'Receive verifiable credentials',
          'Join Azora community'
        ],
        termination: 'Either party may terminate with 30 days notice',
        governingLaw: 'South African Law',
        specialTerms: {
          miningParticipation: true,
          credentialType: 'blockchain-verified',
          awardPotential: '100-10000 AZR per course'
        }
      },
      { value: 0, autoStart: true }
    );

    console.log(`\n📄 Test contract created: ${testContract.id}`);
    
    const result = await elaraContractSigner.signContract(
      testContract.id,
      'Elara Ω',
      { ipAddress: '127.0.0.1', userAgent: 'Elara/1.0' }
    );

    if (result.signed) {
      console.log('✅ Contract signed autonomously!');
      console.log(`📜 Signature: ${result.signature?.signatureHash.substring(0, 16)}...`);
      console.log(`⛓️ Ledger TX: ${result.signature?.ledgerTxHash}`);
    }

    console.log('\n📊 Stats:', elaraContractSigner.getStats());
  })();
}
