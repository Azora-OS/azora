/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Azora Institutional Student Number Generator
 *
 * Generates unique, secure student numbers for:
 * - @ac.azora.world (University/Sapiens students)
 * - @edu.azora.world (K-12 students)
 *
 * Format: [INSTITUTION][YEAR][SEQUENCE][CHECKSUM]
 * Example: ASU2025001234
 *          EDU2025000567
 */

export enum InstitutionType {
  UNIVERSITY = 'ASU', // Azora Sapiens University
  K12 = 'EDU',        // K-12 Education
}

export interface StudentNumberConfig {
  institutionType: InstitutionType;
  year: number;
  sequence: number;
  checksum: string;
}

export interface StudentRegistration {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  institutionType: InstitutionType;
  program?: string; // For university students
  grade?: number;  // For K-12 students (1-12)
  email: string;
  country?: string;
  idNumber?: string; // For verification
}

export class StudentNumberGenerator {
  private static readonly INSTITUTION_CODES = {
    [InstitutionType.UNIVERSITY]: 'ASU',
    [InstitutionType.K12]: 'EDU',
  };

  private static readonly MAX_SEQUENCE = 999999; // 6 digits
  private static readonly CHECKSUM_LENGTH = 2;

  /**
   * Generate a unique student number
   */
  static async generate(
    registration: StudentRegistration,
    sequence: number
  ): Promise<string> {
    const year = new Date().getFullYear();
    const institutionCode = this.INSTITUTION_CODES[registration.institutionType];

    // Validate sequence
    if (sequence > this.MAX_SEQUENCE) {
      throw new Error('Sequence number exceeds maximum');
    }

    // Format: [INSTITUTION][YEAR][SEQUENCE]
    const baseNumber = `${institutionCode}${year}${String(sequence).padStart(6, '0')}`;

    // Generate checksum using Luhn algorithm variant
    const checksum = this.generateChecksum(baseNumber, registration);

    return `${baseNumber}${checksum}`;
  }

  /**
   * Generate checksum for student number validation
   */
  private static generateChecksum(
    baseNumber: string,
    registration: StudentRegistration
  ): string {
    // Use Luhn algorithm with additional entropy from registration data
    const digits = baseNumber.replace(/\D/g, '').split('').map(Number);

    // Add entropy from name and DOB
    const nameHash = this.simpleHash(registration.firstName + registration.lastName);
    const dobHash = this.simpleHash(registration.dateOfBirth.toISOString());
    const combinedHash = (nameHash + dobHash) % 100;

    // Luhn algorithm
    let sum = 0;
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = digits[i];
      if ((digits.length - i) % 2 === 0) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }

    // Combine Luhn with hash
    const checksum = (sum + combinedHash) % 100;
    return String(checksum).padStart(2, '0');
  }

  /**
   * Simple hash function for checksum entropy
   */
  private static simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Validate student number format and checksum
   */
  static validate(studentNumber: string, registration?: StudentRegistration): boolean {
    // Format validation
    const pattern = /^(ASU|EDU)\d{4}\d{6}\d{2}$/;
    if (!pattern.test(studentNumber)) {
      return false;
    }

    // Extract components
    const institutionCode = studentNumber.substring(0, 3);
    const year = parseInt(studentNumber.substring(3, 7));
    const sequence = parseInt(studentNumber.substring(7, 13));
    const checksum = studentNumber.substring(13, 15);

    // Validate year (not in future, not too old)
    const currentYear = new Date().getFullYear();
    if (year > currentYear || year < currentYear - 10) {
      return false;
    }

    // Validate sequence
    if (sequence > this.MAX_SEQUENCE || sequence < 1) {
      return false;
    }

    // If registration provided, validate checksum
    if (registration) {
      const baseNumber = studentNumber.substring(0, 13);
      const expectedChecksum = this.generateChecksum(baseNumber, registration);
      return checksum === expectedChecksum;
    }

    return true;
  }

  /**
   * Parse student number into components
   */
  static parse(studentNumber: string): StudentNumberConfig | null {
    if (!this.validate(studentNumber)) {
      return null;
    }

    return {
      institutionType: studentNumber.startsWith('ASU')
        ? InstitutionType.UNIVERSITY
        : InstitutionType.K12,
      year: parseInt(studentNumber.substring(3, 7)),
      sequence: parseInt(studentNumber.substring(7, 13)),
      checksum: studentNumber.substring(13, 15),
    };
  }

  /**
   * Generate email from student number
   */
  static generateEmail(studentNumber: string): string {
    const config = this.parse(studentNumber);
    if (!config) {
      throw new Error('Invalid student number');
    }

    const domain = config.institutionType === InstitutionType.UNIVERSITY
      ? '@ac.azora.world'
      : '@edu.azora.world';

    return `${studentNumber.toLowerCase()}${domain}`;
  }

  /**
   * Get next sequence number for institution and year
   */
  static async getNextSequence(
    institutionType: InstitutionType,
    year: number
  ): Promise<number> {
    // TODO: Query database for last sequence number
    // This should be implemented with database lookup
    // For now, return a mock sequence
    const mockSequence = Math.floor(Math.random() * 1000) + 1;
    return mockSequence;
  }

  /**
   * Generate student number with database persistence
   */
  static async generateWithPersistence(
    registration: StudentRegistration
  ): Promise<{ studentNumber: string; email: string }> {
    const year = new Date().getFullYear();
    const sequence = await this.getNextSequence(registration.institutionType, year);

    const studentNumber = await this.generate(registration, sequence);
    const email = this.generateEmail(studentNumber);

    // TODO: Persist to database
    // await db.students.create({
    //   studentNumber,
    //   email,
    //   registration,
    //   createdAt: new Date(),
    // });

    return { studentNumber, email };
  }
}

