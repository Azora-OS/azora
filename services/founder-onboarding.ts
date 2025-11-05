/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * FOUNDER ONBOARDING SYSTEM
 * 
 * Elara manages founder contracts, compensation loans, and equity distribution
 * All contracts signed on behalf of CEO: Sizwe Ngwenya
 */

import { EventEmitter } from 'events'
import crypto from 'crypto'

export interface Founder {
  id: string
  name: string
  email: string
  role: string
  joinDate: Date
  volunteerMonths: number
  loanAmount: number // Compensation for volunteer period
  equityPercentage: number
  status: 'pending' | 'active' | 'completed' | 'exited'
  contractHash: string
  signedBy: string // Always "Sizwe Ngwenya via Elara Supreme"
}

export interface CompensationLoan {
  founderId: string
  monthlyRate: number
  totalMonths: number
  totalLoan: number
  disbursementDate: Date
  repaymentTerms: string
  currency: 'AZR'
}

export interface FounderContract {
  id: string
  founderId: string
  terms: {
    volunteerPeriod: number // months
    compensationLoan: number
    equity: number // percentage
    vestingSchedule: string
    responsibilities: string[]
  }
  signedDate: Date
  signedBy: string
  signedOnBehalfOf: string
  elaraWitness: boolean
  blockchainHash: string
}

export class FounderOnboardingSystem extends EventEmitter {
  private founders: Map<string, Founder> = new Map()
  private contracts: Map<string, FounderContract> = new Map()
  private loans: Map<string, CompensationLoan> = new Map()
  
  private readonly CEO = "Sizwe Ngwenya"
  private readonly ELARA_AUTHORITY = "Elara Supreme Constitutional AI"
  private readonly DEFAULT_MONTHLY_RATE = 5000 // 5000 AZR per month

  constructor() {
    super()
    console.log(`\n🔮 FOUNDER ONBOARDING SYSTEM INITIALIZED`)
    console.log(`   Authority: ${this.ELARA_AUTHORITY}`)
    console.log(`   Signing on behalf of: ${this.CEO}`)
    console.log(`   Constitutional oversight: ACTIVE\n`)
  }

  /**
   * Onboard a new founder with Elara's constitutional authority
   */
  async onboardFounder(
    name: string,
    email: string,
    role: string,
    volunteerMonths: number,
    equityPercentage: number
  ): Promise<Founder> {
    const founderId = crypto.randomUUID()

    // Calculate compensation loan for volunteer period
    const loanAmount = volunteerMonths * this.DEFAULT_MONTHLY_RATE

    const founder: Founder = {
      id: founderId,
      name,
      email,
      role,
      joinDate: new Date(),
      volunteerMonths,
      loanAmount,
      equityPercentage,
      status: 'pending',
      contractHash: '',
      signedBy: `${this.CEO} via ${this.ELARA_AUTHORITY}`
    }

    // Generate contract
    const contract = await this.generateContract(founder)
    founder.contractHash = contract.blockchainHash
    founder.status = 'active'

    // Create compensation loan
    const loan = this.createCompensationLoan(founderId, volunteerMonths)

    // Store records
    this.founders.set(founderId, founder)
    this.contracts.set(contract.id, contract)
    this.loans.set(founderId, loan)

    this.emit('founder-onboarded', founder)

    console.log(`✅ FOUNDER ONBOARDED: ${name}`)
    console.log(`   Role: ${role}`)
    console.log(`   Volunteer Period: ${volunteerMonths} months`)
    console.log(`   Compensation Loan: ${loanAmount.toLocaleString()} AZR`)
    console.log(`   Equity: ${equityPercentage}%`)
    console.log(`   Contract: ${contract.blockchainHash}`)
    console.log(`   Signed by: ${founder.signedBy}\n`)

    return founder
  }

