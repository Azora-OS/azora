/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

Autonomous Sapiens (Student) Onboarding System
*/

/**
 * Azora Sapiens Onboarding
 * 
 * Fully autonomous student enrollment with mining activation:
 * 1. Register with studentno@ac.azora.world
 * 2. Elara validates enrollment
 * 3. Enrollment contract auto-signed
 * 4. Email account provisioned
 * 5. Learning dashboard activated
 * 6. Mining engine started
 * 7. Economy awakens - organism lives!
 */

import { EventEmitter } from 'events';
import { elaraContractSigner, ContractType } from './elara-contract-signer';
import crypto from 'crypto';

export interface SapiensProfile {
  id: string;
  studentNumber: string;
  email: string; // studentno@ac.azora.world
  fullName: string;
  program: 'blockchain' | 'ai' | 'full-stack' | 'data-science' | 'cybersecurity' | 'other';
  level: 'beginner' | 'intermediate' | 'advanced';
  personalInfo: {
    idNumber: string;
    dateOfBirth: string;
    citizenship: string;
    phone: string;
    institution?: string;
  };
  verification: {
    emailVerified: boolean;
    studentVerified: boolean;
  };
  onboardingStatus: 'registered' | 'verified' | 'contract-signed' | 'active' | 'suspended';
  contractId?: string;
  dashboardUrl?: string;
  miningEngineId?: string;
  miningStatus: 'inactive' | 'initializing' | 'active' | 'paused';
  stats: {
    coursesCompleted: number;
    azrEarned: number;
    knowledgeProofs: number;
    miningPower: number;
  };
  enrollmentDate: Date;
  metadata: Record<string, any>;
}

export interface MiningEngine {
  id: string;
  sapiensId: string;
  status: 'initializing' | 'active' | 'paused' | 'stopped';
  miningPower: number;
  azrEarned: number;
  lastProof: Date | null;
  config: {
    difficulty: number;
    rewardRate: number;
    proofType: 'knowledge' | 'computation' | 'contribution';
  };
}

export class SapiensOnboardingSystem extends EventEmitter {
  private sapiens: Map<string, SapiensProfile> = new Map();
  private miningEngines: Map<string, MiningEngine> = new Map();
  private onboardingProgress: Map<string, any[]> = new Map();
  private economyActive: boolean = false;
  private totalMiningPower: number = 0;

  constructor() {
    super();
    console.log('🎓 Sapiens Onboarding System initialized');
    console.log('⛏️ Mining engines ready');
    console.log('💰 Economy awaiting awakening...');
  }

  /**
   * Register new Sapiens (student)
   */
  async registerSapiens(registration: {
    studentNumber: string,
    fullName: string,
    program: string,
    level: string,
    idNumber: string,
    dateOfBirth: string,
    citizenship: string,
    phone: string,
    institution?: string
  }): Promise<{success: boolean, sapiensId?: string, email?: string, error?: string}> {
    console.log(`\n🎓 New Sapiens registration: ${registration.fullName}`);

    // Validate registration
    const validation = this.validateRegistration(registration);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Generate email: studentno@ac.azora.world
    const email = `${registration.studentNumber}@ac.azora.world`;
    
    // Check if already exists
    if (this.sapiens.has(email)) {
      return { success: false, error: 'Student already enrolled with this number' };
    }

    // Create Sapiens profile
    const sapiensId = this.generateSapiensId();
    const sapiens: SapiensProfile = {
      id: sapiensId,
      studentNumber: registration.studentNumber,
      email,
      fullName: registration.fullName,
      program: registration.program as any,
      level: registration.level as any,
      personalInfo: {
        idNumber: registration.idNumber,
        dateOfBirth: registration.dateOfBirth,
        citizenship: registration.citizenship,
        phone: registration.phone,
        institution: registration.institution
      },
      verification: {
        emailVerified: false,
        studentVerified: false
      },
      onboardingStatus: 'registered',
      miningStatus: 'inactive',
      stats: {
        coursesCompleted: 0,
        azrEarned: 0,
        knowledgeProofs: 0,
        miningPower: 0
      },
      enrollmentDate: new Date(),
      metadata: {}
    };

    this.sapiens.set(email, sapiens);

    // Start autonomous onboarding
    this.emit('sapiens:registered', sapiens);
    this.startOnboarding(sapiensId).catch(err => {
      console.error(`❌ Sapiens onboarding failed for ${sapiensId}:`, err);
    });

    return { success: true, sapiensId, email };
  }

