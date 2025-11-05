/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Academic Credentialing System
 *
 * Manages academic credentials, certifications, and qualifications
 * - SAQA accreditation
 * - Blockchain verification
 * - Credential issuance
 * - Transcript generation
 * - Academic integrity
 */

import { InstitutionalUser, InstitutionType } from './institutional-auth';
import crypto from 'crypto';

export interface AcademicCredential {
  id: string;
  credentialNumber: string;
  studentNumber: string;
  credentialType: CredentialType;
  program: string;
  institution: string;
  issuedDate: Date;
  expiryDate?: Date;
  grade: string;
  credits: number;
  blockchainHash?: string;
  verificationUrl: string;
  status: 'issued' | 'revoked' | 'expired';
  metadata: Record<string, any>;
}

export enum CredentialType {
  CERTIFICATE = 'certificate',
  DIPLOMA = 'diploma',
  DEGREE = 'degree',
  MICRO_CREDENTIAL = 'micro_credential',
  TRANSCRIPT = 'transcript',
  LETTER_OF_COMPLETION = 'letter_of_completion',
}

export interface CourseCompletion {
  courseId: string;
  courseName: string;
  credits: number;
  grade: string;
  completedDate: Date;
  instructor: string;
  verificationHash: string;
}

export interface Transcript {
  studentNumber: string;
  studentName: string;
  institutionType: InstitutionType;
  program: string;
  startDate: Date;
  endDate?: Date;
  gpa: number;
  totalCredits: number;
  completedCredits: number;
  courses: CourseCompletion[];
  credentials: AcademicCredential[];
  issuedDate: Date;
  verificationHash: string;
}

export class AcademicCredentialingService {
  private static readonly INSTITUTION_NAME = 'Azora Sapiens University';
  private static readonly INSTITUTION_CODE = 'ASU';
  private static readonly SAQA_PROVIDER_NUMBER = 'ASU2025'; // TODO: Get actual SAQA number

  /**
   * Issue academic credential
   */
  static async issueCredential(
    user: InstitutionalUser,
    credentialType: CredentialType,
    program: string,
    grade: string,
    credits: number,
    courses: CourseCompletion[]
  ): Promise<AcademicCredential> {
    // Validate eligibility
    await this.validateEligibility(user, credentialType, program, credits);

    // Generate credential number
    const credentialNumber = this.generateCredentialNumber(
      user.studentNumber,
      credentialType
    );

    // Calculate blockchain hash
    const blockchainHash = await this.generateBlockchainHash(
      user,
      credentialType,
      program,
      grade,
      courses
    );

    // Create credential
    const credential: AcademicCredential = {
      id: crypto.randomUUID(),
      credentialNumber,
      studentNumber: user.studentNumber,
      credentialType,
      program,
      institution: this.INSTITUTION_NAME,
      issuedDate: new Date(),
      grade,
      credits,
      blockchainHash,
      verificationUrl: this.generateVerificationUrl(credentialNumber),
      status: 'issued',
      metadata: {
        saqaProviderNumber: this.SAQA_PROVIDER_NUMBER,
        institutionCode: this.INSTITUTION_CODE,
        courses: courses.map(c => ({
          id: c.courseId,
          name: c.courseName,
          grade: c.grade,
          credits: c.credits,
        })),
      },
    };

    // TODO: Persist to database
    // await db.credentials.create(credential);

    // TODO: Store on blockchain
    // await blockchainService.storeCredential(credential);

    // TODO: Send email notification
    // await emailService.sendCredentialIssued(user.email, credential);

    return credential;
  }

  /**
   * Generate transcript
   */
  static async generateTranscript(
    user: InstitutionalUser,
    includeInProgress: boolean = false
  ): Promise<Transcript> {
    // TODO: Fetch all courses and credentials from database
    // const courses = await db.courses.getCompletedCourses(user.studentNumber);
    // const credentials = await db.credentials.getByStudentNumber(user.studentNumber);

    // Mock data for now
    const courses: CourseCompletion[] = [];
    const credentials: AcademicCredential[] = [];

    // Calculate GPA
    const gpa = this.calculateGPA(courses);

    // Calculate credits
    const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
    const completedCredits = courses
      .filter(c => c.grade !== 'F' && c.grade !== 'Incomplete')
      .reduce((sum, c) => sum + c.credits, 0);

    // Generate verification hash
    const verificationHash = this.generateTranscriptHash(
      user,
      courses,
      credentials,
      gpa
    );

    const transcript: Transcript = {
      studentNumber: user.studentNumber,
      studentName: `${user.firstName} ${user.lastName}`,
      institutionType: user.institutionType,
      program: user.program || 'General Studies',
      startDate: user.createdAt,
      endDate: user.status === 'graduated' ? new Date() : undefined,
      gpa,
      totalCredits,
      completedCredits,
      courses,
      credentials,
      issuedDate: new Date(),
      verificationHash,
    };

    // TODO: Persist to database
    // await db.transcripts.create(transcript);

    return transcript;
  }

