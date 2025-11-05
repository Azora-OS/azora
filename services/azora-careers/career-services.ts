/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * Career Services System
 * Complete employment ecosystem connecting students to opportunities
 * Job board, skills matching, internships, freelancing, resume building
 */

import { EventEmitter } from 'events';

// ===== INTERFACES =====

export interface Job {
  id: string;
  jobNumber: string;
  title: string;
  company: string;
  companyLogo?: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skillsRequired: Skill[];
  educationLevel: 'diploma' | 'bachelors' | 'masters' | 'phd' | 'any';
  experienceYears: number;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
  location: string;
  remote: boolean;
  hybrid: boolean;
  salary: SalaryRange;
  currency: string;
  benefits: string[];
  applicationDeadline: Date;
  postedDate: Date;
  status: 'active' | 'closed' | 'filled';
  applicants: number;
  views: number;
  category: JobCategory;
  industryTags: string[];
  verified: boolean;
  urgentHiring: boolean;
}

export interface SalaryRange {
  min: number;
  max: number;
  period: 'hourly' | 'monthly' | 'annual';
  negotiable: boolean;
}

export type JobCategory = 
  | 'technology'
  | 'business'
  | 'engineering'
  | 'healthcare'
  | 'education'
  | 'finance'
  | 'marketing'
  | 'design'
  | 'operations'
  | 'other';

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  verified: boolean;
  yearsExperience?: number;
  certifications?: string[];
}

export interface Application {
  id: string;
  applicationNumber: string;
  jobId: string;
  jobTitle: string;
  company: string;
  studentNumber: string;
  studentName: string;
  email: string;
  phone: string;
  resumeId: string;
  coverLetter: string;
  portfolioUrl?: string;
  appliedDate: Date;
  status: 'submitted' | 'screening' | 'interview' | 'offered' | 'rejected' | 'withdrawn' | 'accepted';
  matchScore: number; // 0-100
  statusHistory: StatusUpdate[];
  interviews: Interview[];
  notes: ApplicationNote[];
  feedback?: string;
}

export interface StatusUpdate {
  status: Application['status'];
  date: Date;
  updatedBy: string;
  notes?: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  type: 'phone' | 'video' | 'in-person' | 'technical' | 'behavioral';
  scheduledDate: Date;
  duration: number; // minutes
  interviewer: string;
  interviewerEmail: string;
  meetingUrl?: string;
  location?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  feedback?: InterviewFeedback;
  recordingUrl?: string;
}

export interface InterviewFeedback {
  rating: number; // 1-5
  strengths: string[];
  weaknesses: string[];
  recommendation: 'strong_yes' | 'yes' | 'maybe' | 'no' | 'strong_no';
  comments: string;
  technicalScore?: number;
  communicationScore?: number;
  cultureFitScore?: number;
}

export interface ApplicationNote {
  id: string;
  authorId: string;
  authorName: string;
  note: string;
  isInternal: boolean;
  createdAt: Date;
}

