import { careerService } from '../career.service';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  })),
}));

describe('CareerService', () => {
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = new PrismaClient();
  });

  describe('generateCareerProfile', () => {
    it('should generate career profile from completed courses', async () => {
      const mockStudent = {
        id: 'student-1',
        firstName: 'John',
        lastName: 'Doe',
        enrollments: [
          {
            course: { title: 'Advanced TypeScript' },
            outcomes: [],
          },
          {
            course: { title: 'React Mastery' },
            outcomes: [],
          },
        ],
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockStudent);
      mockPrisma.user.update.mockResolvedValue(mockStudent);

      const profile = await careerService.generateCareerProfile('student-1');

      expect(profile).toHaveProperty('studentId', 'student-1');
      expect(profile).toHaveProperty('skills');
      expect(profile).toHaveProperty('certifications');
      expect(profile.certifications).toContain('Advanced TypeScript');
    });

    it('should throw error if student not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(careerService.generateCareerProfile('invalid-id')).rejects.toThrow(
        'Student not found'
      );
    });
  });

  describe('getCareerProfile', () => {
    it('should retrieve career profile', async () => {
      const mockStudent = {
        id: 'student-1',
        firstName: 'Jane',
        lastName: 'Smith',
        enrollments: [],
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockStudent);
      mockPrisma.user.update.mockResolvedValue(mockStudent);

      const profile = await careerService.getCareerProfile('student-1');

      expect(profile).toBeDefined();
      expect(profile?.studentId).toBe('student-1');
    });

    it('should return null if student not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const profile = await careerService.getCareerProfile('invalid-id');

      expect(profile).toBeNull();
    });
  });

  describe('matchStudentWithJobs', () => {
    it('should match student with job opportunities', async () => {
      const mockStudent = {
        id: 'student-1',
        firstName: 'John',
        lastName: 'Doe',
        enrollments: [
          {
            course: { title: 'TypeScript Fundamentals' },
            outcomes: [],
          },
        ],
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockStudent);
      mockPrisma.user.update.mockResolvedValue(mockStudent);

      const matches = await careerService.matchStudentWithJobs('student-1');

      expect(Array.isArray(matches)).toBe(true);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0]).toHaveProperty('matchScore');
    });
  });

  describe('getJobOpportunities', () => {
    it('should return job opportunities for student', async () => {
      const mockStudent = {
        id: 'student-1',
        firstName: 'John',
        lastName: 'Doe',
        enrollments: [],
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockStudent);
      mockPrisma.user.update.mockResolvedValue(mockStudent);

      const opportunities = await careerService.getJobOpportunities('student-1');

      expect(Array.isArray(opportunities)).toBe(true);
    });
  });

  describe('getCareerCoaching', () => {
    it('should provide career coaching', async () => {
      const coaching = await careerService.getCareerCoaching('student-1', 'resume');

      expect(typeof coaching).toBe('string');
      expect(coaching.length).toBeGreaterThan(0);
    });

    it('should support multiple coaching topics', async () => {
      const topics = ['resume', 'interview', 'networking', 'salary', 'career-path'];

      for (const topic of topics) {
        const coaching = await careerService.getCareerCoaching('student-1', topic);
        expect(coaching).toBeDefined();
      }
    });
  });

  describe('trackEmploymentOutcome', () => {
    it('should track employment outcome', async () => {
      await expect(
        careerService.trackEmploymentOutcome('student-1', 'job-1', true, 120000)
      ).resolves.not.toThrow();
    });
  });
});