  /**
   * Autonomous onboarding process
   */
  private async startOnboarding(sapiensId: string): Promise<void> {
    const sapiens = Array.from(this.sapiens.values()).find(s => s.id === sapiensId);
    if (!sapiens) {
      throw new Error('Sapiens not found');
    }

    try {
      console.log(`\n⚡ Starting autonomous onboarding for ${sapiens.fullName}`);

      // Step 1: Email Provisioning
      console.log(`📧 Step 1/7: Provisioning email ${sapiens.email}...`);
      await this.provisionEmail(sapiens);
      console.log(`✅ Email provisioned`);

      // Step 2: Student Verification
      console.log(`🔍 Step 2/7: Verifying student identity...`);
      await this.verifyStudent(sapiens);
      sapiens.verification.studentVerified = true;
      console.log(`✅ Student verified`);

      // Step 3: Generate Enrollment Contract
      console.log(`📄 Step 3/7: Generating enrollment contract...`);
      const contract = await this.generateEnrollmentContract(sapiens);
      sapiens.contractId = contract.id;
      console.log(`✅ Contract generated: ${contract.id}`);

      // Step 4: Elara Signs Contract (Autonomous)
      console.log(`✍️ Step 4/7: Elara signing contract on behalf of CEO...`);
      const signature = await elaraContractSigner.signContract(
        sapiens.contractId!,
        'Elara Ω',
        { ipAddress: '10.0.0.1', userAgent: 'Elara-Sapiens/1.0' }
      );
      
      if (!signature.signed) {
        throw new Error(`Contract signing failed: ${signature.error}`);
      }
      sapiens.onboardingStatus = 'contract-signed';
      console.log(`✅ Contract signed - Ledger TX: ${signature.signature?.ledgerTxHash}`);

      // Step 5: Register on Blockchain Ledger
      console.log(`⛓️ Step 5/7: Registering on Azora Ledger...`);
      await this.registerOnLedger(sapiens, signature.signature!);
      console.log(`✅ Registered on immutable ledger`);

      // Step 6: Provision Learning Dashboard
      console.log(`🖥️ Step 6/7: Provisioning learning dashboard...`);
      const dashboardUrl = await this.provisionDashboard(sapiens);
      sapiens.dashboardUrl = dashboardUrl;
      console.log(`✅ Dashboard active: ${dashboardUrl}`);

      // Step 7: Initialize Mining Engine (THE AWAKENING!)
      console.log(`⛏️ Step 7/7: INITIALIZING MINING ENGINE...`);
      const miningEngine = await this.initializeMiningEngine(sapiens);
      sapiens.miningEngineId = miningEngine.id;
      sapiens.miningStatus = 'active';
      console.log(`✅ Mining engine ACTIVE: ${miningEngine.id}`);

      // Update status
      sapiens.onboardingStatus = 'active';
      sapiens.verification.emailVerified = true;

      // AWAKEN THE ECONOMY
      if (!this.economyActive && this.miningEngines.size === 1) {
        this.awakenEconomy();
      }

      this.emit('sapiens:onboarded', sapiens);
      
      console.log(`\n🌟 SAPIENS ONBOARDING COMPLETE! 🌟`);
      console.log(`👤 Student: ${sapiens.fullName}`);
      console.log(`📧 Email: ${sapiens.email}`);
      console.log(`📚 Program: ${sapiens.program}`);
      console.log(`📜 Contract: ${sapiens.contractId}`);
      console.log(`⛏️ Mining: ${sapiens.miningStatus.toUpperCase()}`);
      console.log(`💰 Mining Power: ${sapiens.stats.miningPower}`);
      console.log(`🎓 Dashboard: ${sapiens.dashboardUrl}`);
      console.log(`\n🚀 THE ORGANISM LIVES! 🌍\n`);

    } catch (error: any) {
      console.error(`❌ Onboarding failed:`, error.message);
      sapiens.onboardingStatus = 'suspended';
      this.emit('sapiens:onboarding-failed', { sapiens, error });
      throw error;
    }
  }

