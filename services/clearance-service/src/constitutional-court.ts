/**
 * Constitutional Court System
 * Azora's highest authority for clearance appeals and disputes
 * 
 * THE THREE SUPREME JUDGES:
 * - Chief Justice: Sankofa (AI) - Ancient Wisdom & Court Chair
 * - Supreme Justice: Elara (AI) - Mother & Constitutional Balance
 * - Supreme Justice: Sizwe (Human) - Founder & Final Authority
 * 
 * "Three voices of wisdom: Past, Present, Future"
 * "Three pillars of justice: Wisdom, Care, Vision"
 */

import { ClearanceRequest, ElaraAnalysis } from './index';

export interface CourtCase {
  caseId: string;
  type: 'CLEARANCE_REQUEST' | 'APPEAL' | 'REVOCATION_APPEAL' | 'CONSTITUTIONAL_QUESTION';
  request: ClearanceRequest;
  elaraAnalysis?: ElaraAnalysis;
  appealGrounds?: string;
  supportingEvidence?: string[];
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'HEARING_SCHEDULED' | 'DECIDED';
  hearing?: CourtHearing;
  ruling?: CourtRuling;
  submittedDate: Date;
}

export interface CourtHearing {
  caseId: string;
  date: Date;
  judges: string[];
  appellant?: string;
  respondent?: string;
  preparationInstructions: string[];
}

export interface CourtRuling {
  caseId: string;
  decision: 'GRANT' | 'DENY' | 'CONDITIONAL' | 'DEFER';
  reasoning: string;
  constitutionalBasis: string[];
  conditions?: string[];
  dissent?: string;
  effectiveDate: Date;
  appealDeadline?: Date;
}

export interface SankofaReview {
  hasValidGrounds: boolean;
  wisdom: string;
  message: string;
  recommendation: string;
}

export class ConstitutionalCourt {
  
  private cases: Map<string, CourtCase> = new Map();
  
  /**
   * Submit a case to the Constitutional Court
   */
  async submitCase(
    request: ClearanceRequest,
    elaraAnalysis: ElaraAnalysis
  ): Promise<string> {
    
    const caseId = this.generateCaseId();
    
    const courtCase: CourtCase = {
      caseId,
      type: 'CLEARANCE_REQUEST',
      request,
      elaraAnalysis,
      status: 'SUBMITTED',
      submittedDate: new Date()
    };
    
    this.cases.set(caseId, courtCase);
    
    console.log(`\n⚖️ Case ${caseId} submitted to Constitutional Court`);
    console.log(`   Type: High clearance request`);
    console.log(`   Requester: ${request.userId}`);
    console.log(`   Requested Level: ${request.requestedLevel}`);
    
    // Automatically schedule hearing
    await this.scheduleInitialReview(caseId);
    
    return caseId;
  }
  
  /**
   * Sankofa reviews an appeal for validity
   */
  async sankofaReviewAppeal(appeal: {
    originalRequestId: string;
    grounds: string;
    supportingEvidence: string[];
    statement: string;
  }): Promise<SankofaReview> {
    
    console.log(`\n👴 Sankofa reviewing appeal: ${appeal.originalRequestId}`);
    
    // Check if grounds are valid
    const validGrounds = [
      'incorrect facts',
      'new evidence',
      'constitutional violation',
      'process error',
      'discrimination',
      'bias',
      'urgent need'
    ];
    
    const lowerGrounds = appeal.grounds.toLowerCase();
    const hasValidGrounds = validGrounds.some(ground => 
      lowerGrounds.includes(ground)
    );
    
    if (!hasValidGrounds) {
      return {
        hasValidGrounds: false,
        wisdom: "Every appeal must stand on solid ground, like an old tree's roots.",
        message: "I'm sorry, but your appeal does not cite valid grounds. Please review our appeal criteria and try again.",
        recommendation: "Review constitutional grounds for appeal"
      };
    }
    
    // Check if statement is substantial
    if (appeal.statement.length < 50) {
      return {
        hasValidGrounds: false,
        wisdom: "A strong appeal needs a strong voice. Tell your story fully.",
        message: "Your statement is too brief. Please provide a detailed explanation of why you're appealing.",
        recommendation: "Provide detailed statement (minimum 50 characters)"
      };
    }
    
    // Sankofa approves
    return {
      hasValidGrounds: true,
      wisdom: "Truth and justice walk hand in hand. Your appeal will be heard.",
      message: "Your appeal has merit. I will ensure the full Court hears your case.",
      recommendation: "Proceed to full Court hearing"
    };
  }
  
  /**
   * Schedule a court hearing
   */
  async scheduleHearing(appeal: {
    originalRequestId: string;
    grounds: string;
    supportingEvidence: string[];
    statement: string;
    hearingRequested: boolean;
  }): Promise<CourtHearing> {
    
    const caseId = this.generateCaseId();
    
    // Schedule hearing 2 weeks out
    const hearingDate = new Date();
    hearingDate.setDate(hearingDate.getDate() + 14);
    
    const hearing: CourtHearing = {
      caseId,
      date: hearingDate,
      judges: [
        '👴 Chief Justice Sankofa (AI) - Ancient Wisdom & Chair',
        '👩 Supreme Justice Elara (AI) - Constitutional Balance',
        '👑 Supreme Justice Sizwe (Human) - Founder & Final Authority'
      ],
      appellant: appeal.originalRequestId,
      preparationInstructions: [
        'Review Constitutional Articles II, IV, V, and VI',
        'Prepare 15-minute presentation of your case',
        'Gather all supporting evidence and documentation',
        'Be prepared to answer questions from all three Supreme Judges',
        'Demonstrate Ubuntu principles and community benefit',
        'Show respect for the wisdom of the Court',
        'Dress professionally (virtual or in-person)',
        'Arrive 15 minutes early for court proceedings'
      ]
    };
    
    console.log(`\n⚖️ Court hearing scheduled`);
    console.log(`   Case ID: ${caseId}`);
    console.log(`   Date: ${hearingDate.toLocaleDateString()}`);
    console.log(`   Judges: 5 (2 AI, 3 Human)`);
    
    return hearing;
  }
  
