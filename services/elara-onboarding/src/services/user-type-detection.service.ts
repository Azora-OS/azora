/**
 * User Type Detection Service
 * 
 * Detects and verifies user types based on profile information
 * Supports: founder, student, teacher, researcher, professional, enterprise, non-profit, government
 */

import { ElaraLogger } from '../utils/logger';

export type UserType = 'founder' | 'student' | 'teacher' | 'researcher' | 'professional' | 'enterprise' | 'non-profit' | 'government';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  expertise?: string[];
  learningGoals?: string[];
  interests?: string[];
  institution?: string;
  credentials?: string[];
  linkedIn?: string;
  companyName?: string;
  jobTitle?: string;
  companySize?: number;
  industry?: string;
  taxId?: string;
  agencyType?: string;
  jurisdiction?: string;
}

export interface DetectionResult {
  userType: UserType;
  confidence: number;
  evidence: string[];
  requiresVerification: boolean;
  verificationMethod?: string;
}

export interface VerificationResult {
  verified: boolean;
  userType: UserType;
  verificationMethod: string;
  timestamp: Date;
  details?: any;
}

export class UserTypeDetectionService {
  private logger: ElaraLogger;

  constructor() {
    this.logger = new ElaraLogger('UserTypeDetectionService');
  }

  /**
   * Detect user type based on profile information
   */
  async detectUserType(profile: UserProfile): Promise<DetectionResult> {
    try {
      this.logger.info('Detecting user type from profile');

      // Check for each user type in order of specificity
      const detections: DetectionResult[] = [];

      // Check for founder
      const founderDetection = this.detectFounder(profile);
      if (founderDetection.confidence > 0) {
        detections.push(founderDetection);
      }

      // Check for student
      const studentDetection = this.detectStudent(profile);
      if (studentDetection.confidence > 0) {
        detections.push(studentDetection);
      }

      // Check for teacher
      const teacherDetection = this.detectTeacher(profile);
      if (teacherDetection.confidence > 0) {
        detections.push(teacherDetection);
      }

      // Check for researcher
      const researcherDetection = this.detectResearcher(profile);
      if (researcherDetection.confidence > 0) {
        detections.push(researcherDetection);
      }

      // Check for professional
      const professionalDetection = this.detectProfessional(profile);
      if (professionalDetection.confidence > 0) {
        detections.push(professionalDetection);
      }

      // Check for enterprise
      const enterpriseDetection = this.detectEnterprise(profile);
      if (enterpriseDetection.confidence > 0) {
        detections.push(enterpriseDetection);
      }

      // Check for non-profit
      const nonProfitDetection = this.detectNonProfit(profile);
      if (nonProfitDetection.confidence > 0) {
        detections.push(nonProfitDetection);
      }

      // Check for government
      const governmentDetection = this.detectGovernment(profile);
      if (governmentDetection.confidence > 0) {
        detections.push(governmentDetection);
      }

      // Sort by confidence (highest first)
      detections.sort((a, b) => b.confidence - a.confidence);

      if (detections.length === 0) {
        throw new Error('Unable to detect user type from provided information');
      }

      const topDetection = detections[0];
      this.logger.info(`Detected user type: ${topDetection.userType} (confidence: ${topDetection.confidence})`);

      return topDetection;
    } catch (error) {
      this.logger.error('Error detecting user type:', error);
      throw error;
    }
  }

  /**
   * Detect founder user type
   */
  private detectFounder(profile: UserProfile): DetectionResult {
    const evidence: string[] = [];
    let confidence = 0;

    // Founders typically have expertise and bio
    if (profile.expertise && profile.expertise.length > 0) {
      evidence.push('Has expertise listed');
      confidence += 0.3;
    }

    if (profile.bio && profile.bio.length > 50) {
      evidence.push('Has detailed bio');
      confidence += 0.2;
    }

    // Founders might mention launching or creating
    if (profile.bio && /launch|creat|build|start|founder|entrepreneur/i.test(profile.bio)) {
      evidence.push('Bio mentions entrepreneurial activity');
      confidence += 0.3;
    }

    return {
      userType: 'founder',
      confidence: Math.min(confidence, 1),
      evidence,
      requiresVerification: confidence > 0.5,
      verificationMethod: confidence > 0.5 ? 'kyc_aml' : undefined,
    };
  }

