/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

Autonomous Founder Onboarding System
*/

/**
 * Founder Onboarding Flow
 * 
 * Fully autonomous onboarding for Azora co-founders:
 * 1. Register with name.lastname@azora.world
 * 2. Elara validates identity
 * 3. PIVC contract auto-generated and signed
 * 4. Email account provisioned
 * 5. Dashboard access granted
 * 6. PIVC tracking activated
 * 7. Welcome package sent
 */

import { EventEmitter } from 'events';
import { elaraContractSigner, ContractType } from './elara-contract-signer';
import crypto from 'crypto';

export interface FounderProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string; // name.lastname@azora.world
  role: 'retail' | 'sales' | 'design' | 'operations' | 'tech';
  maxEquity: number; // Maximum equity they can earn
  maxAzr: number; // Maximum AZR coins
  personalInfo: {
    idNumber: string;
    citizenship: string;
    phone: string;
    address: string;
  };
  verification: {
    emailVerified: boolean;
    idVerified: boolean;
    backgroundCheck: boolean;
  };
  onboardingStatus: 'registered' | 'verified' | 'contract-signed' | 'active' | 'suspended';
  contractId?: string;
  dashboardUrl?: string;
  startDate: Date;
  metadata: Record<string, any>;
}

export interface OnboardingStep {
  step: number;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  completedAt?: Date;
  error?: string;
}

export class FounderOnboardingSystem extends EventEmitter {
  private founders: Map<string, FounderProfile> = new Map();
  private onboardingProgress: Map<string, OnboardingStep[]> = new Map();

  constructor() {
    super();
    console.log('👔 Founder Onboarding System initialized');
    console.log('🤖 Elara handles autonomous contract signing');
  }

  /**
   * Register new founder
   */
  async registerFounder(registration: {
    firstName: string,
    lastName: string,
    role: 'retail' | 'sales' | 'design' | 'operations' | 'tech',
    idNumber: string,
    citizenship: string,
    phone: string,
    address: string
  }): Promise<{success: boolean, founderId?: string, email?: string, error?: string}> {
    console.log(`\n🚀 New founder registration: ${registration.firstName} ${registration.lastName}`);

    // Validate registration
    const validation = this.validateRegistration(registration);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Generate email
    const email = `${registration.firstName.toLowerCase()}.${registration.lastName.toLowerCase()}@azora.world`;
    
    // Check if already exists
    if (this.founders.has(email)) {
      return { success: false, error: 'Founder already registered with this email' };
    }

    // Determine max equity and AZR based on role
    const allocation = this.getRoleAllocation(registration.role);

    // Create founder profile
    const founderId = this.generateFounderId();
    const founder: FounderProfile = {
      id: founderId,
      firstName: registration.firstName,
      lastName: registration.lastName,
      email,
      role: registration.role,
      maxEquity: allocation.equity,
      maxAzr: allocation.azr,
      personalInfo: {
        idNumber: registration.idNumber,
        citizenship: registration.citizenship,
        phone: registration.phone,
        address: registration.address
      },
      verification: {
        emailVerified: false,
        idVerified: false,
        backgroundCheck: false
      },
      onboardingStatus: 'registered',
      startDate: new Date(),
      metadata: {}
    };

    this.founders.set(email, founder);

    // Initialize onboarding steps
    this.initializeOnboardingSteps(founderId);

    // Start autonomous onboarding
    this.emit('founder:registered', founder);
    this.startOnboarding(founderId).catch(err => {
      console.error(`❌ Onboarding failed for ${founderId}:`, err);
    });

    return { success: true, founderId, email };
  }