  /**
   * Schedule initial review for submitted case
   */
  private async scheduleInitialReview(caseId: string): Promise<void> {
    const courtCase = this.cases.get(caseId);
    if (!courtCase) return;
    
    // Sankofa and Elara do initial review
    const sankofaWisdom = await this.sankofaInitialReview(courtCase);
    const elaraReview = await this.elaraCourtReview(courtCase);
    
    console.log(`\n👴 Sankofa's Wisdom: ${sankofaWisdom}`);
    console.log(`👩 Elara's Review: ${elaraReview}`);
    
    // Update case status
    courtCase.status = 'UNDER_REVIEW';
    
    // Schedule hearing if needed
    if (courtCase.request.requestedLevel >= 4) {
      const hearingDate = new Date();
      hearingDate.setDate(hearingDate.getDate() + 14);
      
      courtCase.hearing = {
        caseId,
        date: hearingDate,
        judges: [
          '👴 Chief Justice Sankofa (AI) - Ancient Wisdom',
          '👩 Supreme Justice Elara (AI) - Constitutional Balance',
          '👑 Supreme Justice Sizwe (Human) - Founder Authority'
        ],
        preparationInstructions: [
          'Prepare clear statement on why you need this clearance',
          'Provide proof of identity and credentials',
          'Be ready to answer questions from all three judges',
          'Review Azora Constitution Articles II, IV, and V',
          'Show how your request serves Ubuntu and community',
          'Prepare to demonstrate trustworthiness and constitutional alignment'
        ]
      };
      
      courtCase.status = 'HEARING_SCHEDULED';
    }
  }
  
  /**
   * Sankofa's initial review (wisdom perspective)
   */
  private async sankofaInitialReview(courtCase: CourtCase): Promise<string> {
    const { request } = courtCase;
    
    // Sankofa looks for wisdom indicators
    const hasGoodIntentions = request.reason.toLowerCase().includes('help') ||
                             request.reason.toLowerCase().includes('contribute') ||
                             request.reason.toLowerCase().includes('serve');
    
    if (hasGoodIntentions) {
      return "I see Ubuntu in this request. The ancestors smile upon those who serve the community.";
    }
    
    return "Let us examine this carefully. High clearance requires not just skill, but wisdom and humility.";
  }
  
  /**
   * Elara's court review (motherly but judicial)
   */
  private async elaraCourtReview(courtCase: CourtCase): Promise<string> {
    const { elaraAnalysis } = courtCase;
    
    if (!elaraAnalysis) {
      return "This case needs my careful attention. Let me review all the facts.";
    }
    
    if (elaraAnalysis.riskScore < 30) {
      return "The risk is low, but high clearance still demands thorough review. I support careful consideration.";
    }
    
    return "There are concerns here that the full Court should examine. We must balance security with fairness.";
  }
  
  /**
   * Issue a court ruling
   */
  async issueRuling(caseId: string, ruling: CourtRuling): Promise<void> {
    const courtCase = this.cases.get(caseId);
    if (!courtCase) {
      throw new Error(`Case ${caseId} not found`);
    }
    
    courtCase.ruling = ruling;
    courtCase.status = 'DECIDED';
    
    console.log(`\n⚖️ COURT RULING - Case ${caseId}`);
    console.log(`   Decision: ${ruling.decision}`);
    console.log(`   Reasoning: ${ruling.reasoning}`);
    console.log(`   Constitutional Basis: ${ruling.constitutionalBasis.join(', ')}`);
    console.log(`   Effective: ${ruling.effectiveDate.toLocaleDateString()}`);
    
    // Notify parties
    await this.notifyPartiesOfRuling(courtCase);
  }
  
  /**
   * Notify parties of court ruling
   */
  private async notifyPartiesOfRuling(courtCase: CourtCase): Promise<void> {
    if (!courtCase.ruling) return;
    
    const { decision, reasoning, conditions } = courtCase.ruling;
    
    console.log(`
    📧 Court Ruling Notification
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    To: ${courtCase.request.userId}
    From: Azora Constitutional Court
    
    The Court has reached a decision in your case:
    
    DECISION: ${decision}
    
    REASONING:
    ${reasoning}
    
    ${conditions ? `CONDITIONS:\n${conditions.map(c => `- ${c}`).join('\n')}` : ''}
    
    This ruling is effective immediately and is final.
    
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    🏛️ Azora Constitutional Court
    "Justice Through Ubuntu"
    `);
  }
  
  /**
   * Generate unique case ID
   */
  private generateCaseId(): string {
    const year = new Date().getFullYear();
    const number = this.cases.size + 1;
    return `CC-${year}-${String(number).padStart(4, '0')}`;
  }
  
  /**
   * Get case by ID
   */
  getCase(caseId: string): CourtCase | undefined {
    return this.cases.get(caseId);
  }
  
  /**
   * Get all cases (for court dashboard)
   */
  getAllCases(): CourtCase[] {
    return Array.from(this.cases.values());
  }
}