export interface Resume {
  id: string;
  studentNumber: string;
  version: number;
  title: string;
  personalInfo: PersonalInfo;
  summary: string;
  education: Education[];
  experience: Experience[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  achievements: Achievement[];
  languages: Language[];
  references: Reference[];
  template: ResumeTemplate;
  pdfUrl?: string;
  lastUpdated: Date;
  createdAt: Date;
  isPrimary: boolean;
  isPublic: boolean;
  views: number;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn?: string;
  github?: string;
  website?: string;
  professionalTitle: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  gpa?: number;
  achievements?: string[];
  verified: boolean;
  credentialUrl?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description: string;
  achievements: string[];
  skills: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  role: string;
  technologies: string[];
  url?: string;
  githubUrl?: string;
  startDate: Date;
  endDate?: Date;
  achievements: string[];
  featured: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  credentialUrl?: string;
  verified: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: Date;
  issuer?: string;
}

export interface Language {
  name: string;
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
}

export interface Reference {
  name: string;
  position: string;
  company: string;
  email: string;
  phone?: string;
  relationship: string;
}

export type ResumeTemplate = 'modern' | 'classic' | 'minimal' | 'creative' | 'professional';

export interface Portfolio {
  id: string;
  studentNumber: string;
  title: string;
  description: string;
  coverImage?: string;
  items: PortfolioItem[];
  skills: string[];
  categories: string[];
  views: number;
  likes: number;
  url: string;
  customDomain?: string;
  published: boolean;
  theme: PortfolioTheme;
  lastUpdated: Date;
  createdAt: Date;
}

export interface PortfolioItem {
  id: string;
  type: 'project' | 'work_sample' | 'certificate' | 'testimonial' | 'blog_post';
  title: string;
  description: string;
  media: PortfolioMedia[];
  technologies?: string[];
  url?: string;
  order: number;
  featured: boolean;
}

export interface PortfolioMedia {
  type: 'image' | 'video' | 'pdf' | 'link';
  url: string;
  thumbnail?: string;
  caption?: string;
}

export type PortfolioTheme = 'dark' | 'light' | 'gradient' | 'minimal';

export interface Internship extends Job {
  duration: number; // months
  stipend: number;
  learningOutcomes: string[];
  mentorshipProvided: boolean;
  fullTimeConversion: boolean;
  projectBased: boolean;
}

export interface FreelanceGig {
  id: string;
  title: string;
  description: string;
  clientName: string;
  clientRating: number;
  budget: SalaryRange;
  deadline: Date;
  skillsRequired: Skill[];
  deliverables: string[];
  projectType: 'fixed' | 'hourly';
  estimatedHours?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: JobCategory;
  proposals: number;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  postedDate: Date;
  tags: string[];
}

export interface FreelanceProposal {
  id: string;
  gigId: string;
  studentNumber: string;
  coverLetter: string;
  proposedRate: number;
  estimatedDuration: number; // days
  milestones: Milestone[];
  portfolioSamples: string[];
  status: 'pending' | 'accepted' | 'rejected';
  submittedDate: Date;
}

export interface Milestone {
  id: string;
  description: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'paid';
}

export interface SkillMatch {
  studentNumber: string;
  studentName: string;
  jobId: string;
  matchScore: number; // 0-100
  matchedSkills: Skill[];
  missingSkills: Skill[];
  educationMatch: boolean;
  experienceMatch: boolean;
  locationMatch: boolean;
  salaryMatch: boolean;
  recommendations: string[];
  coursesToImprove: string[];
}

export interface CareerProfile {
  studentNumber: string;
  personalInfo: PersonalInfo;
  currentStatus: 'student' | 'graduate' | 'employed' | 'seeking' | 'freelancing';
  desiredRoles: string[];
  desiredIndustries: string[];
  desiredLocations: string[];
  remotePreference: boolean;
  salaryExpectation: SalaryRange;
  availableFrom: Date;
  skills: Skill[];
  completedCourses: CourseSummary[];
  gpa: number;
  creditsCompleted: number;
  transcriptUrl?: string;
  resumeId?: string;
  portfolioId?: string;
  linkedInConnections: number;
  jobAlertsEnabled: boolean;
  profileVisibility: 'public' | 'employers' | 'private';
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseSummary {
  courseId: string;
  courseName: string;
  courseCode: string;
  grade: number;
  credits: number;
  skills: string[];
  completedDate: Date;
}

export interface JobAlert {
  id: string;
  studentNumber: string;
  criteria: JobSearchCriteria;
  frequency: 'instant' | 'daily' | 'weekly';
  enabled: boolean;
  lastSent?: Date;
  matchCount: number;
}

export interface JobSearchCriteria {
  keywords?: string[];
  categories?: JobCategory[];
  employmentTypes?: Job['employmentType'][];
  locations?: string[];
  remote?: boolean;
  salaryMin?: number;
  experienceYears?: number;
  skills?: string[];
}

export interface InterviewPrep {
  id: string;
  studentNumber: string;
  jobId?: string;
  type: Interview['type'];
  questions: InterviewQuestion[];
  mockedAt?: Date;
  score?: number;
  feedback?: string;
  recording?: string;
  transcript?: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  category: 'behavioral' | 'technical' | 'situational' | 'company-specific';
  difficulty: 'easy' | 'medium' | 'hard';
  answer?: string;
  bestPractice?: string;
  userAnswer?: string;
  score?: number;
  feedback?: string;
}

export interface CareerPathway {
  id: string;
  targetRole: string;
  currentRole: string;
  steps: CareerStep[];
  estimatedDuration: number; // months
  difficulty: 'easy' | 'moderate' | 'challenging' | 'very-challenging';
  salary Progression: SalaryProgression[];
  requiredSkills: Skill[];
  recommendedCourses: string[];
  successRate: number; // percentage
}

export interface CareerStep {
  order: number;
  title: string;
  description: string;
  duration: number; // months
  requirements: string[];
  milestones: string[];
  completed: boolean;
}

export interface SalaryProgression {
  stage: string;
  years: number;
  salary: SalaryRange;
}

export interface CareerAnalytics {
  studentNumber: string;
  period: {
    start: Date;
    end: Date;
  };
  applications: {
    total: number;
    submitted: number;
    screening: number;
    interview: number;
    offered: number;
    rejected: number;
    accepted: number;
    averageMatchScore: number;
  };
  interviews: {
    total: number;
    scheduled: number;
    completed: number;
    averageScore: number;
  };
  profileViews: number;
  resumeDownloads: number;
  portfolioViews: number;
  skillGaps: string[];
  marketDemand: MarketDemand[];
  recommendations: string[];
}

export interface MarketDemand {
  skill: string;
  demand: 'low' | 'medium' | 'high' | 'very-high';
  averageSalary: number;
  jobCount: number;
  growth: number; // percentage
}

// ===== CAREER SERVICES SYSTEM =====

export class CareerServicesSystem extends EventEmitter {
  private jobs: Map<string, Job> = new Map();
  private applications: Map<string, Application> = new Map();
  private resumes: Map<string, Resume> = new Map();
  private portfolios: Map<string, Portfolio> = new Map();
  private internships: Map<string, Internship> = new Map();
  private freelanceGigs: Map<string, FreelanceGig> = new Map();
  private careerProfiles: Map<string, CareerProfile> = new Map();
  private jobAlerts: Map<string, JobAlert> = new Map();
  private interviewPreps: Map<string, InterviewPrep> = new Map();
  private jobCounter: number = 10000;
  private applicationCounter: number = 50000;