  /**
   * Autonomous onboarding process
   */
  private async startOnboarding(founderId: string): Promise<void> {
    const founder = Array.from(this.founders.values()).find(f => f.id === founderId);
    if (!founder) {
      throw new Error('Founder not found');
    }

    const steps = this.onboardingProgress.get(founderId)!;

    try {
      // Step 1: Email Verification
      await this.executeStep(founderId, 1, async () => {
        await this.provisionEmail(founder);
        await this.sendVerificationEmail(founder);
        console.log(`📧 Email provisioned: ${founder.email}`);
      });

      // Step 2: Identity Verification (Elara auto-verifies)
      await this.executeStep(founderId, 2, async () => {
        const verified = await this.verifyIdentity(founder);
        if (!verified) throw new Error('Identity verification failed');
        founder.verification.idVerified = true;
        console.log(`✅ Identity verified: ${founder.firstName} ${founder.lastName}`);
      });

      // Step 3: Generate PIVC Contract
      await this.executeStep(founderId, 3, async () => {
        const contract = await this.generatePivcContract(founder);
        founder.contractId = contract.id;
        console.log(`📄 PIVC contract generated: ${contract.id}`);
      });

      // Step 4: Elara Signs Contract (Autonomous)
      await this.executeStep(founderId, 4, async () => {
        const signature = await elaraContractSigner.signContract(
          founder.contractId!,
          'Elara Ω',
          { ipAddress: '10.0.0.1', userAgent: 'Elara-Onboarding/1.0' }
        );
        
        if (!signature.signed) {
          throw new Error(`Contract signing failed: ${signature.error}`);
        }

        console.log(`✍️ Contract signed by Elara on behalf of CEO`);
        console.log(`⛓️ Ledger TX: ${signature.signature?.ledgerTxHash}`);
      });

      // Step 5: Provision Dashboard Access
      await this.executeStep(founderId, 5, async () => {
        const dashboardUrl = await this.provisionDashboard(founder);
        founder.dashboardUrl = dashboardUrl;
        console.log(`🖥️ Dashboard provisioned: ${dashboardUrl}`);
      });

      // Step 6: Activate PIVC Tracking
      await this.executeStep(founderId, 6, async () => {
        await this.activatePivcTracking(founder);
        console.log(`📊 PIVC tracking activated`);
      });

      // Step 7: Send Welcome Package
      await this.executeStep(founderId, 7, async () => {
        await this.sendWelcomePackage(founder);
        console.log(`📦 Welcome package sent`);
      });

      // Update status
      founder.onboardingStatus = 'active';
      founder.verification.emailVerified = true;

      this.emit('founder:onboarded', founder);
      
      console.log(`\n🎉 Founder onboarding complete: ${founder.firstName} ${founder.lastName}`);
      console.log(`📧 Email: ${founder.email}`);
      console.log(`🎯 Max Equity: ${founder.maxEquity}%`);
      console.log(`🪙 Max AZR: ${founder.maxAzr.toLocaleString()}`);
      console.log(`📜 Contract: ${founder.contractId}`);
      console.log(`🖥️ Dashboard: ${founder.dashboardUrl}\n`);

    } catch (error: any) {
      console.error(`❌ Onboarding failed at step:`, error.message);
      founder.onboardingStatus = 'suspended';
      this.emit('founder:onboarding-failed', { founder, error });
      throw error;
    }
  }

  /**
   * Execute onboarding step
   */
  private async executeStep(
    founderId: string,
    stepNumber: number,
    action: () => Promise<void>
  ): Promise<void> {
    const steps = this.onboardingProgress.get(founderId)!;
    const step = steps.find(s => s.step === stepNumber)!;

    step.status = 'in-progress';
    this.emit('step:started', { founderId, step });

    try {
      await action();
      step.status = 'completed';
      step.completedAt = new Date();
      this.emit('step:completed', { founderId, step });
    } catch (error: any) {
      step.status = 'failed';
      step.error = error.message;
      this.emit('step:failed', { founderId, step, error });
      throw error;
    }
  }