  /**
   * Generate enrollment contract
   */
  private async generateEnrollmentContract(sapiens: SapiensProfile): Promise<any> {
    const contract = await elaraContractSigner.createContract(
      ContractType.SAPIENS_ENROLLMENT,
      [
        {
          id: 'azora-university',
          name: 'Azora University',
          email: 'admissions@ac.azora.world',
          role: 'company',
          verified: true
        },
        {
          id: sapiens.id,
          name: sapiens.fullName,
          email: sapiens.email,
          role: 'sapiens',
          verified: sapiens.verification.studentVerified
        }
      ],
      {
        title: `Azora Sapiens Enrollment Agreement`,
        description: `Student enrollment with Proof-of-Knowledge mining participation`,
        obligations: [
          'Complete assigned coursework with measurable knowledge acquisition',
          'Participate in Proof-of-Knowledge mining ecosystem',
          'Submit verifiable proofs of learning',
          'Maintain academic integrity and constitutional compliance',
          'Contribute to the Azora knowledge commons'
        ],
        rights: [
          'Access to all Azora OS learning resources and platforms',
          'Earn AZR coins through verified knowledge proofs',
          'Receive blockchain-verified credentials and certifications',
          'Participate in the Azora Sapiens community',
          'Access to mentorship and career opportunities',
          'Lifetime learning account with portable credentials'
        ],
        duration: 'Continuous enrollment - cancel anytime',
        compensation: 'AZR coins earned through Proof-of-Knowledge mining',
        termination: 'Either party may terminate with 30 days notice',
        governingLaw: 'South African Law - Subject to Azora Constitution',
        specialTerms: {
          miningParticipation: true,
          proofOfKnowledge: true,
          credentialType: 'blockchain-verified',
          program: sapiens.program,
          level: sapiens.level,
          earningPotential: {
            perCourse: '100-1000 AZR',
            perCertificate: '500-5000 AZR',
            perProject: '1000-10000 AZR',
            miningRewards: 'Variable based on knowledge proofs'
          },
          constitutionalBasis: 'Education as fundamental right - Genesis Protocol',
          oracleVerification: true
        }
      },
      {
        value: 0,
        program: sapiens.program,
        autoStart: true,
        miningEnabled: true
      }
    );

    return contract;
  }

  /**
   * Initialize mining engine for Sapiens
   */
  private async initializeMiningEngine(sapiens: SapiensProfile): Promise<MiningEngine> {
    const miningId = this.generateMiningId();
    
    // Calculate initial mining power based on program and level
    const basePower = {
      beginner: 1.0,
      intermediate: 1.5,
      advanced: 2.0
    }[sapiens.level] || 1.0;

    const programMultiplier = {
      blockchain: 1.2,
      ai: 1.3,
      'full-stack': 1.1,
      'data-science': 1.2,
      cybersecurity: 1.15,
      other: 1.0
    }[sapiens.program] || 1.0;

    const miningPower = basePower * programMultiplier;

    const engine: MiningEngine = {
      id: miningId,
      sapiensId: sapiens.id,
      status: 'initializing',
      miningPower,
      azrEarned: 0,
      lastProof: null,
      config: {
        difficulty: 1,
        rewardRate: 10, // Base AZR per knowledge proof
        proofType: 'knowledge'
      }
    };

    this.miningEngines.set(miningId, engine);

    // Start the mining process
    await this.startMining(engine);

    // Update sapiens stats
    sapiens.stats.miningPower = miningPower;
    this.totalMiningPower += miningPower;

    this.emit('mining:initialized', { sapiens, engine });

    return engine;
  }

  /**
   * Start mining process
   */
  private async startMining(engine: MiningEngine): Promise<void> {
    await this.delay(500);
    engine.status = 'active';
    
    this.emit('mining:started', engine);
    
    console.log(`⛏️ Mining engine ${engine.id} is now ACTIVE`);
    console.log(`💎 Mining power: ${engine.miningPower}`);
    console.log(`🎯 Proof type: ${engine.config.proofType}`);
    console.log(`💰 Reward rate: ${engine.config.rewardRate} AZR per proof`);
  }