  constructor() {
    super();
    this.initializeSystem();
  }

  private initializeSystem(): void {
    this.loadSampleJobs();
    this.startBackgroundJobs();
    console.log('✅ Career Services System initialized');
  }

  private loadSampleJobs(): void {
    // Sample jobs for testing
    const sampleJobs: Omit<Job, 'id' | 'jobNumber' | 'postedDate' | 'applicants' | 'views'>[] = [
      {
        title: 'Junior Software Developer',
        company: 'TechCorp',
        description: 'Join our growing team building innovative solutions...',
        requirements: [
          'Bachelor\'s degree in Computer Science or related field',
          'Proficiency in JavaScript and React',
          '1-2 years experience preferred',
        ],
        responsibilities: [
          'Develop and maintain web applications',
          'Collaborate with design team',
          'Write clean, maintainable code',
        ],
        skillsRequired: [
          { name: 'JavaScript', level: 'intermediate', verified: false },
          { name: 'React', level: 'intermediate', verified: false },
          { name: 'Node.js', level: 'beginner', verified: false },
        ],
        educationLevel: 'bachelors',
        experienceYears: 1,
        employmentType: 'full-time',
        location: 'Johannesburg, South Africa',
        remote: true,
        hybrid: true,
        salary: {
          min: 300000,
          max: 450000,
          period: 'annual',
          negotiable: true,
        },
        currency: 'ZAR',
        benefits: ['Medical Aid', 'Retirement Fund', 'Learning Budget', 'Flexible Hours'],
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active',
        category: 'technology',
        industryTags: ['software', 'web-development', 'startups'],
        verified: true,
        urgentHiring: false,
      },
    ];

    sampleJobs.forEach((job) => {
      const fullJob: Job = {
        ...job,
        id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        jobNumber: `JOB-${this.jobCounter++}`,
        postedDate: new Date(),
        applicants: 0,
        views: 0,
      };
      this.jobs.set(fullJob.id, fullJob);
    });

    console.log(`✅ Loaded ${sampleJobs.length} sample jobs`);
  }

  private startBackgroundJobs(): void {
    // Match students to jobs daily
    setInterval(() => this.runSkillsMatching(), 24 * 60 * 60 * 1000);

    // Send job alerts
    setInterval(() => this.sendJobAlerts(), 60 * 60 * 1000);

    // Update market demand data
    setInterval(() => this.updateMarketDemand(), 7 * 24 * 60 * 60 * 1000);
  }

  // ===== JOB MANAGEMENT =====

  async postJob(job: Omit<Job, 'id' | 'jobNumber' | 'postedDate' | 'applicants' | 'views' | 'status'>): Promise<Job> {
    const newJob: Job = {
      ...job,
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      jobNumber: `JOB-${this.jobCounter++}`,
      postedDate: new Date(),
      applicants: 0,
      views: 0,
      status: 'active',
    };

    this.jobs.set(newJob.id, newJob);

    this.emit('job-posted', newJob);

    // Notify matching candidates
    await this.notifyMatchingCandidates(newJob);

    return newJob;
  }

