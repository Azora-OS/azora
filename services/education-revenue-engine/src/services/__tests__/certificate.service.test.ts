import { certificateService } from '../certificate.service';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    enrollment: {
      findUnique: jest.fn(),
    },
    learningOutcome: {
      findMany: jest.fn(),
    },
    certificate: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  })),
}));

describe('CertificateService', () => {
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = new PrismaClient();
  });

  describe('generateCertificate', () => {
    it('should generate a certificate for completed enrollment', async () => {
      const mockEnrollment = {
        id: 'enroll-1',
        studentId: 'student-1',
        courseId: 'course-1',
        status: 'completed',
        student: {
          firstName: 'John',
          lastName: 'Doe',
        },
        course: {
          title: 'Advanced TypeScript',
        },
      };

      const mockOutcomes = [
        {
          id: 'outcome-1',
          moduleId: 'module-1',
          conceptMastery: 85,
        },
      ];

      mockPrisma.enrollment.findUnique.mockResolvedValue(mockEnrollment);
      mockPrisma.learningOutcome.findMany.mockResolvedValue(mockOutcomes);
      mockPrisma.certificate.create.mockResolvedValue({
        id: 'cert-1',
        enrollmentId: 'enroll-1',
        courseId: 'course-1',
        studentName: 'John Doe',
        issuedDate: new Date(),
        verificationUrl: 'https://azora.edu/verify/token-123',
        skills: ['Mastered Concept module-1'],
      });

      const certificate = await certificateService.generateCertificate('enroll-1');

      expect(certificate).toHaveProperty('id', 'cert-1');
      expect(certificate).toHaveProperty('studentName', 'John Doe');
      expect(certificate).toHaveProperty('verificationUrl');
      expect(certificate.skills).toContain('Mastered Concept module-1');
    });

    it('should throw error if enrollment not found', async () => {
      mockPrisma.enrollment.findUnique.mockResolvedValue(null);

      await expect(certificateService.generateCertificate('invalid-id')).rejects.toThrow(
        'Enrollment not found'
      );
    });

    it('should throw error if course not completed', async () => {
      const mockEnrollment = {
        id: 'enroll-1',
        studentId: 'student-1',
        courseId: 'course-1',
        status: 'active',
        student: {
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      mockPrisma.enrollment.findUnique.mockResolvedValue(mockEnrollment);

      await expect(certificateService.generateCertificate('enroll-1')).rejects.toThrow(
        'Certificate can only be generated for completed courses'
      );
    });

    it('should extract skills from learning outcomes', async () => {
      const mockEnrollment = {
        id: 'enroll-1',
        studentId: 'student-1',
        courseId: 'course-1',
        status: 'completed',
        student: {
          firstName: 'Jane',
          lastName: 'Smith',
        },
      };

      const mockOutcomes = [
        { id: 'outcome-1', moduleId: 'module-1', conceptMastery: 90 },
        { id: 'outcome-2', moduleId: 'module-2', conceptMastery: 85 },
        { id: 'outcome-3', moduleId: 'module-3', conceptMastery: 75 },
      ];

      mockPrisma.enrollment.findUnique.mockResolvedValue(mockEnrollment);
      mockPrisma.learningOutcome.findMany.mockResolvedValue(mockOutcomes);
      mockPrisma.certificate.create.mockResolvedValue({
        id: 'cert-1',
        enrollmentId: 'enroll-1',
        courseId: 'course-1',
        studentName: 'Jane Smith',
        issuedDate: new Date(),
        verificationUrl: 'https://azora.edu/verify/token-456',
        skills: [
          'Mastered Concept module-1',
          'Mastered Concept module-2',
          'Mastered Concept module-3',
        ],
      });

      const certificate = await certificateService.generateCertificate('enroll-1');

      expect(certificate.skills.length).toBeGreaterThan(0);
    });
  });

  describe('getCertificateById', () => {
    it('should retrieve certificate by ID', async () => {
      const mockCertificate = {
        id: 'cert-1',
        enrollmentId: 'enroll-1',
        courseId: 'course-1',
        studentName: 'John Doe',
        issuedDate: new Date(),
        verificationUrl: 'https://azora.edu/verify/token-123',
        skills: ['Skill 1', 'Skill 2'],
      };

      mockPrisma.certificate.findUnique.mockResolvedValue(mockCertificate);

      const certificate = await certificateService.getCertificateById('cert-1');

      expect(certificate).toEqual(mockCertificate);
    });

    it('should return null if certificate not found', async () => {
      mockPrisma.certificate.findUnique.mockResolvedValue(null);

      const certificate = await certificateService.getCertificateById('invalid-id');

      expect(certificate).toBeNull();
    });
  });

  describe('getCertificatesByStudentId', () => {
    it('should retrieve all certificates for a student', async () => {
      const mockCertificates = [
        {
          id: 'cert-1',
          enrollmentId: 'enroll-1',
          courseId: 'course-1',
          studentName: 'John Doe',
          issuedDate: new Date(),
          verificationUrl: 'https://azora.edu/verify/token-1',
          skills: ['Skill 1'],
        },
        {
          id: 'cert-2',
          enrollmentId: 'enroll-2',
          courseId: 'course-2',
          studentName: 'John Doe',
          issuedDate: new Date(),
          verificationUrl: 'https://azora.edu/verify/token-2',
          skills: ['Skill 2'],
        },
      ];

      mockPrisma.certificate.findMany.mockResolvedValue(mockCertificates);

      const certificates = await certificateService.getCertificatesByStudentId('student-1');

      expect(certificates).toHaveLength(2);
      expect(certificates[0].id).toBe('cert-1');
      expect(certificates[1].id).toBe('cert-2');
    });

    it('should return empty array if student has no certificates', async () => {
      mockPrisma.certificate.findMany.mockResolvedValue([]);

      const certificates = await certificateService.getCertificatesByStudentId('student-1');

      expect(certificates).toEqual([]);
    });
  });

  describe('verifyCertificate', () => {
    it('should verify certificate by verification URL', async () => {
      const mockCertificate = {
        id: 'cert-1',
        enrollmentId: 'enroll-1',
        courseId: 'course-1',
        studentName: 'John Doe',
        issuedDate: new Date(),
        verificationUrl: 'https://azora.edu/verify/token-123',
        skills: ['Skill 1'],
      };

      mockPrisma.certificate.findUnique.mockResolvedValue(mockCertificate);

      const certificate = await certificateService.verifyCertificate(
        'https://azora.edu/verify/token-123'
      );

      expect(certificate).toEqual(mockCertificate);
    });

    it('should return null if verification URL not found', async () => {
      mockPrisma.certificate.findUnique.mockResolvedValue(null);

      const certificate = await certificateService.verifyCertificate('invalid-url');

      expect(certificate).toBeNull();
    });
  });

  describe('generateCertificateInLanguage', () => {
    it('should generate certificate in specified language', async () => {
      const mockEnrollment = {
        id: 'enroll-1',
        studentId: 'student-1',
        courseId: 'course-1',
        status: 'completed',
        student: {
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      mockPrisma.enrollment.findUnique.mockResolvedValue(mockEnrollment);
      mockPrisma.learningOutcome.findMany.mockResolvedValue([]);
      mockPrisma.certificate.create.mockResolvedValue({
        id: 'cert-1',
        enrollmentId: 'enroll-1',
        courseId: 'course-1',
        studentName: 'John Doe',
        issuedDate: new Date(),
        verificationUrl: 'https://azora.edu/verify/token-123',
        skills: [],
      });

      const certificate = await certificateService.generateCertificateInLanguage('enroll-1', 'es');

      expect(certificate).toHaveProperty('id');
      expect(certificate).toHaveProperty('studentName', 'John Doe');
    });
  });
});
