/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * AZORA CORPORATE LEARNING PLATFORM (B2B)
 * 
 * Enterprise training solution for companies:
 * - Employee onboarding
 * - Skills development
 * - Compliance training
 * - Leadership programs
 * - Custom content creation
 * - Performance tracking
 * - ROI analytics
 * - Integration with HR systems
 * 
 * Compete with: LinkedIn Learning, Coursera for Business, Udacity Enterprise
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';

export interface CorporateClient {
  id: string;
  companyName: string;
  industry: string;
  size: 'small' | 'medium' | 'large' | 'enterprise'; // 1-50, 51-500, 501-5000, 5000+
  
  // Contact
  primaryContact: {
    name: string;
    email: string;
    phone: string;
    title: string;
  };
  
  // Contract
  contractType: 'starter' | 'professional' | 'enterprise' | 'custom';
  startDate: Date;
  renewalDate: Date;
  status: 'active' | 'trial' | 'suspended' | 'cancelled';
  
  // Licensing
  licensedSeats: number;
  activeUsers: number;
  pricePerSeat: number;
  
  // Features
  features: {
    customCourses: boolean;
    whiteLabel: boolean;
    apiAccess: boolean;
    dedicatedSupport: boolean;
    onsiteTraining: boolean;
    customReporting: boolean;
  };
  
  // Customization
  branding?: {
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    customDomain?: string;
  };
  
  // Integration
  integrations: {
    hrSystem?: string; // Workday, BambooHR, etc.
    ssoProvider?: string; // Azure AD, Okta, etc.
    apiKeys: string[];
  };
  
  // Settings
  settings: {
    autoEnrollNewEmployees: boolean;
    requiredCourses: string[];
    learningPaths: string[];
    certificationTracking: boolean;
    complianceReporting: boolean;
  };
}

export interface Employee {
  id: string;
  companyId: string;
  employeeId: string; // Company's internal ID
  
  // Personal
  firstName: string;
  lastName: string;
  email: string;
  
  // Role
  department: string;
  title: string;
  level: 'entry' | 'mid' | 'senior' | 'manager' | 'executive';
  manager?: string;
  
  // Learning
  enrolledCourses: string[];
  completedCourses: string[];
  inProgressCourses: string[];
  certifications: string[];
  skills: Skill[];
  
  // Progress
  totalLearningHours: number;
  lastActivityDate?: Date;
  enrollmentDate: Date;
  
  // Performance
  assessmentScores: AssessmentScore[];
  skillGaps: string[];
  recommendedCourses: string[];
}

export interface Skill {
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  acquiredDate: Date;
  lastPracticed?: Date;
  verified: boolean;
}

export interface AssessmentScore {
  courseId: string;
  courseName: string;
  score: number;
  passed: boolean;
  completedDate: Date;
  certificateId?: string;
}

export interface LearningPath {
  id: string;
  companyId?: string; // Null for public paths
  name: string;
  description: string;
  
  // Target
  targetRole: string;
  targetLevel: string;
  industry?: string;
  
  // Content
  courses: Array<{
    courseId: string;
    order: number;
    required: boolean;
    estimatedHours: number;
  }>;
  
  // Requirements
  prerequisites?: string[];
  estimatedDuration: number; // Total hours
  
  // Outcome
  skillsAcquired: string[];
  certification?: string;
  
  // Stats
  enrolledEmployees: number;
  completionRate: number;
}

export interface TrainingCourse {
  id: string;
  title: string;
  description: string;
  
  // Classification
  category: string;
  subcategory: string;
  tags: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  
  // Content
  modules: CourseModule[];
  totalDuration: number; // hours
  
  // Customization
  isCustom: boolean;
  createdFor?: string; // Company ID
  
  // Requirements
  prerequisites?: string[];
  
  // Assessment
  hasAssessment: boolean;
  passingScore: number;
  certificateAwarded: boolean;
  
  // Compliance
  isComplianceCourse: boolean;
  complianceType?: string; // HIPAA, GDPR, SOX, etc.
  renewalRequired: boolean;
  renewalPeriod?: number; // months
  
  // Stats
  enrollments: number;
  completions: number;
  averageScore: number;
  averageRating: number;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  
  // Content
  contentType: 'video' | 'text' | 'interactive' | 'quiz' | 'assignment';
  contentUrl?: string;
  duration: number; // minutes
  