  async searchJobs(criteria: JobSearchCriteria, page: number = 1, limit: number = 20): Promise<{ jobs: Job[]; total: number; pages: number }> {
    let results = Array.from(this.jobs.values()).filter((job) => job.status === 'active');

    // Apply filters
    if (criteria.keywords && criteria.keywords.length > 0) {
      results = results.filter((job) =>
        criteria.keywords!.some((keyword) =>
          job.title.toLowerCase().includes(keyword.toLowerCase()) ||
          job.description.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    }

    if (criteria.categories && criteria.categories.length > 0) {
      results = results.filter((job) => criteria.categories!.includes(job.category));
    }

    if (criteria.employmentTypes && criteria.employmentTypes.length > 0) {
      results = results.filter((job) => criteria.employmentTypes!.includes(job.employmentType));
    }

    if (criteria.locations && criteria.locations.length > 0) {
      results = results.filter((job) =>
        criteria.locations!.some((loc) =>
          job.location.toLowerCase().includes(loc.toLowerCase())
        )
      );
    }

    if (criteria.remote !== undefined) {
      results = results.filter((job) => job.remote === criteria.remote);
    }

    if (criteria.salaryMin) {
      results = results.filter((job) => job.salary.min >= criteria.salaryMin!);
    }

    // Sort by posted date (newest first)
    results.sort((a, b) => b.postedDate.getTime() - a.postedDate.getTime());

    // Pagination
    const total = results.length;
    const pages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedResults = results.slice(start, start + limit);

    return {
      jobs: paginatedResults,
      total,
      pages,
    };
  }

  async getJob(jobId: string): Promise<Job | null> {
    const job = this.jobs.get(jobId);
    if (job) {
      job.views++;
    }
    return job || null;
  }

  // ===== APPLICATION MANAGEMENT =====

  async submitApplication(application: Omit<Application, 'id' | 'applicationNumber' | 'appliedDate' | 'status' | 'statusHistory' | 'interviews' | 'notes' | 'matchScore'>): Promise<Application> {
    const job = this.jobs.get(application.jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status !== 'active') {
      throw new Error('Job is no longer accepting applications');
    }

    // Calculate match score
    const profile = this.careerProfiles.get(application.studentNumber);
    const matchScore = profile
      ? await this.calculateMatchScore(profile, job)
      : 50;

    const newApplication: Application = {
      ...application,
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      applicationNumber: `APP-${this.applicationCounter++}`,
      appliedDate: new Date(),
      status: 'submitted',
      matchScore,
      statusHistory: [
        {
          status: 'submitted',
          date: new Date(),
          updatedBy: 'system',
        },
      ],
      interviews: [],
      notes: [],
    };

    this.applications.set(newApplication.id, newApplication);
    job.applicants++;

    this.emit('application-submitted', { application: newApplication, job });

    return newApplication;
  }

  async updateApplicationStatus(
    applicationId: string,
    status: Application['status'],
    updatedBy: string,
    notes?: string
  ): Promise<void> {
    const application = this.applications.get(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    application.status = status;
    application.statusHistory.push({
      status,
      date: new Date(),
      updatedBy,
      notes,
    });

    this.emit('application-status-updated', application);
  }

  async scheduleInterview(
    applicationId: string,
    interview: Omit<Interview, 'id' | 'applicationId' | 'status'>
  ): Promise<Interview> {
    const application = this.applications.get(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    const newInterview: Interview = {
      ...interview,
      id: `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      applicationId,
      status: 'scheduled',
    };

    application.interviews.push(newInterview);
    application.status = 'interview';

    this.emit('interview-scheduled', { application, interview: newInterview });

    return newInterview;
  }

  // ===== RESUME BUILDER =====

  async createResume(studentNumber: string, data: Omit<Resume, 'id' | 'studentNumber' | 'version' | 'lastUpdated' | 'createdAt' | 'views'>): Promise<Resume> {
    // Get existing resumes for version number
    const existingResumes = Array.from(this.resumes.values()).filter(
      (r) => r.studentNumber === studentNumber
    );

    const resume: Resume = {
      ...data,
      id: `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentNumber,
      version: existingResumes.length + 1,
      lastUpdated: new Date(),
      createdAt: new Date(),
      views: 0,
    };

    // Auto-populate from student profile if available
    const profile = this.careerProfiles.get(studentNumber);
    if (profile) {
      resume.personalInfo = profile.personalInfo;
      resume.skills = profile.skills;
      resume.education = profile.completedCourses.map((course) => ({
        id: course.courseId,
        institution: 'Sapiens University',
        degree: 'Course Completion',
        field: course.courseName,
        startDate: new Date(),
        endDate: course.completedDate,
        current: false,
        gpa: course.grade / 25, // Convert to 4.0 scale
        verified: true,
        credentialUrl: `https://verify.azora.world/credential/${course.courseId}`,
      }));
    }

    this.resumes.set(resume.id, resume);

    this.emit('resume-created', resume);

    return resume;
  }

  async generatePDF(resumeId: string): Promise<string> {
    const resume = this.resumes.get(resumeId);
    if (!resume) {
      throw new Error('Resume not found');
    }

    // In production, this would generate a PDF
    const pdfUrl = `https://resumes.azora.world/${resumeId}.pdf`;
    resume.pdfUrl = pdfUrl;

    return pdfUrl;
  }

  // ===== PORTFOLIO BUILDER =====

  async createPortfolio(studentNumber: string, portfolio: Omit<Portfolio, 'id' | 'studentNumber' | 'views' | 'likes' | 'url' | 'lastUpdated' | 'createdAt'>): Promise<Portfolio> {
    const portfolioId = `portfolio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newPortfolio: Portfolio = {
      ...portfolio,
      id: portfolioId,
      studentNumber,
      views: 0,
      likes: 0,
      url: `https://portfolio.azora.world/${studentNumber}`,
      lastUpdated: new Date(),
      createdAt: new Date(),
    };

    this.portfolios.set(portfolioId, newPortfolio);

    this.emit('portfolio-created', newPortfolio);

    return newPortfolio;
  }

  // ===== SKILLS MATCHING =====

  async matchStudentToJobs(studentNumber: string, limit: number = 10): Promise<SkillMatch[]> {
    const profile = this.careerProfiles.get(studentNumber);
    if (!profile) {
      throw new Error('Career profile not found');
    }

    const matches: SkillMatch[] = [];

    for (const job of this.jobs.values()) {
      if (job.status !== 'active') continue;

      const matchScore = await this.calculateMatchScore(profile, job);

      if (matchScore >= 50) {
        // Only include matches above 50%
        const matchedSkills = profile.skills.filter((studentSkill) =>
          job.skillsRequired.some((jobSkill) => jobSkill.name.toLowerCase() === studentSkill.name.toLowerCase())
        );

        const missingSkills = job.skillsRequired.filter(
          (jobSkill) =>
            !profile.skills.some((studentSkill) => studentSkill.name.toLowerCase() === jobSkill.name.toLowerCase())
        );

        matches.push({
          studentNumber,
          studentName: profile.personalInfo.firstName + ' ' + profile.personalInfo.lastName,
          jobId: job.id,
          matchScore,
          matchedSkills,
          missingSkills,
          educationMatch: this.checkEducationMatch(profile, job),
          experienceMatch: profile.completedCourses.length >= job.experienceYears,
          locationMatch: profile.desiredLocations.some((loc) => job.location.includes(loc)) || job.remote,
          salaryMatch: job.salary.min >= (profile.salaryExpectation?.min || 0),
          recommendations: this.generateRecommendations(missingSkills),
          coursesToImprove: this.findCoursesForSkills(missingSkills),
        });
      }
    }

    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);

    return matches.slice(0, limit);
  }

  private async calculateMatchScore(profile: CareerProfile, job: Job): Promise<number> {
    let score = 0;
    let maxScore = 0;

    // Skills match (40% weight)
    maxScore += 40;
    const matchedSkills = profile.skills.filter((studentSkill) =>
      job.skillsRequired.some((jobSkill) => jobSkill.name.toLowerCase() === studentSkill.name.toLowerCase())
    );
    score += (matchedSkills.length / job.skillsRequired.length) * 40;

    // Education match (20% weight)
    maxScore += 20;
    if (this.checkEducationMatch(profile, job)) {
      score += 20;
    }

    // Experience match (20% weight)
    maxScore += 20;
    if (profile.completedCourses.length >= job.experienceYears) {
      score += 20;
    }

    // Location match (10% weight)
    maxScore += 10;
    if (profile.desiredLocations.some((loc) => job.location.includes(loc)) || job.remote || profile.remotePreference) {
      score += 10;
    }

    // Salary match (10% weight)
    maxScore += 10;
    if (profile.salaryExpectation && job.salary.min >= profile.salaryExpectation.min) {
      score += 10;
    }

    return Math.round((score / maxScore) * 100);
  }

  private checkEducationMatch(profile: CareerProfile, job: Job): boolean {
    const educationLevels = ['diploma', 'bachelors', 'masters', 'phd'];
    const profileLevel = profile.completedCourses.length >= 120 ? 'bachelors' : 'diploma';
    const profileLevelIndex = educationLevels.indexOf(profileLevel);
    const jobLevelIndex = educationLevels.indexOf(job.educationLevel);

    return profileLevelIndex >= jobLevelIndex || job.educationLevel === 'any';
  }

  private generateRecommendations(missingSkills: Skill[]): string[] {
    return missingSkills.slice(0, 3).map((skill) =>
      `Consider learning ${skill.name} to improve your chances`
    );
  }

  private findCoursesForSkills(skills: Skill[]): string[] {
    // In production, this would query the course catalog
    return skills.slice(0, 3).map((skill) => `${skill.name} Fundamentals`);
  }

  private async notifyMatchingCandidates(job: Job): Promise<void> {
    // Find students with matching skills and notify them
    for (const profile of this.careerProfiles.values()) {
      const matchScore = await this.calculateMatchScore(profile, job);
      if (matchScore >= 70 && profile.jobAlertsEnabled) {
        this.emit('job-match-notification', { profile, job, matchScore });
      }
    }
  }

  private async runSkillsMatching(): Promise<void> {
    console.log('Running daily skills matching...');
    // Match all active students to new jobs
  }

  private async sendJobAlerts(): Promise<void> {
    console.log('Sending job alerts...');
    // Send email/SMS alerts for new matching jobs
  }

  private async updateMarketDemand(): Promise<void> {
    console.log('Updating market demand data...');
    // Analyze job postings to identify trending skills
  }

  // ===== CAREER PROFILE =====

  async createCareerProfile(profile: Omit<CareerProfile, 'lastActive' | 'createdAt' | 'updatedAt'>): Promise<CareerProfile> {
    const newProfile: CareerProfile = {
      ...profile,
      lastActive: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.careerProfiles.set(newProfile.studentNumber, newProfile);

    this.emit('career-profile-created', newProfile);

    return newProfile;
  }

  async updateCareerProfile(studentNumber: string, updates: Partial<CareerProfile>): Promise<CareerProfile> {
    const profile = this.careerProfiles.get(studentNumber);
    if (!profile) {
      throw new Error('Career profile not found');
    }

    Object.assign(profile, updates, { updatedAt: new Date() });

    this.emit('career-profile-updated', profile);

    return profile;
  }

  // ===== ANALYTICS =====

  async getCareerAnalytics(studentNumber: string, startDate: Date, endDate: Date): Promise<CareerAnalytics> {
    const applications = Array.from(this.applications.values()).filter(
      (app) => app.studentNumber === studentNumber &&
        app.appliedDate >= startDate &&
        app.appliedDate <= endDate
    );

    const interviews = applications.flatMap((app) => app.interviews);

    const analytics: CareerAnalytics = {
      studentNumber,
      period: { start: startDate, end: endDate },
      applications: {
        total: applications.length,
        submitted: applications.filter((a) => a.status === 'submitted').length,
        screening: applications.filter((a) => a.status === 'screening').length,
        interview: applications.filter((a) => a.status === 'interview').length,
        offered: applications.filter((a) => a.status === 'offered').length,
        rejected: applications.filter((a) => a.status === 'rejected').length,
        accepted: applications.filter((a) => a.status === 'accepted').length,
        averageMatchScore: applications.length > 0
          ? applications.reduce((sum, app) => sum + app.matchScore, 0) / applications.length
          : 0,
      },
      interviews: {
        total: interviews.length,
        scheduled: interviews.filter((i) => i.status === 'scheduled').length,
        completed: interviews.filter((i) => i.status === 'completed').length,
        averageScore: 0, // Would calculate from interview feedback
      },
      profileViews: 0,
      resumeDownloads: 0,
      portfolioViews: 0,
      skillGaps: [],
      marketDemand: [],
      recommendations: [],
    };

    return analytics;
  }
}

export default CareerServicesSystem;