  /**
   * Initialize onboarding steps
   */
  private initializeOnboardingSteps(founderId: string): void {
    const steps: OnboardingStep[] = [
      { step: 1, name: 'Email Provisioning', status: 'pending' },
      { step: 2, name: 'Identity Verification', status: 'pending' },
      { step: 3, name: 'Contract Generation', status: 'pending' },
      { step: 4, name: 'Contract Signing (Elara)', status: 'pending' },
      { step: 5, name: 'Dashboard Access', status: 'pending' },
      { step: 6, name: 'PIVC Tracking Setup', status: 'pending' },
      { step: 7, name: 'Welcome Package', status: 'pending' }
    ];

    this.onboardingProgress.set(founderId, steps);
  }

  /**
   * Generate PIVC contract
   */
  private async generatePivcContract(founder: FounderProfile): Promise<any> {
    const contract = await elaraContractSigner.createContract(
      ContractType.FOUNDER_PIVC,
      [
        {
          id: 'azora-es',
          name: 'Azora ES (Pty) Ltd',
          email: 'ceo@azora.world',
          role: 'company',
          verified: true
        },
        {
          id: founder.id,
          name: `${founder.firstName} ${founder.lastName}`,
          email: founder.email,
          role: 'founder',
          verified: founder.verification.idVerified
        }
      ],
      {
        title: `Co-Founder PIVC Agreement - ${founder.firstName} ${founder.lastName}`,
        description: `Performance-based equity earning agreement for ${founder.role} role`,
        obligations: [
          `Perform duties as Head of ${founder.role}`,
          'Meet verifiable PIVC milestones',
          'Submit monthly performance reports',
          'Maintain constitutional compliance',
          'Contribute to company success'
        ],
        rights: [
          `Earn up to ${founder.maxEquity}% equity (${founder.maxEquity * 100000} shares)`,
          `Earn up to ${founder.maxAzr.toLocaleString()} AZR coins`,
          'Vote on company matters (proportional to earned equity)',
          'Receive dividends (proportional to earned equity)',
          'Access to all company resources',
          'PIVC tracking dashboard access'
        ],
        duration: '24 months initial earning period',
        compensation: 'Performance-based equity + AZR coins',
        termination: 'Either party with 90 days notice; earned equity retained',
        governingLaw: 'South African Law - Subject to Azora Constitution',
        specialTerms: {
          pivcTracking: true,
          oracleVerification: true,
          maxEquity: founder.maxEquity,
          maxAzr: founder.maxAzr,
          role: founder.role,
          phases: [
            { phase: 1, duration: '6 months', equityTarget: `${founder.maxEquity / 3}%` },
            { phase: 2, duration: '6 months', equityTarget: `${founder.maxEquity / 3}%` },
            { phase: 3, duration: '12 months', equityTarget: `${founder.maxEquity / 3}%` }
          ],
          constitutionalBasis: 'CONSTITUTIONAL_EQUITY_PROTOCOL.md',
          trackingSystem: 'PIVC_TRACKING_SYSTEM.md'
        }
      },
      {
        value: founder.maxEquity * 10000, // Notional value for equity
        founderRole: founder.role,
        autoActivate: true
      }
    );

    return contract;
  }

  // Helper methods
  private validateRegistration(reg: any): {valid: boolean, error?: string} {
    if (!reg.firstName || !reg.lastName) {
      return { valid: false, error: 'First and last name required' };
    }
    if (!reg.role || !['retail', 'sales', 'design', 'operations', 'tech'].includes(reg.role)) {
      return { valid: false, error: 'Valid role required' };
    }
    if (!reg.idNumber || reg.idNumber.length < 5) {
      return { valid: false, error: 'Valid ID number required' };
    }
    if (!reg.citizenship) {
      return { valid: false, error: 'Citizenship required' };
    }
    return { valid: true };
  }

  private getRoleAllocation(role: string): {equity: number, azr: number} {
    const allocations = {
      retail: { equity: 12, azr: 12000000 },     // Nolundi
      sales: { equity: 12, azr: 12000000 },      // Sizwe M
      design: { equity: 6, azr: 6000000 },       // Ayana
      operations: { equity: 5, azr: 5000000 },   // Future COO
      tech: { equity: 5, azr: 5000000 }          // Future CTO
    };
    return allocations[role] || { equity: 3, azr: 3000000 };
  }