  // Order
  order: number;
  required: boolean;
  
  // Progress Tracking
  completions: number;
}

export interface CompanyAnalytics {
  companyId: string;
  period: {
    start: Date;
    end: Date;
  };
  
  // Engagement
  activeUsers: number;
  totalLogins: number;
  averageTimePerUser: number; // hours
  
  // Courses
  coursesCompleted: number;
  coursesInProgress: number;
  averageCompletionRate: number;
  
  // Skills
  skillsAcquired: number;
  certificationsEarned: number;
  
  // Compliance
  complianceRate: number; // % of required training completed
  overdueTrainings: number;
  
  // Performance
  averageAssessmentScore: number;
  topPerformers: string[]; // Employee IDs
  needsAttention: string[]; // Employees falling behind
  
  // ROI
  estimatedProductivityGain: number;
  costPerEmployee: number;
  trainingROI: number;
}

export interface ComplianceReport {
  companyId: string;
  reportDate: Date;
  
  // Overview
  totalEmployees: number;
  compliantEmployees: number;
  complianceRate: number;
  
  // By Course
  courses: Array<{
    courseId: string;
    courseName: string;
    required: boolean;
    completed: number;
    overdue: number;
    upcoming: number;
  }>;
  
  // By Department
  departments: Array<{
    department: string;
    complianceRate: number;
    employees: number;
  }>;
  
  // Risks
  highRiskEmployees: Array<{
    employeeId: string;
    name: string;
    overdueTrainings: string[];
  }>;
  
  // Recommendations
  recommendations: string[];
}

export class CorporateLearningPlatform extends EventEmitter {
  private clients: Map<string, CorporateClient> = new Map();
  private employees: Map<string, Employee> = new Map();
  private courses: Map<string, TrainingCourse> = new Map();
  private learningPaths: Map<string, LearningPath> = new Map();
  
  constructor() {
    super();
    this.initializeStandardCourses();
    this.initializeLearningPaths();
  }

  /**
   * Initialize standard course library
   */
  private initializeStandardCourses(): void {
    // Leadership & Management
    this.addStandardCourse({
      title: 'Leadership Fundamentals',
      category: 'Leadership & Management',
      level: 'beginner',
      duration: 8,
      hasAssessment: true
    });

    // Technical Skills
    this.addStandardCourse({
      title: 'Introduction to Cloud Computing',
      category: 'Technical Skills',
      level: 'beginner',
      duration: 12,
      hasAssessment: true
    });

    // Compliance
    this.addStandardCourse({
      title: 'Information Security Awareness',
      category: 'Compliance',
      level: 'beginner',
      duration: 2,
      isComplianceCourse: true,
      renewalRequired: true,
      renewalPeriod: 12
    });

    // Soft Skills
    this.addStandardCourse({
      title: 'Effective Communication',
      category: 'Soft Skills',
      level: 'intermediate',
      duration: 6,
      hasAssessment: true
    });

    console.log(`[CORPORATE] ✓ Initialized ${this.courses.size} standard courses`);
  }

  /**
   * Add standard course
   */
  private addStandardCourse(data: any): void {
    const course: TrainingCourse = {
      id: crypto.randomUUID(),
      title: data.title,
      description: `Professional ${data.title} course`,
      category: data.category,
      subcategory: '',
      tags: [],
      level: data.level,
      modules: [],
      totalDuration: data.duration,
      isCustom: false,
      hasAssessment: data.hasAssessment || false,
      passingScore: 70,
      certificateAwarded: data.hasAssessment,
      isComplianceCourse: data.isComplianceCourse || false,
      complianceType: data.complianceType,
      renewalRequired: data.renewalRequired || false,
      renewalPeriod: data.renewalPeriod,
      enrollments: 0,
      completions: 0,
      averageScore: 0,
      averageRating: 0
    };

    this.courses.set(course.id, course);
  }