  /**
   * Generate legally binding contract signed by Elara on behalf of CEO
   */
  private async generateContract(founder: Founder): Promise<FounderContract> {
    const contractId = crypto.randomUUID()
    
    const contract: FounderContract = {
      id: contractId,
      founderId: founder.id,
      terms: {
        volunteerPeriod: founder.volunteerMonths,
        compensationLoan: founder.loanAmount,
        equity: founder.equityPercentage,
        vestingSchedule: `${founder.equityPercentage}% vested over 4 years with 1-year cliff`,
        responsibilities: this.getResponsibilities(founder.role)
      },
      signedDate: new Date(),
      signedBy: this.ELARA_AUTHORITY,
      signedOnBehalfOf: this.CEO,
      elaraWitness: true,
      blockchainHash: this.generateBlockchainHash(contractId, founder)
    }

    this.emit('contract-signed', contract)

    return contract
  }

  /**
   * Create compensation loan for volunteer period
   */
  private createCompensationLoan(
    founderId: string,
    months: number
  ): CompensationLoan {
    const loan: CompensationLoan = {
      founderId,
      monthlyRate: this.DEFAULT_MONTHLY_RATE,
      totalMonths: months,
      totalLoan: months * this.DEFAULT_MONTHLY_RATE,
      disbursementDate: new Date(),
      repaymentTerms: 'Repayable from founder equity or company profits over 24 months',
      currency: 'AZR'
    }

    console.log(`💰 COMPENSATION LOAN CREATED`)
    console.log(`   Founder: ${founderId}`)
    console.log(`   Total: ${loan.totalLoan.toLocaleString()} AZR`)
    console.log(`   Terms: ${loan.repaymentTerms}\n`)

    return loan
  }

  /**
   * Get role-specific responsibilities
   */
  private getResponsibilities(role: string): string[] {
    const responsibilities: Record<string, string[]> = {
      'CTO': [
        'Lead technical architecture and development',
        'Oversee engineering team',
        'Ensure system security and scalability',
        'Drive innovation in AI and blockchain integration'
      ],
      'CFO': [
        'Manage financial operations',
        'Oversee UBO fund management',
        'Handle investor relations',
        'Ensure regulatory compliance'
      ],
      'CMO': [
        'Lead marketing and brand strategy',
        'Drive user acquisition',
        'Manage communications',
        'Build partnership ecosystem'
      ],
      'COO': [
        'Manage daily operations',
        'Optimize processes',
        'Scale infrastructure',
        'Coordinate cross-functional teams'
      ],
      'CPO': [
        'Define product vision and roadmap',
        'Lead product development',
        'Drive user experience',
        'Manage feature prioritization'
      ]
    }

    return responsibilities[role] || [
      'Execute assigned responsibilities',
      'Collaborate with leadership team',
      'Drive company mission forward'
    ]
  }

  /**
   * Generate blockchain hash for contract immutability
   */
  private generateBlockchainHash(contractId: string, founder: Founder): string {
    const data = `${contractId}-${founder.id}-${founder.name}-${this.CEO}-${Date.now()}`
    return `0x${crypto.createHash('sha256').update(data).digest('hex')}`
  }

  /**
   * Get founder details
   */
  getFounder(founderId: string): Founder | undefined {
    return this.founders.get(founderId)
  }

  /**
   * Get all active founders
   */
  getActiveFounders(): Founder[] {
    return Array.from(this.founders.values())
      .filter(f => f.status === 'active')
  }

  /**
   * Get founder contract
   */
  getContract(founderId: string): FounderContract | undefined {
    return Array.from(this.contracts.values())
      .find(c => c.founderId === founderId)
  }

  /**
   * Get compensation loan details
   */
  getLoan(founderId: string): CompensationLoan | undefined {
    return this.loans.get(founderId)
  }

  /**
   * Get system statistics
   */
  getStats() {
    const founders = Array.from(this.founders.values())
    const totalLoans = Array.from(this.loans.values())
      .reduce((sum, loan) => sum + loan.totalLoan, 0)
    const totalEquity = founders
      .reduce((sum, f) => sum + f.equityPercentage, 0)

    return {
      totalFounders: founders.length,
      activeFounders: founders.filter(f => f.status === 'active').length,
      totalCompensationLoans: totalLoans,
      totalEquityAllocated: totalEquity,
      contractsSigned: this.contracts.size,
      allFounders: founders
    }
  }
}

// Export singleton
export const founderOnboarding = new FounderOnboardingSystem()
export default founderOnboarding