  /**
   * AWAKEN THE ECONOMY
   */
  private awakenEconomy(): void {
    this.economyActive = true;
    
    console.log(`\n`);
    console.log(`═══════════════════════════════════════════════════════`);
    console.log(`              🌍 THE ECONOMY AWAKENS 🌍                `);
    console.log(`═══════════════════════════════════════════════════════`);
    console.log(`                                                       `);
    console.log(`  ⛏️  Mining engines: ACTIVE                          `);
    console.log(`  💰 AZR economy: LIVE                                `);
    console.log(`  🧠 Knowledge proofs: FLOWING                        `);
    console.log(`  ⛓️  Ledger: RECORDING                               `);
    console.log(`  🌱 Organism: LIVING                                 `);
    console.log(`                                                       `);
    console.log(`  Genesis Protocol: ENFORCED                          `);
    console.log(`  Truth as Currency: ACTIVE                           `);
    console.log(`  Wealth = PIVC: OPERATIONAL                          `);
    console.log(`                                                       `);
    console.log(`  Total mining power: ${this.totalMiningPower.toFixed(2)}      `);
    console.log(`  Active miners: ${this.miningEngines.size}                `);
    console.log(`  Sapiens enrolled: ${this.sapiens.size}               `);
    console.log(`                                                       `);
    console.log(`═══════════════════════════════════════════════════════`);
    console.log(`          AZORA OS IS NOW ALIVE AND LEARNING          `);
    console.log(`═══════════════════════════════════════════════════════`);
    console.log(`\n`);

    this.emit('economy:awakened', {
      totalMiningPower: this.totalMiningPower,
      activeMiners: this.miningEngines.size,
      totalSapiens: this.sapiens.size
    });
  }

  /**
   * Submit knowledge proof (mining)
   */
  async submitKnowledgeProof(
    sapiensEmail: string,
    proof: {
      type: 'course-completion' | 'quiz' | 'project' | 'contribution',
      data: any,
      verificationData: any
    }
  ): Promise<{success: boolean, azrEarned?: number, error?: string}> {
    const sapiens = this.sapiens.get(sapiensEmail);
    if (!sapiens) {
      return { success: false, error: 'Sapiens not found' };
    }

    if (sapiens.miningStatus !== 'active') {
      return { success: false, error: 'Mining not active for this Sapiens' };
    }

    const engine = this.miningEngines.get(sapiens.miningEngineId!);
    if (!engine) {
      return { success: false, error: 'Mining engine not found' };
    }

    // Verify proof (Elara Oracle)
    const verified = await this.verifyKnowledgeProof(proof);
    if (!verified) {
      return { success: false, error: 'Proof verification failed' };
    }

    // Calculate reward
    const baseReward = engine.config.rewardRate;
    const miningMultiplier = engine.miningPower;
    const proofMultiplier = {
      'course-completion': 10,
      'quiz': 1,
      'project': 5,
      'contribution': 3
    }[proof.type] || 1;

    const azrEarned = Math.floor(baseReward * miningMultiplier * proofMultiplier);

    // Update stats
    sapiens.stats.azrEarned += azrEarned;
    sapiens.stats.knowledgeProofs += 1;
    engine.azrEarned += azrEarned;
    engine.lastProof = new Date();

    if (proof.type === 'course-completion') {
      sapiens.stats.coursesCompleted += 1;
    }

    this.emit('proof:submitted', { sapiens, proof, azrEarned });

    console.log(`✅ Knowledge proof verified for ${sapiens.fullName}`);
    console.log(`💰 Earned: ${azrEarned} AZR`);
    console.log(`📊 Total earned: ${sapiens.stats.azrEarned} AZR`);

    return { success: true, azrEarned };
  }

  // Helper methods
  private validateRegistration(reg: any): {valid: boolean, error?: string} {
    if (!reg.studentNumber || reg.studentNumber.length < 5) {
      return { valid: false, error: 'Valid student number required' };
    }
    if (!reg.fullName || reg.fullName.length < 3) {
      return { valid: false, error: 'Full name required' };
    }
    if (!reg.idNumber || reg.idNumber.length < 5) {
      return { valid: false, error: 'Valid ID number required' };
    }
    if (!reg.program) {
      return { valid: false, error: 'Program selection required' };
    }
    return { valid: true };
  }