  /**
   * Initialize learning paths
   */
  private initializeLearningPaths(): void {
    // Software Developer Path
    this.addLearningPath({
      name: 'Software Developer Career Path',
      targetRole: 'Software Developer',
      targetLevel: 'Entry to Senior',
      estimatedDuration: 200,
      skillsAcquired: ['Python', 'JavaScript', 'Git', 'Agile', 'Testing']
    });

    // Data Analyst Path
    this.addLearningPath({
      name: 'Data Analyst Career Path',
      targetRole: 'Data Analyst',
      targetLevel: 'Entry to Senior',
      estimatedDuration: 150,
      skillsAcquired: ['SQL', 'Python', 'Statistics', 'Data Visualization', 'Excel']
    });

    console.log(`[CORPORATE] ✓ Initialized ${this.learningPaths.size} learning paths`);
  }

  /**
   * Add learning path
   */
  private addLearningPath(data: any): void {
    const path: LearningPath = {
      id: crypto.randomUUID(),
      name: data.name,
      description: `Complete path to become a ${data.targetRole}`,
      targetRole: data.targetRole,
      targetLevel: data.targetLevel,
      courses: [],
      estimatedDuration: data.estimatedDuration,
      skillsAcquired: data.skillsAcquired,
      enrolledEmployees: 0,
      completionRate: 0
    };

    this.learningPaths.set(path.id, path);
  }

  /**
   * Onboard new corporate client
   */
  async onboardClient(data: {
    companyName: string;
    industry: string;
    size: CorporateClient['size'];
    contactName: string;
    contactEmail: string;
    contractType: CorporateClient['contractType'];
    licensedSeats: number;
  }): Promise<CorporateClient> {
    const client: CorporateClient = {
      id: crypto.randomUUID(),
      companyName: data.companyName,
      industry: data.industry,
      size: data.size,
      primaryContact: {
        name: data.contactName,
        email: data.contactEmail,
        phone: '',
        title: 'Training Manager'
      },
      contractType: data.contractType,
      startDate: new Date(),
      renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      status: 'trial',
      licensedSeats: data.licensedSeats,
      activeUsers: 0,
      pricePerSeat: this.calculatePricePerSeat(data.contractType, data.size),
      features: this.getFeaturesByContract(data.contractType),
      integrations: {
        apiKeys: [this.generateApiKey()]
      },
      settings: {
        autoEnrollNewEmployees: true,
        requiredCourses: [],
        learningPaths: [],
        certificationTracking: true,
        complianceReporting: true
      }
    };

    this.clients.set(client.id, client);

    this.emit('client-onboarded', client);

    // Send welcome email with setup instructions
    this.emit('send-welcome-email', {
      client,
      setupUrl: `https://corporate.azora.world/setup/${client.id}`
    });

    console.log(`[CORPORATE] ✓ Onboarded ${data.companyName} (${data.licensedSeats} seats)`);

    return client;
  }

  /**
   * Calculate price per seat
   */
  private calculatePricePerSeat(contractType: string, size: string): number {
    const pricing = {
      starter: 99,
      professional: 79,
      enterprise: 60,
      custom: 50
    };

    let basePrice = pricing[contractType as keyof typeof pricing] || 99;

    // Volume discount
    if (size === 'large') basePrice *= 0.9;
    if (size === 'enterprise') basePrice *= 0.8;

    return basePrice;
  }

  /**
   * Get features by contract type
   */
  private getFeaturesByContract(contractType: string): CorporateClient['features'] {
    const features: Record<string, CorporateClient['features']> = {
      starter: {
        customCourses: false,
        whiteLabel: false,
        apiAccess: false,
        dedicatedSupport: false,
        onsiteTraining: false,
        customReporting: false
      },
      professional: {
        customCourses: true,
        whiteLabel: false,
        apiAccess: true,
        dedicatedSupport: true,
        onsiteTraining: false,
        customReporting: true
      },
      enterprise: {
        customCourses: true,
        whiteLabel: true,
        apiAccess: true,
        dedicatedSupport: true,
        onsiteTraining: true,
        customReporting: true
      }
    };

    return features[contractType] || features.starter;
  }

  /**
   * Generate API key
   */
  private generateApiKey(): string {
    return `azora_corp_${crypto.randomBytes(32).toString('hex')}`;
  }

