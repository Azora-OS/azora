import request from 'supertest';
import express from 'express';
import certificateRouter from '../certificate.routes';
import { certificateService } from '../../services/certificate.service';

jest.mock('../../services/certificate.service');

const app = express();
app.use(express.json());
app.use('/', certificateRouter);

describe('Certificate Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /certificates/generate', () => {
    it('should generate a certificate', async () => {
      const mockCertificate = {
        id: 'cert-1',
        enrollmentId: 'enroll-1',
        courseId: 'course-1',
        studentName: 'John Doe',
        issuedDate: new Date(),
        verificationUrl: 'https://azora.edu/verify/token-123',
        skills: ['Skill 1'],
      };

      (certificateService.generateCertificate as jest.Mock).mockResolvedValue(mockCertificate);

      const response = await request(app).post('/certificates/generate').send({
        enrollmentId: 'enroll-1',
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('cert-1');
    });

    it('should return 400 if enrollmentId is missing', async () => {
      const response = await request(app).post('/certificates/generate').send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('enrollmentId is required');
    });

    it('should handle service errors', async () => {
      (certificateService.generateCertificate as jest.Mock).mockRejectedValue(
        new Error('Enrollment not found')
      );

      const response = await request(app).post('/certificates/generate').send({
        enrollmentId: 'invalid-id',
      });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /certificates/:id', () => {
    it('should retrieve certificate by ID', async () => {
      const mockCertificate = {
        id: 'cert-1',
        enrollmentId: 'enroll-1',
        courseId: 'course-1',
        studentName: 'John Doe',
        issuedDate: new Date(),
        verificationUrl: 'https://azora.edu/verify/token-123',
        skills: ['Skill 1'],
      };

      (certificateService.getCertificateById as jest.Mock).mockResolvedValue(mockCertificate);

      const response = await request(app).get('/certificates/cert-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('cert-1');
    });

    it('should return 404 if certificate not found', async () => {
      (certificateService.getCertificateById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/certificates/invalid-id');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Certificate not found');
    });
  });

  describe('GET /certificates/student/:studentId', () => {
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

      (certificateService.getCertificatesByStudentId as jest.Mock).mockResolvedValue(
        mockCertificates
      );

      const response = await request(app).get('/certificates/student/student-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.count).toBe(2);
    });

    it('should return empty array if student has no certificates', async () => {
      (certificateService.getCertificatesByStudentId as jest.Mock).mockResolvedValue([]);

      const response = await request(app).get('/certificates/student/student-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.count).toBe(0);
    });
  });

  describe('GET /verify/:verificationUrl', () => {
    it('should verify certificate', async () => {
      const mockCertificate = {
        id: 'cert-1',
        enrollmentId: 'enroll-1',
        courseId: 'course-1',
        studentName: 'John Doe',
        issuedDate: new Date(),
        verificationUrl: 'https://azora.edu/verify/token-123',
        skills: ['Skill 1'],
      };

      (certificateService.verifyCertificate as jest.Mock).mockResolvedValue(mockCertificate);

      const response = await request(app).get('/verify/token-123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.verified).toBe(true);
      expect(response.body.data.id).toBe('cert-1');
    });

    it('should return 404 if verification URL not found', async () => {
      (certificateService.verifyCertificate as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/verify/invalid-token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /certificates/generate/:enrollmentId/:language', () => {
    it('should generate certificate in specified language', async () => {
      const mockCertificate = {
        id: 'cert-1',
        enrollmentId: 'enroll-1',
        courseId: 'course-1',
        studentName: 'John Doe',
        issuedDate: new Date(),
        verificationUrl: 'https://azora.edu/verify/token-123',
        skills: ['Skill 1'],
      };

      (certificateService.generateCertificateInLanguage as jest.Mock).mockResolvedValue(
        mockCertificate
      );

      const response = await request(app).post('/certificates/generate/enroll-1/es');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.language).toBe('es');
    });

    it('should return 400 for invalid language code', async () => {
      const response = await request(app).post('/certificates/generate/enroll-1/invalid');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid language code format');
    });

    it('should accept language codes with region', async () => {
      const mockCertificate = {
        id: 'cert-1',
        enrollmentId: 'enroll-1',
        courseId: 'course-1',
        studentName: 'John Doe',
        issuedDate: new Date(),
        verificationUrl: 'https://azora.edu/verify/token-123',
        skills: ['Skill 1'],
      };

      (certificateService.generateCertificateInLanguage as jest.Mock).mockResolvedValue(
        mockCertificate
      );

      const response = await request(app).post('/certificates/generate/enroll-1/es-MX');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });
});