  /**
   * Detect student user type
   */
  private detectStudent(profile: UserProfile): DetectionResult {
    const evidence: string[] = [];
    let confidence = 0;

    // Students have .edu email
    if (profile.email && profile.email.endsWith('.edu')) {
      evidence.push('Has .edu email address');
      confidence += 0.5;
    }

    // Students have learning goals
    if (profile.learningGoals && profile.learningGoals.length > 0) {
      evidence.push('Has learning goals');
      confidence += 0.2;
    }

    // Students have interests
    if (profile.interests && profile.interests.length > 0) {
      evidence.push('Has learning interests');
      confidence += 0.1;
    }

    // Students might mention school or university
    if (profile.bio && /student|school|university|college|learning/i.test(profile.bio)) {
      evidence.push('Bio mentions educational context');
      confidence += 0.2;
    }

    return {
      userType: 'student',
      confidence: Math.min(confidence, 1),
      evidence,
      requiresVerification: confidence > 0.3,
      verificationMethod: confidence > 0.3 ? 'student_verification' : undefined,
    };
  }

  /**
   * Detect teacher user type
   */
  private detectTeacher(profile: UserProfile): DetectionResult {
    const evidence: string[] = [];
    let confidence = 0;

    // Teachers have institution
    if (profile.institution) {
      evidence.push('Has institution listed');
      confidence += 0.2;
    }

    // Teachers have credentials
    if (profile.credentials && profile.credentials.length > 0) {
      evidence.push('Has education credentials');
      confidence += 0.3;
    }

    // Teachers might mention teaching or education
    if (profile.bio && /teach|educator|professor|instructor|faculty/i.test(profile.bio)) {
      evidence.push('Bio mentions teaching role');
      confidence += 0.3;
    }

    // Teachers might have job title indicating teaching
    if (profile.jobTitle && /teach|professor|instructor|educator/i.test(profile.jobTitle)) {
      evidence.push('Job title indicates teaching role');
      confidence += 0.2;
    }

    return {
      userType: 'teacher',
      confidence: Math.min(confidence, 1),
      evidence,
      requiresVerification: confidence > 0.4,
      verificationMethod: confidence > 0.4 ? 'credential_verification' : undefined,
    };
  }

  /**
   * Detect researcher user type
   */
  private detectResearcher(profile: UserProfile): DetectionResult {
    const evidence: string[] = [];
    let confidence = 0;

    // Researchers have institution
    if (profile.institution) {
      evidence.push('Has institution listed');
      confidence += 0.2;
    }

    // Researchers have expertise
    if (profile.expertise && profile.expertise.length > 0) {
      evidence.push('Has expertise listed');
      confidence += 0.2;
    }

    // Researchers might mention research
    if (profile.bio && /research|study|academic|scholar|investigat/i.test(profile.bio)) {
      evidence.push('Bio mentions research activity');
      confidence += 0.3;
    }

    // Researchers might have job title indicating research
    if (profile.jobTitle && /research|scientist|scholar|academic/i.test(profile.jobTitle)) {
      evidence.push('Job title indicates research role');
      confidence += 0.2;
    }

    return {
      userType: 'researcher',
      confidence: Math.min(confidence, 1),
      evidence,
      requiresVerification: confidence > 0.4,
      verificationMethod: confidence > 0.4 ? 'affiliation_verification' : undefined,
    };
  }

