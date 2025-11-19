import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface CertificateData {
  id: string;
  enrollmentId: string;
  courseId: string;
  studentName: string;
  issuedDate: Date;
  verificationUrl: string;
  skills: string[];
}

export class CertificateService {
  /**
   * Generate a digital certificate upon course completion
   * Requirements: 1.1, 1.2
   */
  async generateCertificate(enrollmentId: string): Promise<CertificateData> {
    try {
      // Get enrollment details
      const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: {
          student: true,
          course: true,
        },
      });

      if (!enrollment) {
        throw new Error(`Enrollment not found: ${enrollmentId}`);
      }

      if (enrollment.status !== 'completed') {
        throw new Error('Certificate can only be generated for completed courses');
      }

      // Get learning outcomes to extract skills
      const outcomes = await prisma.learningOutcome.findMany({
        where: { enrollmentId },
      });

      // Extract skills from outcomes
      const skills = this.extractSkillsFromOutcomes(outcomes);

      // Generate unique verification URL
      const verificationToken = uuidv4();
      const verificationUrl = `${process.env.CERTIFICATE_BASE_URL || 'https://azora.edu'}/verify/${verificationToken}`;

      // Create certificate record
      const certificate = await prisma.certificate.create({
        data: {
          enrollmentId,
          courseId: enrollment.courseId,
          studentName: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
          issuedDate: new Date(),
          verificationUrl,
          skills,
          verificationToken
        },
      });

      logger.info('Certificate generated', {
        certificateId: certificate.id,
        enrollmentId,
        studentId: enrollment.studentId,
      });

      return {
        id: certificate.id,
        enrollmentId: certificate.enrollmentId,
        courseId: certificate.courseId,
        studentName: certificate.studentName,
        issuedDate: certificate.issuedDate,
        verificationUrl: certificate.verificationUrl,
        skills: certificate.skills,
      };
    } catch (error) {
      logger.error('Error generating certificate', { error, enrollmentId });
      throw error;
    }
  }

  /**
   * Get certificate by ID
   * Requirements: 1.1, 1.2
   */
  async getCertificateById(certificateId: string): Promise<CertificateData | null> {
    try {
      const certificate = await prisma.certificate.findUnique({
        where: { id: certificateId },
      });

      if (!certificate) {
        return null;
      }

      return {
        id: certificate.id,
        enrollmentId: certificate.enrollmentId,
        courseId: certificate.courseId,
        studentName: certificate.studentName,
        issuedDate: certificate.issuedDate,
        verificationUrl: certificate.verificationUrl,
        skills: certificate.skills,
      };
    } catch (error) {
      logger.error('Error fetching certificate', { error, certificateId });
      throw error;
    }
  }

  /**
   * Get all certificates for a student
   * Requirements: 1.1, 1.2
   */
  async getCertificatesByStudentId(studentId: string): Promise<CertificateData[]> {
    try {
      const certificates = await prisma.certificate.findMany({
        where: {
          enrollment: {
            studentId,
          },
        },
      });

      return certificates.map((cert: any) => ({
        id: cert.id,
        enrollmentId: cert.enrollmentId,
        courseId: cert.courseId,
        studentName: cert.studentName,
        issuedDate: cert.issuedDate,
        verificationUrl: cert.verificationUrl,
        skills: cert.skills,
      }));
    } catch (error) {
      logger.error('Error fetching student certificates', { error, studentId });
      throw error;
    }
  }

  /**
   * Verify certificate by verification URL
   * Requirements: 1.1, 1.2
   */
  async verifyCertificate(verificationUrl: string): Promise<CertificateData | null> {
    try {
      const certificate = await prisma.certificate.findUnique({
        where: { verificationUrl },
      });

      if (!certificate) {
        return null;
      }

      return {
        id: certificate.id,
        enrollmentId: certificate.enrollmentId,
        courseId: certificate.courseId,
        studentName: certificate.studentName,
        issuedDate: certificate.issuedDate,
        verificationUrl: certificate.verificationUrl,
        skills: certificate.skills,
      };
    } catch (error) {
      logger.error('Error verifying certificate', { error, verificationUrl });
      throw error;
    }
  }

  /**
   * Generate certificate in multiple languages
   * Requirements: 1.1, 1.2
   */
  async generateCertificateInLanguage(
    enrollmentId: string,
    language: string
  ): Promise<CertificateData> {
    try {
      // Get base certificate
      const certificate = await this.generateCertificate(enrollmentId);

      // In a real implementation, this would translate the certificate content
      // For now, we'll just return the base certificate
      // Translation would be handled by a separate service (e.g., using AI)

      logger.info('Certificate generated in language', {
        certificateId: certificate.id,
        language,
      });

      return certificate;
    } catch (error) {
      logger.error('Error generating certificate in language', { error, enrollmentId, language });
      throw error;
    }
  }

  /**
   * Extract skills from learning outcomes
   */
  private extractSkillsFromOutcomes(outcomes: any[]): string[] {
    // This is a simplified implementation
    // In a real system, skills would be extracted from assessment data
    // and mapped to a skill taxonomy

    const skillMap: Record<string, number> = {};

    outcomes.forEach((outcome: any) => {
      // Map concept mastery to skills
      if (outcome.conceptMastery >= 80) {
        const skill = `Mastered Concept ${outcome.moduleId}`;
        skillMap[skill] = (skillMap[skill] || 0) + 1;
      }
    });

    return Object.keys(skillMap).filter((skill) => skillMap[skill] > 0);
  }
}

export const certificateService = new CertificateService();