  /**
   * Enroll employee
   */
  async enrollEmployee(companyId: string, data: {
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    title: string;
    level: Employee['level'];
  }): Promise<Employee> {
    const client = this.clients.get(companyId);
    
    if (!client) {
      throw new Error('Company not found');
    }

    if (client.activeUsers >= client.licensedSeats) {
      throw new Error('No available seats. Please upgrade your plan.');
    }

    const employee: Employee = {
      id: crypto.randomUUID(),
      companyId,
      employeeId: data.employeeId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      department: data.department,
      title: data.title,
      level: data.level,
      enrolledCourses: [],
      completedCourses: [],
      inProgressCourses: [],
      certifications: [],
      skills: [],
      totalLearningHours: 0,
      enrollmentDate: new Date(),
      assessmentScores: [],
      skillGaps: [],
      recommendedCourses: []
    };

    this.employees.set(employee.id, employee);

    // Update client active users
    client.activeUsers++;

    // Auto-enroll in required courses
    if (client.settings.autoEnrollNewEmployees) {
      for (const courseId of client.settings.requiredCourses) {
        await this.enrollInCourse(employee.id, courseId);
      }
    }

    // Analyze skill gaps and recommend courses
    await this.analyzeSkillGaps(employee.id);

    this.emit('employee-enrolled', { client, employee });

    return employee;
  }

  /**
   * Enroll in course
   */
  async enrollInCourse(employeeId: string, courseId: string): Promise<void> {
    const employee = this.employees.get(employeeId);
    const course = this.courses.get(courseId);
    
    if (!employee || !course) {
      throw new Error('Employee or course not found');
    }

    if (employee.enrolledCourses.includes(courseId)) {
      throw new Error('Already enrolled in this course');
    }

    employee.enrolledCourses.push(courseId);
    employee.inProgressCourses.push(courseId);
    course.enrollments++;

    this.emit('course-enrollment', { employee, course });
  }

  /**
   * Complete course
   */
  async completeCourse(employeeId: string, courseId: string, score: number): Promise<void> {
    const employee = this.employees.get(employeeId);
    const course = this.courses.get(courseId);
    
    if (!employee || !course) {
      throw new Error('Employee or course not found');
    }

    const passed = score >= course.passingScore;

    // Remove from in-progress
    employee.inProgressCourses = employee.inProgressCourses.filter(id => id !== courseId);

    // Add to completed if passed
    if (passed) {
      employee.completedCourses.push(courseId);
      course.completions++;
      
      // Award certificate if applicable
      if (course.certificateAwarded) {
        const certId = await this.awardCertificate(employee, course);
        employee.certifications.push(certId);
      }

      // Update skills
      // TODO: Extract skills from course and add to employee
    }

    // Record assessment score
    employee.assessmentScores.push({
      courseId,
      courseName: course.title,
      score,
      passed,
      completedDate: new Date()
    });

    // Update learning hours
    employee.totalLearningHours += course.totalDuration;
    employee.lastActivityDate = new Date();

    this.emit('course-completed', { employee, course, passed, score });
  }

  /**
   * Award certificate
   */
  private async awardCertificate(employee: Employee, course: TrainingCourse): Promise<string> {
    const certId = crypto.randomUUID();
    
    // TODO: Generate PDF certificate
    // TODO: Store in blockchain
    // TODO: Send to employee
    
    console.log(`[CORPORATE] ✓ Awarded certificate to ${employee.firstName} ${employee.lastName} for ${course.title}`);
    
    return certId;
  }

  /**
   * Analyze skill gaps
   */
  private async analyzeSkillGaps(employeeId: string): Promise<void> {
    const employee = this.employees.get(employeeId);
    
    if (!employee) return;

    // TODO: AI-powered skill gap analysis
    // - Compare employee skills to role requirements
    // - Identify missing skills
    // - Recommend courses to fill gaps
    
    // For now, recommend based on role
    const recommendations = this.getRecommendedCoursesByRole(employee.title, employee.level);
    employee.recommendedCourses = recommendations;
  }

  /**
   * Get recommended courses by role
   */
  private getRecommendedCoursesByRole(title: string, level: string): string[] {
    // TODO: Intelligent course recommendations
    return Array.from(this.courses.values())
      .slice(0, 5)
      .map(c => c.id);
  }