  /**
   * Detect professional user type
   */
  private detectProfessional(profile: UserProfile): DetectionResult {
    const evidence: string[] = [];
    let confidence = 0;

    // Professionals have company name
    if (profile.companyName) {
      evidence.push('Has company name');
      confidence += 0.2;
    }

    // Professionals have job title
    if (profile.jobTitle) {
      evidence.push('Has job title');
      confidence += 0.2;
    }

    // Professionals have LinkedIn
    if (profile.linkedIn) {
      evidence.push('Has LinkedIn profile');
      confidence += 0.3;
    }

    // Professionals might mention work or career
    if (profile.bio && /work|career|professional|experience|employ/i.test(profile.bio)) {
      evidence.push('Bio mentions professional context');
      confidence += 0.2;
    }

    return {
      userType: 'professional',
      confidence: Math.min(confidence, 1),
      evidence,
      requiresVerification: confidence > 0.3,
      verificationMethod: confidence > 0.3 ? 'linkedin_verification' : undefined,
    };
  }

  /**
   * Detect enterprise user type
   */
  private detectEnterprise(profile: UserProfile): DetectionResult {
    const evidence: string[] = [];
    let confidence = 0;

    // Enterprises have company size
    if (profile.companySize && profile.companySize > 50) {
      evidence.push('Large company size');
      confidence += 0.3;
    }

    // Enterprises have industry
    if (profile.industry) {
      evidence.push('Has industry listed');
      confidence += 0.2;
    }

    // Enterprises might have specific job titles
    if (profile.jobTitle && /manager|director|executive|cto|cfo|ceo|vp/i.test(profile.jobTitle)) {
      evidence.push('Job title indicates management role');
      confidence += 0.2;
    }

    // Enterprises might mention organization or company
    if (profile.bio && /organization|company|enterprise|team|department/i.test(profile.bio)) {
      evidence.push('Bio mentions organizational context');
      confidence += 0.1;
    }

    return {
      userType: 'enterprise',
      confidence: Math.min(confidence, 1),
      evidence,
      requiresVerification: confidence > 0.4,
      verificationMethod: confidence > 0.4 ? 'business_verification' : undefined,
    };
  }

  /**
   * Detect non-profit user type
   */
  private detectNonProfit(profile: UserProfile): DetectionResult {
    const evidence: string[] = [];
    let confidence = 0;

    // Non-profits have tax ID
    if (profile.taxId) {
      evidence.push('Has tax ID');
      confidence += 0.4;
    }

    // Non-profits might mention non-profit in bio
    if (profile.bio && /non-profit|nonprofit|charity|foundation|mission|social/i.test(profile.bio)) {
      evidence.push('Bio mentions non-profit context');
      confidence += 0.3;
    }

    // Non-profits might have specific job titles
    if (profile.jobTitle && /director|executive|founder|ceo/i.test(profile.jobTitle)) {
      evidence.push('Job title indicates leadership role');
      confidence += 0.1;
    }

    return {
      userType: 'non-profit',
      confidence: Math.min(confidence, 1),
      evidence,
      requiresVerification: confidence > 0.3,
      verificationMethod: confidence > 0.3 ? 'nonprofit_verification' : undefined,
    };
  }

  /**
   * Detect government user type
   */
  private detectGovernment(profile: UserProfile): DetectionResult {
    const evidence: string[] = [];
    let confidence = 0;

    // Government has agency type
    if (profile.agencyType) {
      evidence.push('Has agency type');
      confidence += 0.3;
    }

    // Government has jurisdiction
    if (profile.jurisdiction) {
      evidence.push('Has jurisdiction');
      confidence += 0.2;
    }

    // Government might mention government in bio
    if (profile.bio && /government|agency|federal|state|municipal|public/i.test(profile.bio)) {
      evidence.push('Bio mentions government context');
      confidence += 0.3;
    }

    // Government might have specific job titles
    if (profile.jobTitle && /officer|agent|director|administrator|official/i.test(profile.jobTitle)) {
      evidence.push('Job title indicates government role');
      confidence += 0.1;
    }

    return {
      userType: 'government',
      confidence: Math.min(confidence, 1),
      evidence,
      requiresVerification: confidence > 0.3,
      verificationMethod: confidence > 0.3 ? 'government_verification' : undefined,
    };
  }

