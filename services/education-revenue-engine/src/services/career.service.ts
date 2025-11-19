import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface CareerProfile {
  id: string;
  studentId: string;
  title: string;
  bio: string;
  skills: string[];
  certifications: string[];
  experience: number; // years
  desiredRole: string;
  location: string;
  profileUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  description: string;
  requiredSkills: string[];
  location: string;
  salary: number;
  jobType: 'full-time' | 'part-time' | 'contract';
  postedDate: Date;
  matchScore: number;
}

export interface JobMatch {
  studentId: string;
  jobId: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  matchedAt: Date;
}

export class CareerService {
  /**
   * Generate professional profile from completed courses
   * Requirements: 8.1, 8.2
   */
  async generateCareerProfile(studentId: string): Promise<CareerProfile> {
    try {
      // Get student
      const student = await prisma.user.findUnique({
        where: { id: studentId },
        include: {
          enrollments: {
            where: { status: 'completed' },
            include: {
              course: true,
              outcomes: true,
            },
          },
        },
      });

      if (!student) {
        throw new Error(`Student not found: ${studentId}`);
      }

      // Extract skills from completed courses
      const skills = this.extractSkillsFromCourses(student.enrollments);
      const certifications = student.enrollments.map((e: any) => e.course.title);

      // Create profile
      const profileUrl = `${process.env.CAREER_BASE_URL || 'https://azora.edu'}/profile/${studentId}`;

      const profile = await prisma.user.update({
        where: { id: studentId },
        data: {
          // In a real implementation, this would update a separate CareerProfile table
        },
      });

      logger.info('Career profile generated', {
        studentId,
        skillsCount: skills.length,
        certificationsCount: certifications.length,
      });

      return {
        id: `profile-${studentId}`,
        studentId,
        title: `${student.firstName} ${student.lastName}`,
        bio: `Professional with expertise in ${skills.slice(0, 3).join(', ')}`,
        skills,
        certifications,
        experience: 0,
        desiredRole: 'Software Engineer',
        location: 'Remote',
        profileUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      logger.error('Error generating career profile', { error, studentId });
      throw error;
    }
  }

  /**
   * Get career profile for a student
   * Requirements: 8.1, 8.2
   */
  async getCareerProfile(studentId: string): Promise<CareerProfile | null> {
    try {
      const student = await prisma.user.findUnique({
        where: { id: studentId },
      });

      if (!student) {
        return null;
      }

      // In a real implementation, this would fetch from CareerProfile table
      return await this.generateCareerProfile(studentId);
    } catch (error) {
      logger.error('Error fetching career profile', { error, studentId });
      throw error;
    }
  }

  /**
   * Match students with job opportunities
   * Requirements: 8.1, 8.2
   */
  async matchStudentWithJobs(studentId: string): Promise<JobMatch[]> {
    try {
      // Get student profile
      const profile = await this.getCareerProfile(studentId);

      if (!profile) {
        throw new Error(`Career profile not found for student: ${studentId}`);
      }

      // Get available job opportunities
      const jobs = await this.getAvailableJobs();

      // Match student with jobs
      const matches: JobMatch[] = jobs.map((job) => {
        const matchedSkills = profile.skills.filter((skill) =>
          job.requiredSkills.some((req) => req.toLowerCase().includes(skill.toLowerCase()))
        );

        const missingSkills = job.requiredSkills.filter(
          (req) => !profile.skills.some((skill) => skill.toLowerCase().includes(req.toLowerCase()))
        );

        const matchScore = (matchedSkills.length / job.requiredSkills.length) * 100;

        return {
          studentId,
          jobId: job.id,
          matchScore,
          matchedSkills,
          missingSkills,
          matchedAt: new Date(),
        };
      });

      // Sort by match score
      matches.sort((a, b) => b.matchScore - a.matchScore);

      logger.info('Student matched with jobs', {
        studentId,
        matchCount: matches.length,
        topMatch: matches[0]?.matchScore,
      });

      return matches;
    } catch (error) {
      logger.error('Error matching student with jobs', { error, studentId });
      throw error;
    }
  }

  /**
   * Get job opportunities for a student
   * Requirements: 8.1, 8.2
   */
  async getJobOpportunities(studentId: string, limit: number = 10): Promise<JobOpportunity[]> {
    try {
      const matches = await this.matchStudentWithJobs(studentId);

      // Get top matches
      const topMatches = matches.slice(0, limit);

      // Get job details
      const jobs = await this.getAvailableJobs();

      const opportunities = topMatches
        .map((match) => {
          const job = jobs.find((j) => j.id === match.jobId);
          return job;
        })
        .filter((job) => job !== undefined) as JobOpportunity[];

      return opportunities;
    } catch (error) {
      logger.error('Error fetching job opportunities', { error, studentId });
      throw error;
    }
  }

  /**
   * Track employment outcomes
   * Requirements: 8.1, 8.2
   */
  async trackEmploymentOutcome(
    studentId: string,
    jobId: string,
    hired: boolean,
    salary?: number
  ): Promise<void> {
    try {
      logger.info('Employment outcome tracked', {
        studentId,
        jobId,
        hired,
        salary,
      });

      // In a real implementation, this would be stored in a database
      // for analytics and reporting
    } catch (error) {
      logger.error('Error tracking employment outcome', { error, studentId, jobId });
      throw error;
    }
  }

  /**
   * Provide career coaching through Elara
   * Requirements: 8.1, 8.2
   */
  async getCareerCoaching(studentId: string, topic: string): Promise<string> {
    try {
      // In a real implementation, this would call Elara Orchestrator
      // For now, return placeholder coaching

      const coachingTopics: Record<string, string> = {
        'resume': 'Focus on highlighting your technical skills and project experience. Use action verbs and quantify your achievements.',
        'interview': 'Practice common technical interview questions. Prepare examples of your problem-solving approach.',
        'networking': 'Connect with professionals in your field. Attend industry events and engage on professional networks.',
        'salary': 'Research market rates for your role and experience level. Be prepared to negotiate based on your skills.',
        'career-path': 'Consider specialization areas that align with your interests and market demand.',
      };

      const coaching = coachingTopics[topic] || 'Career coaching available on various topics. Ask about resume, interview, networking, salary, or career-path.';

      logger.info('Career coaching provided', {
        studentId,
        topic,
      });

      return coaching;
    } catch (error) {
      logger.error('Error providing career coaching', { error, studentId, topic });
      throw error;
    }
  }

  /**
   * Extract skills from completed courses
   */
  private extractSkillsFromCourses(enrollments: any[]): string[] {
    const skills = new Set<string>();

    enrollments.forEach((enrollment: any) => {
      // Extract skills from course title
      const courseTitle = enrollment.course.title;
      const skillKeywords = [
        'TypeScript',
        'JavaScript',
        'React',
        'Node.js',
        'Python',
        'Java',
        'SQL',
        'MongoDB',
        'AWS',
        'Docker',
        'Kubernetes',
        'GraphQL',
        'REST API',
        'Microservices',
        'DevOps',
      ];

      skillKeywords.forEach((keyword: string) => {
        if (courseTitle.toLowerCase().includes(keyword.toLowerCase())) {
          skills.add(keyword);
        }
      });
    });

    return Array.from(skills);
  }

  /**
   * Get available job opportunities
   */
  private async getAvailableJobs(): Promise<JobOpportunity[]> {
    // Mock job opportunities
    return [
      {
        id: 'job-1',
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        description: 'Looking for experienced software engineer with TypeScript and React expertise',
        requiredSkills: ['TypeScript', 'React', 'Node.js', 'SQL'],
        location: 'San Francisco, CA',
        salary: 150000,
        jobType: 'full-time',
        postedDate: new Date(),
        matchScore: 0,
      },
      {
        id: 'job-2',
        title: 'Full Stack Developer',
        company: 'StartUp Inc',
        description: 'Join our growing team as a full stack developer',
        requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        location: 'Remote',
        salary: 120000,
        jobType: 'full-time',
        postedDate: new Date(),
        matchScore: 0,
      },
      {
        id: 'job-3',
        title: 'DevOps Engineer',
        company: 'Cloud Systems',
        description: 'Manage and optimize our cloud infrastructure',
        requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'Python'],
        location: 'New York, NY',
        salary: 140000,
        jobType: 'full-time',
        postedDate: new Date(),
        matchScore: 0,
      },
    ];
  }
}

export const careerService = new CareerService();