  /**
   * Verify credential authenticity
   */
  static async verifyCredential(
    credentialNumber: string,
    studentNumber?: string
  ): Promise<{
    valid: boolean;
    credential?: AcademicCredential;
    message: string;
  }> {
    // TODO: Fetch from database
    // const credential = await db.credentials.findByNumber(credentialNumber);

    // Mock validation
    if (!credentialNumber) {
      return {
        valid: false,
        message: 'Credential not found',
      };
    }

    // If student number provided, verify match
    // if (studentNumber && credential.studentNumber !== studentNumber) {
    //   return {
    //     valid: false,
    //     message: 'Student number does not match',
    //   };
    // }

    // Verify blockchain hash if exists
    // if (credential.blockchainHash) {
    //   const isValid = await blockchainService.verifyCredential(credential);
    //   if (!isValid) {
    //     return {
    //       valid: false,
    //       message: 'Blockchain verification failed',
    //     };
    //   }
    // }

    return {
      valid: true,
      message: 'Credential verified',
    };
  }

  /**
   * Validate eligibility for credential
   */
  private static async validateEligibility(
    user: InstitutionalUser,
    credentialType: CredentialType,
    program: string,
    requiredCredits: number
  ): Promise<void> {
    // Check user status
    if (user.status !== 'active') {
      throw new Error('User account is not active');
    }

    // Check program match
    if (user.program && user.program !== program) {
      throw new Error('Program does not match user enrollment');
    }

    // TODO: Check credit requirements
    // const earnedCredits = await db.courses.getEarnedCredits(user.studentNumber);
    // if (earnedCredits < requiredCredits) {
    //   throw new Error(`Insufficient credits. Required: ${requiredCredits}, Earned: ${earnedCredits}`);
    // }

    // TODO: Check course requirements
    // const requiredCourses = await db.programs.getRequiredCourses(program);
    // const completedCourses = await db.courses.getCompletedCourses(user.studentNumber);
    // const missingCourses = requiredCourses.filter(rc =>
    //   !completedCourses.some(cc => cc.courseId === rc.courseId)
    // );
    // if (missingCourses.length > 0) {
    //   throw new Error(`Missing required courses: ${missingCourses.map(c => c.name).join(', ')}`);
    // }
  }

  /**
   * Generate credential number
   */
  private static generateCredentialNumber(
    studentNumber: string,
    credentialType: CredentialType
  ): string {
    const year = new Date().getFullYear();
    const typeCode = credentialType.substring(0, 3).toUpperCase();
    const sequence = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    return `${this.INSTITUTION_CODE}${year}${typeCode}${sequence}`;
  }

  /**
   * Generate blockchain hash for credential
   */
  private static async generateBlockchainHash(
    user: InstitutionalUser,
    credentialType: CredentialType,
    program: string,
    grade: string,
    courses: CourseCompletion[]
  ): Promise<string> {
    const data = JSON.stringify({
      studentNumber: user.studentNumber,
      credentialType,
      program,
      grade,
      courses: courses.map(c => ({
        id: c.courseId,
        hash: c.verificationHash,
      })),
      issuedDate: new Date().toISOString(),
      institution: this.INSTITUTION_NAME,
    });

    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate transcript hash
   */
  private static generateTranscriptHash(
    user: InstitutionalUser,
    courses: CourseCompletion[],
    credentials: AcademicCredential[],
    gpa: number
  ): string {
    const data = JSON.stringify({
      studentNumber: user.studentNumber,
      courses: courses.map(c => c.verificationHash),
      credentials: credentials.map(c => c.blockchainHash),
      gpa,
      generatedDate: new Date().toISOString(),
    });

    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Calculate GPA from courses
   */
  private static calculateGPA(courses: CourseCompletion[]): number {
    const gradePoints: Record<string, number> = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'D-': 0.7,
      'F': 0.0,
    };

    let totalPoints = 0;
    let totalCredits = 0;

    for (const course of courses) {
      const points = gradePoints[course.grade] || 0;
      totalPoints += points * course.credits;
      totalCredits += course.credits;
    }

    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  }

  /**
   * Generate verification URL
   */
  private static generateVerificationUrl(credentialNumber: string): string {
    return `https://verify.azora.world/credential/${credentialNumber}`;
  }

  /**
   * Revoke credential
   */
  static async revokeCredential(
    credentialNumber: string,
    reason: string
  ): Promise<void> {
    // TODO: Update credential status
    // await db.credentials.updateStatus(credentialNumber, 'revoked', reason);

    // TODO: Update blockchain
    // await blockchainService.revokeCredential(credentialNumber, reason);
  }
}