  /**
   * Verify user type with external services
   */
  async verifyUserType(userType: UserType, profile: UserProfile): Promise<VerificationResult> {
    try {
      this.logger.info(`Verifying user type: ${userType}`);

      let verified = false;
      let details: any = {};

      switch (userType) {
        case 'student':
          verified = await this.verifyStudent(profile);
          details = { method: 'student_verification', email: profile.email };
          break;

        case 'teacher':
          verified = await this.verifyTeacher(profile);
          details = { method: 'credential_verification', institution: profile.institution };
          break;

        case 'researcher':
          verified = await this.verifyResearcher(profile);
          details = { method: 'affiliation_verification', institution: profile.institution };
          break;

        case 'professional':
          verified = await this.verifyProfessional(profile);
          details = { method: 'linkedin_verification', linkedIn: profile.linkedIn };
          break;

        case 'enterprise':
          verified = await this.verifyEnterprise(profile);
          details = { method: 'business_verification', company: profile.companyName };
          break;

        case 'non-profit':
          verified = await this.verifyNonProfit(profile);
          details = { method: 'nonprofit_verification', taxId: profile.taxId };
          break;

        case 'government':
          verified = await this.verifyGovernment(profile);
          details = { method: 'government_verification', agency: profile.agencyType };
          break;

        case 'founder':
          verified = await this.verifyFounder(profile);
          details = { method: 'kyc_aml', email: profile.email };
          break;

        default:
          throw new Error(`Unknown user type: ${userType}`);
      }

      this.logger.info(`User type verification result: ${verified ? 'verified' : 'failed'}`);

      return {
        verified,
        userType,
        verificationMethod: details.method,
        timestamp: new Date(),
        details,
      };
    } catch (error) {
      this.logger.error('Error verifying user type:', error);
      throw error;
    }
  }

  /**
   * Verify student (check .edu email or student ID)
   */
  private async verifyStudent(profile: UserProfile): Promise<boolean> {
    // Check for .edu email
    if (profile.email && profile.email.endsWith('.edu')) {
      return true;
    }

    // In production, would verify student ID or enrollment
    return false;
  }

  /**
   * Verify teacher (check credentials with institution)
   */
  private async verifyTeacher(profile: UserProfile): Promise<boolean> {
    // In production, would verify with institution
    if (profile.institution && profile.credentials && profile.credentials.length > 0) {
      return true;
    }

    return false;
  }

  /**
   * Verify researcher (check institution affiliation)
   */
  private async verifyResearcher(profile: UserProfile): Promise<boolean> {
    // In production, would verify with institution
    if (profile.institution) {
      return true;
    }

    return false;
  }

  /**
   * Verify professional (check LinkedIn)
   */
  private async verifyProfessional(profile: UserProfile): Promise<boolean> {
    // In production, would verify LinkedIn profile
    if (profile.linkedIn || (profile.companyName && profile.jobTitle)) {
      return true;
    }

    return false;
  }

  /**
   * Verify enterprise (check business registration)
   */
  private async verifyEnterprise(profile: UserProfile): Promise<boolean> {
    // In production, would verify with D&B or business registry
    if (profile.companyName && profile.companySize && profile.companySize > 50) {
      return true;
    }

    return false;
  }

  /**
   * Verify non-profit (check tax ID)
   */
  private async verifyNonProfit(profile: UserProfile): Promise<boolean> {
    // In production, would verify tax ID with IRS or equivalent
    if (profile.taxId) {
      return true;
    }

    return false;
  }

  /**
   * Verify government (check government ID)
   */
  private async verifyGovernment(profile: UserProfile): Promise<boolean> {
    // In production, would verify government ID
    if (profile.agencyType && profile.jurisdiction) {
      return true;
    }

    return false;
  }

  /**
   * Verify founder (KYC/AML check)
   */
  private async verifyFounder(profile: UserProfile): Promise<boolean> {
    // In production, would perform KYC/AML verification
    if (profile.firstName && profile.lastName && profile.email) {
      return true;
    }

    return false;
  }
}
