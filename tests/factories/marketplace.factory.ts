import { faker } from '@faker-js/faker';
import { Job, JobApplication, ApplicationStatus, JobStatus } from '@prisma/client';
import { BaseFactory } from './base.factory';

export interface CreateJobOptions {
  title?: string;
  description?: string;
  employerId?: string;
  salary?: number;
  location?: string;
  status?: JobStatus;
  skills?: string[];
}

export interface CreateApplicationOptions {
  userId: string;
  jobId: string;
  status?: ApplicationStatus;
  coverLetter?: string;
  appliedAt?: Date;
}

/**
 * Factory for creating test jobs
 */
export class JobFactory extends BaseFactory<Job> {
  /**
   * Create a test job
   */
  async create(overrides?: CreateJobOptions): Promise<Job> {
    const job = await this.prisma.job.create({
      data: {
        title: overrides?.title || faker.person.jobTitle(),
        description: overrides?.description || faker.lorem.paragraphs(2),
        employerId: overrides?.employerId || faker.string.uuid(),
        salary: overrides?.salary ?? faker.number.int({ min: 30000, max: 150000 }),
        location: overrides?.location || faker.location.city(),
        status: overrides?.status || JobStatus.ACTIVE,
        skills: overrides?.skills || this.generateSkills(),
        createdAt: new Date(),
      },
    });

    this.trackRecord('job', job.id);
    return job;
  }

  /**
   * Create active job
   */
  async createActive(overrides?: CreateJobOptions): Promise<Job> {
    return this.create({
      ...overrides,
      status: JobStatus.ACTIVE,
    });
  }

  /**
   * Create closed job
   */
  async createClosed(overrides?: CreateJobOptions): Promise<Job> {
    return this.create({
      ...overrides,
      status: JobStatus.CLOSED,
    });
  }

  /**
   * Create job with specific skills
   */
  async createWithSkills(skills: string[], overrides?: CreateJobOptions): Promise<Job> {
    return this.create({
      ...overrides,
      skills,
    });
  }

  /**
   * Generate random skills
   */
  private generateSkills(): string[] {
    const allSkills = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Node.js',
      'AWS', 'Docker', 'Kubernetes', 'SQL', 'MongoDB', 'GraphQL',
      'Machine Learning', 'Data Science', 'DevOps', 'Agile'
    ];
    
    const count = faker.number.int({ min: 3, max: 7 });
    return faker.helpers.arrayElements(allSkills, count);
  }
}

/**
 * Factory for creating test job applications
 */
export class JobApplicationFactory extends BaseFactory<JobApplication> {
  /**
   * Create a test job application
   */
  async create(overrides: CreateApplicationOptions): Promise<JobApplication> {
    const application = await this.prisma.jobApplication.create({
      data: {
        userId: overrides.userId,
        jobId: overrides.jobId,
        status: overrides.status || ApplicationStatus.PENDING,
        coverLetter: overrides.coverLetter || faker.lorem.paragraphs(2),
        appliedAt: overrides.appliedAt || new Date(),
      },
    });

    this.trackRecord('jobApplication', application.id);
    return application;
  }

  /**
   * Create pending application
   */
  async createPending(userId: string, jobId: string): Promise<JobApplication> {
    return this.create({
      userId,
      jobId,
      status: ApplicationStatus.PENDING,
    });
  }

  /**
   * Create accepted application
   */
  async createAccepted(userId: string, jobId: string): Promise<JobApplication> {
    return this.create({
      userId,
      jobId,
      status: ApplicationStatus.ACCEPTED,
    });
  }

  /**
   * Create rejected application
   */
  async createRejected(userId: string, jobId: string): Promise<JobApplication> {
    return this.create({
      userId,
      jobId,
      status: ApplicationStatus.REJECTED,
    });
  }

  /**
   * Create withdrawn application
   */
  async createWithdrawn(userId: string, jobId: string): Promise<JobApplication> {
    return this.create({
      userId,
      jobId,
      status: ApplicationStatus.WITHDRAWN,
    });
  }
}

/**
 * Factory for creating test skill profiles
 */
export class SkillProfileFactory extends BaseFactory<any> {
  /**
   * Create a test skill profile
   */
  async create(overrides?: any): Promise<any> {
    const profile = await this.prisma.userSkill.create({
      data: {
        userId: overrides?.userId || faker.string.uuid(),
        skill: overrides?.skill || faker.person.jobArea(),
        level: overrides?.level || this.pickRandom(['beginner', 'intermediate', 'advanced', 'expert']),
        yearsOfExperience: overrides?.yearsOfExperience ?? faker.number.int({ min: 0, max: 20 }),
      },
    });

    this.trackRecord('userSkill', profile.id);
    return profile;
  }

  /**
   * Create multiple skills for a user
   */
  async createMultiple(userId: string, skills: string[]): Promise<any[]> {
    const promises = skills.map(skill =>
      this.create({ userId, skill })
    );
    return Promise.all(promises);
  }
}

// Export singleton instances
export const jobFactory = new JobFactory();
export const jobApplicationFactory = new JobApplicationFactory();
export const skillProfileFactory = new SkillProfileFactory();