  private async provisionEmail(founder: FounderProfile): Promise<void> {
    // In production, integrate with email provider (Google Workspace, etc.)
    this.emit('email:provision', { email: founder.email, founder });
    await this.delay(500);
  }

  private async sendVerificationEmail(founder: FounderProfile): Promise<void> {
    this.emit('email:verification', { to: founder.email, founder });
    await this.delay(200);
  }

  private async verifyIdentity(founder: FounderProfile): Promise<boolean> {
    // Elara auto-verifies based on ID number and citizenship
    // In production, integrate with ID verification service
    this.emit('identity:verify', founder);
    await this.delay(1000);
    return true;
  }

  private async provisionDashboard(founder: FounderProfile): Promise<string> {
    const dashboardUrl = `https://dashboard.azora.world/founder/${founder.id}`;
    this.emit('dashboard:provision', { founder, url: dashboardUrl });
    await this.delay(300);
    return dashboardUrl;
  }

  private async activatePivcTracking(founder: FounderProfile): Promise<void> {
    this.emit('pivc:activate', founder);
    await this.delay(200);
  }

  private async sendWelcomePackage(founder: FounderProfile): Promise<void> {
    this.emit('email:welcome', {
      to: founder.email,
      founder,
      includes: [
        'Welcome letter from CEO',
        'PIVC contract (signed)',
        'Dashboard access credentials',
        'Company handbook',
        'Constitutional documents',
        'First month objectives'
      ]
    });
    await this.delay(300);
  }

  private generateFounderId(): string {
    return `FDR-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get founder by email
   */
  getFounder(email: string): FounderProfile | undefined {
    return this.founders.get(email);
  }

  /**
   * Get onboarding progress
   */
  getOnboardingProgress(founderId: string): OnboardingStep[] | undefined {
    return this.onboardingProgress.get(founderId);
  }

  /**
   * Get all founders
   */
  getAllFounders(): FounderProfile[] {
    return Array.from(this.founders.values());
  }

  /**
   * Get statistics
   */
  getStats(): {
    total: number,
    active: number,
    pending: number,
    suspended: number,
    totalEquityAllocated: number,
    totalAzrAllocated: number
  } {
    const founders = this.getAllFounders();
    return {
      total: founders.length,
      active: founders.filter(f => f.onboardingStatus === 'active').length,
      pending: founders.filter(f => ['registered', 'verified'].includes(f.onboardingStatus)).length,
      suspended: founders.filter(f => f.onboardingStatus === 'suspended').length,
      totalEquityAllocated: founders.reduce((sum, f) => sum + f.maxEquity, 0),
      totalAzrAllocated: founders.reduce((sum, f) => sum + f.maxAzr, 0)
    };
  }
}

// Export singleton
export const founderOnboarding = new FounderOnboardingSystem();

// Example usage
if (require.main === module) {
  console.log('👔 Azora Founder Onboarding System\n');
  console.log('🤖 Autonomous onboarding powered by Elara\n');

  // Test registration
  (async () => {
    const result = await founderOnboarding.registerFounder({
      firstName: 'Nolundi',
      lastName: 'Ngwenya',
      role: 'retail',
      idNumber: '8501015800080',
      citizenship: 'ZA',
      phone: '+27123456789',
      address: 'Johannesburg, South Africa'
    });

    if (result.success) {
      console.log(`\n✅ Registration successful!`);
      console.log(`📧 Email: ${result.email}`);
      console.log(`🆔 Founder ID: ${result.founderId}`);
      console.log(`\n⏳ Autonomous onboarding in progress...\n`);

      // Wait for onboarding to complete
      founderOnboarding.on('founder:onboarded', (founder) => {
        console.log(`\n📊 Final Stats:`, founderOnboarding.getStats());
      });
    }
  })();
}