  /**
   * Generate company analytics
   */
  async generateAnalytics(companyId: string, startDate: Date, endDate: Date): Promise<CompanyAnalytics> {
    const client = this.clients.get(companyId);
    
    if (!client) {
      throw new Error('Company not found');
    }

    const employees = Array.from(this.employees.values())
      .filter(e => e.companyId === companyId);

    const analytics: CompanyAnalytics = {
      companyId,
      period: { start: startDate, end: endDate },
      activeUsers: employees.filter(e => e.lastActivityDate && e.lastActivityDate >= startDate).length,
      totalLogins: 0, // TODO: Track logins
      averageTimePerUser: employees.reduce((sum, e) => sum + e.totalLearningHours, 0) / employees.length,
      coursesCompleted: employees.reduce((sum, e) => sum + e.completedCourses.length, 0),
      coursesInProgress: employees.reduce((sum, e) => sum + e.inProgressCourses.length, 0),
      averageCompletionRate: this.calculateAverageCompletionRate(employees),
      skillsAcquired: employees.reduce((sum, e) => sum + e.skills.length, 0),
      certificationsEarned: employees.reduce((sum, e) => sum + e.certifications.length, 0),
      complianceRate: this.calculateComplianceRate(client, employees),
      overdueTrainings: this.countOverdueTrainings(employees),
      averageAssessmentScore: this.calculateAverageScore(employees),
      topPerformers: this.getTopPerformers(employees, 10),
      needsAttention: this.getNeedsAttention(employees, 10),
      estimatedProductivityGain: this.estimateProductivityGain(employees),
      costPerEmployee: client.pricePerSeat,
      trainingROI: 0 // TODO: Calculate ROI
    };

    return analytics;
  }

  /**
   * Calculate average completion rate
   */
  private calculateAverageCompletionRate(employees: Employee[]): number {
    if (employees.length === 0) return 0;

    const rates = employees.map(e => {
      const total = e.enrolledCourses.length;
      return total > 0 ? (e.completedCourses.length / total) * 100 : 0;
    });

    return rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
  }

  /**
   * Calculate compliance rate
   */
  private calculateComplianceRate(client: CorporateClient, employees: Employee[]): number {
    if (employees.length === 0 || client.settings.requiredCourses.length === 0) return 100;

    const compliant = employees.filter(e => 
      client.settings.requiredCourses.every(courseId => 
        e.completedCourses.includes(courseId)
      )
    ).length;

    return (compliant / employees.length) * 100;
  }

  /**
   * Count overdue trainings
   */
  private countOverdueTrainings(employees: Employee[]): number {
    // TODO: Implement renewal tracking
    return 0;
  }

  /**
   * Calculate average assessment score
   */
  private calculateAverageScore(employees: Employee[]): number {
    const allScores = employees.flatMap(e => e.assessmentScores.map(a => a.score));
    
    if (allScores.length === 0) return 0;
    
    return allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
  }

  /**
   * Get top performers
   */
  private getTopPerformers(employees: Employee[], count: number): string[] {
    return employees
      .sort((a, b) => {
        const aScore = a.assessmentScores.reduce((sum, s) => sum + s.score, 0) / Math.max(a.assessmentScores.length, 1);
        const bScore = b.assessmentScores.reduce((sum, s) => sum + s.score, 0) / Math.max(b.assessmentScores.length, 1);
        return bScore - aScore;
      })
      .slice(0, count)
      .map(e => e.id);
  }

  /**
   * Get employees needing attention
   */
  private getNeedsAttention(employees: Employee[], count: number): string[] {
    return employees
      .filter(e => e.inProgressCourses.length > 0 && !e.lastActivityDate)
      .slice(0, count)
      .map(e => e.id);
  }

  /**
   * Estimate productivity gain
   */
  private estimateProductivityGain(employees: Employee[]): number {
    // Rough estimate: 5% productivity gain per completed course
    const totalCourses = employees.reduce((sum, e) => sum + e.completedCourses.length, 0);
    return totalCourses * 5;
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalClients: number;
    totalEmployees: number;
    totalCourses: number;
    totalLearningPaths: number;
    monthlyRevenue: number;
  } {
    const monthlyRevenue = Array.from(this.clients.values())
      .filter(c => c.status === 'active')
      .reduce((sum, c) => sum + (c.pricePerSeat * c.licensedSeats), 0) / 12;

    return {
      totalClients: this.clients.size,
      totalEmployees: this.employees.size,
      totalCourses: this.courses.size,
      totalLearningPaths: this.learningPaths.size,
      monthlyRevenue
    };
  }
}

// Create singleton
export const corporateLearningPlatform = new CorporateLearningPlatform();

export default corporateLearningPlatform;