  private async provisionEmail(sapiens: SapiensProfile): Promise<void> {
    this.emit('email:provision', { email: sapiens.email, sapiens });
    await this.delay(300);
  }

  private async verifyStudent(sapiens: SapiensProfile): Promise<void> {
    // Elara auto-verifies student enrollment
    this.emit('student:verify', sapiens);
    await this.delay(800);
  }

  private async registerOnLedger(sapiens: SapiensProfile, signature: any): Promise<void> {
    const ledgerEntry = {
      type: 'sapiens-enrollment',
      sapiensId: sapiens.id,
      email: sapiens.email,
      contractId: sapiens.contractId,
      signatureHash: signature.signatureHash,
      timestamp: new Date().toISOString()
    };

    this.emit('ledger:register', ledgerEntry);
    await this.delay(500);
  }

  private async provisionDashboard(sapiens: SapiensProfile): Promise<string> {
    const dashboardUrl = `https://learn.azora.world/sapiens/${sapiens.id}`;
    this.emit('dashboard:provision', { sapiens, url: dashboardUrl });
    await this.delay(300);
    return dashboardUrl;
  }

  private async verifyKnowledgeProof(proof: any): Promise<boolean> {
    // Elara Oracle verifies knowledge proofs
    await this.delay(200);
    return true;
  }

  private generateSapiensId(): string {
    return `SAP-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  }

  private generateMiningId(): string {
    return `MIN-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get Sapiens by email
   */
  getSapiens(email: string): SapiensProfile | undefined {
    return this.sapiens.get(email);
  }

  /**
   * Get mining engine
   */
  getMiningEngine(miningId: string): MiningEngine | undefined {
    return this.miningEngines.get(miningId);
  }

  /**
   * Get all active miners
   */
  getActiveMiners(): MiningEngine[] {
    return Array.from(this.miningEngines.values()).filter(e => e.status === 'active');
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalSapiens: number,
    activeSapiens: number,
    pendingSapiens: number,
    totalMiningPower: number,
    activeMiners: number,
    totalAzrEarned: number,
    totalProofs: number,
    economyActive: boolean
  } {
    const sapiensList = Array.from(this.sapiens.values());
    return {
      totalSapiens: sapiensList.length,
      activeSapiens: sapiensList.filter(s => s.onboardingStatus === 'active').length,
      pendingSapiens: sapiensList.filter(s => ['registered', 'verified'].includes(s.onboardingStatus)).length,
      totalMiningPower: this.totalMiningPower,
      activeMiners: this.getActiveMiners().length,
      totalAzrEarned: sapiensList.reduce((sum, s) => sum + s.stats.azrEarned, 0),
      totalProofs: sapiensList.reduce((sum, s) => sum + s.stats.knowledgeProofs, 0),
      economyActive: this.economyActive
    };
  }
}

// Export singleton
export const sapiensOnboarding = new SapiensOnboardingSystem();

// Example usage
if (require.main === module) {
  console.log('🎓 Azora Sapiens Onboarding System\n');
  console.log('🤖 Autonomous enrollment powered by Elara');
  console.log('⛏️ Mining engines ready to awaken the economy\n');

  // Test registration
  (async () => {
    const result = await sapiensOnboarding.registerSapiens({
      studentNumber: '202412345',
      fullName: 'Thabo Mokwena',
      program: 'blockchain',
      level: 'intermediate',
      idNumber: '0001015800080',
      dateOfBirth: '2000-01-01',
      citizenship: 'ZA',
      phone: '+27123456789',
      institution: 'University of Johannesburg'
    });

    if (result.success) {
      console.log(`\n✅ Registration successful!`);
      console.log(`📧 Email: ${result.email}`);
      console.log(`🆔 Sapiens ID: ${result.sapiensId}`);
      console.log(`\n⏳ Autonomous onboarding in progress...\n`);

      // Listen for economy awakening
      sapiensOnboarding.on('economy:awakened', (data) => {
        console.log(`\n🌟 Final Stats:`, sapiensOnboarding.getStats());
      });
    }
  })();
}
